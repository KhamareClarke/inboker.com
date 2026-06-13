import { NextRequest, NextResponse } from 'next/server';
import { triggerEmpireOsEvent } from '@/lib/empire-os/events';

/**
 * Scheduled Empire OS time-based signals (hourly / daily / weekly).
 * Vercel cron: wire in vercel.json. Auth: Bearer CRON_SECRET
 */
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET?.trim();
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();
  const hour = now.getUTCHours();
  const dayOfWeek = now.getUTCDay();
  const dateOfMonth = now.getUTCDate();

  const payloads: { frequency: string; hour?: number; dayOfWeek?: number; dateOfMonth?: number }[] = [
    { frequency: 'hourly', hour },
  ];

  if (hour === 0) {
    payloads.push({ frequency: 'daily', hour, dateOfMonth });
  }
  if (dayOfWeek === 1) {
    payloads.push({ frequency: 'weekly', hour, dayOfWeek });
  }

  for (const data of payloads) {
    void triggerEmpireOsEvent('time_based_check', data as Record<string, unknown>, null);
  }

  return NextResponse.json({
    ok: true,
    dispatched: payloads.length,
    payloads,
  });
}

export async function GET() {
  return NextResponse.json({
    message: 'Empire OS cron — POST with Authorization: Bearer CRON_SECRET',
  });
}
