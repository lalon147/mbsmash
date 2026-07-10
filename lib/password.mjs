import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

// Node-only (scrypt has no Web Crypto equivalent), so this must never be
// imported from middleware.js — that runs on the Edge runtime.

const N = 16384;   // 128 * N * r = 16 MB of work per hash
const R = 8;
const P = 1;
const KEYLEN = 32;
const MAXMEM = 64 * 1024 * 1024;   // scrypt's 32 MB default is under our 16 MB + overhead

export function hashPassword(password) {
  const salt = randomBytes(16);
  const key = scryptSync(password, salt, KEYLEN, { N, r: R, p: P, maxmem: MAXMEM });
  return `scrypt$${N}$${R}$${P}$${salt.toString('base64')}$${key.toString('base64')}`;
}

export function verifyPassword(password, stored) {
  if (!password || !stored) return false;
  const parts = stored.split('$');
  if (parts.length !== 6 || parts[0] !== 'scrypt') return false;

  const [, n, r, p, saltB64, keyB64] = parts;
  const salt = Buffer.from(saltB64, 'base64');
  const key = Buffer.from(keyB64, 'base64');

  try {
    const candidate = scryptSync(password, salt, key.length, {
      N: Number(n), r: Number(r), p: Number(p), maxmem: MAXMEM,
    });
    return timingSafeEqual(key, candidate);
  } catch {
    return false;
  }
}

// Ambiguous characters (0/O, 1/l/I) are left out — these get read off a screen
// once and typed into a phone.
const ALPHABET = 'abcdefghijkmnpqrstuvwxyz23456789';

export function generatePassword(length = 12) {
  const bytes = randomBytes(length);
  let out = '';
  for (let i = 0; i < length; i++) {
    out += ALPHABET[bytes[i] % ALPHABET.length];
    if (i === 3 || i === 7) out += '-';
  }
  return out;
}
