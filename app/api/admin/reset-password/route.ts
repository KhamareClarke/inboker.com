import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { normalizeSupabaseUrl } from '@/lib/supabase-env';
import { generateTemporaryPassword } from '@/lib/admin/generate-temp-password';
import { sendEmail, emailTemplates } from '@/lib/email';

async function resolveActorUserId(
  req: NextRequest,
  supabaseUrl: string,
  anonKey: string
): Promise<string | null> {
  const supabase = createRouteHandlerClient(
    { cookies },
    {
      supabaseUrl,
      supabaseKey: anonKey,
    }
  );
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session?.user?.id) {
    return session.user.id;
  }

  const authHeader = req.headers.get('authorization');
  const bearer = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7).trim()
    : null;
  if (!bearer) {
    return null;
  }

  const anon = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: userData, error } = await anon.auth.getUser(bearer);
  if (error || !userData.user?.id) {
    return null;
  }
  return userData.user.id;
}

export async function POST(req: NextRequest) {
  try {
    const supabaseUrl =
      normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL) ??
      process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      return NextResponse.json(
        { error: 'Server not configured (Supabase)' },
        { status: 503 }
      );
    }

    const actorId = await resolveActorUserId(req, supabaseUrl, anonKey);
    if (!actorId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: actorRow, error: actorErr } = await adminClient
      .from('users')
      .select('id, role')
      .eq('id', actorId)
      .maybeSingle();

    if (actorErr || !actorRow || actorRow.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    let body: { userId?: string; newPassword?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const userId = typeof body.userId === 'string' ? body.userId.trim() : '';
    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    if (userId === actorId) {
      return NextResponse.json(
        {
          error:
            'Use account settings or forgot-password to change your own password',
        },
        { status: 400 }
      );
    }

    let newPassword =
      typeof body.newPassword === 'string' ? body.newPassword.trim() : '';
    if (newPassword) {
      if (newPassword.length < 8 || newPassword.length > 72) {
        return NextResponse.json(
          { error: 'newPassword must be between 8 and 72 characters' },
          { status: 400 }
        );
      }
    } else {
      newPassword = generateTemporaryPassword(16);
    }

    const { data: target, error: targetErr } = await adminClient
      .from('users')
      .select('id, email, full_name, role, suspended')
      .eq('id', userId)
      .maybeSingle();

    if (targetErr) {
      console.error('[reset-password] target lookup', targetErr);
      return NextResponse.json(
        { error: 'Failed to look up user' },
        { status: 500 }
      );
    }
    if (!target?.email) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (target.role === 'admin') {
      return NextResponse.json(
        {
          error:
            'Resetting another administrator account is not allowed',
        },
        { status: 403 }
      );
    }

    if (target.suspended) {
      return NextResponse.json(
        { error: 'Cannot reset password for a suspended account' },
        { status: 400 }
      );
    }

    const { error: authUpdateErr } = await adminClient.auth.admin.updateUserById(
      userId,
      { password: newPassword }
    );

    if (authUpdateErr) {
      console.error('[reset-password] auth.admin.updateUserById', authUpdateErr);
      return NextResponse.json(
        { error: authUpdateErr.message || 'Failed to update password' },
        { status: 400 }
      );
    }

    console.info('[admin] reset_password', {
      adminId: actorId,
      targetUserId: userId,
      targetEmail: target.email,
    });

    const displayName =
      target.full_name?.trim() ||
      target.email.split('@')[0] ||
      'there';
    const tpl = emailTemplates.passwordResetByAdmin(displayName);
    const emailSent = await sendEmail({
      to: target.email,
      subject: tpl.subject,
      html: tpl.html,
    });
    if (!emailSent) {
      console.warn(
        '[reset-password] notice email not sent (check EMAIL_USER / EMAIL_PASS)'
      );
    }

    return NextResponse.json({
      success: true,
      temporaryPassword: newPassword,
      emailSent,
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Internal error';
    console.error('[reset-password]', e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
