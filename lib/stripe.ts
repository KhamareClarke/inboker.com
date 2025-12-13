// Server-side only Stripe client initialization
// DO NOT import this in client components - use lib/stripe-config.ts instead

import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
});

// Re-export constants from stripe-config for server-side use
export { TRIAL_PERIOD_DAYS, SUBSCRIPTION_PLANS, type SubscriptionPlan } from './stripe-config';

// Helper function to get subscription status from Stripe
export function getSubscriptionStatus(stripeSubscription: Stripe.Subscription): 'active' | 'inactive' | 'trial' | 'cancelled' | 'past_due' | 'trialing' {
  const status = stripeSubscription.status;
  
  if (status === 'active') {
    // Check if it's in trial period
    if (stripeSubscription.trial_end && stripeSubscription.trial_end > Math.floor(Date.now() / 1000)) {
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

