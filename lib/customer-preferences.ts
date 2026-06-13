import type { Json } from '@/lib/supabase';

/** Stored in `customer_booking_preferences.preferences` (JSONB). */
export type CustomerBookingPreferencesShape = {
  favoriteStaffId?: string | null;
  preferredTimes?: string[];
  serviceNotes?: string;
  allergies?: string[];
  specialRequests?: string;
};

export function parseCustomerPreferences(raw: Json | null | undefined): CustomerBookingPreferencesShape {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const o = raw as Record<string, unknown>;
  return {
    favoriteStaffId: typeof o.favoriteStaffId === 'string' ? o.favoriteStaffId : null,
    preferredTimes: Array.isArray(o.preferredTimes) ? o.preferredTimes.map(String) : [],
    serviceNotes: typeof o.serviceNotes === 'string' ? o.serviceNotes : undefined,
    allergies: Array.isArray(o.allergies) ? o.allergies.map(String) : [],
    specialRequests: typeof o.specialRequests === 'string' ? o.specialRequests : undefined,
  };
}

export function mergePreferenceNotes(prefs: CustomerBookingPreferencesShape): string {
  const parts: string[] = [];
  if (prefs.serviceNotes?.trim()) parts.push(prefs.serviceNotes.trim());
  if (prefs.allergies?.length) parts.push(`Allergies: ${prefs.allergies.join(', ')}`);
  if (prefs.specialRequests?.trim()) parts.push(`Requests: ${prefs.specialRequests.trim()}`);
  return parts.join('\n');
}
