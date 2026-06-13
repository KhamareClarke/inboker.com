import { logEmpireOsEvent } from './log-event';
import type { EmpireEventPayload, InbokerEvent } from './types';

const DEFAULT_WEBHOOK = process.env.EMPIRE_OS_WEBHOOK_URL ?? '';

/**
 * Sends a normalized event to Empire OS and persists a row in empire_os_events.
 * If EMPIRE_OS_SECRET is unset, skips HTTP but still logs locally (outbound_ok false).
 */
export async function triggerEmpireOsEvent(
  eventType: InbokerEvent,
  data: EmpireEventPayload,
  businessId: string | null
): Promise<{ ok: boolean; skipped?: boolean }> {
  const webhookUrl = (process.env.EMPIRE_OS_WEBHOOK_URL || DEFAULT_WEBHOOK).trim();
  const secret = process.env.EMPIRE_OS_SECRET?.trim();

  const envelope = {
    type: eventType,
    businessId: businessId ?? null,
    timestamp: new Date().toISOString(),
    data,
  };

  let outboundOk = false;
  let outboundStatus: number | null = null;
  let outboundError: string | null = null;

  if (!secret || !webhookUrl) {
    outboundError = !secret ? 'EMPIRE_OS_SECRET not configured' : 'EMPIRE_OS_WEBHOOK_URL not configured';
  } else {
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Empire-Secret': secret,
        },
        body: JSON.stringify(envelope),
      });
      outboundOk = response.ok;
      outboundStatus = response.status;
      if (!response.ok) {
        outboundError = (await response.text().catch(() => response.statusText)).slice(0, 2000);
      }
    } catch (e) {
      outboundError = e instanceof Error ? e.message : 'fetch failed';
    }
  }

  await logEmpireOsEvent({
    event_type: eventType,
    business_id: businessId,
    payload: envelope as Record<string, unknown>,
    outbound_ok: outboundOk,
    outbound_status: outboundStatus,
    outbound_error: outboundError,
  });

  return { ok: outboundOk, skipped: !secret };
}
