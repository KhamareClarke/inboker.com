import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { TRIAL_PERIOD_DAYS, SUBSCRIPTION_PLANS, SubscriptionPlan } from '@/lib/stripe-config';

export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
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

    // Check if user already has a subscription
    const { data: existingSubscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', session.user.id)
      .single();

    if (existingSubscription && (existingSubscription.status === 'active' || existingSubscription.status === 'trialing' || existingSubscription.status === 'trial')) {
      return NextResponse.json({ error: 'You already have an active subscription' }, { status: 400 });
    }

    const { plan } = await req.json();
    
    if (!plan || !SUBSCRIPTION_PLANS[plan as SubscriptionPlan]) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const selectedPlan = SUBSCRIPTION_PLANS[plan as SubscriptionPlan];
    
    // Get price ID from environment variables (server-side only)
    const priceId = plan === 'monthly' 
      ? process.env.STRIPE_MONTHLY_PRICE_ID 
      : process.env.STRIPE_ANNUAL_PRICE_ID;
    
    if (!priceId) {
      return NextResponse.json({ error: 'Plan not configured' }, { status: 500 });
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
      const customer = await stripe.customers.create({
        email: userData?.email || session.user.email || '',
        name: userData?.full_name || undefined,
        metadata: {
          userId: session.user.id,
        },
      });

      customerId = customer.id;

      // Save customer ID to database
      if (existingSubscription) {
        await supabase
          .from('subscriptions')
          .update({ stripe_customer_id: customerId })
          .eq('user_id', session.user.id);
      } else {
        await supabase
          .from('subscriptions')
          .insert({
            user_id: session.user.id,
            stripe_customer_id: customerId,
            status: 'trialing',
          });
      }
    }

    // Calculate trial end date (14 days from now)
    const trialEnd = Math.floor(Date.now() / 1000) + (TRIAL_PERIOD_DAYS * 24 * 60 * 60);

    // Create Stripe Checkout session with trial
    // Get base URL - always use custom domain in production
    const getBaseUrl = () => {
      // In production, always use custom domain
      if (process.env.NODE_ENV === 'production') {
        return 'https://inboker.com';
      }
      // Check environment variable (for local development)
      if (process.env.NEXT_PUBLIC_APP_URL) {
        return process.env.NEXT_PUBLIC_APP_URL;
      }
      // Check for custom domain in headers (Vercel sets x-forwarded-host)
      const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
      if (host && !host.includes('vercel.app')) {
        const protocol = req.headers.get('x-forwarded-proto') || 'https';
        return `${protocol}://${host}`;
      }
      // Fallback to origin
      return req.nextUrl.origin;
    };
    const baseUrl = getBaseUrl();
    
    const checkoutSession = await stripe.checkout.sessions.create({
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
        trial_period_days: TRIAL_PERIOD_DAYS,
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

