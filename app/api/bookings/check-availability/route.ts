import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { checkTimeSlotConflict } from '@/lib/booking/overlap-checker';
import { isBusinessProfileStaffAvailable } from '@/lib/booking/availability-checker';
import { normalizeSupabaseUrl } from '@/lib/supabase-env';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST body: { businessProfileId | businessId, staffId?, startTime, endTime, excludeBookingId? } — times as ISO strings.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const businessProfileId = body.businessProfileId ?? body.businessId;
    const { staffId, startTime, endTime, excludeBookingId } = body;

    if (!businessProfileId || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Missing businessProfileId (or businessId), startTime, or endTime' },
        { status: 400 }
      );
    }

    const url =
      normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL) ??
      process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
    if (!url || !key) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const supabase = createClient(url, key);
    const start = new Date(startTime);
    const end = new Date(endTime);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return NextResponse.json({ error: 'Invalid date values' }, { status: 400 });
    }
    if (end <= start) {
      return NextResponse.json({ error: 'endTime must be after startTime' }, { status: 400 });
    }

    const { conflict, conflictingBooking } = await checkTimeSlotConflict(
      supabase,
      staffId ?? null,
      start,
      end,
      businessProfileId,
      excludeBookingId
    );

    if (conflict) {
      const c = conflictingBooking as { start_time?: string; end_time?: string } | null | undefined;
      return NextResponse.json({
        available: false,
        reason: 'overlap',
        message: c?.start_time
          ? `Time slot conflict: already booked ${c.start_time}–${c.end_time ?? ''}.`
          : 'Time slot conflict.',
        conflictingBooking: conflictingBooking ?? null,
      });
    }

    if (staffId) {
      const av = await isBusinessProfileStaffAvailable(supabase, staffId, start, end);
      if (!av.available) {
        return NextResponse.json({
          available: false,
          reason: av.reason ?? 'outside_hours',
          message: 'Staff member is not available at this time.',
          conflictingBooking: null,
        });
      }
    }

    return NextResponse.json({
      available: true,
      conflictingBooking: null,
    });
  } catch (e: any) {
    console.error('check-availability:', e);
    return NextResponse.json(
      { error: e.message || 'Failed to check availability', available: false },
      { status: 500 }
    );
  }
}
