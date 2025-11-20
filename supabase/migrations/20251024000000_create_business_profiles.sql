/*
  # Business Profiles Migration

  ## Overview
  Creates a business_profiles table for business owners to customize their brand identity
  and booking experience. Each business owner can have one profile.

  ## New Table: business_profiles
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key to users, unique) - Links to business owner
  - `business_name` (text) - Name of the business
  - `logo_url` (text) - Business logo image URL
  - `description` (text) - Business description
  - `contact_email` (text) - Contact email
  - `contact_phone` (text) - Contact phone
  - `website` (text) - Business website URL
  - `primary_color` (text) - Primary brand color (hex)
  - `secondary_color` (text) - Secondary brand color (hex)
  - `booking_page_title` (text) - Custom title for booking page
  - `booking_page_subtitle` (text) - Custom subtitle for booking page
  - `social_links` (jsonb) - Social media links (Instagram, Facebook, etc.)
  - `custom_settings` (jsonb) - Additional customization settings
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## Security
  - Enable RLS
  - Business owners can only view/edit their own profile
  - Public can view active profiles (for booking pages)
*/

-- Create business_profiles table
CREATE TABLE IF NOT EXISTS business_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  business_name text NOT NULL,
  business_slug text UNIQUE,
  logo_url text,
  description text,
  contact_email text,
  contact_phone text,
  website text,
  primary_color text DEFAULT '#3b82f6',
  secondary_color text DEFAULT '#06b6d4',
  booking_page_title text,
  booking_page_subtitle text,
  social_links jsonb DEFAULT '{}',
  custom_settings jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create function to generate slug from business name
CREATE OR REPLACE FUNCTION generate_business_slug(business_name text)
RETURNS text AS $$
BEGIN
  RETURN lower(regexp_replace(regexp_replace(business_name, '[^a-zA-Z0-9\s]', '', 'g'), '\s+', '-', 'g'));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create trigger to auto-generate slug
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

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_business_profiles_user_id ON business_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_business_profiles_slug ON business_profiles(business_slug);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_business_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_business_profiles_updated_at ON business_profiles;
CREATE TRIGGER update_business_profiles_updated_at
  BEFORE UPDATE ON business_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_business_profiles_updated_at();

-- Enable Row Level Security
ALTER TABLE business_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Business owners can view their own profile
CREATE POLICY "Business owners can view their own profile"
  ON business_profiles FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- RLS Policy: Business owners can insert their own profile
CREATE POLICY "Business owners can create their own profile"
  ON business_profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'business_owner'
    )
  );

-- RLS Policy: Business owners can update their own profile
CREATE POLICY "Business owners can update their own profile"
  ON business_profiles FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  )
  WITH CHECK (
    user_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- RLS Policy: Public can view business profiles (for booking pages)
CREATE POLICY "Public can view business profiles"
  ON business_profiles FOR SELECT
  TO anon
  USING (true);

COMMENT ON TABLE business_profiles IS 'Brand profiles for business owners to customize their booking experience';
COMMENT ON COLUMN business_profiles.user_id IS 'Links to the business owner user account';
COMMENT ON COLUMN business_profiles.social_links IS 'JSON object with social media links: {instagram, facebook, twitter, linkedin}';
COMMENT ON COLUMN business_profiles.custom_settings IS 'JSON object for additional customization options';

