import { NextRequest, NextResponse } from 'next/server';
import { assertSameSiteMutation } from '@/lib/security/safe-origin';
import { clientIpFromRequest, rateLimitExceeded } from '@/lib/security/rate-limit';

/** Rate limit + optional same-site check for unauthenticated / public POST endpoints. */
export function applyPublicMutationGuards(
  req: NextRequest,
  rateKey: string,
  max: number,
  windowMs: number
): NextResponse | null {
  const originBlock = assertSameSiteMutation(req);
  if (originBlock) return originBlock;
  const ip = clientIpFromRequest(req);
  if (rateLimitExceeded(`${rateKey}:${ip}`, max, windowMs)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }
  return null;
}

/** Rate limit only (e.g. GET export). */
export function applyRateLimit(
  req: NextRequest,
  rateKey: string,
  max: number,
  windowMs: number
): NextResponse | null {
  const ip = clientIpFromRequest(req);
  if (rateLimitExceeded(`${rateKey}:${ip}`, max, windowMs)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }
  return null;
}
