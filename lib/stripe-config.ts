// Client-safe Stripe configuration (constants only, no secret keys)
// This file can be imported in client components
// Price IDs are not needed on client - they're only used in API routes

export const TRIAL_PERIOD_DAYS = 14;

export const SUBSCRIPTION_PLANS = {
  monthly: {
    name: 'Monthly Plan',
    amount: 49,
    currency: 'gbp',
    interval: 'month' as const,
  },
  annually: {
    name: 'Annual Plan',
    amount: 490,
    currency: 'gbp',
    interval: 'year' as const,
  },
} as const;

export type SubscriptionPlan = keyof typeof SUBSCRIPTION_PLANS;

