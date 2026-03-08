import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * POST /api/admin/grant-subscription
 * Grants an active subscription to a user by email (e.g. for manual/off-Stripe purchases).
 * Secured by ADMIN_SECRET or GRANT_SUBSCRIPTION_SECRET env var.
 * Body: { "email": "user@example.com" }
 */
export async function POST(req: NextRequest) {
  const secret =
    process.env.ADMIN_SECRET ||
    process.env.GRANT_SUBSCRIPTION_SECRET;
  const authHeader = req.headers.get('authorization');
  const bearer = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null;
  if (!secret || bearer !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body. Use { "email": "user@example.com" }' },
      { status: 400 }
    );
  }

  const rawEmail = body.email?.trim?.();
  if (!rawEmail) {
    return NextResponse.json(
      { error: 'Missing email. Body: { "email": "user@example.com" }' },
      { status: 400 }
    );
  }
  const email = rawEmail.includes('@') ? rawEmail : `${rawEmail}@gmail.com`;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { error: 'Server not configured (Supabase)' },
      { status: 503 }
    );
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const { data: userRow, error: userError } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('email', email.toLowerCase())
    .maybeSingle();

  if (userError) {
    console.error('[grant-subscription] users lookup error:', userError);
    return NextResponse.json(
      { error: 'Failed to look up user' },
      { status: 500 }
    );
  }
  if (!userRow?.id) {
    return NextResponse.json(
      {
        error: `No user found with email "${email}". They must sign up first.`,
      },
      { status: 404 }
    );
  }

  const userId = userRow.id;
  const now = new Date().toISOString();
  const periodEnd = new Date();
  periodEnd.setFullYear(periodEnd.getFullYear() + 1);

  const { error: subError } = await supabaseAdmin
    .from('subscriptions')
    .upsert(
      {
        user_id: userId,
        status: 'active',
        current_period_start: now,
        current_period_end: periodEnd.toISOString(),
        cancel_at_period_end: false,
        stripe_customer_id: null,
        stripe_subscription_id: null,
        stripe_price_id: null,
        trial_end: null,
      },
      { onConflict: 'user_id' }
    );

  if (subError) {
    console.error('[grant-subscription] upsert error:', subError);
    return NextResponse.json(
      { error: 'Failed to grant subscription', details: subError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    message: `Subscription granted for ${email}`,
    user_id: userId,
  });
}
