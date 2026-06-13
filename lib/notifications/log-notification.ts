import { createClient } from '@supabase/supabase-js';
import { normalizeSupabaseUrl } from '@/lib/supabase-env';
import type { Database, Json } from '@/lib/supabase';
import type { NotificationChannel, NotificationType } from './types';

function adminClient() {
  const url =
    normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL) ??
    process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) return null;
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function logNotification(params: {
  type: NotificationType;
  userId?: string | null;
  email?: string | null;
  phone?: string | null;
  channels: NotificationChannel[];
  status: 'sent' | 'failed' | 'partial';
  errorMessage?: string | null;
  metadata?: Json;
}): Promise<void> {
  const supabase = adminClient();
  if (!supabase) return;

  const row = {
    type: params.type,
    user_id: params.userId ?? null,
    email: params.email ?? null,
    phone: params.phone ?? null,
    channels: params.channels,
    status: params.status,
    error_message: params.errorMessage ?? null,
    metadata: (params.metadata ?? {}) as Json,
  };

  const { error } = await (supabase as any).from('notification_logs').insert(row);

  if (error) {
    console.warn('[notifications] log insert skipped:', error.message);
  }
}
