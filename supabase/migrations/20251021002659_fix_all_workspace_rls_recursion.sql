/*
  # Fix All Workspace RLS Recursion

  ## Problem
  The UPDATE and DELETE policies on workspace_members also have recursion issues

  ## Solution
  Update those policies to also use the security definer function

  ## Changes
  - Drop and recreate UPDATE policy using helper function
  - Drop and recreate DELETE policy using helper function
  - Drop and recreate INSERT policy for admins using helper function
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Owners and admins can update members" ON workspace_members;
DROP POLICY IF EXISTS "Owners can delete members" ON workspace_members;
DROP POLICY IF EXISTS "Owners and admins can add members" ON workspace_members;

-- Create helper function to check if user is owner/admin
CREATE OR REPLACE FUNCTION user_is_workspace_admin(check_workspace_id uuid, user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM workspace_members 
    WHERE workspace_members.workspace_id = check_workspace_id
    AND workspace_members.user_id = $2
    AND workspace_members.role IN ('owner', 'admin')
    AND workspace_members.is_active = true
  );
$$;

-- Create helper function to check if user is owner
CREATE OR REPLACE FUNCTION user_is_workspace_owner(check_workspace_id uuid, user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM workspace_members 
    WHERE workspace_members.workspace_id = check_workspace_id
    AND workspace_members.user_id = $2
    AND workspace_members.role = 'owner'
    AND workspace_members.is_active = true
  );
$$;

-- Recreate policies using helper functions

-- Allow owners/admins to add new members
CREATE POLICY "Owners and admins can add members"
  ON workspace_members FOR INSERT
  TO authenticated
  WITH CHECK (
    user_is_workspace_admin(workspace_id, auth.uid())
  );

-- Allow owners/admins to update members
CREATE POLICY "Owners and admins can update members"
  ON workspace_members FOR UPDATE
  TO authenticated
  USING (user_is_workspace_admin(workspace_id, auth.uid()))
  WITH CHECK (user_is_workspace_admin(workspace_id, auth.uid()));

-- Allow owners to delete members
CREATE POLICY "Owners can delete members"
  ON workspace_members FOR DELETE
  TO authenticated
  USING (user_is_workspace_owner(workspace_id, auth.uid()));

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION user_is_workspace_admin(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION user_is_workspace_owner(uuid, uuid) TO authenticated;
