import { NextRequest, NextResponse } from 'next/server';
/**
 * PCI DSS scope reduction: card data is collected only by Stripe Checkout / Elements.
 * This route processes signed Stripe webhooks — never log or persist raw card numbers or CVC.
 */
import { createClient } from '@supabase/supabase-js';
import { getStripe, getSubscriptionStatus } from '@/lib/stripe';
import { sendEmail, emailTemplates } from '@/lib/email';
import { sendNotification } from '@/lib/notifications';
import Stripe from 'stripe';
import { normalizeSupabaseUrl } from '@/lib/supabase-env';
import { triggerEmpireOsEvent } from '@/lib/empire-os/events';
import { emitEmpireActivity } from '@/lib/empire-activity';

const supabaseAdmin = createClient(
  (normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL) ??
    process.env.NEXT_PUBLIC_SUPABASE_URL) as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

/** Safely convert Unix timestamp (seconds) to ISO string; return null if invalid. */
function toISOOrNull(unixSeconds: number | null | undefined): string | null {
  if (unixSeconds == null || typeof unixSeconds !== 'number' || !Number.isFinite(unixSeconds)) {
    return null;
  }
  const d = new Date(unixSeconds * 1000);
  return Number.isFinite(d.getTime()) ? d.toISOString() : null;
}

function formatRenewalHuman(iso: string) {
  try {
    return new Intl.DateTimeFormat('en-GB', { dateStyle: 'long' }).format(new Date(iso));
  } catch {
    return iso;
  }
}

async function empireBusinessIdForUser(userId: string): Promise<string | null> {
  const { data } = await supabaseAdmin
    .from('business_profiles')
    .select('id')
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle();
  return (data as { id?: string } | null)?.id ?? null;
}

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not set');
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
  }

  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        if (session.mode === 'subscription' && session.subscription) {
          const subscriptionRaw = await getStripe().subscriptions.retrieve(
            session.subscription as string,
            { expand: ['items.data.price.product'] }
          );
          const subscription = subscriptionRaw as unknown as Stripe.Subscription;

          const userId = session.metadata?.userId || subscription.metadata?.userId;
          if (!userId) {
            console.error('No userId in session metadata');
            break;
          }

          const status = getSubscriptionStatus(subscription);
          
          const currentPeriodStart = (subscription as any).current_period_start as number | null | undefined;
          const currentPeriodEnd = (subscription as any).current_period_end as number | null | undefined;
          const cancelAtPeriodEnd = (subscription as any).cancel_at_period_end as boolean | null | undefined;
          const trialEnd = (subscription as any).trial_end as number | null | undefined;

          const periodStartISO = toISOOrNull(currentPeriodStart);
          const periodEndISO = toISOOrNull(currentPeriodEnd);
          const trialEndISO = toISOOrNull(trialEnd);
          if (!periodStartISO || !periodEndISO) {
            console.error('Invalid period dates from Stripe', { currentPeriodStart, currentPeriodEnd });
          }

          await supabaseAdmin
            .from('subscriptions')
            .upsert({
              user_id: userId,
              stripe_customer_id: subscription.customer as string,
              stripe_subscription_id: subscription.id,
              stripe_price_id: subscription.items.data[0]?.price.id,
              status: status,
              current_period_start: periodStartISO ?? new Date(0).toISOString(),
              current_period_end: periodEndISO ?? new Date(0).toISOString(),
              cancel_at_period_end: cancelAtPeriodEnd ?? false,
              trial_end: trialEndISO,
            }, {
              onConflict: 'user_id',
            });

          console.log(`Subscription created/updated for user ${userId}: ${status}`);

          const empireBid = await empireBusinessIdForUser(userId);
          void triggerEmpireOsEvent(
            'subscription_created',
            {
              userId,
              stripeSubscriptionId: subscription.id,
              status,
              trialEnd: trialEndISO,
              priceId: subscription.items.data[0]?.price.id,
            },
            empireBid
          );

          void (async () => {
            const { data: u } = await supabaseAdmin
              .from('users')
              .select('email, full_name')
              .eq('id', userId)
              .single();
            void emitEmpireActivity({
              event_type: 'subscription_created',
              user_email: u?.email || session.customer_details?.email || null,
              user_id: userId,
              user_name: u?.full_name || session.customer_details?.name || null,
              message: status === 'trialing' ? 'Trial subscription started' : 'Paid subscription started',
              metadata: {
                stripe_subscription_id: subscription.id,
                stripe_price_id: subscription.items.data[0]?.price.id,
                stripe_customer_id: subscription.customer,
                status,
                trial_end: trialEndISO,
                amount_total: session.amount_total,
              },
            });
          })();

          // Send welcome email if trial just started
          if (status === 'trialing' && trialEndISO) {
            try {
              const { data: userData } = await supabaseAdmin
                .from('users')
                .select('email, full_name')
                .eq('id', userId)
                .single();

              if (userData?.email) {
                const trialEndDate = new Date(trialEndISO);
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
        
        const currentPeriodStart = (subscription as any).current_period_start as number | null | undefined;
        const currentPeriodEnd = (subscription as any).current_period_end as number | null | undefined;
        const cancelAtPeriodEnd = (subscription as any).cancel_at_period_end as boolean | null | undefined;
        const trialEnd = (subscription as any).trial_end as number | null | undefined;

        const periodStartISO = toISOOrNull(currentPeriodStart);
        const periodEndISO = toISOOrNull(currentPeriodEnd);
        const trialEndISO = toISOOrNull(trialEnd);

        const updatePayload: Record<string, unknown> = {
          stripe_subscription_id: subscription.id,
          stripe_price_id: subscription.items.data[0]?.price.id,
          status: status,
          cancel_at_period_end: cancelAtPeriodEnd ?? false,
          trial_end: trialEndISO,
        };
        if (periodStartISO) updatePayload.current_period_start = periodStartISO;
        if (periodEndISO) updatePayload.current_period_end = periodEndISO;

        await supabaseAdmin
          .from('subscriptions')
          .update(updatePayload)
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

        void (async () => {
          const { data: u } = await supabaseAdmin
            .from('users')
            .select('email, full_name')
            .eq('id', userId)
            .single();
          void emitEmpireActivity({
            event_type: 'subscription_cancelled',
            user_email: u?.email || null,
            user_id: userId,
            user_name: u?.full_name || null,
            message: 'Subscription cancelled',
            metadata: { stripe_subscription_id: subscription.id },
          });
        })();
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        
        const invoiceSubscription = (invoice as any).subscription as string | null | undefined;
        if (invoiceSubscription) {
          const subscriptionRaw = await getStripe().subscriptions.retrieve(
            invoiceSubscription
          );
          const subscription = subscriptionRaw as unknown as Stripe.Subscription;
          
          const userId = subscription.metadata?.userId;
          if (!userId) break;

          // Check current subscription status in database
          const { data: currentSubscription } = await supabaseAdmin
            .from('subscriptions')
            .select('status, trial_end')
            .eq('user_id', userId)
            .single();

          const trialEnd = (subscription as any).trial_end as number | null | undefined;
          const currentPeriodStart = (subscription as any).current_period_start as number | null | undefined;
          const currentPeriodEnd = (subscription as any).current_period_end as number | null | undefined;

          const periodStartISO = toISOOrNull(currentPeriodStart);
          const periodEndISO = toISOOrNull(currentPeriodEnd);

          // Check if this is the first payment after trial (trial just ended)
          // This happens when:
          // 1. Previous status was 'trialing' or 'trial'
          // 2. Invoice billing reason is 'subscription_cycle' (first charge after trial)
          // 3. Trial end date has passed
          const wasTrialing = (currentSubscription?.status === 'trialing' || currentSubscription?.status === 'trial') &&
                              (invoice.billing_reason === 'subscription_cycle' || invoice.billing_reason === 'subscription_create') &&
                              subscription.status === 'active' &&
                              trialEnd &&
                              trialEnd <= Math.floor(Date.now() / 1000);

          const status = getSubscriptionStatus(subscription);
          const invoiceUpdatePayload: Record<string, unknown> = { status };
          if (periodStartISO) invoiceUpdatePayload.current_period_start = periodStartISO;
          if (periodEndISO) invoiceUpdatePayload.current_period_end = periodEndISO;

          await supabaseAdmin
            .from('subscriptions')
            .update(invoiceUpdatePayload)
            .eq('user_id', userId);

          console.log(`Payment succeeded for user ${userId}, subscription status: ${status}`);

          const empireBidPay = await empireBusinessIdForUser(userId);
          const amountPaid =
            typeof invoice.amount_paid === 'number' ? invoice.amount_paid : 0;
          void triggerEmpireOsEvent(
            'payment_received',
            {
              userId,
              invoiceId: invoice.id,
              amountPaid,
              currency: invoice.currency,
              billingReason: invoice.billing_reason,
              subscriptionId: subscription.id,
            },
            empireBidPay
          );

          void (async () => {
            const { data: u } = await supabaseAdmin
              .from('users')
              .select('email, full_name')
              .eq('id', userId)
              .single();
            void emitEmpireActivity({
              event_type: 'payment_succeeded',
              user_email: u?.email || null,
              user_id: userId,
              user_name: u?.full_name || null,
              message: `Subscription payment received (${invoice.currency?.toUpperCase()} ${(amountPaid / 100).toFixed(2)})`,
              metadata: {
                invoice_id: invoice.id,
                stripe_subscription_id: subscription.id,
                amount_paid: amountPaid,
                currency: invoice.currency,
                billing_reason: invoice.billing_reason,
              },
            });
          })();

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
                  const price = await getStripe().prices.retrieve(subscriptionData.stripe_price_id);
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

          // Recurring subscription charge (not the "trial just ended" first paid cycle)
          const isRecurringRenewal =
            invoice.billing_reason === 'subscription_cycle' && !wasTrialing && userId;

          if (isRecurringRenewal) {
            try {
              const { data: renewalUser } = await supabaseAdmin
                .from('users')
                .select('email, full_name')
                .eq('id', userId)
                .single();

              if (renewalUser?.email) {
                const amountPaid =
                  typeof invoice.amount_paid === 'number' ? invoice.amount_paid : 0;
                const cur = (invoice.currency || 'usd').toUpperCase();
                const amountLabel =
                  amountPaid > 0 ? `${cur} ${(amountPaid / 100).toFixed(2)}` : '';
                const nextRenewal = periodEndISO ? formatRenewalHuman(periodEndISO) : '';

                await sendNotification({
                  type: 'subscription_renewal_confirmation',
                  channels: ['email', 'in_app'],
                  email: renewalUser.email,
                  userId,
                  data: {
                    name: renewalUser.full_name || renewalUser.email,
                    amountLabel,
                    nextRenewal,
                  },
                });
                console.log(`Subscription renewal notification for user ${userId}`);
              }
            } catch (renewalErr) {
              console.error('Error sending subscription renewal notification:', renewalErr);
            }
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        
        const invoiceSubscription = (invoice as any).subscription as string | null | undefined;
        if (invoiceSubscription) {
          const subscriptionRaw = await getStripe().subscriptions.retrieve(
            invoiceSubscription
          );
          const subscription = subscriptionRaw as unknown as Stripe.Subscription;
          
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

