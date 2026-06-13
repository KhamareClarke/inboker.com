/*
  # Business profile staff weekly availability (public booking / GAP 2)

  Recurring weekly windows when a staff member accepts bookings.
  If a staff member has no rows here, availability enforcement is skipped (backward compatible).
*/

CREATE TABLE IF NOT EXISTS business_profile_staff_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id uuid NOT NULL REFERENCES business_profile_staff(id) ON DELETE CASCADE,
  day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bp_staff_avail_staff ON business_profile_staff_availability(staff_id);
CREATE INDEX IF NOT EXISTS idx_bp_staff_avail_day ON business_profile_staff_availability(day_of_week);

ALTER TABLE business_profile_staff_availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Business owners manage staff availability"
  ON business_profile_staff_availability FOR ALL
  TO authenticated
  USING (
    staff_id IN (
      SELECT s.id FROM business_profile_staff s
      JOIN business_profiles p ON p.id = s.business_profile_id
      WHERE p.user_id = auth.uid()
    )
  )
  WITH CHECK (
    staff_id IN (
      SELECT s.id FROM business_profile_staff s
      JOIN business_profiles p ON p.id = s.business_profile_id
      WHERE p.user_id = auth.uid()
    )
  );

CREATE POLICY "Public can read staff availability for booking"
  ON business_profile_staff_availability FOR SELECT
  TO anon
  USING (is_active = true);

CREATE POLICY "Authenticated customers can read staff availability"
  ON business_profile_staff_availability FOR SELECT
  TO authenticated
  USING (is_active = true);

COMMENT ON TABLE business_profile_staff_availability IS 'Weekly recurring availability for business_profile_staff (public booking page)';
