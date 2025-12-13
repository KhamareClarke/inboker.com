import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { stripe, getSubscriptionStatus } from '@/lib/stripe';
import { sendEmail, emailTemplates } from '@/lib/email';
import Stripe from 'stripe';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

if (!webhookSecret) {
  throw new Error('STRIPE_WEBHOOK_SECRET is not set');
}

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret!);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        if (session.mode === 'subscription' && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string,
            { expand: ['items.data.price.product'] }
          );

          const userId = session.metadata?.userId || subscription.metadata?.userId;
          if (!userId) {
            console.error('No userId in session metadata');
            break;
          }

          const status = getSubscriptionStatus(subscription);
          
          await supabaseAdmin
            .from('subscriptions')
            .upsert({
              user_id: userId,
              stripe_customer_id: subscription.customer as string,
              stripe_subscription_id: subscription.id,
              stripe_price_id: subscription.items.data[0]?.price.id,
              status: status,
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              cancel_at_period_end: subscription.cancel_at_period_end || false,
              trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
            }, {
              onConflict: 'user_id',
            });

          console.log(`Subscription created/updated for user ${userId}: ${status}`);

          // Send welcome email if trial just started
          if (status === 'trialing' && subscription.trial_end) {
            try {
              const { data: userData } = await supabaseAdmin
                .from('users')
                .select('email, full_name')
                .eq('id', userId)
                .single();

              if (userData?.email) {
                const trialEndDate = new Date(subscription.trial_end * 1000);
                const emailContent = emailTemplates.trialStarted(
                  userData.full_name || userData.email,
                  trialEndDate
                );
                
                await sendEmail({
                  to: userData.email,
                  subject: emailContent.subject,
                  html: emailContent.html,
                });
                console.log(`Welcome email sent to ${userData.email}`);
              }
            } catch (emailError) {
              console.error('Error sending welcome email:', emailError);
            }
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;
        
        if (!userId) {
          console.error('No userId in subscription metadata');
          break;
        }

        const status = getSubscriptionStatus(subscription);
        
        await supabaseAdmin
          .from('subscriptions')
          .update({
            stripe_subscription_id: subscription.id,
            stripe_price_id: subscription.items.data[0]?.price.id,
            status: status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end || false,
            trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
          })
          .eq('user_id', userId);

        console.log(`Subscription updated for user ${userId}: ${status}`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;
        
        if (!userId) {
          console.error('No userId in subscription metadata');
          break;
        }

        await supabaseAdmin
          .from('subscriptions')
          .update({
            status: 'cancelled',
            cancel_at_period_end: false,
          })
          .eq('user_id', userId);

        console.log(`Subscription cancelled for user ${userId}`);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            invoice.subscription as string
          );
          
          const userId = subscription.metadata?.userId;
          if (!userId) break;

          // Check current subscription status in database
          const { data: currentSubscription } = await supabaseAdmin
            .from('subscriptions')
            .select('status, trial_end')
            .eq('user_id', userId)
            .single();

          // Check if this is the first payment after trial (trial just ended)
          // This happens when:
          // 1. Previous status was 'trialing' or 'trial'
          // 2. Invoice billing reason is 'subscription_cycle' (first charge after trial)
          // 3. Trial end date has passed
          const wasTrialing = (currentSubscription?.status === 'trialing' || currentSubscription?.status === 'trial') &&
                              (invoice.billing_reason === 'subscription_cycle' || invoice.billing_reason === 'subscription_create') &&
                              subscription.status === 'active' &&
                              subscription.trial_end &&
                              subscription.trial_end <= Math.floor(Date.now() / 1000);

          // Update subscription status to active if payment succeeded
          const status = getSubscriptionStatus(subscription);
          
          await supabaseAdmin
            .from('subscriptions')
            .update({
              status: status,
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            })
            .eq('user_id', userId);

          console.log(`Payment succeeded for user ${userId}, subscription status: ${status}`);

          // Send trial ended email if this is the first payment after trial
          if (wasTrialing) {
            try {
              const { data: userData } = await supabaseAdmin
                .from('users')
                .select('email, full_name')
                .eq('id', userId)
                .single();

              const { data: subscriptionData } = await supabaseAdmin
                .from('subscriptions')
                .select('stripe_price_id')
                .eq('user_id', userId)
                .single();

              if (userData?.email) {
                // Get plan details
                let planName = 'Monthly Plan';
                let amount = 49;
                
                if (subscriptionData?.stripe_price_id) {
                  const price = await stripe.prices.retrieve(subscriptionData.stripe_price_id);
                  if (price.recurring?.interval === 'year') {
                    planName = 'Annual Plan';
                    amount = 490;
                  }
                }

                const emailContent = emailTemplates.trialEnded(
                  userData.full_name || userData.email,
                  planName,
                  amount
                );
                
                await sendEmail({
                  to: userData.email,
                  subject: emailContent.subject,
                  html: emailContent.html,
                });
                console.log(`Trial ended email sent to ${userData.email}`);
              }
            } catch (emailError) {
              console.error('Error sending trial ended email:', emailError);
            }
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            invoice.subscription as string
          );
          
          const userId = subscription.metadata?.userId;
          if (!userId) break;

          await supabaseAdmin
            .from('subscriptions')
            .update({
              status: 'past_due',
            })
            .eq('user_id', userId);

          console.log(`Payment failed for user ${userId}`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: `Webhook handler failed: ${error.message}` },
      { status: 500 }
    );
  }
}

// Disable body parsing for webhook route
export const runtime = 'nodejs';

