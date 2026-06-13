import { sendEmail, emailTemplates } from '@/lib/email';
import { sendGhlSms } from './ghl-sms';
import { logNotification } from './log-notification';
import type {
  NotificationChannel,
  NotificationType,
  SendNotificationInput,
  SendNotificationResult,
} from './types';
import {
  loginAlertEmail,
  passwordChangedEmail,
  passwordResetRequestEmail,
  signupConfirmationEmail,
  smsBookingCustomerConfirm,
  smsBookingReminder,
  smsSignupWelcome,
  smsBookingCancelled,
  smsNewReviewOwner,
  subscriptionExpirationWarningEmail,
  subscriptionRenewalEmail,
  reviewPostedOwnerEmail,
  reviewRequestEmail,
  smsReviewRequest,
} from './templates';
import { inboxContent } from './in-app-content';
import { createClient } from '@supabase/supabase-js';
import { normalizeSupabaseUrl } from '@/lib/supabase-env';
import type { Database, Json } from '@/lib/supabase';
import { publicSiteOrigin } from '@/lib/public-site-url';

function admin() {
  const url =
    normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL) ??
    process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) return null;
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function channelAllowed(
  userId: string | null | undefined,
  channel: NotificationChannel
): Promise<boolean> {
  if (!userId) return true;
  const supabase = admin();
  if (!supabase) return true;
  const { data } = await (supabase as any)
    .from('notification_preferences')
    .select('email_enabled, sms_enabled, push_enabled, frequency')
    .eq('user_id', userId)
    .maybeSingle();

  const row = data as {
    email_enabled?: boolean;
    sms_enabled?: boolean;
    push_enabled?: boolean;
    frequency?: string;
  } | null;

  if (!row) return true;
  if (channel === 'in_app') return true;
  if (row.frequency === 'never') return false;
  if (channel === 'email' && row.email_enabled === false) return false;
  if (channel === 'sms' && row.sms_enabled === false) return false;
  if (channel === 'push' && row.push_enabled === false) return false;
  return true;
}

function buildEmailPayload(type: NotificationType, input: SendNotificationInput) {
  const d = input.data;
  const name = (d.name as string) || (d.fullName as string) || 'there';

  switch (type) {
    case 'signup_confirmation':
      return signupConfirmationEmail(name);
    case 'login_alert':
      return loginAlertEmail(
        name,
        (d.ip as string) || 'Unknown',
        (d.device as string) || 'Unknown',
        (d.timestamp as string) || new Date().toISOString()
      );
    case 'password_reset_request':
      return passwordResetRequestEmail(
        name,
        (d.resetLink as string) ||
          `${publicSiteOrigin()}/login`
      );
    case 'password_changed':
      return passwordChangedEmail(name, (d.timestamp as string) || new Date().toISOString());
    case 'subscription_renewal_confirmation':
      return subscriptionRenewalEmail(
        name,
        (d.amountLabel as string) || '',
        (d.nextRenewal as string) || ''
      );
    case 'subscription_expiration_warning':
      return subscriptionExpirationWarningEmail(
        name,
        Number(d.daysLeft ?? 7),
        (d.endDate as string) || ''
      );
    case 'review_request':
      return reviewRequestEmail(
        (d.customerName as string) || name,
        (d.businessName as string) || 'Business',
        (d.serviceName as string) || 'Service',
        (d.reviewUrl as string) ||
          `${publicSiteOrigin()}/dashboard/customer/bookings`
      );
    case 'review_posted_owner':
      return reviewPostedOwnerEmail(
        name,
        (d.customerName as string) || 'Customer',
        Number(d.rating ?? 5),
        (d.reviewText as string) || '',
        (d.dashboardUrl as string) ||
          `${publicSiteOrigin()}/dashboard`
      );
    case 'booking_confirmation_customer': {
      const booking = d.booking as Record<string, unknown> | undefined;
      const businessName = (d.businessName as string) || 'Business';
      const dashboardUrl =
        (d.dashboardUrl as string) ||
        `${publicSiteOrigin()}/dashboard/customer/bookings`;
      if (!booking) return null;
      return emailTemplates.customerBookingConfirmed(booking, businessName, dashboardUrl);
    }
    case 'booking_notification_owner': {
      const booking = d.booking as Record<string, unknown> | undefined;
      const businessName = (d.businessName as string) || 'Your business';
      if (!booking) return null;
      return emailTemplates.newBooking(booking, businessName);
    }
    case 'booking_reminder_customer': {
      const booking = d.booking as Record<string, unknown> | undefined;
      const businessName = (d.businessName as string) || 'Business';
      const reminderType = (d.reminderType as 'day' | 'hour') || 'day';
      if (!booking) return null;
      return emailTemplates.appointmentReminder(booking, businessName, reminderType);
    }
    case 'booking_cancelled_customer': {
      const booking = d.booking as Record<string, unknown> | undefined;
      const businessName = (d.businessName as string) || 'Business';
      const cancelledBy = (d.cancelledBy as string) || 'business';
      const dash =
        (d.dashboardUrl as string) ||
        `${publicSiteOrigin()}/dashboard/customer/bookings`;
      if (!booking) return null;
      return emailTemplates.customerBookingCancelled(booking, businessName, cancelledBy, dash);
    }
    case 'booking_cancelled_owner': {
      const booking = d.booking as Record<string, unknown> | undefined;
      const businessName = (d.businessName as string) || 'Business';
      if (!booking) return null;
      return emailTemplates.bookingCancelled(booking, businessName, (d.cancelledBy as string) || 'customer');
    }
    default:
      return null;
  }
}

function buildSmsBody(type: NotificationType, input: SendNotificationInput): string | null {
  const d = input.data;
  const name = (d.name as string) || (d.fullName as string) || 'there';

  switch (type) {
    case 'signup_confirmation':
      return smsSignupWelcome(name);
    case 'booking_confirmation_customer':
      return smsBookingCustomerConfirm(
        (d.serviceName as string) || 'Appointment',
        (d.whenLabel as string) || '',
        (d.businessName as string) || 'Inboker'
      );
    case 'booking_reminder_customer':
      return smsBookingReminder(
        (d.serviceName as string) || 'Appointment',
        (d.whenLabel as string) || '',
        (d.businessName as string) || 'Inboker'
      );
    case 'review_request':
      return smsReviewRequest(
        (d.businessName as string) || 'your visit',
        (d.reviewUrl as string) ||
          `${publicSiteOrigin()}/dashboard/customer/bookings`
      );
    case 'booking_notification_owner':
      return `Inboker: New booking — ${(d.serviceName as string) || 'Service'} ${(d.whenLabel as string) || ''}. ${publicSiteOrigin()}`;
    case 'booking_cancelled_customer':
    case 'booking_cancelled_owner':
      return smsBookingCancelled(
        (d.serviceName as string) || 'Appointment',
        (d.whenLabel as string) || '',
        (d.businessName as string) || 'Inboker'
      );
    case 'review_posted_owner':
      return smsNewReviewOwner(
        (d.customerName as string) || 'Customer',
        Number(d.rating ?? 5)
      );
    default:
      return null;
  }
}

async function insertInAppNotification(
  userId: string,
  type: NotificationType,
  data: Record<string, unknown>
): Promise<boolean> {
  const supabase = admin();
  if (!supabase) return false;
  const { title, body } = inboxContent(type, data);
  const { error } = await (supabase as any).from('user_inbox_notifications').insert({
    user_id: userId,
    type,
    title,
    body,
    metadata: data as Json,
  });
  if (error) {
    console.warn('[notifications] in_app insert:', error.message);
    return false;
  }
  return true;
}

/**
 * Multi-channel notification entry point (server-only).
 * Email uses existing Gmail SMTP (EMAIL_USER / EMAIL_PASS).
 * SMS uses Go High Level when GHL_API_KEY and GHL_LOCATION_ID are set.
 */
export async function sendNotification(
  input: SendNotificationInput
): Promise<SendNotificationResult> {
  const result: SendNotificationResult = {
    emailOk: false,
    smsOk: false,
    pushOk: !input.channels.includes('push'),
    inAppOk: !input.channels.includes('in_app'),
  };

  const channels = input.channels;
  const meta: Json = { type: input.type } as Json;

  try {
    if (channels.includes('email') && input.email?.trim()) {
      if (await channelAllowed(input.userId, 'email')) {
        const payload = buildEmailPayload(input.type, input);
        if (payload) {
          result.emailOk = await sendEmail({
            to: input.email.trim(),
            subject: payload.subject,
            html: payload.html,
          });
        }
      }
    }

    if (channels.includes('sms') && input.phone?.trim()) {
      if (await channelAllowed(input.userId, 'sms')) {
        const body = buildSmsBody(input.type, input);
        if (body) {
          result.smsOk = await sendGhlSms(input.phone.trim(), body);
        }
      }
    }

    if (channels.includes('in_app') && input.userId) {
      result.inAppOk = await insertInAppNotification(input.userId, input.type, input.data);
    }

    // push: wire FCM/APNs later; treat as no-op success for now
    if (channels.includes('push')) {
      result.pushOk = true;
    }

    let status: 'sent' | 'failed' | 'partial' = 'sent';
    const wantedEmail = channels.includes('email') && !!input.email?.trim();
    const wantedSms = channels.includes('sms') && !!input.phone?.trim();
    const wantedInApp = channels.includes('in_app') && !!input.userId;
    const wantedPush = channels.includes('push');

    const okEmail = !wantedEmail || result.emailOk;
    const okSms = !wantedSms || result.smsOk;
    const okInApp = !wantedInApp || result.inAppOk;
    const okPush = !wantedPush || result.pushOk;

    if (okEmail && okSms && okInApp && okPush) {
      status = 'sent';
    } else if (okEmail || okSms || okInApp || okPush) {
      status = 'partial';
    } else {
      status = 'failed';
    }

    await logNotification({
      type: input.type,
      userId: input.userId,
      email: input.email,
      phone: input.phone,
      channels,
      status,
      errorMessage:
        status === 'failed' || status === 'partial'
          ? `emailOk=${result.emailOk} smsOk=${result.smsOk} inAppOk=${result.inAppOk} pushOk=${result.pushOk}`
          : null,
      metadata: meta,
    });
  } catch (e) {
    result.error = e instanceof Error ? e.message : 'notification error';
    await logNotification({
      type: input.type,
      userId: input.userId,
      email: input.email,
      phone: input.phone,
      channels,
      status: 'failed',
      errorMessage: result.error,
      metadata: meta,
    });
  }

  return result;
}
