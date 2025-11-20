/*
  # Add Suspended Field to Users
  
  Adds a suspended field to track accounts that have been suspended by admin.
*/

-- Add suspended column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS suspended BOOLEAN DEFAULT false;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_suspended ON users(suspended);

-- Add comment
COMMENT ON COLUMN users.suspended IS 'Indicates if the account has been suspended by admin';


