/*
  # Allow Customers to View Their Own Bookings
  
  Adds RLS policy to allow authenticated customers to view their own bookings
  by matching their email with the booking's client_email.
*/

-- RLS Policy: Customers can view their own bookings
CREATE POLICY "Customers can view their own bookings"
  ON business_profile_bookings FOR SELECT
  TO authenticated
  USING (
    client_email = auth.jwt() ->> 'email'
    OR
    business_profile_id IN (
      SELECT id FROM business_profiles WHERE user_id = auth.uid()
    )
  );

COMMENT ON POLICY "Customers can view their own bookings" ON business_profile_bookings IS 
  'Allows authenticated customers to view their own bookings by matching email';


