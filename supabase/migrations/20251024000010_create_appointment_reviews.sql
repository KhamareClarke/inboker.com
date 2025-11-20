/*
  # Appointment Reviews & Feedback
  
  Creates a table to store customer reviews and feedback for completed appointments.
*/

-- Create appointment_reviews table
CREATE TABLE IF NOT EXISTS appointment_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES business_profile_bookings(id) ON DELETE CASCADE,
  business_profile_id uuid NOT NULL REFERENCES business_profiles(id) ON DELETE CASCADE,
  customer_email text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text text,
  feedback text,
  is_public boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_reviews_booking ON appointment_reviews(booking_id);
CREATE INDEX IF NOT EXISTS idx_reviews_business ON appointment_reviews(business_profile_id);
CREATE INDEX IF NOT EXISTS idx_reviews_customer ON appointment_reviews(customer_email);
CREATE INDEX IF NOT EXISTS idx_reviews_created ON appointment_reviews(created_at);

-- Create unique constraint: one review per booking
ALTER TABLE appointment_reviews ADD CONSTRAINT appointment_reviews_booking_unique UNIQUE(booking_id);

-- Enable RLS
ALTER TABLE appointment_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Business owners can view reviews for their business
CREATE POLICY "Business owners can view their reviews"
  ON appointment_reviews FOR SELECT
  TO authenticated
  USING (
    business_profile_id IN (
      SELECT id FROM business_profiles WHERE user_id = auth.uid()
    )
  );

-- RLS Policy: Customers can view their own reviews
CREATE POLICY "Customers can view their own reviews"
  ON appointment_reviews FOR SELECT
  TO authenticated
  USING (customer_email = auth.jwt() ->> 'email');

-- RLS Policy: Customers can create reviews for their bookings
CREATE POLICY "Customers can create reviews"
  ON appointment_reviews FOR INSERT
  TO authenticated
  WITH CHECK (
    customer_email = auth.jwt() ->> 'email'
    AND booking_id IN (
      SELECT id FROM business_profile_bookings 
      WHERE client_email = auth.jwt() ->> 'email'
      AND status = 'completed'
    )
  );

-- RLS Policy: Customers can update their own reviews
CREATE POLICY "Customers can update their own reviews"
  ON appointment_reviews FOR UPDATE
  TO authenticated
  USING (customer_email = auth.jwt() ->> 'email')
  WITH CHECK (customer_email = auth.jwt() ->> 'email');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_appointment_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_appointment_reviews_updated_at ON appointment_reviews;
CREATE TRIGGER update_appointment_reviews_updated_at
  BEFORE UPDATE ON appointment_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_appointment_reviews_updated_at();

COMMENT ON TABLE appointment_reviews IS 'Customer reviews and feedback for completed appointments';
COMMENT ON COLUMN appointment_reviews.rating IS 'Rating from 1 to 5 stars';
COMMENT ON COLUMN appointment_reviews.review_text IS 'Public review text';
COMMENT ON COLUMN appointment_reviews.feedback IS 'Private feedback for the business owner';


