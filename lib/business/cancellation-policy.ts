export type CancellationPolicy = {
  /** Hours before start_time that cancellation is free (default 24). */
  freeCancelHoursBefore: number;
  /** Fee charged if cancelled inside the free window (pence). */
  lateCancelFeePence: number;
};

const DEFAULT_POLICY: CancellationPolicy = {
  freeCancelHoursBefore: 24,
  lateCancelFeePence: 0,
};

export function parseCancellationPolicy(customSettings: unknown): CancellationPolicy {
  if (!customSettings || typeof customSettings !== 'object' || Array.isArray(customSettings)) {
    return DEFAULT_POLICY;
  }
  const cs = customSettings as Record<string, unknown>;
  const raw = cs.cancellationPolicy;
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return DEFAULT_POLICY;
  }
  const p = raw as Record<string, unknown>;
  const hours = Number(p.freeCancelHoursBefore);
  const fee = Number(p.lateCancelFeePence);
  return {
    freeCancelHoursBefore: Number.isFinite(hours) && hours >= 0 ? hours : DEFAULT_POLICY.freeCancelHoursBefore,
    lateCancelFeePence: Number.isFinite(fee) && fee >= 0 ? Math.round(fee) : DEFAULT_POLICY.lateCancelFeePence,
  };
}

/** Milliseconds from now until start; negative if already started. */
export function hoursUntilStart(startIso: string): number {
  const start = new Date(startIso).getTime();
  return (start - Date.now()) / (1000 * 60 * 60);
}

export function cancellationFeeIfApplicable(
  startIso: string,
  policy: CancellationPolicy
): { feePence: number; insideWindow: boolean; hoursUntil: number } {
  const hoursUntil = hoursUntilStart(startIso);
  const insideWindow = hoursUntil < policy.freeCancelHoursBefore;
  const feePence = insideWindow && policy.lateCancelFeePence > 0 ? policy.lateCancelFeePence : 0;
  return { feePence, insideWindow, hoursUntil };
}

export function formatCancellationHint(
  startIso: string,
  policy: CancellationPolicy,
  currencySymbol = '£'
): string {
  const { feePence, insideWindow, hoursUntil } = cancellationFeeIfApplicable(startIso, policy);
  const fee = (feePence / 100).toFixed(2);
  if (policy.lateCancelFeePence <= 0) {
    return `Free cancellation is allowed up to ${policy.freeCancelHoursBefore}h before your appointment.`;
  }
  if (insideWindow && hoursUntil > 0) {
    return `Your appointment is within ${policy.freeCancelHoursBefore}h. A fee of ${currencySymbol}${fee} may apply per the business policy (collection not automated yet).`;
  }
  if (hoursUntil <= 0) {
    return 'This appointment time has passed or is underway.';
  }
  return `You can still cancel for free — more than ${policy.freeCancelHoursBefore}h before start. After that, a ${currencySymbol}${fee} fee may apply.`;
}
