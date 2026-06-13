// Server-side only Stripe client initialization
// DO NOT import this in client components - use lib/stripe-config.ts instead

import Stripe from 'stripe';

let stripeSingleton: Stripe | null = null;

/** Lazy init so missing env does not crash route module load / JSON responses. */
export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) {
    throw new Error(
      'STRIPE_SECRET_KEY is not set. Add it to .env.local (Stripe Dashboard → Developers → API keys).'
    );
  }
  if (!stripeSingleton) {
    stripeSingleton = new Stripe(key, {
      apiVersion: '2026-02-25.clover',
      typescript: true,
    });
  }
  return stripeSingleton;
}

// Re-export constants from stripe-config for server-side use
export { TRIAL_PERIOD_DAYS, SUBSCRIPTION_PLANS, type SubscriptionPlan } from './stripe-config';

// Helper function to get subscription status from Stripe
export function getSubscriptionStatus(stripeSubscription: Stripe.Subscription): 'active' | 'inactive' | 'trial' | 'cancelled' | 'past_due' | 'trialing' {
  const status = stripeSubscription.status as string;
  
  if (status === 'active') {
    // Check if it's in trial period
    const trialEnd = (stripeSubscription as any).trial_end as number | null | undefined;
    if (trialEnd && trialEnd > Math.floor(Date.now() / 1000)) {
      return 'trialing';
    }
    return 'active';
  }
  
  if (status === 'trialing') return 'trialing';
  if (status === 'past_due') return 'past_due';
  if (status === 'canceled' || status === 'cancelled') return 'cancelled';
  if (status === 'incomplete' || status === 'incomplete_expired' || status === 'unpaid') return 'inactive';
  
  return 'inactive';
}

