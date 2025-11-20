/*
  # Staff-Services Assignment

  Creates a many-to-many relationship between staff and services,
  allowing staff members to be assigned to specific services.
*/

-- Create junction table for staff-service assignments
CREATE TABLE IF NOT EXISTS business_profile_staff_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id uuid NOT NULL REFERENCES business_profile_staff(id) ON DELETE CASCADE,
  service_id uuid NOT NULL REFERENCES business_profile_services(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(staff_id, service_id)
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_staff_services_staff ON business_profile_staff_services(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_services_service ON business_profile_staff_services(service_id);

-- Enable RLS
ALTER TABLE business_profile_staff_services ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Business owners can view their staff-service assignments
CREATE POLICY "Business owners can view staff-service assignments"
  ON business_profile_staff_services FOR SELECT
  TO authenticated
  USING (
    staff_id IN (
      SELECT id FROM business_profile_staff
      WHERE business_profile_id IN (
        SELECT id FROM business_profiles WHERE user_id = auth.uid()
      )
    )
  );

-- RLS Policy: Business owners can manage staff-service assignments
CREATE POLICY "Business owners can manage staff-service assignments"
  ON business_profile_staff_services FOR ALL
  TO authenticated
  USING (
    staff_id IN (
      SELECT id FROM business_profile_staff
      WHERE business_profile_id IN (
        SELECT id FROM business_profiles WHERE user_id = auth.uid()
      )
    )
  )
  WITH CHECK (
    staff_id IN (
      SELECT id FROM business_profile_staff
      WHERE business_profile_id IN (
        SELECT id FROM business_profiles WHERE user_id = auth.uid()
      )
    )
  );

-- RLS Policy: Public can view active staff-service assignments
CREATE POLICY "Public can view active staff-service assignments"
  ON business_profile_staff_services FOR SELECT
  TO anon
  USING (
    staff_id IN (
      SELECT id FROM business_profile_staff
      WHERE is_active = true
    )
    AND
    service_id IN (
      SELECT id FROM business_profile_services
      WHERE is_active = true
    )
  );

COMMENT ON TABLE business_profile_staff_services IS 'Many-to-many relationship between staff and services';


