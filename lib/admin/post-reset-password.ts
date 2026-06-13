import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Calls POST /api/admin/reset-password with cookie session and/or Bearer access token
 * so the route handler can authenticate admin flows that only have client-side sessions.
 */
export async function postAdminResetPassword(
  supabase: SupabaseClient,
  payload: { userId: string; newPassword?: string }
): Promise<Response> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (session?.access_token) {
    headers.Authorization = `Bearer ${session.access_token}`;
  }
  return fetch('/api/admin/reset-password', {
    method: 'POST',
    headers,
    credentials: 'include',
    body: JSON.stringify(payload),
  });
}
