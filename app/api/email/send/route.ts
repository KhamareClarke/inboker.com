import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, emailTemplates } from '@/lib/email';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { type, bookingId, businessEmail, customerEmail, additionalData } = await request.json();

    if (!type) {
      return NextResponse.json(
        { error: 'Type is required' },
        { status: 400 }
      );
    }

    // Fetch booking details if bookingId is provided
    let booking = null;
    let businessOwnerEmail = businessEmail;
    
    if (bookingId) {
      const { data, error } = await supabase
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

      if (!error && data) {
        booking = data;
        
        // If business email not provided, fetch it from users table
        if (!businessOwnerEmail && booking.business_profiles?.user_id) {
          const { data: owner, error: ownerError } = await supabase
            .from('users')
            .select('email')
            .eq('id', booking.business_profiles.user_id)
            .single();
          
          if (!ownerError && owner?.email) {
            businessOwnerEmail = owner.email;
          }
        }
      }
    }

    let emailContent;
    const businessName = booking?.business_profiles?.business_name || 'Business Owner';

    switch (type) {
      case 'new_booking':
        if (!booking) {
          return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
        }
        emailContent = emailTemplates.newBooking(booking, businessName);
        break;

      case 'booking_cancelled':
        if (!booking) {
          return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
        }
        const cancelledByBusiness = additionalData?.cancelledBy || 'customer';
        emailContent = emailTemplates.bookingCancelled(booking, businessName, cancelledByBusiness);
        break;

      case 'booking_rescheduled':
        if (!booking) {
          return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
        }
        emailContent = emailTemplates.bookingRescheduled(
          booking,
          businessName,
          additionalData?.newDate || '',
          additionalData?.newTime || ''
        );
        break;

      case 'appointment_reminder':
        if (!booking) {
          return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
        }
        const reminderType = additionalData?.reminderType || 'day';
        emailContent = emailTemplates.appointmentReminder(booking, businessName, reminderType);
        break;

      case 'new_review':
        if (!booking || !additionalData?.review) {
          return NextResponse.json({ error: 'Booking or review not found' }, { status: 404 });
        }
        emailContent = emailTemplates.newReview(additionalData.review, booking, businessName);
        break;

      case 'customer_booking_confirmed':
        if (!booking) {
          return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
        }
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        emailContent = emailTemplates.customerBookingConfirmed(booking, businessName, `${baseUrl}/dashboard/customer/bookings`);
        break;

      case 'customer_booking_cancelled':
        if (!booking) {
          return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
        }
        const cancelledByCustomer = additionalData?.cancelledBy || 'business_owner';
        const baseUrl2 = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        emailContent = emailTemplates.customerBookingCancelled(booking, businessName, cancelledByCustomer, `${baseUrl2}/dashboard/customer/bookings`);
        break;

      case 'customer_booking_completed':
        if (!booking) {
          return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
        }
        const baseUrl3 = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const reviewUrl = `${baseUrl3}/dashboard/customer/bookings?review=${booking.id}`;
        emailContent = emailTemplates.customerBookingCompleted(booking, businessName, `${baseUrl3}/dashboard/customer/bookings`, reviewUrl);
        break;

      default:
        return NextResponse.json({ error: 'Invalid email type' }, { status: 400 });
    }

    // Determine recipient email based on email type
    let recipientEmail: string | null = null;
    
    if (type.startsWith('customer_')) {
      // Customer emails
      recipientEmail = customerEmail || booking?.client_email;
      if (!recipientEmail) {
        return NextResponse.json({ error: 'Customer email not found' }, { status: 404 });
      }
    } else {
      // Business owner emails
      recipientEmail = businessOwnerEmail;
      if (!recipientEmail) {
        return NextResponse.json({ error: 'Business owner email not found' }, { status: 404 });
      }
    }

    const success = await sendEmail({
      to: recipientEmail,
      subject: emailContent.subject,
      html: emailContent.html,
    });

    if (success) {
      return NextResponse.json({ success: true, message: 'Email sent successfully' });
    } else {
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Error in email API:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send email' },
      { status: 500 }
    );
  }
}

