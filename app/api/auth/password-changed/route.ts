import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { normalizeSupabaseUrl } from '@/lib/supabase-env';
import { sendNotification } from '@/lib/notifications';

/**
 * Call after a successful password update (e.g. from account settings).
 * Auth: Bearer access token (same pattern as welcome-email).
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseUrl =
      normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL) ??
      process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
    if (!supabaseUrl || !anonKey) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 503 });
    }

    const supabase = createClient(supabaseUrl, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body: { fullName?: string } = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const fullName =
      body.fullName?.trim() ||
      (user.user_metadata?.full_name as string | undefined)?.trim() ||
      user.email.split('@')[0] ||
      'there';

    const ts = new Date().toISOString();

    await sendNotification({
      type: 'password_changed',
      channels: ['email', 'in_app'],
      email: user.email,
      userId: user.id,
      data: { name: fullName, fullName, timestamp: ts },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[password-changed]', e);
    return NextResponse.json({ error: 'Failed to send notice' }, { status: 500 });
  }
}
