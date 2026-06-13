/*
  # In-app notification inbox (for "in_app" channel from sendNotification)
*/

CREATE TABLE IF NOT EXISTS public.user_inbox_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_inbox_user_created ON public.user_inbox_notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_inbox_unread ON public.user_inbox_notifications(user_id) WHERE read_at IS NULL;

ALTER TABLE public.user_inbox_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own inbox"
  ON public.user_inbox_notifications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users update own inbox"
  ON public.user_inbox_notifications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

COMMENT ON TABLE public.user_inbox_notifications IS 'In-app alerts; inserted when notifications use the in_app channel';
