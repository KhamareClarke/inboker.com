/**
 * One-off: send test email (Gmail SMTP) + test SMS (GHL).
 * Usage: node scripts/send-test-notify.mjs <email> <e164-phone>
 * Loads D:\projects\inboker.com\.env.local if present (simple KEY=VAL parser).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

function loadEnvFiles() {
  const files = [
    { path: path.join(root, '.env'), override: false },
    { path: path.join(root, '.env.local'), override: true },
  ];
  for (const { path: envPath, override } of files) {
    if (!fs.existsSync(envPath)) continue;
    const text = fs.readFileSync(envPath, 'utf8');
    for (const line of text.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq <= 0) continue;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (!override && process.env[key] !== undefined) continue;
      process.env[key] = val;
    }
  }
}

loadEnvFiles();

const BASE = 'https://services.leadconnectorhq.com';

function normalizePhone(raw) {
  return raw.trim().replace(/[\s()-]/g, '');
}

async function sendGhlSms(to, message) {
  const apiKey = process.env.GHL_API_KEY?.trim();
  const locationId = process.env.GHL_LOCATION_ID?.trim();
  if (!apiKey || !locationId) {
    console.error('Missing GHL_API_KEY or GHL_LOCATION_ID');
    return false;
  }
  const phone = normalizePhone(to);
  const headers = {
    Authorization: `Bearer ${apiKey}`,
    Version: '2021-07-28',
    'Content-Type': 'application/json',
  };

  const contactRes = await fetch(`${BASE}/contacts/`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      locationId,
      phone,
      firstName: 'Inboker',
      lastName: 'Test',
    }),
  });
  const contactJson = await contactRes.json().catch(() => ({}));
  let contactId = contactJson.contact?.id ?? contactJson.id ?? null;
  if (!contactId && contactJson.meta?.contactId) {
    contactId = contactJson.meta.contactId;
  }
  if (!contactId) {
    console.error('[ghl] create contact', contactRes.status, contactJson);
    return false;
  }

  const msgRes = await fetch(`${BASE}/conversations/messages`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      type: 'SMS',
      locationId,
      contactId,
      message: String(message).slice(0, 1600),
    }),
  });
  if (!msgRes.ok) {
    console.error('[ghl] send', msgRes.status, await msgRes.text().catch(() => ''));
    return false;
  }
  return true;
}

async function main() {
  const emailTo = process.argv[2];
  const phoneTo = process.argv[3];
  if (!emailTo || !phoneTo) {
    console.error('Usage: node scripts/send-test-notify.mjs <email> <e164-phone>');
    process.exit(1);
  }

  const origin = 'https://inboker.com';
  const dashboardLink = `${origin}/dashboard`;

  let emailOk = false;
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('Missing EMAIL_USER or EMAIL_PASS');
  } else {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });
    const info = await transporter.sendMail({
      from: `"Inboker" <${process.env.EMAIL_USER}>`,
      to: emailTo,
      subject: 'Inboker — test email',
      html: `<p>This is a test email from Inboker.</p><p>Links in production emails use <a href="${origin}">${origin}</a> (never localhost).</p><p><a href="${dashboardLink}">Open dashboard</a></p>`,
      text: `Inboker test email. Dashboard: ${dashboardLink}`,
    });
    console.log('Email sent:', info.messageId);
    emailOk = true;
  }

  const smsBody = `Inboker test SMS. Manage bookings: ${origin}`;
  const smsOk = await sendGhlSms(phoneTo, smsBody);
  console.log('SMS result:', smsOk ? 'ok' : 'failed');

  process.exit(emailOk || smsOk ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
