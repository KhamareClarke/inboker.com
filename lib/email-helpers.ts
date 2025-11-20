import { supabase } from '@/lib/supabase';

/**
 * Send email notification to business owner
 */
export async function sendEmailToBusinessOwner(
  bookingId: string,
  emailType: 'new_booking' | 'booking_cancelled' | 'booking_rescheduled' | 'new_review',
  additionalData?: any
) {
  try {
    // Fetch booking with business profile to get business owner email
    const { data: booking, error } = await supabase
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
      .eq('id', bookingId)
      .single();

    if (error || !booking) {
      console.error('Error fetching booking for email:', error);
      return false;
    }

    // Get business owner email from users table
    const { data: businessOwner, error: ownerError } = await supabase
      .from('users')
      .select('email')
      .eq('id', booking.business_profiles?.user_id)
      .single();

    if (ownerError || !businessOwner?.email) {
      console.error('Error fetching business owner email:', ownerError);
      return false;
    }

    // Call email API
    const response = await fetch('/api/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: emailType,
        bookingId: bookingId,
        businessEmail: businessOwner.email,
        additionalData: additionalData || {},
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Error sending email:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in sendEmailToBusinessOwner:', error);
    return false;
  }
}

