# Stripe Subscription Integration Setup

This document outlines the setup required for the Stripe subscription integration.

## Environment Variables

Add the following environment variables to your `.env.local` file:

```env
# Stripe Keys
STRIPE_SECRET_KEY=sk_test_... # Your Stripe secret key
STRIPE_WEBHOOK_SECRET=whsec_... # Your Stripe webhook signing secret

# Stripe Price IDs (create these in your Stripe Dashboard)
STRIPE_MONTHLY_PRICE_ID=price_... # Monthly plan price ID (£20/month)
STRIPE_ANNUAL_PRICE_ID=price_... # Annual plan price ID (£50/year)

# App URL (for redirects)
NEXT_PUBLIC_APP_URL=http://localhost:3000 # or your production URL

# Supabase (if not already set)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key # Required for webhook to update subscriptions
```

## Stripe Dashboard Setup

1. **Create Products and Prices:**
   - Go to Stripe Dashboard → Products
   - Create two products: "Monthly Plan" and "Annual Plan"
   - For Monthly Plan: Create a recurring price of £20/month
   - For Annual Plan: Create a recurring price of £50/year
   - Copy the Price IDs and add them to your environment variables

2. **Set up Webhook:**
   - Go to Stripe Dashboard → Developers → Webhooks
   - Add endpoint: `https://yourdomain.com/api/stripe/webhook`
   - Select events to listen to:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
   - Copy the webhook signing secret and add it to `STRIPE_WEBHOOK_SECRET`

3. **For Local Development:**
   - Use Stripe CLI: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
   - Copy the webhook signing secret from the CLI output

## Database Migration

Run the migration to create the subscriptions table:

```bash
# If using Supabase CLI
supabase migration up

# Or apply the migration manually in Supabase Dashboard
```

## Features Implemented

1. **Stripe Checkout Integration:**
   - Business owners get a 14-day free trial when signing up
   - Card details are collected during signup (no charge until trial ends)
   - Two subscription tiers: Monthly (£20/month) and Annual (£50/year)
   - Trial period is automatically applied to new subscriptions

2. **Subscription Management:**
   - View current subscription status
   - Cancel subscription (cancels at period end)
   - Reactivate cancelled subscription
   - Automatic status updates via webhooks

3. **Access Control:**
   - Middleware checks subscription status for business owners
   - Inactive subscriptions redirect to billing page
   - Billing page is always accessible (even with inactive subscription)

4. **Webhook Handling:**
   - Automatically updates subscription status in database
   - Handles subscription lifecycle events
   - Updates payment status

## Testing

1. **Test Subscription Flow:**
   - Use Stripe test cards: `4242 4242 4242 4242`
   - Any future expiry date and any CVC
   - Sign up as a business owner to see the 14-day free trial offer
   - Complete the trial signup flow at `/signup/trial`
   - Or go to `/dashboard/business-owner/billing` to subscribe directly

2. **Test Webhook:**
   - Use Stripe CLI for local testing
   - Ensure webhook endpoint is accessible in production

3. **Test Access Control:**
   - Create a business owner account
   - Try accessing dashboard without subscription (should redirect to billing)
   - Subscribe and verify dashboard access

## Subscription Statuses

- `active`: Subscription is active and paid
- `trialing`: Subscription is in trial period
- `trial`: Legacy trial status
- `inactive`: No active subscription
- `cancelled`: Subscription has been cancelled
- `past_due`: Payment failed, subscription is past due

Only `active`, `trialing`, and `trial` statuses allow dashboard access.

