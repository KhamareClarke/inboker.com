/*
  # Notifications: logs, preferences, review-request idempotency

  - notification_logs: audit trail for multi-channel sends (email/SMS/push/in-app).
  - notification_preferences: per-user toggles (defaults on).
  - business_profile_bookings.review_request_sent_at: avoid duplicate review emails.
*/

CREATE TABLE IF NOT EXISTS public.notification_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  email text,
  phone text,
  channels text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'partial')),
  error_message text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notification_logs_user_id ON public.notification_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_created_at ON public.notification_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notification_logs_type ON public.notification_logs(type);

CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  email_enabled boolean NOT NULL DEFAULT true,
  sms_enabled boolean NOT NULL DEFAULT true,
  push_enabled boolean NOT NULL DEFAULT false,
  frequency text NOT NULL DEFAULT 'immediate' CHECK (frequency IN ('immediate', 'daily', 'weekly', 'never')),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON public.notification_preferences(user_id);

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own notification preferences"
  ON public.notification_preferences
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins read notification preferences"
  ON public.notification_preferences
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

COMMENT ON TABLE public.notification_logs IS 'Outbound notification attempts (email, SMS, etc.)';
COMMENT ON TABLE public.notification_preferences IS 'Per-user channel preferences for notifications';

ALTER TABLE public.business_profile_bookings
  ADD COLUMN IF NOT EXISTS review_request_sent_at timestamptz;

COMMENT ON COLUMN public.business_profile_bookings.review_request_sent_at IS 'Set when post-visit review request email was sent';
