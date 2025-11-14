/*
  # Add Services and Availability Management

  ## New Tables
  
  ### 1. `services`
  - `id` (uuid, primary key)
  - `workspace_id` (uuid, foreign key to workspaces)
  - `name` (text) - Service name
  - `description` (text) - Service description
  - `duration_minutes` (integer) - How long the service takes
  - `price` (decimal) - Service price
  - `is_active` (boolean) - Whether service is available for booking
  - `color` (text) - Color for calendar display
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. `member_availability`
  - `id` (uuid, primary key)
  - `workspace_member_id` (uuid, foreign key to workspace_members)
  - `day_of_week` (integer) - 0=Sunday, 6=Saturday
  - `start_time` (time) - Start of availability
  - `end_time` (time) - End of availability
  - `is_active` (boolean) - Whether this schedule is active
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## Updates
  - Add `service_id` to bookings table
  - Add foreign key constraint

  ## Security
  - Enable RLS on both tables
  - Add policies for workspace members to manage their data
*/

CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  duration_minutes integer NOT NULL DEFAULT 60,
  price decimal(10,2) DEFAULT 0,
  is_active boolean DEFAULT true,
  color text DEFAULT '#3b82f6',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS member_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_member_id uuid NOT NULL REFERENCES workspace_members(id) ON DELETE CASCADE,
  day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'service_id'
  ) THEN
    ALTER TABLE bookings ADD COLUMN service_id uuid REFERENCES services(id) ON DELETE SET NULL;
  END IF;
END $$;

ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workspace members can view services"
  ON services FOR SELECT
  TO authenticated
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Workspace admins can manage services"
  ON services FOR ALL
  TO authenticated
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin') AND is_active = true
    )
  );

CREATE POLICY "Public can view active services"
  ON services FOR SELECT
  TO anon
  USING (is_active = true);

CREATE POLICY "Members can view their availability"
  ON member_availability FOR SELECT
  TO authenticated
  USING (
    workspace_member_id IN (
      SELECT id FROM workspace_members
      WHERE user_id = auth.uid()
    )
    OR
    workspace_member_id IN (
      SELECT wm.id FROM workspace_members wm
      WHERE wm.workspace_id IN (
        SELECT workspace_id FROM workspace_members
        WHERE user_id = auth.uid() AND is_active = true
      )
    )
  );

CREATE POLICY "Members can manage their availability"
  ON member_availability FOR ALL
  TO authenticated
  USING (
    workspace_member_id IN (
      SELECT id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Public can view member availability"
  ON member_availability FOR SELECT
  TO anon
  USING (is_active = true);

CREATE INDEX IF NOT EXISTS idx_services_workspace ON services(workspace_id);
CREATE INDEX IF NOT EXISTS idx_services_active ON services(is_active);
CREATE INDEX IF NOT EXISTS idx_member_availability_member ON member_availability(workspace_member_id);
CREATE INDEX IF NOT EXISTS idx_member_availability_day ON member_availability(day_of_week);
CREATE INDEX IF NOT EXISTS idx_bookings_service ON bookings(service_id);
