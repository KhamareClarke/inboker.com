import type { InbokerEvent } from './types';
import { empireOsAdmin } from './supabase-admin';

export type EmpireOsLogInput = {
  event_type: InbokerEvent;
  business_id: string | null;
  payload: Record<string, unknown>;
  skill_ids?: number[];
  outbound_ok: boolean;
  outbound_status: number | null;
  outbound_error: string | null;
};

export async function logEmpireOsEvent(input: EmpireOsLogInput): Promise<void> {
  const supabase = empireOsAdmin();
  if (!supabase) {
    console.warn('[empire-os] skip log: no service role');
    return;
  }
  const { error } = await (supabase as any).from('empire_os_events').insert({
    business_id: input.business_id,
    event_type: input.event_type,
    payload: input.payload,
    skill_ids: input.skill_ids ?? [],
    outbound_ok: input.outbound_ok,
    outbound_status: input.outbound_status,
    outbound_error: input.outbound_error,
  });
  if (error) {
    console.warn('[empire-os] log insert failed', error.message);
  }
}
