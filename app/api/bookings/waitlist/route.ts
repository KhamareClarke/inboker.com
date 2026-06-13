import { NextRequest, NextResponse } from 'next/server';
import { getServiceRoleClient } from '@/lib/supabase-service-role';
import { applyPublicMutationGuards } from '@/lib/security/api-guards';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST — join waitlist (works for guests; uses service role).
 * Body: businessProfileId, serviceId, staffId?, requestedStart ISO, requestedEnd ISO, clientEmail, clientName?, notes?, userId? (auth users id if known)
 */
export async function POST(req: NextRequest) {
  const blocked = applyPublicMutationGuards(req, 'booking_waitlist', 25, 60 * 60 * 1000);
  if (blocked) return blocked;

  try {
    const admin = getServiceRoleClient();
    if (!admin) {
      return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
    }
    const db = admin as any;

    const body = await req.json();
    const {
      businessProfileId,
      serviceId,
      staffId,
      requestedStart,
      requestedEnd,
      clientEmail,
      clientName,
      notes,
      userId,
    } = body;

    if (!businessProfileId || !serviceId || !requestedStart || !requestedEnd || !clientEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await db
      .from('booking_waitlist')
      .insert({
        business_profile_id: businessProfileId,
        service_id: serviceId,
        staff_id: staffId || null,
        requested_start: requestedStart,
        requested_end: requestedEnd,
        client_email: String(clientEmail).trim().toLowerCase(),
        client_name: clientName ? String(clientName) : null,
        notes: notes ? String(notes) : null,
        user_id: userId || null,
        status: 'active',
      })
      .select('id')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ id: data?.id });
  } catch (e: unknown) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed' },
      { status: 500 }
    );
  }
}
