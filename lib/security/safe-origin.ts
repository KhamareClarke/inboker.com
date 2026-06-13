import { NextRequest, NextResponse } from 'next/server';

function allowedHostnames(): Set<string> {
  const hosts = new Set<string>(['inboker.com', 'www.inboker.com']);
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (raw) {
    try {
      hosts.add(new URL(raw).hostname);
    } catch {
      /* ignore */
    }
  }
  if (process.env.NODE_ENV !== 'production') {
    hosts.add('localhost');
    hosts.add('127.0.0.1');
    hosts.add('::1');
  }
  return hosts;
}

function hostnameFromUrl(value: string): string | null {
  try {
    return new URL(value).hostname;
  } catch {
    return null;
  }
}

/**
 * Mitigates CSRF on cookie-backed mutating requests from browsers by requiring
 * Origin or Referer to match this deployment when present.
 *
 * When both headers are absent (CLI, mobile, some proxies), behaviour depends on
 * REQUIRE_BROWSER_ORIGIN: if "true", reject; otherwise allow (still use rate limits).
 */
export function assertSameSiteMutation(request: NextRequest): NextResponse | null {
  const method = request.method.toUpperCase();
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    return null;
  }

  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  if (!origin && !referer) {
    if (process.env.REQUIRE_BROWSER_ORIGIN === 'true') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return null;
  }

  const url = origin || referer!;
  const host = hostnameFromUrl(url);
  if (!host) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const allowed = allowedHostnames();
  if (!allowed.has(host)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return null;
}
