import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { normalizeSupabaseUrl } from '@/lib/supabase-env';
import { applyPublicMutationGuards } from '@/lib/security/api-guards';
import { writeAuditLog } from '@/lib/audit-log';
import { getStripe } from '@/lib/stripe';

const CONFIRM_PHRASE = 'DELETE MY ACCOUNT';

/**
 * GDPR right to erasure: cancels Stripe subscription when possible, deletes auth user
 * (cascades public.users and related rows per database FKs).
 */
export async function POST(req: NextRequest) {
  const guard = applyPublicMutationGuards(req, 'account_delete', 3, 24 * 60 * 60 * 1000);
  if (guard) return guard;

  const supabaseUrl =
    normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL) ??
    process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!supabaseUrl || !anonKey || !serviceKey) {
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 503 });
  }

  const supabase = createRouteHandlerClient(
    { cookies },
    { supabaseUrl, supabaseKey: anonKey }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let confirm = '';
  try {
    const body = await req.json();
    confirm = typeof body.confirm === 'string' ? body.confirm.trim() : '';
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  if (confirm !== CONFIRM_PHRASE) {
    return NextResponse.json(
      { error: `Confirmation must be exactly: ${CONFIRM_PHRASE}` },
      { status: 400 }
    );
  }

  const uid = session.user.id;

  await writeAuditLog({
    request: req,
    actorUserId: uid,
    action: 'gdpr_account_delete_requested',
    resourceType: 'user',
    resourceId: uid,
  });

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('stripe_subscription_id, status')
    .eq('user_id', uid)
    .maybeSingle();

  let stripeNote: string | null = null;
  if (sub?.stripe_subscription_id) {
    const activeLike = ['active', 'trialing', 'trial', 'past_due'].includes(sub.status ?? '');
    if (activeLike) {
      try {
        await getStripe().subscriptions.cancel(sub.stripe_subscription_id);
        stripeNote = 'stripe_subscription_cancelled';
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'stripe_error';
        stripeNote = `stripe_cancel_failed:${msg}`;
        console.warn('[account/delete] Stripe cancel:', e);
      }
    }
  }

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { error: delErr } = await admin.auth.admin.deleteUser(uid);

  if (delErr) {
    console.error('[account/delete] deleteUser:', delErr);
    return NextResponse.json(
      { error: 'Could not complete account deletion. Contact support if this persists.' },
      { status: 500 }
    );
  }

  await writeAuditLog({
    request: req,
    actorUserId: null,
    action: 'gdpr_account_deleted',
    resourceType: 'user',
    resourceId: uid,
    metadata: { stripeNote },
  });

  return NextResponse.json({ ok: true, stripeNote });
}
