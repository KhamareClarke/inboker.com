import type { SupabaseClient } from '@supabase/supabase-js';

const ACTIVE_BUSINESS_BOOKING_STATUSES = ['pending', 'confirmed'] as const;
const ACTIVE_WORKSPACE_BOOKING_STATUSES = ['pending', 'confirmed'] as const;

export type OverlapCheckResult = {
  conflict: boolean;
  conflictingBooking?: Record<string, unknown> | null;
};

/**
 * Public / business-profile appointments (`business_profile_bookings`).
 * When `staffId` is set, only conflicts with that staff member.
 * When `staffId` is null, only conflicts with other unassigned (`staff_id` null) rows for the same profile.
 */
export async function checkTimeSlotConflict(
  client: SupabaseClient,
  staffId: string | null,
  startTime: Date,
  endTime: Date,
  businessProfileId: string,
  excludeBookingId?: string
): Promise<OverlapCheckResult> {
  if (!(startTime instanceof Date) || !(endTime instanceof Date) || Number.isNaN(startTime.getTime()) || Number.isNaN(endTime.getTime())) {
    throw new Error('Invalid start or end time');
  }
  if (endTime <= startTime) {
    throw new Error('End time must be after start time');
  }

  const startIso = startTime.toISOString();
  const endIso = endTime.toISOString();

  let q = client
    .from('business_profile_bookings')
    .select('*')
    .eq('business_profile_id', businessProfileId)
    .in('status', [...ACTIVE_BUSINESS_BOOKING_STATUSES])
    .lt('start_time', endIso)
    .gt('end_time', startIso);

  if (staffId) {
    q = q.eq('staff_id', staffId);
  } else {
    q = q.is('staff_id', null);
  }

  if (excludeBookingId) {
    q = q.neq('id', excludeBookingId);
  }

  const { data, error } = await q.limit(5);
  if (error) throw error;

  const row = data?.[0];
  return {
    conflict: !!row,
    conflictingBooking: row ?? undefined,
  };
}

/**
 * Workspace CRM calendar bookings (`bookings` table) — same provider must not double-book.
 */
export async function checkWorkspaceBookingOverlap(
  client: SupabaseClient,
  params: {
    workspaceId: string;
    providerId: string;
    startTime: Date;
    endTime: Date;
    excludeBookingId?: string;
  }
): Promise<OverlapCheckResult> {
  const { workspaceId, providerId, startTime, endTime, excludeBookingId } = params;
  if (endTime <= startTime) {
    throw new Error('End time must be after start time');
  }
  const startIso = startTime.toISOString();
  const endIso = endTime.toISOString();

  let q = client
    .from('bookings')
    .select('*')
    .eq('workspace_id', workspaceId)
    .eq('provider_id', providerId)
    .in('status', [...ACTIVE_WORKSPACE_BOOKING_STATUSES])
    .lt('start_time', endIso)
    .gt('end_time', startIso);

  if (excludeBookingId) {
    q = q.neq('id', excludeBookingId);
  }

  const { data, error } = await q.limit(5);
  if (error) throw error;
  const row = data?.[0];
  return {
    conflict: !!row,
    conflictingBooking: row ?? undefined,
  };
}
