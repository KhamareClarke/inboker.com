/**
 * Origin for user-facing links in emails and SMS.
 * Never use localhost — misconfigured dev env should not leak into outbound messages.
 */
export function publicSiteOrigin(): string {
  const raw = (process.env.NEXT_PUBLIC_APP_URL || 'https://inboker.com').trim().replace(/\/$/, '');
  if (!raw || /localhost|127\.0\.0\.1/i.test(raw)) {
    return 'https://inboker.com';
  }
  if (!/^https?:\/\//i.test(raw)) {
    return 'https://inboker.com';
  }
  return raw;
}
