# Stripe Information Required

To complete the subscription setup, you need to provide the following information from your Stripe Dashboard:

## Required Stripe Keys

1. **STRIPE_SECRET_KEY**
   - Location: Stripe Dashboard → Developers → API keys
   - Format: `sk_test_...` (for testing) or `sk_live_...` (for production)
   - This is your secret API key (keep it secure!)

2. **STRIPE_WEBHOOK_SECRET**
   - Location: Stripe Dashboard → Developers → Webhooks
   - After creating a webhook endpoint, copy the "Signing secret"
   - Format: `whsec_...`
   - This is used to verify webhook requests from Stripe

## Required Price IDs

You need to create two subscription products in Stripe:

### 1. Monthly Plan
- **Product Name**: "Monthly Plan" (or any name you prefer)
- **Price**: £20.00
- **Billing Period**: Monthly (recurring)
- **Currency**: GBP (British Pounds)
- Copy the **Price ID** (format: `price_...`)
- Add to `.env.local` as: `STRIPE_MONTHLY_PRICE_ID=price_...`

### 2. Annual Plan
- **Product Name**: "Annual Plan" (or any name you prefer)
- **Price**: £50.00
- **Billing Period**: Yearly (recurring)
- **Currency**: GBP (British Pounds)
- Copy the **Price ID** (format: `price_...`)
- Add to `.env.local` as: `STRIPE_ANNUAL_PRICE_ID=price_...`

## How to Create Products in Stripe

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Products** in the left sidebar
3. Click **+ Add product**
4. Fill in:
   - **Name**: "Monthly Plan" or "Annual Plan"
   - **Description**: (optional)
   - **Pricing model**: Standard pricing
   - **Price**: £20 (monthly) or £50 (annual)
   - **Billing period**: Monthly or Yearly
   - **Currency**: GBP
5. Click **Save product**
6. Copy the **Price ID** from the product page

## Webhook Setup

1. Go to Stripe Dashboard → **Developers** → **Webhooks**
2. Click **+ Add endpoint**
3. **Endpoint URL**: `https://yourdomain.com/api/stripe/webhook`
   - For local testing: Use Stripe CLI (see below)
4. **Events to send**: Select these events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click **Add endpoint**
6. Copy the **Signing secret** and add to `.env.local` as: `STRIPE_WEBHOOK_SECRET=whsec_...`

## Local Development Setup

For local testing, use Stripe CLI:

```bash
# Install Stripe CLI (if not installed)
# macOS: brew install stripe/stripe-cli/stripe
# Windows: Download from https://github.com/stripe/stripe-cli/releases

# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

The CLI will output a webhook signing secret. Use that for `STRIPE_WEBHOOK_SECRET` in local development.

## Environment Variables Summary

Add these to your `.env.local` file:

```env
# Stripe Keys
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price IDs
STRIPE_MONTHLY_PRICE_ID=price_...
STRIPE_ANNUAL_PRICE_ID=price_...

# App URL (for redirects)
NEXT_PUBLIC_APP_URL=http://localhost:3000  # or your production URL

# Supabase (if not already set)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # Required for webhook
```

## Testing

Use Stripe test cards:
- **Card Number**: `4242 4242 4242 4242`
- **Expiry**: Any future date (e.g., 12/25)
- **CVC**: Any 3 digits (e.g., 123)
- **ZIP**: Any 5 digits (e.g., 12345)

## Important Notes

- **Trial Period**: The system automatically applies a 14-day free trial to all new subscriptions
- **Currency**: All prices are in GBP (£)
- **Card Collection**: Card details are collected during signup, but no charge is made until the trial ends
- **Webhook Security**: Always use HTTPS in production for webhook endpoints

