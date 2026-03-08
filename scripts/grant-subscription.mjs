/**
 * One-off script to grant active subscription to a user by email.
 * Usage: node scripts/grant-subscription.mjs <email>
 * Example: node scripts/grant-subscription.mjs fizasaif0233@gmail.com
 *
 * Loads env from .env.local (or .env) if present. Requires:
 *   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

function loadEnv(path) {
  if (!existsSync(path)) return;
  const content = readFileSync(path, 'utf8');
  for (const line of content.split('\n')) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (m) {
      const key = m[1];
      let val = m[2].trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'")))
        val = val.slice(1, -1).replace(/\\n/g, '\n');
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

const root = resolve(process.cwd());
loadEnv(resolve(root, '.env.local'));
loadEnv(resolve(root, '.env'));

const email = process.argv[2]?.trim();
if (!email) {
  console.error('Usage: node scripts/grant-subscription.mjs <email>');
  console.error('Example: node scripts/grant-subscription.mjs fizasaif0233@gmail.com');
  process.exit(1);
}
const normalizedEmail = email.includes('@') ? email : `${email}@gmail.com`;

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local or .env');
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

async function main() {
  const { data: userRow, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('email', normalizedEmail.toLowerCase())
    .maybeSingle();

  if (userError) {
    console.error('Lookup error:', userError.message);
    process.exit(1);
  }
  if (!userRow?.id) {
    console.error(`No user found with email "${normalizedEmail}". They must sign up first.`);
    process.exit(1);
  }

  const now = new Date().toISOString();
  const periodEnd = new Date();
  periodEnd.setFullYear(periodEnd.getFullYear() + 1);

  const { error: subError } = await supabase
    .from('subscriptions')
    .upsert(
      {
        user_id: userRow.id,
        status: 'active',
        current_period_start: now,
        current_period_end: periodEnd.toISOString(),
        cancel_at_period_end: false,
        stripe_customer_id: null,
        stripe_subscription_id: null,
        stripe_price_id: null,
        trial_end: null,
      },
      { onConflict: 'user_id' }
    );

  if (subError) {
    console.error('Subscription upsert error:', subError.message);
    process.exit(1);
  }

  console.log('OK: Subscription granted for', normalizedEmail);
}

main();
