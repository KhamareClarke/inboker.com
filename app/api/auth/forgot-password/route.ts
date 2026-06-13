import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { normalizeSupabaseUrl } from '@/lib/supabase-env';
import { publicSiteOrigin } from '@/lib/public-site-url';
import { sendNotification } from '@/lib/notifications';
import { applyPublicMutationGuards } from '@/lib/security/api-guards';
import { writeAuditLog } from '@/lib/audit-log';

/**
 * Server-side password reset: generates Supabase recovery link and sends our branded email.
 * Always returns 200 for unknown emails to avoid enumeration.
 */
export async function POST(request: NextRequest) {
  const blocked = applyPublicMutationGuards(request, 'forgot_password', 10, 60 * 60 * 1000);
  if (blocked) return blocked;

  let emailRaw = '';
  try {
    const body = await request.json();
    emailRaw = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  } catch {
    return NextResponse.json({ ok: true });
  }

  if (!emailRaw || !emailRaw.includes('@')) {
    return NextResponse.json({ ok: true });
  }

  const supabaseUrl =
    normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL) ??
    process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ ok: true });
  }

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const baseUrl = publicSiteOrigin();
  const redirectTo = `${baseUrl}/login`;

  const { data: linkData, error } = await admin.auth.admin.generateLink({
    type: 'recovery',
    email: emailRaw,
    options: { redirectTo },
  });

  const actionLink = linkData?.properties?.action_link ?? null;

  if (error || !actionLink) {
    console.warn('[forgot-password] generateLink:', error?.message);
    return NextResponse.json({ ok: true });
  }

  const { data: profile } = await admin
    .from('users')
    .select('full_name')
    .eq('email', emailRaw)
    .maybeSingle();

  const name = profile?.full_name?.trim() || emailRaw.split('@')[0] || 'there';

  await sendNotification({
    type: 'password_reset_request',
    channels: ['email'],
    email: emailRaw,
    userId: null,
    data: { name, resetLink: actionLink },
  });

  await writeAuditLog({
    request,
    actorUserId: null,
    action: 'password_reset_email_sent',
    resourceType: 'auth',
    metadata: { emailDomain: emailRaw.split('@')[1] ?? 'unknown' },
  });

  return NextResponse.json({ ok: true });
}
