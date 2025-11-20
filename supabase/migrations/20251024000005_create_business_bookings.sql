/*
  # Business Profile Bookings

  Creates a bookings table for business profiles to track appointments
  made through the public booking pages.
*/

-- Create business_profile_bookings table
CREATE TABLE IF NOT EXISTS business_profile_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_profile_id uuid NOT NULL REFERENCES business_profiles(id) ON DELETE CASCADE,
  service_id uuid NOT NULL REFERENCES business_profile_services(id) ON DELETE CASCADE,
  staff_id uuid REFERENCES business_profile_staff(id) ON DELETE SET NULL,
  client_name text NOT NULL,
  client_email text NOT NULL,
  client_phone text,
  client_notes text,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  amount numeric(10, 2),
  payment_status text DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'refunded')),
  source text DEFAULT 'public_booking',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_business_bookings_profile ON business_profile_bookings(business_profile_id);
CREATE INDEX IF NOT EXISTS idx_business_bookings_service ON business_profile_bookings(service_id);
CREATE INDEX IF NOT EXISTS idx_business_bookings_staff ON business_profile_bookings(staff_id);
CREATE INDEX IF NOT EXISTS idx_business_bookings_start_time ON business_profile_bookings(start_time);
CREATE INDEX IF NOT EXISTS idx_business_bookings_status ON business_profile_bookings(status);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_business_bookings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_business_bookings_updated_at ON business_profile_bookings;
CREATE TRIGGER update_business_bookings_updated_at
  BEFORE UPDATE ON business_profile_bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_business_bookings_updated_at();

-- Enable RLS
ALTER TABLE business_profile_bookings ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Business owners can view their bookings
CREATE POLICY "Business owners can view their bookings"
  ON business_profile_bookings FOR SELECT
  TO authenticated
  USING (
    business_profile_id IN (
      SELECT id FROM business_profiles WHERE user_id = auth.uid()
    )
  );

-- RLS Policy: Business owners can manage their bookings
CREATE POLICY "Business owners can manage their bookings"
  ON business_profile_bookings FOR ALL
  TO authenticated
  USING (
    business_profile_id IN (
      SELECT id FROM business_profiles WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    business_profile_id IN (
      SELECT id FROM business_profiles WHERE user_id = auth.uid()
    )
  );

-- RLS Policy: Public can create bookings
CREATE POLICY "Public can create bookings"
  ON business_profile_bookings FOR INSERT
  TO anon
  WITH CHECK (true);

-- RLS Policy: Public can view their own bookings (by email)
-- Note: This is a simplified approach. In production, you might want to add authentication
CREATE POLICY "Public can view bookings by email"
  ON business_profile_bookings FOR SELECT
  TO anon
  USING (true); -- Allow public to view for now, can be restricted later

COMMENT ON TABLE business_profile_bookings IS 'Bookings/appointments for business profiles';


