/**
 * Simple in-process sliding-window rate limiter for API routes.
 * For multi-instance production traffic, prefer Upstash Redis or an edge limiter.
 */

type Bucket = { count: number; resetAt: number };

const store = new Map<string, Bucket>();

const MAX_KEYS = 20_000;

function prune(now: number) {
  if (store.size <= MAX_KEYS) return;
  for (const [k, v] of Array.from(store.entries())) {
    if (now > v.resetAt) store.delete(k);
    if (store.size <= MAX_KEYS * 0.7) break;
  }
}

/** @returns true if request should be blocked (rate exceeded) */
export function rateLimitExceeded(
  key: string,
  max: number,
  windowMs: number
): boolean {
  const now = Date.now();
  prune(now);
  const b = store.get(key);
  if (!b || now > b.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }
  b.count += 1;
  return b.count > max;
}

export function clientIpFromRequest(request: Request): string {
  const fwd = request.headers.get('x-forwarded-for');
  if (fwd) {
    const first = fwd.split(',')[0]?.trim();
    if (first) return first;
  }
  return request.headers.get('x-real-ip')?.trim() || 'unknown';
}
