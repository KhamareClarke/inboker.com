/*
  # Empire OS integration — outbound events log + inbound recommendations

  - empire_os_events: audit of events sent to Empire OS (service role inserts).
  - empire_os_recommendations: AI recommendations per business (read/update by owner).
*/

CREATE TABLE IF NOT EXISTS public.empire_os_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES public.business_profiles(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  skill_ids integer[] NOT NULL DEFAULT ARRAY[]::integer[],
  outbound_ok boolean NOT NULL DEFAULT false,
  outbound_status int,
  outbound_error text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_empire_os_events_business_created
  ON public.empire_os_events (business_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_empire_os_events_type_created
  ON public.empire_os_events (event_type, created_at DESC);

ALTER TABLE public.empire_os_events ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.empire_os_events IS 'Outbound Empire OS webhook attempts; inserts via service role only';

CREATE TABLE IF NOT EXISTS public.empire_os_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  skill_id int NOT NULL CHECK (skill_id >= 1 AND skill_id <= 33),
  title text NOT NULL,
  description text NOT NULL,
  action text,
  estimated_impact text NOT NULL DEFAULT 'medium' CHECK (estimated_impact IN ('high', 'medium', 'low')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'implemented', 'dismissed')),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  implemented_at timestamptz,
  dismissed_at timestamptz,
  impact_measurement jsonb
);

CREATE INDEX IF NOT EXISTS idx_empire_os_rec_business_status
  ON public.empire_os_recommendations (business_id, status, created_at DESC);

ALTER TABLE public.empire_os_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Business owners read own recommendations"
  ON public.empire_os_recommendations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.business_profiles bp
      WHERE bp.id = empire_os_recommendations.business_id
        AND bp.user_id = auth.uid()
    )
  );

CREATE POLICY "Business owners update own recommendations"
  ON public.empire_os_recommendations
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.business_profiles bp
      WHERE bp.id = empire_os_recommendations.business_id
        AND bp.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.business_profiles bp
      WHERE bp.id = empire_os_recommendations.business_id
        AND bp.user_id = auth.uid()
    )
  );

COMMENT ON TABLE public.empire_os_recommendations IS 'Empire OS / AI recommendations; external writes use service role';
