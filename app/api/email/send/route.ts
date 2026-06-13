import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, emailTemplates } from '@/lib/email';
import { supabase } from '@/lib/supabase';
import { sendNotification } from '@/lib/notifications';
import { publicSiteOrigin } from '@/lib/public-site-url';
import { dispatchEmpireOsFromEmailSuccess } from '@/lib/empire-os/dispatch-from-email';

function formatWhen(iso: string) {
  try {
    return new Intl.DateTimeFormat('en-GB', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function bookingSideData(booking: any, businessName: string) {
  const whenLabel = formatWhen(booking.start_time);
  const serviceName = booking.business_profile_services?.name || 'Appointment';
  const ownerUserId = booking.business_profiles?.user_id as string | undefined;
  const ownerPhone = (booking.business_profiles?.contact_phone as string | null | undefined)?.trim();
  return { whenLabel, serviceName, ownerUserId, ownerPhone, businessName };
}

async function dispatchBookingSideChannels(
  type: string,
  booking: any,
  businessName: string,
  additionalData?: { cancelledBy?: string; [key: string]: unknown }
) {
  const { whenLabel, serviceName, ownerUserId, ownerPhone } = bookingSideData(booking, businessName);
  const base = publicSiteOrigin();
  const clientPhone = (booking.client_phone as string | null | undefined)?.trim();
  const ghl = !!(process.env.GHL_API_KEY && process.env.GHL_LOCATION_ID);

  const commonData = {
    serviceName,
    whenLabel,
    businessName,
    booking,
  };

  if (type === 'new_booking') {
    if (clientPhone && ghl) {
      void sendNotification({
        type: 'booking_confirmation_customer',
        channels: ['sms'],
        phone: clientPhone,
        userId: null,
        data: commonData,
      });
    }
    if (ownerPhone && ownerUserId && ghl) {
      void sendNotification({
        type: 'booking_notification_owner',
        channels: ['sms'],
        phone: ownerPhone,
        userId: ownerUserId,
        data: { ...commonData },
      });
    }
    if (ownerUserId) {
      void sendNotification({
        type: 'booking_notification_owner',
        channels: ['in_app'],
        userId: ownerUserId,
        data: { ...commonData },
      });
    }
  }

  if (type === 'customer_booking_confirmed' && clientPhone && ghl) {
    void sendNotification({
      type: 'booking_confirmation_customer',
      channels: ['sms'],
      phone: clientPhone,
      userId: null,
      data: commonData,
    });
  }

  if (type === 'customer_booking_cancelled' && clientPhone && ghl) {
    void sendNotification({
      type: 'booking_cancelled_customer',
      channels: ['sms'],
      phone: clientPhone,
      userId: null,
      data: commonData,
    });
  }

  const ownerCancelSource =
    (additionalData?.cancelledBy as string | undefined) || 'customer';

  if (type === 'booking_cancelled' && ownerPhone && ownerUserId && ghl) {
    void sendNotification({
      type: 'booking_cancelled_owner',
      channels: ['sms'],
      phone: ownerPhone,
      userId: ownerUserId,
      data: {
        ...commonData,
        cancelledBy: ownerCancelSource,
      },
    });
  }

  if (type === 'booking_cancelled' && ownerUserId) {
    void sendNotification({
      type: 'booking_cancelled_owner',
      channels: ['in_app'],
      userId: ownerUserId,
      data: { ...commonData, cancelledBy: ownerCancelSource },
    });
  }

  /** Business cancelled from dashboard — customer email type, but owner still gets SMS/in-app. */
  if (
    type === 'customer_booking_cancelled' &&
    ownerUserId &&
    (additionalData?.cancelledBy === 'business_owner' ||
      additionalData?.cancelledBy === 'business')
  ) {
    if (ownerPhone && ghl) {
      void sendNotification({
        type: 'booking_cancelled_owner',
        channels: ['sms'],
        phone: ownerPhone,
        userId: ownerUserId,
        data: {
          ...commonData,
          cancelledBy: 'business_owner',
        },
      });
    }
    void sendNotification({
      type: 'booking_cancelled_owner',
      channels: ['in_app'],
      userId: ownerUserId,
      data: { ...commonData, cancelledBy: 'business_owner' },
    });
  }

  if (type === 'new_review' && ownerUserId) {
    const review = booking._reviewExtra;
    if (review) {
      const emailLocal =
        typeof booking.client_email === 'string' && booking.client_email.includes('@')
          ? booking.client_email.split('@')[0]
          : '';
      const customerName =
        (review.customer_name as string | undefined)?.trim() ||
        (review.client_name as string | undefined)?.trim() ||
        (booking.client_name as string | undefined)?.trim() ||
        emailLocal ||
        'Customer';
      void sendNotification({
        type: 'review_posted_owner',
        channels: ['in_app'],
        userId: ownerUserId,
        data: {
          name: businessName,
          customerName,
          rating: review.rating,
          reviewText: review.review_text || '',
          dashboardUrl: `${base}/dashboard`,
        },
      });
      if (ownerPhone && ghl) {
        void sendNotification({
          type: 'review_posted_owner',
          channels: ['sms'],
          phone: ownerPhone,
          userId: ownerUserId,
          data: {
            customerName,
            rating: review.rating,
          },
        });
      }
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { type, bookingId, businessEmail, customerEmail, additionalData } = await request.json();

    if (!type) {
      return NextResponse.json(
        { error: 'Type is required' },
        { status: 400 }
      );
    }

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
            user_id,
            contact_phone
          )
        `)
        .eq('id', bookingId)
        .single();

      if (!error && data) {
        booking = data;
        
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
        (booking as any)._reviewExtra = additionalData.review;
        emailContent = emailTemplates.newReview(additionalData.review, booking, businessName);
        break;

      case 'customer_booking_confirmed':
        if (!booking) {
          return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
        }
        const baseUrl = publicSiteOrigin();
        emailContent = emailTemplates.customerBookingConfirmed(booking, businessName, `${baseUrl}/dashboard/customer/bookings`);
        break;

      case 'customer_booking_cancelled':
        if (!booking) {
          return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
        }
        const cancelledByCustomer = additionalData?.cancelledBy || 'business_owner';
        const baseUrl2 = publicSiteOrigin();
        emailContent = emailTemplates.customerBookingCancelled(booking, businessName, cancelledByCustomer, `${baseUrl2}/dashboard/customer/bookings`);
        break;

      case 'customer_booking_completed':
        if (!booking) {
          return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
        }
        const baseUrl3 = publicSiteOrigin();
        const reviewUrl = `${baseUrl3}/dashboard/customer/bookings?review=${booking.id}`;
        emailContent = emailTemplates.customerBookingCompleted(booking, businessName, `${baseUrl3}/dashboard/customer/bookings`, reviewUrl);
        break;

      default:
        return NextResponse.json({ error: 'Invalid email type' }, { status: 400 });
    }

    let recipientEmail: string | null = null;
    
    if (type.startsWith('customer_')) {
      recipientEmail = customerEmail || booking?.client_email;
      if (!recipientEmail) {
        return NextResponse.json({ error: 'Customer email not found' }, { status: 404 });
      }
    } else {
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

    if (success && booking) {
      await dispatchBookingSideChannels(type, booking, businessName, additionalData);
      dispatchEmpireOsFromEmailSuccess(type, booking as Record<string, unknown>, additionalData);
    }

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
