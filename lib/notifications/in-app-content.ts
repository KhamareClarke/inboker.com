import type { NotificationType } from './types';

/** Short title + body for user_inbox_notifications rows. */
export function inboxContent(
  type: NotificationType,
  data: Record<string, unknown>
): { title: string; body: string } {
  const s = (k: string) => (data[k] != null ? String(data[k]) : '').trim();

  switch (type) {
    case 'signup_confirmation':
      return { title: 'Welcome to Inboker', body: 'Your account is ready. Set up your profile to get started.' };
    case 'login_alert':
      return { title: 'New sign-in', body: `Sign-in from ${s('ip')} · ${s('device')}` };
    case 'password_reset_request':
      return { title: 'Password reset', body: 'Check your email for a reset link.' };
    case 'password_changed':
      return { title: 'Password updated', body: `Your password was changed on ${s('timestamp')}.` };
    case 'booking_notification_owner':
      return { title: 'New booking', body: `${s('serviceName')} · ${s('whenLabel')}` };
    case 'booking_reminder_customer':
      return { title: 'Appointment reminder', body: `${s('serviceName')} at ${s('whenLabel')}` };
    case 'booking_cancelled_customer':
    case 'booking_cancelled_owner':
      return { title: 'Booking cancelled', body: `${s('serviceName')} · ${s('whenLabel')}` };
    case 'review_request':
      return { title: 'Leave a review', body: `How was ${s('businessName')}?` };
    case 'review_posted_owner':
      return { title: 'New review', body: `${s('customerName')} rated ${s('rating')}/5` };
    case 'subscription_expiration_warning':
      return {
        title: 'Subscription / trial ending',
        body: `Ends in ${s('daysLeft')} day(s) (${s('endDate')}).`,
      };
    case 'subscription_renewal_confirmation':
      return { title: 'Subscription renewed', body: `Next renewal: ${s('nextRenewal')}` };
    case 'booking_confirmation_customer':
      return { title: 'Booking confirmed', body: `${s('serviceName')} · ${s('whenLabel')}` };
    default:
      return { title: 'Inboker', body: type };
  }
}
