export type NotificationType =
  | 'signup_confirmation'
  | 'login_alert'
  | 'password_reset_request'
  | 'password_changed'
  | 'booking_confirmation_customer'
  | 'booking_notification_owner'
  | 'booking_reminder_customer'
  | 'booking_cancelled_customer'
  | 'booking_cancelled_owner'
  | 'review_request'
  | 'review_posted_owner'
  | 'subscription_expiration_warning'
  | 'subscription_renewal_confirmation';

export type NotificationChannel = 'email' | 'sms' | 'push' | 'in_app';

export type SendNotificationInput = {
  type: NotificationType;
  channels: NotificationChannel[];
  email?: string | null;
  phone?: string | null;
  userId?: string | null;
  data: Record<string, unknown>;
};

export type SendNotificationResult = {
  emailOk: boolean;
  smsOk: boolean;
  pushOk: boolean;
  inAppOk: boolean;
  error?: string;
};
