import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendNotification } from '@/lib/notifications';
import { publicSiteOrigin } from '@/lib/public-site-url';

function checkCronAuth(request: NextRequest): NextResponse | null {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET || 'your-secret-key';
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}

function getAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * ~2 hours after appointment end: ask customer for a review (email + optional SMS).
 * Idempotent via business_profile_bookings.review_request_sent_at.
 */
async function runReviewRequests() {
  const supabase = getAdmin();
  if (!supabase) {
    throw new Error('Server misconfiguration: Supabase service role not set');
  }

  const now = Date.now();
  const twoHoursAgo = new Date(now - 2 * 60 * 60 * 1000).toISOString();
  const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data: bookings, error } = await supabase
    .from('business_profile_bookings')
    .select(
      `
      id,
      client_email,
      client_name,
      client_phone,
      end_time,
      business_profile_services ( name ),
      business_profiles ( business_name )
    `
    )
    .in('status', ['pending', 'confirmed', 'completed'])
    .lte('end_time', twoHoursAgo)
    .gte('end_time', sevenDaysAgo)
    .is('review_request_sent_at', null)
    .not('client_email', 'is', null);

  if (error) {
    throw new Error(error.message);
  }

  if (!bookings?.length) {
    return { success: true, sent: 0, candidates: 0 };
  }

  const ids = bookings.map((b) => b.id);
  const { data: existingReviews } = await supabase
    .from('appointment_reviews')
    .select('booking_id')
    .in('booking_id', ids);

  const reviewed = new Set((existingReviews || []).map((r) => r.booking_id));

  const baseUrl = publicSiteOrigin();
  let sent = 0;

  for (const booking of bookings as any[]) {
    if (reviewed.has(booking.id)) continue;
    const email = booking.client_email as string;
    if (!email) continue;

    const businessName = booking.business_profiles?.business_name || 'Business';
    const serviceName = booking.business_profile_services?.name || 'your visit';
    const reviewUrl = `${baseUrl}/dashboard/customer/bookings?review=${booking.id}`;
    const customerName = booking.client_name || email.split('@')[0];

    const channels: ('email' | 'sms')[] = ['email'];
    const phone = (booking.client_phone as string | null | undefined)?.trim();
    if (phone && process.env.GHL_API_KEY && process.env.GHL_LOCATION_ID) {
      channels.push('sms');
    }

    const result = await sendNotification({
      type: 'review_request',
      channels,
      email,
      phone: phone || null,
      userId: null,
      data: {
        name: customerName,
        customerName,
        businessName,
        serviceName,
        reviewUrl,
      },
    });

    if (result.emailOk) {
      await supabase
        .from('business_profile_bookings')
        .update({ review_request_sent_at: new Date().toISOString() })
        .eq('id', booking.id);
      sent += 1;
    }
  }

  return { success: true, sent, candidates: bookings.length };
}

export async function GET(request: NextRequest) {
  const unauth = checkCronAuth(request);
  if (unauth) return unauth;
  try {
    const result = await runReviewRequests();
    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed';
    console.error('[review-requests cron]', e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const unauth = checkCronAuth(request);
  if (unauth) return unauth;
  try {
    const result = await runReviewRequests();
    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed';
    console.error('[review-requests cron]', e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
