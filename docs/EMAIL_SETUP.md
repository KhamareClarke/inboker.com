# Email Setup Guide

This guide explains how to set up Gmail SMTP email notifications for business owners.

## Environment Variables

Add these to your `.env.local` file:

```env
EMAIL_USER=khamareclarke@gmail.com
EMAIL_PASS=ovga hgzy rltc ifyh
CRON_SECRET=your-secret-key-here
```

## Gmail App Password Setup

1. Go to your Google Account settings
2. Enable 2-Step Verification
3. Go to App Passwords (https://myaccount.google.com/apppasswords)
4. Generate a new app password for "Mail"
5. Use that password in `EMAIL_PASS`

## Email Notifications

The system sends emails to business owners for:

1. **New Booking** - When a customer books an appointment
2. **Booking Cancelled** - When an appointment is cancelled (by customer or business owner)
3. **Booking Rescheduled** - When an appointment is rescheduled
4. **New Review** - When a customer submits a review
5. **Appointment Reminders** - 1 day before and 1 hour before appointment

## Reminder System Setup

To set up automatic reminders, you need to call the reminder API endpoint regularly using a cron job.

### Option 1: Using a Cron Service (Recommended)

Use a service like:
- **Cron-job.org** (free)
- **EasyCron** (free tier available)
- **Vercel Cron** (if deployed on Vercel)

Set up a cron job to call:
```
POST https://your-domain.com/api/email/reminders
Authorization: Bearer your-secret-key-here
```

**Recommended Schedule:**
- Every hour: Check for 1-hour-before reminders
- Daily at 9 AM: Check for day-before reminders

### Option 2: Using Vercel Cron (if on Vercel)

Create `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/email/reminders",
      "schedule": "0 * * * *"
    }
  ]
}
```

## Testing

Test the email system by:
1. Creating a booking
2. Cancelling a booking
3. Rescheduling a booking
4. Submitting a review

Check the business owner's email inbox for notifications.

## Troubleshooting

- **Emails not sending**: Check that `EMAIL_USER` and `EMAIL_PASS` are set correctly
- **Authentication errors**: Make sure you're using an App Password, not your regular Gmail password
- **Reminders not working**: Verify the cron job is calling the API with the correct `CRON_SECRET`

