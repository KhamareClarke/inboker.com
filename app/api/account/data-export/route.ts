import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { normalizeSupabaseUrl } from '@/lib/supabase-env';
import { applyRateLimit } from '@/lib/security/api-guards';
import { writeAuditLog } from '@/lib/audit-log';

/**
 * GDPR-style data export: returns JSON of tables the user can read under RLS.
 */
export async function GET(req: NextRequest) {
  const limited = applyRateLimit(req, 'gdpr_export', 8, 60 * 60 * 1000);
  if (limited) return limited;

  const supabaseUrl =
    normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL) ??
    process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabase = createRouteHandlerClient(
    { cookies },
    {
      supabaseUrl,
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim(),
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const uid = session.user.id;

  const [
    profile,
    businessProfiles,
    bookings,
    subscriptions,
    notifPrefs,
    credits,
    inbox,
    vouchers,
    promos,
  ] = await Promise.all([
    supabase.from('users').select('*').eq('id', uid).maybeSingle(),
    supabase.from('business_profiles').select('*').eq('user_id', uid),
    supabase.from('business_profile_bookings').select('*').order('created_at', { ascending: false }).limit(500),
    supabase.from('subscriptions').select('*').eq('user_id', uid).maybeSingle(),
    supabase.from('notification_preferences').select('*').eq('user_id', uid).maybeSingle(),
    supabase.from('customer_credits').select('*').eq('user_id', uid),
    supabase.from('user_inbox_notifications').select('*').eq('user_id', uid).order('created_at', { ascending: false }).limit(200),
    supabase.from('gift_vouchers').select('*').order('created_at', { ascending: false }).limit(100),
    supabase.from('promo_codes').select('*').order('created_at', { ascending: false }).limit(100),
  ]);

  const payload = {
    exportedAt: new Date().toISOString(),
    schemaVersion: 1,
    user: profile.data ?? null,
    business_profiles: businessProfiles.data ?? [],
    business_profile_bookings: bookings.data ?? [],
    subscriptions: subscriptions.data ?? null,
    notification_preferences: notifPrefs.data ?? null,
    customer_credits: credits.data ?? [],
    user_inbox_notifications: inbox.data ?? [],
    gift_vouchers: vouchers.data ?? [],
    promo_codes: promos.data ?? [],
    _errors: [
      profile.error && { table: 'users', message: profile.error.message },
      businessProfiles.error && { table: 'business_profiles', message: businessProfiles.error.message },
      bookings.error && { table: 'business_profile_bookings', message: bookings.error.message },
      subscriptions.error && { table: 'subscriptions', message: subscriptions.error.message },
      notifPrefs.error && { table: 'notification_preferences', message: notifPrefs.error.message },
      credits.error && { table: 'customer_credits', message: credits.error.message },
      inbox.error && { table: 'user_inbox_notifications', message: inbox.error.message },
      vouchers.error && { table: 'gift_vouchers', message: vouchers.error.message },
      promos.error && { table: 'promo_codes', message: promos.error.message },
    ].filter(Boolean),
  };

  await writeAuditLog({
    request: req,
    actorUserId: uid,
    action: 'gdpr_data_export',
    resourceType: 'user',
    resourceId: uid,
    metadata: { bookingCount: (bookings.data ?? []).length },
  });

  const body = JSON.stringify(payload, null, 2);

  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="inboker-data-export-${uid.slice(0, 8)}.json"`,
      'Cache-Control': 'no-store',
    },
  });
}
