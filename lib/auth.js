// Web Crypto HMAC — works in both Edge (middleware) and Node.js (API routes)
const TOKEN_VALUE = 'mbsmash-auth';

function secret() {
  return new TextEncoder().encode(process.env.AUTH_SECRET || 'dev-secret-change-me-in-production');
}

async function getKey(usage) {
  return crypto.subtle.importKey('raw', secret(), { name: 'HMAC', hash: 'SHA-256' }, false, [usage]);
}

export async function createAuthToken() {
  const key = await getKey('sign');
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(TOKEN_VALUE));
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig)));
  return `${TOKEN_VALUE}.${sigB64}`;
}

export async function verifyAuthToken(token) {
  if (!token) return false;
  const dot = token.lastIndexOf('.');
  if (dot === -1) return false;
  const value = token.slice(0, dot);
  const sigB64 = token.slice(dot + 1);
  if (value !== TOKEN_VALUE) return false;
  try {
    const key = await getKey('verify');
    const sig = Uint8Array.from(atob(sigB64), c => c.charCodeAt(0));
    return crypto.subtle.verify('HMAC', key, sig, new TextEncoder().encode(value));
  } catch {
    return false;
  }
}
