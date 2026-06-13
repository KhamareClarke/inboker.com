/*
  # Add User Roles for Platform-Level Access Control

  ## Overview
  This migration adds platform-level user roles (admin, business_owner, customer) to enable
  role-based access control across the entire platform, not just within workspaces.

  ## Changes
  - Add `role` column to users table with default 'customer'
  - Add check constraint to ensure valid role values
  - Update RLS policies to respect platform-level roles
  - Add index for role-based queries

  ## Role Definitions
  - `admin`: Platform administrators (Kamare) - full access to all businesses and users
  - `business_owner`: Business owners who can create/manage workspaces
  - `customer`: End customers who can book services but not access dashboard
*/

-- Add role column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS role text DEFAULT 'customer';

-- Add check constraint for valid role values (if it doesn't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'users_role_check'
  ) THEN
    ALTER TABLE users 
    ADD CONSTRAINT users_role_check 
    CHECK (role IN ('admin', 'business_owner', 'customer'));
  END IF;
END $$;

-- Create index for role-based queries
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Update existing users to have 'business_owner' role if they own a workspace
-- (This assumes existing users are business owners)
UPDATE users 
SET role = 'business_owner' 
WHERE role = 'customer' 
AND EXISTS (
  SELECT 1 FROM workspace_members 
  WHERE workspace_members.user_id = users.id 
  AND workspace_members.role = 'owner'
);

-- RLS Policy: Users can view their own role
-- (Already covered by existing "Users can view their own profile" policy)

-- Drop existing policies if they exist (to allow re-running migration)
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can update any user" ON users;
DROP POLICY IF EXISTS "Business owners can view workspace users" ON users;

-- RLS Policy: Admins can view all users
CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- RLS Policy: Admins can update any user
CREATE POLICY "Admins can update any user"
  ON users FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- RLS Policy: Business owners can view users in their workspaces
CREATE POLICY "Business owners can view workspace users"
  ON users FOR SELECT
  TO authenticated
  USING (
    -- Allow if viewing own profile
    auth.uid() = id
    OR
    -- Allow if user is admin
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role = 'admin'
    )
    OR
    -- Allow if user is business owner viewing members of their workspaces
    EXISTS (
      SELECT 1 FROM workspace_members wm1
      INNER JOIN workspace_members wm2 ON wm1.workspace_id = wm2.workspace_id
      WHERE wm1.user_id = auth.uid()
      AND wm1.role IN ('owner', 'admin')
      AND wm2.user_id = users.id
    )
  );

-- Add comment to document the role column
COMMENT ON COLUMN users.role IS 'Platform-level role: admin (platform admin), business_owner (can create workspaces), customer (end user)';

-- Auto-confirm email addresses and create user profile on signup
-- This function automatically confirms users and creates their profile when they sign up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_full_name text;
  user_role text;
BEGIN
  -- Auto-confirm the email immediately
  -- Note: confirmed_at is a generated column, so we only update email_confirmed_at
  UPDATE auth.users
  SET email_confirmed_at = COALESCE(email_confirmed_at, NOW())
  WHERE id = NEW.id;
  
  -- Extract user metadata
  user_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', 'User');
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'business_owner');
  
  -- Create user profile in public.users table
  -- Use INSERT ... ON CONFLICT to handle race conditions
  INSERT INTO public.users (id, email, full_name, timezone, role)
  VALUES (
    NEW.id,
    NEW.email,
    user_full_name,
    'UTC',
    user_role::text
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-confirm users and create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Also create a function to manually confirm users if needed
CREATE OR REPLACE FUNCTION public.auto_confirm_user(user_email text)
RETURNS void AS $$
BEGIN
  -- Note: confirmed_at is a generated column, so we only update email_confirmed_at
  UPDATE auth.users
  SET email_confirmed_at = COALESCE(email_confirmed_at, NOW())
  WHERE email = user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

