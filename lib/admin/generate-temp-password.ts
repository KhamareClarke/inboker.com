import { randomBytes } from 'crypto';

const ALPHABET =
  'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

/**
 * Cryptographically random password for admin-assisted recovery.
 * Length kept within common bcrypt limits (≤72).
 */
export function generateTemporaryPassword(length = 16): string {
  const n = Math.min(Math.max(length, 12), 64);
  const bytes = randomBytes(n);
  let out = '';
  for (let i = 0; i < n; i++) {
    out += ALPHABET[bytes[i]! % ALPHABET.length];
  }
  return out;
}
