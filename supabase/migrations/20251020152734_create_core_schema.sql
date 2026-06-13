/*
  # Umlate Platform - Core Schema

  ## Overview
  This migration creates the foundational database schema for the Umlate booking platform,
  including workspaces, team management, calendar, bookings, and CRM functionality.

  ## New Tables

  ### 1. workspaces
  Multi-tenant workspace table for white-label support
  - `id` (uuid, primary key)
  - `name` (text) - Workspace name
  - `slug` (text, unique) - URL-safe slug
  - `logo_url` (text) - Logo image URL
  - `primary_color` (text) - Brand color
  - `domain` (text) - Custom domain (optional)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. users
  Extended user profile linked to auth
  - `id` (uuid, primary key, links to auth.users)
  - `email` (text)
  - `full_name` (text)
  - `avatar_url` (text)
  - `timezone` (text) - User's timezone
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 3. workspace_members
  Team members within a workspace
  - `id` (uuid, primary key)
  - `workspace_id` (uuid, foreign key)
  - `user_id` (uuid, foreign key)
  - `role` (text) - owner, admin, member
  - `is_active` (boolean)
  - `created_at` (timestamptz)

  ### 4. team_shifts
  Recurring shift schedules for team members
  - `id` (uuid, primary key)
  - `workspace_id` (uuid, foreign key)
  - `member_id` (uuid, foreign key)
  - `day_of_week` (integer) - 0=Sunday, 6=Saturday
  - `start_time` (time)
  - `end_time` (time)
  - `is_active` (boolean)
  - `created_at` (timestamptz)

  ### 5. time_off
  Vacation and blocked time periods
  - `id` (uuid, primary key)
  - `workspace_id` (uuid, foreign key)
  - `member_id` (uuid, foreign key)
  - `start_date` (timestamptz)
  - `end_date` (timestamptz)
  - `reason` (text)
  - `all_day` (boolean)
  - `created_at` (timestamptz)

  ### 6. clients
  Client profiles and contact information
  - `id` (uuid, primary key)
  - `workspace_id` (uuid, foreign key)
  - `email` (text)
  - `full_name` (text)
  - `phone` (text)
  - `avatar_url` (text)
  - `timezone` (text)
  - `tags` (text array)
  - `notes` (text)
  - `lead_score` (integer) - Lead scoring value
  - `pipeline_stage` (text) - CRM pipeline stage
  - `last_activity_at` (timestamptz)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 7. bookings
  Appointment bookings
  - `id` (uuid, primary key)
  - `workspace_id` (uuid, foreign key)
  - `client_id` (uuid, foreign key)
  - `provider_id` (uuid, foreign key) - Team member providing service
  - `title` (text)
  - `description` (text)
  - `start_time` (timestamptz)
  - `end_time` (timestamptz)
  - `status` (text) - pending, confirmed, cancelled, completed
  - `source` (text) - Marketing channel source
  - `payment_status` (text) - unpaid, paid, refunded
  - `amount` (numeric)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 8. client_activities
  Activity timeline for CRM
  - `id` (uuid, primary key)
  - `workspace_id` (uuid, foreign key)
  - `client_id` (uuid, foreign key)
  - `activity_type` (text) - booking, note, email, call, status_change
  - `title` (text)
  - `description` (text)
  - `metadata` (jsonb) - Flexible data storage
  - `created_by` (uuid, foreign key to users)
  - `created_at` (timestamptz)

  ### 9. availability_overrides
  One-time availability modifications
  - `id` (uuid, primary key)
  - `workspace_id` (uuid, foreign key)
  - `member_id` (uuid, foreign key)
  - `date` (date)
  - `start_time` (time)
  - `end_time` (time)
  - `is_available` (boolean) - true for special hours, false for blocking
  - `created_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Add policies for workspace-scoped access
  - Ensure users can only access data from their workspaces
*/

-- Create workspaces table
CREATE TABLE IF NOT EXISTS workspaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  logo_url text,
  primary_color text DEFAULT '#3b82f6',
  domain text UNIQUE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  avatar_url text,
  timezone text DEFAULT 'UTC',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create workspace_members table
CREATE TABLE IF NOT EXISTS workspace_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(workspace_id, user_id)
);

-- Create team_shifts table
CREATE TABLE IF NOT EXISTS team_shifts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  member_id uuid NOT NULL REFERENCES workspace_members(id) ON DELETE CASCADE,
  day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create time_off table
CREATE TABLE IF NOT EXISTS time_off (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  member_id uuid NOT NULL REFERENCES workspace_members(id) ON DELETE CASCADE,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  reason text,
  all_day boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  email text,
  full_name text NOT NULL,
  phone text,
  avatar_url text,
  timezone text DEFAULT 'UTC',
  tags text[] DEFAULT '{}',
  notes text,
  lead_score integer DEFAULT 0,
  pipeline_stage text DEFAULT 'new',
  last_activity_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  provider_id uuid NOT NULL REFERENCES workspace_members(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  source text,
  payment_status text DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'refunded')),
  amount numeric(10, 2),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create client_activities table
CREATE TABLE IF NOT EXISTS client_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  activity_type text NOT NULL CHECK (activity_type IN ('booking', 'note', 'email', 'call', 'status_change')),
  title text NOT NULL,
  description text,
  metadata jsonb DEFAULT '{}',
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Create availability_overrides table
CREATE TABLE IF NOT EXISTS availability_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  member_id uuid NOT NULL REFERENCES workspace_members(id) ON DELETE CASCADE,
  date date NOT NULL,
  start_time time,
  end_time time,
  is_available boolean NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_workspace_members_workspace ON workspace_members(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_user ON workspace_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_shifts_member ON team_shifts(member_id);
CREATE INDEX IF NOT EXISTS idx_time_off_member ON time_off(member_id);
CREATE INDEX IF NOT EXISTS idx_clients_workspace ON clients(workspace_id);
CREATE INDEX IF NOT EXISTS idx_bookings_workspace ON bookings(workspace_id);
CREATE INDEX IF NOT EXISTS idx_bookings_client ON bookings(client_id);
CREATE INDEX IF NOT EXISTS idx_bookings_provider ON bookings(provider_id);
CREATE INDEX IF NOT EXISTS idx_bookings_start_time ON bookings(start_time);
CREATE INDEX IF NOT EXISTS idx_client_activities_client ON client_activities(client_id);
CREATE INDEX IF NOT EXISTS idx_availability_overrides_member ON availability_overrides(member_id);

-- Enable Row Level Security
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_off ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_overrides ENABLE ROW LEVEL SECURITY;

-- RLS Policies for workspaces
CREATE POLICY "Users can view workspaces they are members of"
  ON workspaces FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = workspaces.id
      AND workspace_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Workspace owners can update their workspace"
  ON workspaces FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = workspaces.id
      AND workspace_members.user_id = auth.uid()
      AND workspace_members.role = 'owner'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = workspaces.id
      AND workspace_members.user_id = auth.uid()
      AND workspace_members.role = 'owner'
    )
  );

CREATE POLICY "Authenticated users can create workspaces"
  ON workspaces FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for users
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- RLS Policies for workspace_members
CREATE POLICY "Members can view workspace members"
  ON workspace_members FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members wm
      WHERE wm.workspace_id = workspace_members.workspace_id
      AND wm.user_id = auth.uid()
    )
  );

CREATE POLICY "Owners and admins can insert members"
  ON workspace_members FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = workspace_members.workspace_id
      AND workspace_members.user_id = auth.uid()
      AND workspace_members.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Owners and admins can update members"
  ON workspace_members FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members wm
      WHERE wm.workspace_id = workspace_members.workspace_id
      AND wm.user_id = auth.uid()
      AND wm.role IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspace_members wm
      WHERE wm.workspace_id = workspace_members.workspace_id
      AND wm.user_id = auth.uid()
      AND wm.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Owners can delete members"
  ON workspace_members FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members wm
      WHERE wm.workspace_id = workspace_members.workspace_id
      AND wm.user_id = auth.uid()
      AND wm.role = 'owner'
    )
  );

-- RLS Policies for team_shifts
CREATE POLICY "Members can view team shifts in their workspace"
  ON team_shifts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = team_shifts.workspace_id
      AND workspace_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins and owners can manage team shifts"
  ON team_shifts FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = team_shifts.workspace_id
      AND workspace_members.user_id = auth.uid()
      AND workspace_members.role IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = team_shifts.workspace_id
      AND workspace_members.user_id = auth.uid()
      AND workspace_members.role IN ('owner', 'admin')
    )
  );

-- RLS Policies for time_off
CREATE POLICY "Members can view time off in their workspace"
  ON time_off FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = time_off.workspace_id
      AND workspace_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Members can manage their own time off"
  ON time_off FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.id = time_off.member_id
      AND workspace_members.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.id = time_off.member_id
      AND workspace_members.user_id = auth.uid()
    )
  );

-- RLS Policies for clients
CREATE POLICY "Members can view clients in their workspace"
  ON clients FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = clients.workspace_id
      AND workspace_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Members can manage clients in their workspace"
  ON clients FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = clients.workspace_id
      AND workspace_members.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = clients.workspace_id
      AND workspace_members.user_id = auth.uid()
    )
  );

-- RLS Policies for bookings
CREATE POLICY "Members can view bookings in their workspace"
  ON bookings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = bookings.workspace_id
      AND workspace_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Members can manage bookings in their workspace"
  ON bookings FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = bookings.workspace_id
      AND workspace_members.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = bookings.workspace_id
      AND workspace_members.user_id = auth.uid()
    )
  );

-- RLS Policies for client_activities
CREATE POLICY "Members can view activities in their workspace"
  ON client_activities FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = client_activities.workspace_id
      AND workspace_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Members can create activities in their workspace"
  ON client_activities FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = client_activities.workspace_id
      AND workspace_members.user_id = auth.uid()
    )
  );

-- RLS Policies for availability_overrides
CREATE POLICY "Members can view availability overrides in their workspace"
  ON availability_overrides FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = availability_overrides.workspace_id
      AND workspace_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Members can manage their own availability overrides"
  ON availability_overrides FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.id = availability_overrides.member_id
      AND workspace_members.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.id = availability_overrides.member_id
      AND workspace_members.user_id = auth.uid()
    )
  );