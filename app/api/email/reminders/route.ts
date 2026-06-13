import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendEmail, emailTemplates } from '@/lib/email';
import { sendNotification } from '@/lib/notifications';

const getSupabaseAdmin = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
};

function checkCronAuth(request: NextRequest): NextResponse | null {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET || 'your-secret-key';
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}

/**
 * Cron job: send appointment reminders (24h and 1h before).
 * - Vercel Cron sends GET; external crons can use POST. Both run the same logic.
 * - Sends to the customer (booking.client_email).
 * - Idempotent via reminder_24h_sent_at / reminder_1h_sent_at; logs to reminder_deliveries.
 */
async function runReminders() {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    throw new Error('Server misconfiguration: Supabase service role not set');
  }

  const now = new Date();
    const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

    const tomorrowStart = oneDayFromNow.toISOString().split('T')[0] + 'T00:00:00';
    const tomorrowEnd = oneDayFromNow.toISOString().split('T')[0] + 'T23:59:59';
    const hourWindowEnd = new Date(oneHourFromNow.getTime() + 5 * 60 * 1000).toISOString();

    // Appointments tomorrow that haven't had 24h reminder yet
    const { data: dayReminders, error: dayError } = await supabase
      .from('business_profile_bookings')
      .select(`
        *,
        business_profile_services ( name, duration_minutes ),
        business_profiles ( business_name, user_id )
      `)
      .in('status', ['pending', 'confirmed'])
      .gte('start_time', tomorrowStart)
      .lte('start_time', tomorrowEnd)
      .is('reminder_24h_sent_at', null);

  if (dayError) {
    console.error('Day reminders query error:', dayError);
    throw new Error(`Failed to fetch day reminders: ${dayError.message}`);
  }

    // Appointments in ~1 hour that haven't had 1h reminder yet
    const { data: hourReminders, error: hourError } = await supabase
      .from('business_profile_bookings')
      .select(`
        *,
        business_profile_services ( name, duration_minutes ),
        business_profiles ( business_name, user_id )
      `)
      .in('status', ['pending', 'confirmed'])
      .gte('start_time', oneHourFromNow.toISOString())
      .lte('start_time', hourWindowEnd)
      .is('reminder_1h_sent_at', null);

  if (hourError) {
    console.error('Hour reminders query error:', hourError);
    throw new Error(`Failed to fetch hour reminders: ${hourError.message}`);
  }

    const sentEmails: { bookingId: string; type: '24h' | '1h'; email: string }[] = [];

    const businessName = (b: any) => b.business_profiles?.business_name || 'Business';

    const formatWhen = (iso: string) =>
      new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(
        new Date(iso)
      );

    // Send 24h reminders to customer (client_email)
    if (dayReminders?.length) {
      for (const booking of dayReminders) {
        const to = booking.client_email;
        if (!to) continue;
        const emailContent = emailTemplates.appointmentReminder(
          booking,
          businessName(booking),
          'day'
        );
        const success = await sendEmail({
          to,
          subject: emailContent.subject,
          html: emailContent.html,
        });
        if (success) {
          await supabase
            .from('business_profile_bookings')
            .update({ reminder_24h_sent_at: new Date().toISOString() })
            .eq('id', booking.id);
          await supabase.from('reminder_deliveries').insert({
            booking_id: booking.id,
            reminder_type: '24h',
            recipient_email: to,
          });
          sentEmails.push({ bookingId: booking.id, type: '24h', email: to });
          const phone = booking.client_phone as string | null | undefined;
          if (phone) {
            void sendNotification({
              type: 'booking_reminder_customer',
              channels: ['sms'],
              phone,
              userId: null,
              data: {
                serviceName: booking.business_profile_services?.name || 'Appointment',
                businessName: businessName(booking),
                whenLabel: formatWhen(booking.start_time),
                booking,
                reminderType: 'day',
              },
            });
          }
        }
      }
    }

    // Send 1h reminders to customer (client_email)
    if (hourReminders?.length) {
      for (const booking of hourReminders) {
        const to = booking.client_email;
        if (!to) continue;
        const emailContent = emailTemplates.appointmentReminder(
          booking,
          businessName(booking),
          'hour'
        );
        const success = await sendEmail({
          to,
          subject: emailContent.subject,
          html: emailContent.html,
        });
        if (success) {
          await supabase
            .from('business_profile_bookings')
            .update({ reminder_1h_sent_at: new Date().toISOString() })
            .eq('id', booking.id);
          await supabase.from('reminder_deliveries').insert({
            booking_id: booking.id,
            reminder_type: '1h',
            recipient_email: to,
          });
          sentEmails.push({ bookingId: booking.id, type: '1h', email: to });
          const phone = booking.client_phone as string | null | undefined;
          if (phone) {
            void sendNotification({
              type: 'booking_reminder_customer',
              channels: ['sms'],
              phone,
              userId: null,
              data: {
                serviceName: booking.business_profile_services?.name || 'Appointment',
                businessName: businessName(booking),
                whenLabel: formatWhen(booking.start_time),
                booking,
                reminderType: 'hour',
              },
            });
          }
        }
      }
    }

  return {
    success: true,
    sent: sentEmails.length,
    dayReminders: dayReminders?.length || 0,
    hourReminders: hourReminders?.length || 0,
    emails: sentEmails,
  };
}

/** Vercel Cron sends GET; accept both GET and POST. */
export async function GET(request: NextRequest) {
  const unauth = checkCronAuth(request);
  if (unauth) return unauth;
  try {
    const result = await runReminders();
    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to send reminders';
    console.error('Error in reminders API (GET):', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const unauth = checkCronAuth(request);
  if (unauth) return unauth;
  try {
    const result = await runReminders();
    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to send reminders';
    console.error('Error in reminders API (POST):', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
