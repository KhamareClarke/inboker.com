import type { SupabaseClient } from '@supabase/supabase-js';

/** Parse Postgres `time` / `HH:mm` string to minutes from midnight (wall clock, no TZ). */
export function parseWallTimeToMinutes(t: string): number {
  const parts = String(t).split(':');
  const h = parseInt(parts[0] ?? '0', 10) || 0;
  const m = parseInt(parts[1] ?? '0', 10) || 0;
  return h * 60 + m;
}

/** Minutes from midnight UTC for an instant (consistent with ISO bookings stored in UTC). */
export function utcMinutesFromMidnight(d: Date): number {
  return d.getUTCHours() * 60 + d.getUTCMinutes();
}

/**
 * Workspace CRM provider: must fall inside `team_shifts` for that UTC weekday, or an
 * `availability_override` for that UTC date; blocked on `time_off` overlapping the day.
 * Uses the same rules as `calculateAvailableSlots` in lib/actions/calendar.ts.
 */
export async function isWorkspaceProviderAvailable(
  client: SupabaseClient,
  params: {
    workspaceId: string;
    providerId: string;
    startTime: Date;
    endTime: Date;
  }
): Promise<{ available: boolean; reason?: string }> {
  const { workspaceId, providerId, startTime, endTime } = params;
  if (!(startTime instanceof Date) || !(endTime instanceof Date) || Number.isNaN(startTime.getTime())) {
    return { available: false, reason: 'invalid_time' };
  }
  if (endTime <= startTime) {
    return { available: false, reason: 'invalid_range' };
  }

  const dateStr = startTime.toISOString().slice(0, 10);
  if (endTime.toISOString().slice(0, 10) !== dateStr) {
    return { available: false, reason: 'cross_day' };
  }

  const dayOfWeek = startTime.getUTCDay();

  const { data: timeOff, error: timeOffError } = await client
    .from('time_off')
    .select('id')
    .eq('member_id', providerId)
    .lte('start_date', dateStr)
    .gte('end_date', dateStr);

  if (timeOffError) throw timeOffError;
  if ((timeOff?.length ?? 0) > 0) {
    return { available: false, reason: 'time_off' };
  }

  const { data: overrides, error: overridesError } = await client
    .from('availability_overrides')
    .select('*')
    .eq('workspace_id', workspaceId)
    .eq('member_id', providerId)
    .eq('date', dateStr);

  if (overridesError) throw overridesError;

  const { data: shifts, error: shiftsError } = await client
    .from('team_shifts')
    .select('*')
    .eq('workspace_id', workspaceId)
    .eq('member_id', providerId)
    .eq('day_of_week', dayOfWeek)
    .eq('is_active', true);

  if (shiftsError) throw shiftsError;

  let workingHours: Array<{ start: string; end: string }> = [];

  if (overrides && overrides.length > 0) {
    const override = overrides[0] as {
      is_available: boolean;
      start_time: string | null;
      end_time: string | null;
    };
    if (!override.is_available) {
      return { available: false, reason: 'override_blocked' };
    }
    if (override.start_time && override.end_time) {
      workingHours = [{ start: override.start_time, end: override.end_time }];
    }
  }

  if (workingHours.length === 0 && shifts && shifts.length > 0) {
    workingHours = shifts.map((s: { start_time: string; end_time: string }) => ({
      start: s.start_time,
      end: s.end_time,
    }));
  }

  if (workingHours.length === 0) {
    return { available: false, reason: 'no_schedule' };
  }

  const bStart = utcMinutesFromMidnight(startTime);
  const bEnd = utcMinutesFromMidnight(endTime);
  if (bEnd <= bStart) {
    return { available: false, reason: 'invalid_same_day_window' };
  }

  const ok = workingHours.some((h) => {
    const sm = parseWallTimeToMinutes(h.start);
    const em = parseWallTimeToMinutes(h.end);
    return sm <= bStart && em >= bEnd;
  });

  return { available: ok, reason: ok ? undefined : 'outside_hours' };
}

/**
 * Public business profile staff: weekly `business_profile_staff_availability` rows.
 * If the staff member has no rows, returns available (backward compatible until schedules are added).
 */
export async function isBusinessProfileStaffAvailable(
  client: SupabaseClient,
  staffId: string,
  startTime: Date,
  endTime: Date
): Promise<{ available: boolean; reason?: string }> {
  if (!(startTime instanceof Date) || !(endTime instanceof Date) || Number.isNaN(startTime.getTime())) {
    return { available: false, reason: 'invalid_time' };
  }
  if (endTime <= startTime) {
    return { available: false, reason: 'invalid_range' };
  }

  const dateStr = startTime.toISOString().slice(0, 10);
  if (endTime.toISOString().slice(0, 10) !== dateStr) {
    return { available: false, reason: 'cross_day' };
  }

  const dayOfWeek = startTime.getUTCDay();

  const { data: slots, error } = await client
    .from('business_profile_staff_availability')
    .select('start_time, end_time')
    .eq('staff_id', staffId)
    .eq('day_of_week', dayOfWeek)
    .eq('is_active', true);

  if (error) throw error;

  if (!slots || slots.length === 0) {
    return { available: true, reason: 'not_configured' };
  }

  const bStart = utcMinutesFromMidnight(startTime);
  const bEnd = utcMinutesFromMidnight(endTime);

  const ok = slots.some((s) => {
    const sm = parseWallTimeToMinutes(String(s.start_time));
    const em = parseWallTimeToMinutes(String(s.end_time));
    return sm <= bStart && em >= bEnd;
  });

  return { available: ok, reason: ok ? undefined : 'outside_hours' };
}
