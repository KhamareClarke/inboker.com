-- Add reminder sent timestamps to bookings (idempotency + display)
ALTER TABLE business_profile_bookings
  ADD COLUMN IF NOT EXISTS reminder_24h_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS reminder_1h_sent_at timestamptz;

-- Log table for admin reminder history
CREATE TABLE IF NOT EXISTS reminder_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES business_profile_bookings(id) ON DELETE CASCADE,
  reminder_type text NOT NULL CHECK (reminder_type IN ('24h', '1h')),
  sent_at timestamptz NOT NULL DEFAULT now(),
  recipient_email text NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_reminder_deliveries_booking ON reminder_deliveries(booking_id);
CREATE INDEX IF NOT EXISTS idx_reminder_deliveries_sent_at ON reminder_deliveries(sent_at);

ALTER TABLE reminder_deliveries ENABLE ROW LEVEL SECURITY;

-- Admins can read all reminder deliveries
CREATE POLICY "Admins can read reminder_deliveries"
  ON reminder_deliveries FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Business owners can read reminder deliveries for their own bookings
CREATE POLICY "Business owners can read own reminder_deliveries"
  ON reminder_deliveries FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM business_profile_bookings b
      JOIN business_profiles p ON p.id = b.business_profile_id
      WHERE b.id = reminder_deliveries.booking_id AND p.user_id = auth.uid()
    )
  );

COMMENT ON TABLE reminder_deliveries IS 'Log of appointment reminder emails sent (24h and 1h before) for admin and validation';
