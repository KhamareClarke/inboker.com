import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendEmail, emailTemplates } from '@/lib/email';

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

/**
 * Cron job to send trial ending reminder emails
 * Should be called daily (e.g., at 9 AM)
 * 
 * Sends reminders:
 * - 4 days before trial ends
 * - 3 days before trial ends
 * - 2 days before trial ends
 * - 1 day before trial ends
 * 
 * Usage:
 * - Set up a cron job to call: POST /api/cron/trial-reminders
 * - Include Authorization header: Bearer {CRON_SECRET}
 */
export async function POST(req: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (!cronSecret) {
      console.error('CRON_SECRET not configured');
      return NextResponse.json({ error: 'Cron secret not configured' }, { status: 500 });
    }

    if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const remindersSent: string[] = [];

    // Get all active trials
    const { data: subscriptions, error } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .in('status', ['trialing', 'trial'])
      .not('trial_end', 'is', null);

    if (error) {
      console.error('Error fetching subscriptions:', error);
      return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 });
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ 
        message: 'No active trials found',
        remindersSent: 0 
      });
    }

    // Check each subscription for reminders
    for (const subscription of subscriptions) {
      if (!subscription.trial_end) continue;

      const trialEndDate = new Date(subscription.trial_end);
      const daysRemaining = Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      // Send reminder if 4, 3, 2, or 1 days remaining
      if (daysRemaining >= 1 && daysRemaining <= 4) {
        // Fetch user data
        const { data: userData, error: userError } = await supabaseAdmin
          .from('users')
          .select('email, full_name')
          .eq('id', subscription.user_id)
          .single();

        if (userError || !userData?.email) {
          console.warn(`No email found for subscription ${subscription.id}:`, userError);
          continue;
        }

        try {
          const emailContent = emailTemplates.trialEndingReminder(
            userData.full_name || userData.email,
            daysRemaining,
            trialEndDate
          );

          const success = await sendEmail({
            to: userData.email,
            subject: emailContent.subject,
            html: emailContent.html,
          });

          if (success) {
            remindersSent.push(`${userData.email} (${daysRemaining} days remaining)`);
            console.log(`Trial reminder sent to ${userData.email} - ${daysRemaining} days remaining`);
          } else {
            console.error(`Failed to send reminder to ${userData.email}`);
          }
        } catch (emailError) {
          console.error(`Error sending reminder to ${userData.email}:`, emailError);
        }
      }
    }

    return NextResponse.json({
      message: 'Trial reminders processed',
      remindersSent: remindersSent.length,
      details: remindersSent,
    });
  } catch (error: any) {
    console.error('Error in trial reminders cron:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process trial reminders' },
      { status: 500 }
    );
  }
}

// Allow GET for testing (remove in production)
export async function GET(req: NextRequest) {
  return NextResponse.json({ 
    message: 'Trial reminders cron endpoint',
    note: 'Use POST with Authorization header to trigger',
  });
}

