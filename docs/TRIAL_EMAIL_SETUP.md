# Trial Email Notifications Setup

This document explains how to set up email notifications for trial subscriptions.

## Email Types

The system sends the following emails:

1. **Welcome Email** - Sent when a user creates an account and starts their free trial
2. **Trial Ending Reminders** - Sent 4, 3, 2, and 1 days before trial ends
3. **Trial Ended Email** - Sent on the day the trial ends and payment is processed

## Email Templates

All email templates are defined in `lib/email.ts`:
- `trialStarted` - Welcome email with trial details
- `trialEndingReminder` - Reminder emails before trial ends
- `trialEnded` - Notification when trial ends and payment is processed

## Automatic Email Sending

### Welcome Email
- **Trigger**: Automatically sent when Stripe checkout session is completed and subscription status is 'trialing'
- **Location**: `app/api/stripe/webhook/route.ts` - `checkout.session.completed` event

### Trial Ended Email
- **Trigger**: Automatically sent when first payment succeeds after trial period
- **Location**: `app/api/stripe/webhook/route.ts` - `invoice.payment_succeeded` event

### Trial Reminder Emails
- **Trigger**: Requires a cron job to call the API endpoint daily
- **Location**: `app/api/cron/trial-reminders/route.ts`

## Setting Up the Cron Job

### Option 1: Using a Cron Service (Recommended)

Use a service like:
- **Cron-job.org** (free)
- **EasyCron** (free tier available)
- **UptimeRobot** (free tier available)

**Setup Steps:**

1. Create a new cron job
2. **URL**: `https://your-domain.com/api/cron/trial-reminders`
3. **Method**: POST
4. **Headers**: 
   ```
   Authorization: Bearer YOUR_CRON_SECRET
   Content-Type: application/json
   ```
5. **Schedule**: Daily at 9:00 AM (or your preferred time)
   - Cron expression: `0 9 * * *` (9 AM every day)

### Option 2: Using Vercel Cron (if deployed on Vercel)

Create or update `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/trial-reminders",
      "schedule": "0 9 * * *"
    }
  ]
}
```

Then set the `CRON_SECRET` environment variable in Vercel dashboard.

### Option 3: Manual Testing

You can test the endpoint manually:

```bash
curl -X POST https://your-domain.com/api/cron/trial-reminders \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  -H "Content-Type: application/json"
```

## Environment Variables

Make sure these are set in your `.env.local` or production environment:

```env
# Email configuration (required)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Cron secret (required for cron endpoint)
CRON_SECRET=your-secret-key-here

# App URL (used in email links)
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## How It Works

1. **Daily Cron Job** runs at 9 AM (or your scheduled time)
2. **Fetches** all subscriptions with status 'trialing' or 'trial' that have a `trial_end` date
3. **Calculates** days remaining until trial ends
4. **Sends** reminder emails if:
   - 4 days remaining
   - 3 days remaining
   - 2 days remaining
   - 1 day remaining
5. **Logs** all sent emails for monitoring

## Monitoring

Check your application logs to see:
- Which emails were sent
- Any errors that occurred
- Number of reminders sent per run

The cron endpoint returns a JSON response:
```json
{
  "message": "Trial reminders processed",
  "remindersSent": 5,
  "details": [
    "user1@example.com (4 days remaining)",
    "user2@example.com (3 days remaining)",
    ...
  ]
}
```

## Troubleshooting

### Emails Not Sending
1. Check that `EMAIL_USER` and `EMAIL_PASS` are set correctly
2. Verify Gmail app password is valid
3. Check application logs for errors

### Cron Job Not Running
1. Verify `CRON_SECRET` is set correctly
2. Check that the Authorization header matches
3. Test the endpoint manually first
4. Verify the cron service is actually calling the endpoint

### Reminders Not Being Sent
1. Check that subscriptions have `trial_end` dates set
2. Verify subscription status is 'trialing' or 'trial'
3. Check that days remaining calculation is correct (should be 1-4 days)

## Email Content

All emails include:
- Professional HTML formatting
- Clear call-to-action buttons
- Links to dashboard and billing pages
- Trial end dates and subscription details

