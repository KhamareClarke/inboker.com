'use server';

import { supabase } from '../supabase';
import { revalidatePath } from 'next/cache';
import { addDays, format, startOfWeek, endOfWeek, parseISO } from 'date-fns';

export async function getAvailabilityOverrides(workspaceId: string, memberId: string) {
  const { data, error } = await supabase
    .from('availability_overrides')
    .select('*')
    .eq('workspace_id', workspaceId)
    .eq('member_id', memberId)
    .order('date', { ascending: true });

  if (error) throw error;
  return data;
}

export async function createAvailabilityOverride(
  workspaceId: string,
  memberId: string,
  date: string,
  startTime: string | null,
  endTime: string | null,
  isAvailable: boolean
) {
  const { data, error } = await supabase
    .from('availability_overrides')
    .insert({
      workspace_id: workspaceId,
      member_id: memberId,
      date,
      start_time: startTime,
      end_time: endTime,
      is_available: isAvailable,
    })
    .select()
    .single();

  if (error) throw error;
  revalidatePath('/dashboard/calendar');
  return data;
}

export async function deleteAvailabilityOverride(overrideId: string) {
  const { error } = await supabase
    .from('availability_overrides')
    .delete()
    .eq('id', overrideId);

  if (error) throw error;
  revalidatePath('/dashboard/calendar');
}

export async function getWeeklyAvailability(workspaceId: string, date: Date) {
  const weekStart = startOfWeek(date, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(date, { weekStartsOn: 0 });

  const { data: shifts, error: shiftsError } = await supabase
    .from('team_shifts')
    .select(`
      *,
      member:workspace_members(
        *,
        user:users(*)
      )
    `)
    .eq('workspace_id', workspaceId)
    .eq('is_active', true);

  if (shiftsError) throw shiftsError;

  const { data: timeOff, error: timeOffError } = await supabase
    .from('time_off')
    .select('*')
    .eq('workspace_id', workspaceId)
    .gte('end_date', format(weekStart, 'yyyy-MM-dd'))
    .lte('start_date', format(weekEnd, 'yyyy-MM-dd'));

  if (timeOffError) throw timeOffError;

  const { data: overrides, error: overridesError } = await supabase
    .from('availability_overrides')
    .select('*')
    .eq('workspace_id', workspaceId)
    .gte('date', format(weekStart, 'yyyy-MM-dd'))
    .lte('date', format(weekEnd, 'yyyy-MM-dd'));

  if (overridesError) throw overridesError;

  const { data: bookings, error: bookingsError } = await supabase
    .from('bookings')
    .select('*')
    .eq('workspace_id', workspaceId)
    .gte('start_time', weekStart.toISOString())
    .lte('start_time', weekEnd.toISOString())
    .neq('status', 'cancelled');

  if (bookingsError) throw bookingsError;

  return {
    shifts,
    timeOff,
    overrides,
    bookings,
  };
}

export async function calculateAvailableSlots(
  workspaceId: string,
  providerId: string,
  date: string,
  duration: number = 60
) {
  const targetDate = parseISO(date);
  const dayOfWeek = targetDate.getDay();

  const { data: shifts, error: shiftsError } = await supabase
    .from('team_shifts')
    .select('*')
    .eq('workspace_id', workspaceId)
    .eq('member_id', providerId)
    .eq('day_of_week', dayOfWeek)
    .eq('is_active', true);

  if (shiftsError) throw shiftsError;

  const { data: timeOff, error: timeOffError } = await supabase
    .from('time_off')
    .select('*')
    .eq('member_id', providerId)
    .lte('start_date', date)
    .gte('end_date', date);

  if (timeOffError) throw timeOffError;

  if (timeOff.length > 0) {
    return [];
  }

  const { data: overrides, error: overridesError } = await supabase
    .from('availability_overrides')
    .select('*')
    .eq('member_id', providerId)
    .eq('date', date);

  if (overridesError) throw overridesError;

  const { data: bookings, error: bookingsError } = await supabase
    .from('bookings')
    .select('*')
    .eq('provider_id', providerId)
    .gte('start_time', `${date}T00:00:00`)
    .lte('start_time', `${date}T23:59:59`)
    .neq('status', 'cancelled');

  if (bookingsError) throw bookingsError;

  const availableSlots: string[] = [];
  const blockedTimes = new Set(
    bookings.map((b) => format(parseISO(b.start_time), 'HH:mm'))
  );

  let workingHours: Array<{ start: string; end: string }> = [];

  if (overrides.length > 0) {
    const override = overrides[0];
    if (override.is_available && override.start_time && override.end_time) {
      workingHours = [{ start: override.start_time, end: override.end_time }];
    }
  } else if (shifts.length > 0) {
    workingHours = shifts.map((s) => ({
      start: s.start_time,
      end: s.end_time,
    }));
  }

  for (const hours of workingHours) {
    const [startHour, startMin] = hours.start.split(':').map(Number);
    const [endHour, endMin] = hours.end.split(':').map(Number);

    let currentHour = startHour;
    let currentMin = startMin;

    while (
      currentHour < endHour ||
      (currentHour === endHour && currentMin < endMin)
    ) {
      const timeStr = `${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`;

      if (!blockedTimes.has(timeStr)) {
        availableSlots.push(timeStr);
      }

      currentMin += duration;
      if (currentMin >= 60) {
        currentHour += Math.floor(currentMin / 60);
        currentMin = currentMin % 60;
      }
    }
  }

  return availableSlots;
}
