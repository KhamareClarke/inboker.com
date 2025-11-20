import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendEmail, emailTemplates } from '@/lib/email';

/**
 * This endpoint should be called by a cron job to send appointment reminders
 * It checks for appointments that need reminders (1 day before and 1 hour before)
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    // Simple auth check - in production, use a secure token
    if (authHeader !== `Bearer ${process.env.CRON_SECRET || 'your-secret-key'}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

    // Find appointments that need day-before reminders (tomorrow, same time)
    const { data: dayReminders, error: dayError } = await supabase
      .from('business_profile_bookings')
      .select(`
        *,
        business_profile_services (
          name,
          duration_minutes
        ),
        business_profiles (
          business_name,
          user_id
        )
      `)
      .in('status', ['pending', 'confirmed'])
      .gte('start_time', oneDayFromNow.toISOString().split('T')[0] + 'T00:00:00')
      .lte('start_time', oneDayFromNow.toISOString().split('T')[0] + 'T23:59:59');

    // Find appointments that need hour-before reminders (in 1 hour)
    const { data: hourReminders, error: hourError } = await supabase
      .from('business_profile_bookings')
      .select(`
        *,
        business_profile_services (
          name,
          duration_minutes
        ),
        business_profiles (
          business_name,
          user_id
        )
      `)
      .in('status', ['pending', 'confirmed'])
      .gte('start_time', oneHourFromNow.toISOString())
      .lte('start_time', new Date(oneHourFromNow.getTime() + 5 * 60 * 1000).toISOString()); // 5 minute window

    const sentEmails = [];

    // Send day-before reminders
    if (dayReminders && !dayError) {
      for (const booking of dayReminders) {
        const { data: businessOwner } = await supabase
          .from('users')
          .select('email')
          .eq('id', booking.business_profiles?.user_id)
          .single();

        if (businessOwner?.email) {
          const emailContent = emailTemplates.appointmentReminder(booking, booking.business_profiles?.business_name || 'Business Owner', 'day');
          const success = await sendEmail({
            to: businessOwner.email,
            subject: emailContent.subject,
            html: emailContent.html,
          });
          if (success) {
            sentEmails.push({ bookingId: booking.id, type: 'day', email: businessOwner.email });
          }
        }
      }
    }

    // Send hour-before reminders
    if (hourReminders && !hourError) {
      for (const booking of hourReminders) {
        const { data: businessOwner } = await supabase
          .from('users')
          .select('email')
          .eq('id', booking.business_profiles?.user_id)
          .single();

        if (businessOwner?.email) {
          const emailContent = emailTemplates.appointmentReminder(booking, booking.business_profiles?.business_name || 'Business Owner', 'hour');
          const success = await sendEmail({
            to: businessOwner.email,
            subject: emailContent.subject,
            html: emailContent.html,
          });
          if (success) {
            sentEmails.push({ bookingId: booking.id, type: 'hour', email: businessOwner.email });
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      sent: sentEmails.length,
      dayReminders: dayReminders?.length || 0,
      hourReminders: hourReminders?.length || 0,
      emails: sentEmails,
    });
  } catch (error: any) {
    console.error('Error in reminders API:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send reminders' },
      { status: 500 }
    );
  }
}

