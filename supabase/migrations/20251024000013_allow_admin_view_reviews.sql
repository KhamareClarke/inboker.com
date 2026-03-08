/*
  # Allow Admin to View All Reviews
  
  Adds RLS policy to allow admin users to view all appointment reviews.
*/

-- RLS Policy: Admins can view all reviews
CREATE POLICY "Admins can view all reviews"
  ON appointment_reviews FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

COMMENT ON POLICY "Admins can view all reviews" ON appointment_reviews IS 
  'Allows admin users to view all appointment reviews for administrative purposes';


