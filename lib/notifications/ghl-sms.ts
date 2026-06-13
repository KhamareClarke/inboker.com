/**
 * Go High Level (LeadConnector) outbound SMS.
 * Env: GHL_API_KEY, GHL_LOCATION_ID (sub-account location).
 * https://marketplace.gohighlevel.com/docs/ghl/conversations/send-a-new-message
 *
 * Creates a minimal contact, then sends an SMS. Fails soft if env or API errors.
 */
const BASE = 'https://services.leadconnectorhq.com';

function normalizePhone(raw: string): string {
  const t = raw.trim().replace(/[\s()-]/g, '');
  return t.startsWith('+') ? t : t;
}

export async function sendGhlSms(to: string, message: string): Promise<boolean> {
  const apiKey = process.env.GHL_API_KEY?.trim();
  const locationId = process.env.GHL_LOCATION_ID?.trim();
  if (!apiKey || !locationId || !to?.trim()) {
    return false;
  }

  const phone = normalizePhone(to);
  if (phone.length < 8) return false;

  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
    Version: '2021-07-28',
    'Content-Type': 'application/json',
  };

  try {
    const contactRes = await fetch(`${BASE}/contacts/`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        locationId,
        phone,
        firstName: 'Inboker',
        lastName: 'Customer',
      }),
    });

    const contactJson = (await contactRes.json().catch(() => ({}))) as {
      contact?: { id?: string };
      id?: string;
      meta?: { contactId?: string };
    };

    let contactId: string | null =
      contactJson.contact?.id ?? contactJson.id ?? null;

    /** Location may reject duplicate phone but return existing `meta.contactId`. */
    if (!contactId && contactJson.meta?.contactId) {
      contactId = contactJson.meta.contactId;
    }

    if (!contactId) {
      console.error('[ghl-sms] create contact failed', contactRes.status, contactJson);
      return false;
    }

    const msgRes = await fetch(`${BASE}/conversations/messages`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        type: 'SMS',
        locationId,
        contactId,
        message: message.slice(0, 1600),
      }),
    });

    if (!msgRes.ok) {
      const errBody = await msgRes.text().catch(() => '');
      console.error('[ghl-sms] send message failed', msgRes.status, errBody);
      return false;
    }

    return true;
  } catch (e) {
    console.error('[ghl-sms]', e);
    return false;
  }
}
