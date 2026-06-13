import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { getStripe } from '@/lib/stripe';
import { TRIAL_PERIOD_DAYS, SUBSCRIPTION_PLANS, SubscriptionPlan } from '@/lib/stripe-config';
import { normalizeSupabaseUrl } from '@/lib/supabase-env';

export async function POST(req: NextRequest) {
  try {
    const supabaseUrl =
      normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL) ??
      process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabase = createRouteHandlerClient(
      { cookies },
      {
        supabaseUrl,
        supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim(),
      }
    );
    
    // Get authenticated user
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is a business owner
    const { data: userProfile } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (userProfile?.role !== 'business_owner') {
      return NextResponse.json({ error: 'Only business owners can subscribe' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const plan = body.plan as SubscriptionPlan | undefined;

    if (!plan || !SUBSCRIPTION_PLANS[plan]) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const priceId =
      plan === 'monthly'
        ? process.env.STRIPE_MONTHLY_PRICE_ID?.trim()
        : process.env.STRIPE_ANNUAL_PRICE_ID?.trim();

    if (!process.env.STRIPE_SECRET_KEY?.trim()) {
      return NextResponse.json(
        {
          error:
            'Stripe is not configured. Add STRIPE_SECRET_KEY to .env.local (Stripe Dashboard → Developers → API keys).',
        },
        { status: 503 }
      );
    }

    if (!priceId) {
      const varName = plan === 'monthly' ? 'STRIPE_MONTHLY_PRICE_ID' : 'STRIPE_ANNUAL_PRICE_ID';
      return NextResponse.json(
        {
          error: `Missing ${varName}. Create a recurring GBP price in Stripe for this plan and add its price_… id to .env.local.`,
        },
        { status: 503 }
      );
    }

    // Check if user already has a subscription
    const { data: existingSubscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', session.user.id)
      .single();

    // Only block if subscription is ACTIVE (actually paid) AND has a Stripe subscription ID
    // Allow retry if:
    // - Status is inactive, canceled, past_due
    // - No stripe_subscription_id (checkout was never completed)
    // - Status is trialing/trial but no stripe_subscription_id (payment was canceled)
    if (existingSubscription) {
      const hasStripeSubscription = !!existingSubscription.stripe_subscription_id;
      const isActive = existingSubscription.status === 'active';
      
      // Only block if it's ACTIVE and has a Stripe subscription (actually paid)
      if (isActive && hasStripeSubscription) {
        return NextResponse.json({ error: 'You already have an active subscription' }, { status: 400 });
      }
      
      // If status is trialing/trial but no Stripe subscription ID, it means payment was canceled
      // Allow them to retry by updating status to inactive
      if ((existingSubscription.status === 'trialing' || existingSubscription.status === 'trial') && !hasStripeSubscription) {
        // Update to inactive so they can retry
        await supabase
          .from('subscriptions')
          .update({ status: 'inactive' })
          .eq('user_id', session.user.id);
      }
    }

    // Get user data
    const { data: userData } = await supabase
      .from('users')
      .select('email, full_name')
      .eq('id', session.user.id)
      .single();

    let customerId = existingSubscription?.stripe_customer_id;

    // Create or retrieve Stripe customer
    if (!customerId) {
      const customer = await getStripe().customers.create({
        email: userData?.email || session.user.email || '',
        name: userData?.full_name || undefined,
        metadata: {
          userId: session.user.id,
        },
      });

      customerId = customer.id;

      // Save customer ID to database
      // IMPORTANT: Don't set status to 'trialing' until payment is actually completed
      // Set to 'inactive' initially - webhook will update to 'trialing' when checkout succeeds
      if (existingSubscription) {
        await supabase
          .from('subscriptions')
          .update({ 
            stripe_customer_id: customerId,
            status: 'inactive' // Keep inactive until payment succeeds
          })
          .eq('user_id', session.user.id);
      } else {
        await supabase
          .from('subscriptions')
          .insert({
            user_id: session.user.id,
            stripe_customer_id: customerId,
            status: 'inactive', // Start as inactive - webhook will activate when payment succeeds
          });
      }
    }

    // Create Stripe Checkout session with trial
    // Get base URL - always use canonical domain (inboker.com) for Stripe redirects, never Vercel URL
    const getBaseUrl = () => {
      const envUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
      // Never use Vercel URL for Stripe return URLs so users land on inboker.com
      if (envUrl && !envUrl.includes('vercel.app')) {
        return envUrl.replace(/\/$/, '');
      }
      if (process.env.NODE_ENV === 'production') {
        return 'https://inboker.com';
      }
      const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || '';
      if (host.includes('vercel.app')) {
        return 'https://inboker.com';
      }
      if (host && !host.includes('localhost') && host.includes('inboker.com')) {
        const protocol = req.headers.get('x-forwarded-proto') || 'https';
        return `${protocol}://${host}`;
      }
      return envUrl || req.nextUrl.origin;
    };
    const baseUrl = getBaseUrl();
    
    // Trial subscription: no charge at checkout. Card is only saved; first charge is after trial_period_days.
    const checkoutSession = await getStripe().checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: TRIAL_PERIOD_DAYS, // Stripe will not charge the card until trial ends (14 days)
        metadata: {
          userId: session.user.id,
          plan: plan,
        },
      },
      success_url: `${baseUrl}/dashboard/business-owner?trial_started=true`,
      cancel_url: `${baseUrl}/signup?canceled=true`,
      metadata: {
        userId: session.user.id,
        plan: plan,
        isTrial: 'true',
      },
      // Allow promotion codes
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error: any) {
    console.error('Error creating trial subscription:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

