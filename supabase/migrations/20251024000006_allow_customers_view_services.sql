/*
  # Allow Customers to View Active Services

  Adds RLS policy to allow authenticated users (including customers)
  to view active services from all business profiles.
*/

-- Drop existing policy if it exists to avoid conflicts
DROP POLICY IF EXISTS "Authenticated users can view active services" ON business_profile_services;

-- RLS Policy: Authenticated users (including customers) can view active services
CREATE POLICY "Authenticated users can view active services"
  ON business_profile_services FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Also ensure business_profiles can be viewed by authenticated users for the join query
DROP POLICY IF EXISTS "Authenticated users can view business profiles" ON business_profiles;

CREATE POLICY "Authenticated users can view business profiles"
  ON business_profiles FOR SELECT
  TO authenticated
  USING (true);

