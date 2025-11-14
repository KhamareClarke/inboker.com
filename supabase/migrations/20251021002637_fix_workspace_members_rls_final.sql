/*
  # Fix Workspace Members RLS - Final Solution

  ## Problem
  Even after the previous fix, there's still recursion because:
  - "Users can view members in their workspaces" queries workspace_members
  - This triggers RLS on that subquery
  - Which causes infinite recursion

  ## Solution
  Use security definer functions to bypass RLS in subqueries
  This allows checking membership without triggering RLS recursion

  ## Changes
  - Drop the recursive SELECT policy
  - Create a helper function that bypasses RLS
  - Create new SELECT policy using the helper function
*/

-- Drop the recursive policy
DROP POLICY IF EXISTS "Users can view members in their workspaces" ON workspace_members;

-- Create a security definer function to check workspace membership
-- This bypasses RLS and prevents recursion
CREATE OR REPLACE FUNCTION user_workspace_ids(user_id uuid)
RETURNS TABLE (workspace_id uuid)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT workspace_id 
  FROM workspace_members 
  WHERE workspace_members.user_id = $1 
  AND is_active = true;
$$;

-- Create new policy using the helper function
CREATE POLICY "Users can view members in their workspaces"
  ON workspace_members FOR SELECT
  TO authenticated
  USING (
    workspace_id IN (
      SELECT user_workspace_ids(auth.uid())
    )
  );

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION user_workspace_ids(uuid) TO authenticated;
