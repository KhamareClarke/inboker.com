import { triggerEmpireOsEvent } from './events';

/** Fire-and-forget Empire OS hooks after transactional emails (booking/review lifecycle). */
export function dispatchEmpireOsFromEmailSuccess(
  emailType: string,
  booking: Record<string, unknown> | null,
  additionalData?: Record<string, unknown>
) {
  if (!booking?.id) return;

  const businessId = (booking.business_profile_id as string | undefined) ?? null;

  if (emailType === 'new_booking') {
    void triggerEmpireOsEvent(
      'booking_created',
      {
        bookingId: booking.id,
        serviceId: booking.service_id,
        staffId: booking.staff_id,
        startTime: booking.start_time,
        endTime: booking.end_time,
        clientEmail: booking.client_email,
        clientName: booking.client_name,
        amount: booking.amount,
        status: booking.status,
      },
      businessId
    );
    return;
  }

  if (emailType === 'booking_cancelled' || emailType === 'customer_booking_cancelled') {
    void triggerEmpireOsEvent(
      'booking_cancelled',
      {
        bookingId: booking.id,
        cancelledBy: additionalData?.cancelledBy,
        status: booking.status,
      },
      businessId
    );
    return;
  }

  if (emailType === 'new_review' && additionalData?.review) {
    const r = additionalData.review as Record<string, unknown>;
    void triggerEmpireOsEvent(
      'review_posted',
      {
        bookingId: booking.id,
        rating: r.rating,
        reviewText: r.review_text,
        feedback: r.feedback,
      },
      businessId
    );
  }
}
