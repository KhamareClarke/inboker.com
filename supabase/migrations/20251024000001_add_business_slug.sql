/*
  # Add business_slug column to business_profiles

  This migration adds the business_slug column to existing business_profiles table
  and generates slugs for existing records.
*/

-- Add business_slug column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'business_profiles' 
    AND column_name = 'business_slug'
  ) THEN
    ALTER TABLE business_profiles 
    ADD COLUMN business_slug text UNIQUE;
  END IF;
END $$;

-- Create function to generate slug from business name (if it doesn't exist)
CREATE OR REPLACE FUNCTION generate_business_slug(business_name text)
RETURNS text AS $$
BEGIN
  RETURN lower(regexp_replace(regexp_replace(business_name, '[^a-zA-Z0-9\s]', '', 'g'), '\s+', '-', 'g'));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Generate slugs for existing records
UPDATE business_profiles
SET business_slug = generate_business_slug(business_name)
WHERE business_slug IS NULL OR business_slug = '';

-- Create trigger to auto-generate slug (if it doesn't exist)
CREATE OR REPLACE FUNCTION auto_generate_business_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.business_slug IS NULL OR NEW.business_slug = '' THEN
    NEW.business_slug := generate_business_slug(NEW.business_name);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_generate_business_slug ON business_profiles;
CREATE TRIGGER trigger_auto_generate_business_slug
  BEFORE INSERT OR UPDATE ON business_profiles
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_business_slug();

-- Create index for business_slug if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_business_profiles_slug ON business_profiles(business_slug);


