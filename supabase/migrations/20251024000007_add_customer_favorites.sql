/*
  # Customer Favorites
  
  Creates a table to store customer favorite appointments/bookings and services.
*/

-- Create customer_favorites table
CREATE TABLE IF NOT EXISTS customer_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  booking_id uuid REFERENCES business_profile_bookings(id) ON DELETE CASCADE,
  service_id uuid REFERENCES business_profile_services(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Add service_id column if it doesn't exist (for existing tables)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'customer_favorites' AND column_name = 'service_id'
  ) THEN
    ALTER TABLE customer_favorites ADD COLUMN service_id uuid REFERENCES business_profile_services(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add unique constraints if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'customer_favorites_user_id_booking_id_key'
  ) THEN
    ALTER TABLE customer_favorites ADD CONSTRAINT customer_favorites_user_id_booking_id_key UNIQUE(user_id, booking_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'customer_favorites_user_id_service_id_key'
  ) THEN
    ALTER TABLE customer_favorites ADD CONSTRAINT customer_favorites_user_id_service_id_key UNIQUE(user_id, service_id);
  END IF;
END $$;

-- Add check constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'customer_favorites_booking_or_service_check'
  ) THEN
    ALTER TABLE customer_favorites ADD CONSTRAINT customer_favorites_booking_or_service_check 
      CHECK (
        (booking_id IS NOT NULL AND service_id IS NULL) OR
        (booking_id IS NULL AND service_id IS NOT NULL)
      );
  END IF;
END $$;

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_customer_favorites_user ON customer_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_customer_favorites_booking ON customer_favorites(booking_id);
CREATE INDEX IF NOT EXISTS idx_customer_favorites_service ON customer_favorites(service_id);

-- Enable RLS
ALTER TABLE customer_favorites ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own favorites
CREATE POLICY "Users can view their own favorites"
  ON customer_favorites FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policy: Users can insert their own favorites
CREATE POLICY "Users can create their own favorites"
  ON customer_favorites FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- RLS Policy: Users can delete their own favorites
CREATE POLICY "Users can delete their own favorites"
  ON customer_favorites FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

COMMENT ON TABLE customer_favorites IS 'Customer favorite appointments/bookings and services';

