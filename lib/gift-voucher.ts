const ALPHANUM = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateGiftVoucherCode(length = 10): string {
  const bytes = new Uint8Array(length);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < length; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  let out = '';
  for (let i = 0; i < length; i++) {
    out += ALPHANUM[bytes[i]! % ALPHANUM.length];
  }
  return `INB-${out}`;
}
