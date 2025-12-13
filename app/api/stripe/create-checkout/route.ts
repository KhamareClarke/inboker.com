import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { SUBSCRIPTION_PLANS, SubscriptionPlan } from '@/lib/stripe-config';

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

    // Check for existing subscription
    const { data: existingSubscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', session.user.id)
      .single();

    let customerId = existingSubscription?.stripe_customer_id;

    // Create or retrieve Stripe customer
    if (!customerId) {
      const { data: userData } = await supabase
        .from('users')
        .select('email, full_name')
        .eq('id', session.user.id)
        .single();

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
            status: 'inactive',
          });
      }
    }

    // Create Stripe Checkout session
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;
    
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
      success_url: `${baseUrl}/dashboard/business-owner/billing?success=true`,
      cancel_url: `${baseUrl}/dashboard/business-owner/billing?canceled=true`,
      metadata: {
        userId: session.user.id,
        plan: plan,
      },
      subscription_data: {
        metadata: {
          userId: session.user.id,
          plan: plan,
        },
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

