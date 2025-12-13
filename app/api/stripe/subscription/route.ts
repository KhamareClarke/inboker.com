import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { stripe } from '@/lib/stripe';
import Stripe from 'stripe';

// GET - Get current subscription
export async function GET(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', session.user.id)
      .single();

    if (!subscription) {
      return NextResponse.json({ subscription: null });
    }

    // If subscription exists in Stripe, get latest details
    if (subscription.stripe_subscription_id) {
      try {
        const stripeSub = await stripe.subscriptions.retrieve(
          subscription.stripe_subscription_id
        );
        
        return NextResponse.json({
          subscription: {
            ...subscription,
            stripeSubscription: {
              status: stripeSub.status,
              current_period_end: stripeSub.current_period_end 
                ? new Date(stripeSub.current_period_end * 1000).toISOString()
                : null,
              cancel_at_period_end: stripeSub.cancel_at_period_end,
            },
          },
        });
      } catch (error) {
        // Subscription might not exist in Stripe anymore
        console.error('Error fetching Stripe subscription:', error);
      }
    }

    return NextResponse.json({ subscription });
  } catch (error: any) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch subscription' },
      { status: 500 }
    );
  }
}

// POST - Cancel subscription
export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action } = await req.json();
    
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', session.user.id)
      .single();

    if (!subscription?.stripe_subscription_id) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 404 });
    }

    if (action === 'cancel') {
      // Cancel at period end
      const updatedSubscription = await stripe.subscriptions.update(
        subscription.stripe_subscription_id,
        {
          cancel_at_period_end: true,
        }
      );

      await supabase
        .from('subscriptions')
        .update({
          cancel_at_period_end: true,
        })
        .eq('user_id', session.user.id);

      return NextResponse.json({ 
        message: 'Subscription will be cancelled at the end of the billing period',
        cancel_at_period_end: true,
      });
    }

    if (action === 'reactivate') {
      // Reactivate subscription
      const updatedSubscription = await stripe.subscriptions.update(
        subscription.stripe_subscription_id,
        {
          cancel_at_period_end: false,
        }
      );

      await supabase
        .from('subscriptions')
        .update({
          cancel_at_period_end: false,
          status: 'active',
        })
        .eq('user_id', session.user.id);

      return NextResponse.json({ 
        message: 'Subscription reactivated',
        cancel_at_period_end: false,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Error managing subscription:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to manage subscription' },
      { status: 500 }
    );
  }
}

