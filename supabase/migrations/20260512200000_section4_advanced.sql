/*
  # Section 4 — Advanced features (foundation)

  - customer_booking_preferences: per-user, per-business JSON preferences (RLS).
  - gift_vouchers: digital codes per business (RLS for owners).
*/

CREATE TABLE IF NOT EXISTS public.customer_booking_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  business_profile_id uuid NOT NULL REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  preferences jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT customer_booking_preferences_user_business UNIQUE (user_id, business_profile_id)
);

CREATE INDEX IF NOT EXISTS idx_customer_prefs_user ON public.customer_booking_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_customer_prefs_business ON public.customer_booking_preferences(business_profile_id);

ALTER TABLE public.customer_booking_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers manage own booking preferences"
  ON public.customer_booking_preferences
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

COMMENT ON TABLE public.customer_booking_preferences IS 'Saved notes, favorite staff, preferred times, allergies (JSON shape app-defined)';

CREATE TABLE IF NOT EXISTS public.gift_vouchers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_profile_id uuid NOT NULL REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  code text NOT NULL,
  initial_value_pence int NOT NULL CHECK (initial_value_pence > 0),
  balance_pence int NOT NULL CHECK (balance_pence >= 0),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'redeemed', 'void')),
  expires_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT gift_vouchers_code_unique UNIQUE (code)
);

CREATE INDEX IF NOT EXISTS idx_gift_vouchers_business ON public.gift_vouchers(business_profile_id);
CREATE INDEX IF NOT EXISTS idx_gift_vouchers_code ON public.gift_vouchers(code);

ALTER TABLE public.gift_vouchers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Business owners manage gift vouchers"
  ON public.gift_vouchers
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.business_profiles bp
      WHERE bp.id = gift_vouchers.business_profile_id
        AND bp.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.business_profiles bp
      WHERE bp.id = gift_vouchers.business_profile_id
        AND bp.user_id = auth.uid()
    )
  );

COMMENT ON TABLE public.gift_vouchers IS 'Promotional / gift codes; redemption flow can be added later';
