/*
  # Add service_id to customer_favorites
  
  Adds service_id column to existing customer_favorites table
  if it was created without it. Also makes booking_id nullable.
*/

-- Make booking_id nullable if it's not already
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'customer_favorites' 
    AND column_name = 'booking_id' 
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE customer_favorites ALTER COLUMN booking_id DROP NOT NULL;
  END IF;
END $$;

-- Add service_id column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'customer_favorites' AND column_name = 'service_id'
  ) THEN
    ALTER TABLE customer_favorites ADD COLUMN service_id uuid REFERENCES business_profile_services(id) ON DELETE CASCADE;
    
    -- Add unique constraint for service_id if it doesn't exist
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint WHERE conname = 'customer_favorites_user_id_service_id_key'
    ) THEN
      ALTER TABLE customer_favorites ADD CONSTRAINT customer_favorites_user_id_service_id_key UNIQUE(user_id, service_id);
    END IF;
    
    -- Add check constraint to ensure either booking_id or service_id is set
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint WHERE conname = 'customer_favorites_booking_or_service_check'
    ) THEN
      ALTER TABLE customer_favorites ADD CONSTRAINT customer_favorites_booking_or_service_check 
        CHECK (
          (booking_id IS NOT NULL AND service_id IS NULL) OR
          (booking_id IS NULL AND service_id IS NOT NULL)
        );
    END IF;
    
    -- Add index for service_id
    CREATE INDEX IF NOT EXISTS idx_customer_favorites_service ON customer_favorites(service_id);
  END IF;
END $$;

