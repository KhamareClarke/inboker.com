import type { NextRequest } from 'next/server';
import { getServiceRoleClient } from '@/lib/supabase-service-role';

export async function writeAuditLog(params: {
  request?: NextRequest;
  actorUserId?: string | null;
  action: string;
  resourceType?: string | null;
  resourceId?: string | null;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  const admin = getServiceRoleClient();
  if (!admin) return;

  const ip =
    params.request?.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    params.request?.headers.get('x-real-ip')?.trim() ??
    null;
  const ua = params.request?.headers.get('user-agent')?.slice(0, 500) ?? null;

  const row = {
    actor_user_id: params.actorUserId ?? null,
    actor_ip: ip,
    user_agent: ua,
    action: params.action,
    resource_type: params.resourceType ?? null,
    resource_id: params.resourceId ?? null,
    metadata: params.metadata ?? {},
  };

  try {
    await (admin as any).from('audit_logs').insert(row);
  } catch (e) {
    console.warn('[audit-log] insert failed:', e);
  }
}
