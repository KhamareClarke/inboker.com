/*
  # Allow Customers to Update Their Own Bookings
  
  Adds RLS policy to allow authenticated customers to update their own bookings
  (cancel, reschedule) by matching their email with the booking's client_email.
*/

-- RLS Policy: Customers can update their own bookings
CREATE POLICY "Customers can update their own bookings"
  ON business_profile_bookings FOR UPDATE
  TO authenticated
  USING (
    client_email = auth.jwt() ->> 'email'
    OR
    business_profile_id IN (
      SELECT id FROM business_profiles WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    client_email = auth.jwt() ->> 'email'
    OR
    business_profile_id IN (
      SELECT id FROM business_profiles WHERE user_id = auth.uid()
    )
  );

COMMENT ON POLICY "Customers can update their own bookings" ON business_profile_bookings IS 
  'Allows authenticated customers to cancel or reschedule their own bookings by matching email';


