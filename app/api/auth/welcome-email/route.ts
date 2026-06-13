import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { normalizeSupabaseUrl } from '@/lib/supabase-env';
import { sendNotification } from '@/lib/notifications';
import { triggerEmpireOsEvent } from '@/lib/empire-os/events';
import { emitEmpireActivity } from '@/lib/empire-activity';

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

    const phone =
      (user.phone as string | undefined)?.trim() ||
      (user.user_metadata?.phone as string | undefined)?.trim() ||
      null;

    const channels: ('email' | 'sms' | 'in_app')[] = ['email', 'in_app'];
    if (phone && process.env.GHL_API_KEY && process.env.GHL_LOCATION_ID) {
      channels.push('sms');
    }

    await sendNotification({
      type: 'signup_confirmation',
      channels,
      email: user.email,
      phone,
      userId: user.id,
      data: { name: fullName, fullName },
    });

    void triggerEmpireOsEvent(
      'customer_signup',
      {
        userId: user.id,
        email: user.email,
        fullName,
      },
      null
    );

    void emitEmpireActivity({
      event_type: 'signup',
      user_email: user.email,
      user_id: user.id,
      user_name: fullName,
      request,
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[welcome-email]', e);
    return NextResponse.json({ error: 'Failed to send welcome' }, { status: 500 });
  }
}
