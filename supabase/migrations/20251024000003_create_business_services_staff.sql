/*
  # Business Profile Services and Staff

  Creates tables for business owners to manage their services and staff
  independently from workspaces.
*/

-- Create business_profile_services table
CREATE TABLE IF NOT EXISTS business_profile_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_profile_id uuid NOT NULL REFERENCES business_profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  duration_minutes integer NOT NULL DEFAULT 60,
  price decimal(10,2) DEFAULT 0,
  is_active boolean DEFAULT true,
  color text DEFAULT '#3b82f6',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create business_profile_staff table
CREATE TABLE IF NOT EXISTS business_profile_staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_profile_id uuid NOT NULL REFERENCES business_profiles(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text,
  phone text,
  role text DEFAULT 'staff',
  avatar_url text,
  bio text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_business_profile_services_profile ON business_profile_services(business_profile_id);
CREATE INDEX IF NOT EXISTS idx_business_profile_services_active ON business_profile_services(is_active);
CREATE INDEX IF NOT EXISTS idx_business_profile_staff_profile ON business_profile_staff(business_profile_id);
CREATE INDEX IF NOT EXISTS idx_business_profile_staff_active ON business_profile_staff(is_active);

-- Create function to update updated_at timestamp for services
CREATE OR REPLACE FUNCTION update_business_profile_services_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for services
DROP TRIGGER IF EXISTS update_business_profile_services_updated_at ON business_profile_services;
CREATE TRIGGER update_business_profile_services_updated_at
  BEFORE UPDATE ON business_profile_services
  FOR EACH ROW
  EXECUTE FUNCTION update_business_profile_services_updated_at();

-- Create function to update updated_at timestamp for staff
CREATE OR REPLACE FUNCTION update_business_profile_staff_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for staff
DROP TRIGGER IF EXISTS update_business_profile_staff_updated_at ON business_profile_staff;
CREATE TRIGGER update_business_profile_staff_updated_at
  BEFORE UPDATE ON business_profile_staff
  FOR EACH ROW
  EXECUTE FUNCTION update_business_profile_staff_updated_at();

-- Enable RLS
ALTER TABLE business_profile_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_profile_staff ENABLE ROW LEVEL SECURITY;

-- RLS Policies for business_profile_services
CREATE POLICY "Business owners can view their services"
  ON business_profile_services FOR SELECT
  TO authenticated
  USING (
    business_profile_id IN (
      SELECT id FROM business_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Business owners can manage their services"
  ON business_profile_services FOR ALL
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

CREATE POLICY "Public can view active services"
  ON business_profile_services FOR SELECT
  TO anon
  USING (is_active = true);

-- RLS Policies for business_profile_staff
CREATE POLICY "Business owners can view their staff"
  ON business_profile_staff FOR SELECT
  TO authenticated
  USING (
    business_profile_id IN (
      SELECT id FROM business_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Business owners can manage their staff"
  ON business_profile_staff FOR ALL
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

CREATE POLICY "Public can view active staff"
  ON business_profile_staff FOR SELECT
  TO anon
  USING (is_active = true);

COMMENT ON TABLE business_profile_services IS 'Services offered by a business profile';
COMMENT ON TABLE business_profile_staff IS 'Staff members for a business profile';


