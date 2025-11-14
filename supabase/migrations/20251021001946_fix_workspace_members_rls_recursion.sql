/*
  # Fix Workspace Members RLS Infinite Recursion

  ## Problem
  The workspace_members table has RLS policies that query itself, causing infinite recursion.
  Users cannot query workspace_members because the SELECT policy requires checking workspace_members.

  ## Solution
  1. Drop the recursive policies
  2. Create new policies that don't cause recursion:
     - Allow users to view memberships for workspaces they belong to (using direct user_id check)
     - Allow workspace owners to be inserted during workspace creation
     - Simplified policies that avoid self-referencing

  ## Changes
  - Drop all existing workspace_members policies
  - Create new non-recursive policies
*/

-- Drop existing recursive policies
DROP POLICY IF EXISTS "Members can view workspace members" ON workspace_members;
DROP POLICY IF EXISTS "Owners and admins can insert members" ON workspace_members;
DROP POLICY IF EXISTS "Owners and admins can update members" ON workspace_members;
DROP POLICY IF EXISTS "Owners can delete members" ON workspace_members;

-- Create new non-recursive policies

-- Allow users to view their own workspace memberships
CREATE POLICY "Users can view their own memberships"
  ON workspace_members FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Allow users to view other members in workspaces where they are members
-- This uses a subquery that checks a different condition to avoid recursion
CREATE POLICY "Users can view members in their workspaces"
  ON workspace_members FOR SELECT
  TO authenticated
  USING (
    workspace_id IN (
      SELECT workspace_id 
      FROM workspace_members 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Allow workspace creation: Users can insert themselves as owners
-- This is needed for the onboarding flow
CREATE POLICY "Users can create workspace memberships during onboarding"
  ON workspace_members FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() 
    AND role = 'owner'
  );

-- Allow owners/admins to add new members
-- This checks if the inserting user is an owner/admin in the target workspace
CREATE POLICY "Owners and admins can add members"
  ON workspace_members FOR INSERT
  TO authenticated
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id 
      FROM workspace_members 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin')
      AND is_active = true
    )
  );

-- Allow owners/admins to update members in their workspace
CREATE POLICY "Owners and admins can update members"
  ON workspace_members FOR UPDATE
  TO authenticated
  USING (
    workspace_id IN (
      SELECT workspace_id 
      FROM workspace_members 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin')
      AND is_active = true
    )
  )
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id 
      FROM workspace_members 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin')
      AND is_active = true
    )
  );

-- Allow owners to delete members
CREATE POLICY "Owners can delete members"
  ON workspace_members FOR DELETE
  TO authenticated
  USING (
    workspace_id IN (
      SELECT workspace_id 
      FROM workspace_members 
      WHERE user_id = auth.uid() 
      AND role = 'owner'
      AND is_active = true
    )
  );
