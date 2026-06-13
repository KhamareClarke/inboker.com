/*
  # GAP 4 — Booking integrity (constraints + triggers)

  ## Already present (see 20251024000005_create_business_bookings.sql)
  - `business_profile_id` → `business_profiles(id)` ON DELETE CASCADE
  - `service_id` → `business_profile_services(id)` ON DELETE CASCADE
  - `staff_id` → `business_profile_staff(id)` ON DELETE SET NULL (keeps historical rows when staff removed)

  ## This migration adds
  1. CHECK: `end_time > start_time` (invalid ranges rejected at DB level).
  2. Trigger: `service_id` and optional `staff_id` must belong to the same `business_profile_id`
     (prevents cross-tenant / forged IDs even if RLS is bypassed by service role).
  3. Trigger: on INSERT and on UPDATE when booking time / profile / service / staff change,
     the business owner must have `subscriptions.status` in (`active`, `trial`, `trialing`).

  ## Not implemented here (and why)
  - `CHECK (start_time > now())`: volatile, breaks imports/history and rescheduling edge cases; enforce in app if needed.
  - `CHECK (EXISTS … subscriptions …)`: PostgreSQL does not allow subqueries referencing other tables in CHECK constraints.

  ## Operational note
  - New public bookings require the owner subscription status in (`active`, `trial`, `trialing`).
  - This file backfills `subscriptions` (`inactive`) for existing `business_profiles` owners missing a row,
    and adds a trigger on new `business_profiles` rows to insert the same. Upgrade status via Stripe
    webhook, trial checkout, or admin grant before accepting live bookings.
*/

-- ---------------------------------------------------------------------------
-- 1. Time range sanity (same row only — valid CHECK)
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'business_profile_bookings_check_end_after_start'
      AND conrelid = 'public.business_profile_bookings'::regclass
  ) THEN
    ALTER TABLE public.business_profile_bookings
      ADD CONSTRAINT business_profile_bookings_check_end_after_start
      CHECK (end_time > start_time);
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- 1b. One subscription row per business profile owner (if missing)
--     Ensures the trigger below can evaluate status consistently. Owners stay
--     `inactive` until Stripe / admin grant sets `trial` | `trialing` | `active`.
-- ---------------------------------------------------------------------------
INSERT INTO public.subscriptions (user_id, status)
SELECT DISTINCT p.user_id, 'inactive'::text
FROM public.business_profiles AS p
WHERE NOT EXISTS (
  SELECT 1 FROM public.subscriptions AS s WHERE s.user_id = p.user_id
)
ON CONFLICT (user_id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 2–3. Scope + subscription (trigger — cross-table rules)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.enforce_business_profile_booking_integrity()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  svc_profile uuid;
  stf_profile uuid;
  owner_user_id uuid;
  sub_status text;
BEGIN
  -- Service must exist and belong to this business profile
  SELECT s.business_profile_id
  INTO svc_profile
  FROM public.business_profile_services AS s
  WHERE s.id = NEW.service_id;

  IF svc_profile IS NULL THEN
    RAISE EXCEPTION 'business_profile_bookings: invalid service_id %', NEW.service_id
      USING ERRCODE = '23503';
  END IF;

  IF svc_profile IS DISTINCT FROM NEW.business_profile_id THEN
    RAISE EXCEPTION 'business_profile_bookings: service_id does not belong to business_profile_id'
      USING ERRCODE = '23514';
  END IF;

  -- Optional staff must exist and belong to the same business profile
  IF NEW.staff_id IS NOT NULL THEN
    SELECT st.business_profile_id
    INTO stf_profile
    FROM public.business_profile_staff AS st
    WHERE st.id = NEW.staff_id;

    IF stf_profile IS NULL THEN
      RAISE EXCEPTION 'business_profile_bookings: invalid staff_id %', NEW.staff_id
        USING ERRCODE = '23503';
    END IF;

    IF stf_profile IS DISTINCT FROM NEW.business_profile_id THEN
      RAISE EXCEPTION 'business_profile_bookings: staff_id does not belong to business_profile_id'
        USING ERRCODE = '23514';
    END IF;
  END IF;

  -- Subscription gate: new bookings and material changes (reschedule / reassign)
  IF TG_OP = 'INSERT'
     OR (
       TG_OP = 'UPDATE'
       AND (
         OLD.business_profile_id IS DISTINCT FROM NEW.business_profile_id
         OR OLD.service_id IS DISTINCT FROM NEW.service_id
         OR OLD.staff_id IS DISTINCT FROM NEW.staff_id
         OR OLD.start_time IS DISTINCT FROM NEW.start_time
         OR OLD.end_time IS DISTINCT FROM NEW.end_time
       )
     )
  THEN
    SELECT p.user_id
    INTO owner_user_id
    FROM public.business_profiles AS p
    WHERE p.id = NEW.business_profile_id;

    IF owner_user_id IS NULL THEN
      RAISE EXCEPTION 'business_profile_bookings: invalid business_profile_id'
        USING ERRCODE = '23503';
    END IF;

    SELECT s.status
    INTO sub_status
    FROM public.subscriptions AS s
    WHERE s.user_id = owner_user_id
    LIMIT 1;

    IF sub_status IS NULL THEN
      RAISE EXCEPTION 'business_profile_bookings: business owner has no subscription row (user_id %)', owner_user_id
        USING ERRCODE = '23514';
    END IF;

    IF sub_status NOT IN ('active', 'trial', 'trialing') THEN
      RAISE EXCEPTION 'business_profile_bookings: subscription not eligible for bookings (status %)', sub_status
        USING ERRCODE = '23514';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS business_profile_bookings_enforce_integrity
  ON public.business_profile_bookings;

CREATE TRIGGER business_profile_bookings_enforce_integrity
  BEFORE INSERT
  OR UPDATE OF business_profile_id, service_id, staff_id, start_time, end_time
  ON public.business_profile_bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_business_profile_booking_integrity();

COMMENT ON FUNCTION public.enforce_business_profile_booking_integrity() IS
  'Ensures booking service/staff match business_profile_id and owner subscription is active/trial/trialing for new or materially changed bookings.';

-- ---------------------------------------------------------------------------
-- 4. New business profiles: ensure owner has a subscriptions row (inactive OK)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.ensure_subscription_for_new_business_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.subscriptions (user_id, status)
  VALUES (NEW.user_id, 'inactive')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS business_profiles_ensure_subscription_row ON public.business_profiles;

CREATE TRIGGER business_profiles_ensure_subscription_row
  AFTER INSERT ON public.business_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.ensure_subscription_for_new_business_profile();

COMMENT ON FUNCTION public.ensure_subscription_for_new_business_profile() IS
  'Creates a default subscriptions row for the profile owner when missing (RLS: owner insert).';
