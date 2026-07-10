// Web Crypto HMAC — works in both Edge (middleware) and Node.js (API routes).
//
// The token is `payload.signature`, where payload is the signed-in user as
// base64url JSON. Reading it is what lets every write be attributed, so the
// signature is checked before the payload is ever parsed.
//
// The old token was a signed constant with no user in it. Those cookies no
// longer verify, so everyone is sent back to the login page once.

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function secret() {
  return encoder.encode(process.env.AUTH_SECRET || 'dev-secret-change-me-in-production');
}

async function getKey(usage) {
  return crypto.subtle.importKey('raw', secret(), { name: 'HMAC', hash: 'SHA-256' }, false, [usage]);
}

function toBase64Url(bytes) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(str) {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  return Uint8Array.from(atob(padded), c => c.charCodeAt(0));
}

export async function createAuthToken(user) {
  const payload = toBase64Url(encoder.encode(JSON.stringify({
    id: user.id,
    username: user.username,
    name: user.display_name,
  })));
  const key = await getKey('sign');
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  return `${payload}.${toBase64Url(new Uint8Array(sig))}`;
}

// Returns the user `{ id, username, name }`, or null if the token is missing,
// malformed, or not signed by us.
export async function verifyAuthToken(token) {
  if (!token) return null;
  const dot = token.lastIndexOf('.');
  if (dot === -1) return null;

  const payload = token.slice(0, dot);
  const signature = token.slice(dot + 1);

  try {
    const key = await getKey('verify');
    const valid = await crypto.subtle.verify(
      'HMAC', key, fromBase64Url(signature), encoder.encode(payload),
    );
    if (!valid) return null;

    const user = JSON.parse(decoder.decode(fromBase64Url(payload)));
    return user && user.id && user.username ? user : null;
  } catch {
    return null;
  }
}
