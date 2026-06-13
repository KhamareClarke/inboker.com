import { NextRequest, NextResponse } from 'next/server';
import { sendNotification } from '@/lib/notifications';
import type { NotificationChannel, NotificationType } from '@/lib/notifications/types';

const ALLOWED_TYPES: NotificationType[] = [
  'signup_confirmation',
  'login_alert',
  'password_reset_request',
  'password_changed',
  'booking_confirmation_customer',
  'booking_notification_owner',
  'booking_reminder_customer',
  'booking_cancelled_customer',
  'booking_cancelled_owner',
  'review_request',
  'review_posted_owner',
  'subscription_expiration_warning',
  'subscription_renewal_confirmation',
];

function isChannel(x: unknown): x is NotificationChannel {
  return x === 'email' || x === 'sms' || x === 'push' || x === 'in_app';
}

/**
 * Server-to-server multi-channel send (same pipeline as welcome-email / forgot-password).
 * Auth: Authorization: Bearer {CRON_SECRET}
 */
export async function POST(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET?.trim();
  const authHeader = req.headers.get('authorization');
  const bearer = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';

  if (!cronSecret || bearer !== cronSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const type = body.type as string | undefined;
  if (!type || !ALLOWED_TYPES.includes(type as NotificationType)) {
    return NextResponse.json({ error: 'Invalid or disallowed type' }, { status: 400 });
  }

  const rawChannels = body.channels;
  if (!Array.isArray(rawChannels) || rawChannels.length === 0) {
    return NextResponse.json({ error: 'channels must be a non-empty array' }, { status: 400 });
  }

  const channels = rawChannels.filter(isChannel);
  if (channels.length !== rawChannels.length) {
    return NextResponse.json({ error: 'Invalid channel in channels' }, { status: 400 });
  }

  const data =
    body.data && typeof body.data === 'object' && !Array.isArray(body.data)
      ? (body.data as Record<string, unknown>)
      : {};

  const result = await sendNotification({
    type: type as NotificationType,
    channels,
    email: typeof body.email === 'string' ? body.email : null,
    phone: typeof body.phone === 'string' ? body.phone : null,
    userId: typeof body.userId === 'string' ? body.userId : null,
    data,
  });

  return NextResponse.json({ ok: true, result });
}
