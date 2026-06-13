/**
 * Browser and server Supabase clients expect the project API origin only,
 * e.g. https://abcdefghijk.supabase.co
 *
 * If NEXT_PUBLIC_SUPABASE_URL mistakenly includes /rest/v1, URL resolution
 * turns auth base into .../rest/auth/v1 and signup/auth requests fail.
 */
export function normalizeSupabaseUrl(url: string | undefined | null): string | undefined {
  if (!url?.trim()) return undefined;
  const trimmed = url.trim();
  try {
    const u = new URL(trimmed);
    return `${u.protocol}//${u.host}`;
  } catch {
    return trimmed;
  }
}
