/*
  # Section 4 — Complete remaining schema

  - Discovery: service_category, business geo + accepts_new_customers
  - Booking extras: party_size, recurring, voucher/promo refs, credit, metadata
  - promo_codes: percent or fixed discount per business
  - booking_waitlist: queue when slot is full
  - customer_credits: balance per user per business (grants via service role / future flows)
*/

-- ---------------------------------------------------------------------------
-- Business & service discovery fields
-- ---------------------------------------------------------------------------
ALTER TABLE public.business_profiles
  ADD COLUMN IF NOT EXISTS latitude double precision,
  ADD COLUMN IF NOT EXISTS longitude double precision,
  ADD COLUMN IF NOT EXISTS accepts_new_customers boolean NOT NULL DEFAULT true;

COMMENT ON COLUMN public.business_profiles.latitude IS 'Optional WGS84 latitude for distance / map features';
COMMENT ON COLUMN public.business_profiles.accepts_new_customers IS 'When false, browse can filter "existing clients only"';

ALTER TABLE public.business_profile_services
  ADD COLUMN IF NOT EXISTS service_category text;

COMMENT ON COLUMN public.business_profile_services.service_category IS 'e.g. haircut, massage, consulting — used for browse filters';

-- ---------------------------------------------------------------------------
-- Promotional / bulk discount codes (separate from gift balance vouchers)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.promo_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_profile_id uuid NOT NULL REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  code text NOT NULL,
  discount_type text NOT NULL CHECK (discount_type IN ('percent', 'fixed_pence')),
  discount_value int NOT NULL CHECK (discount_value > 0),
  max_redemptions int,
  redemptions_count int NOT NULL DEFAULT 0 CHECK (redemptions_count >= 0),
  expires_at timestamptz,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT promo_codes_business_code_unique UNIQUE (business_profile_id, code)
);

CREATE INDEX IF NOT EXISTS idx_promo_codes_business ON public.promo_codes(business_profile_id);

ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Business owners manage promo codes"
  ON public.promo_codes
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.business_profiles bp
      WHERE bp.id = promo_codes.business_profile_id
        AND bp.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.business_profiles bp
      WHERE bp.id = promo_codes.business_profile_id
        AND bp.user_id = auth.uid()
    )
  );

COMMENT ON TABLE public.promo_codes IS 'Percent or fixed-amount discounts; redemptions tracked in redemptions_count';

-- ---------------------------------------------------------------------------
-- Booking extensions
-- ---------------------------------------------------------------------------
ALTER TABLE public.business_profile_bookings
  ADD COLUMN IF NOT EXISTS party_size int NOT NULL DEFAULT 1;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'business_profile_bookings_party_size_range'
      AND conrelid = 'public.business_profile_bookings'::regclass
  ) THEN
    ALTER TABLE public.business_profile_bookings
      ADD CONSTRAINT business_profile_bookings_party_size_range
      CHECK (party_size >= 1 AND party_size <= 50);
  END IF;
END $$;

ALTER TABLE public.business_profile_bookings
  ADD COLUMN IF NOT EXISTS recurring_frequency text,
  ADD COLUMN IF NOT EXISTS recurring_until timestamptz,
  ADD COLUMN IF NOT EXISTS applied_voucher_id uuid REFERENCES public.gift_vouchers(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS applied_promo_id uuid REFERENCES public.promo_codes(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS credit_applied_pence int NOT NULL DEFAULT 0 CHECK (credit_applied_pence >= 0),
  ADD COLUMN IF NOT EXISTS metadata jsonb NOT NULL DEFAULT '{}'::jsonb;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'business_profile_bookings_recurring_frequency_check'
      AND conrelid = 'public.business_profile_bookings'::regclass
  ) THEN
    ALTER TABLE public.business_profile_bookings
      ADD CONSTRAINT business_profile_bookings_recurring_frequency_check
      CHECK (recurring_frequency IS NULL OR recurring_frequency IN ('weekly', 'biweekly'));
  END IF;
END $$;

COMMENT ON COLUMN public.business_profile_bookings.metadata IS 'Extra flags: waitlist source, group label, etc.';
COMMENT ON COLUMN public.business_profile_bookings.recurring_frequency IS 'Intent for repeat appointments; app may create follow-ups later';

-- ---------------------------------------------------------------------------
-- Waitlist
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.booking_waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  business_profile_id uuid NOT NULL REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  service_id uuid NOT NULL REFERENCES public.business_profile_services(id) ON DELETE CASCADE,
  staff_id uuid REFERENCES public.business_profile_staff(id) ON DELETE SET NULL,
  client_email text NOT NULL,
  client_name text,
  requested_start timestamptz NOT NULL,
  requested_end timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'notified', 'converted', 'cancelled')),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_booking_waitlist_business ON public.booking_waitlist(business_profile_id);
CREATE INDEX IF NOT EXISTS idx_booking_waitlist_service ON public.booking_waitlist(service_id);
CREATE INDEX IF NOT EXISTS idx_booking_waitlist_email ON public.booking_waitlist(lower(client_email));

ALTER TABLE public.booking_waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers view own waitlist rows"
  ON public.booking_waitlist
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR lower(trim(client_email)) = lower(trim(coalesce(auth.jwt() ->> 'email', '')))
  );

CREATE POLICY "Business owners view waitlist for their business"
  ON public.booking_waitlist
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.business_profiles bp
      WHERE bp.id = booking_waitlist.business_profile_id
        AND bp.user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated customers insert own waitlist"
  ON public.booking_waitlist
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Business owners update waitlist for their business"
  ON public.booking_waitlist
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.business_profiles bp
      WHERE bp.id = booking_waitlist.business_profile_id
        AND bp.user_id = auth.uid()
    )
  );

COMMENT ON TABLE public.booking_waitlist IS 'Queue when preferred slot is unavailable';

-- ---------------------------------------------------------------------------
-- Customer credits (balance); mutations typically via service role API
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.customer_credits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  business_profile_id uuid NOT NULL REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  balance_pence int NOT NULL DEFAULT 0 CHECK (balance_pence >= 0),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT customer_credits_user_business UNIQUE (user_id, business_profile_id)
);

CREATE INDEX IF NOT EXISTS idx_customer_credits_business ON public.customer_credits(business_profile_id);

ALTER TABLE public.customer_credits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own credits"
  ON public.customer_credits
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Business owners read credits for their customers"
  ON public.customer_credits
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.business_profiles bp
      WHERE bp.id = customer_credits.business_profile_id
        AND bp.user_id = auth.uid()
    )
  );

COMMENT ON TABLE public.customer_credits IS 'Optional account credit per business; apply via secure API';

-- ---------------------------------------------------------------------------
-- Public read of public reviews (browse star filters / trust)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Anyone can read public appointment reviews" ON public.appointment_reviews;
CREATE POLICY "Anyone can read public appointment reviews"
  ON public.appointment_reviews
  FOR SELECT
  TO anon, authenticated
  USING (COALESCE(is_public, true) = true);
