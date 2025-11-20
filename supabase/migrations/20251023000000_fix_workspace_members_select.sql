-- Fix workspace_members SELECT policy to allow users to view their own memberships
-- This fixes the 500 error when loading workspaces

-- Drop all existing SELECT policies
DROP POLICY IF EXISTS "Users can view their own memberships" ON workspace_members;
DROP POLICY IF EXISTS "Users can view members in their workspaces" ON workspace_members;
DROP POLICY IF EXISTS "Members can view workspace members" ON workspace_members;

-- Create simple policy: Users can view their own memberships
CREATE POLICY "Users can view their own memberships"
  ON workspace_members FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Create policy: Users can view other members in workspaces they belong to
-- Use the security definer function to avoid recursion
CREATE POLICY "Users can view members in their workspaces"
  ON workspace_members FOR SELECT
  TO authenticated
  USING (
    workspace_id IN (
      SELECT user_workspace_ids(auth.uid())
    )
  );

-- If the function doesn't exist, create it
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

-- Grant execute permission
GRANT EXECUTE ON FUNCTION user_workspace_ids(uuid) TO authenticated;



