// Web Crypto HMAC — works in both Edge (middleware) and Node.js (API routes).
//
// The token is `payload.signature`, where payload is the signed-in user as
// base64url JSON. Reading it is what lets every write be attributed, so the
// signature is checked before the payload is ever parsed.
//
// The payload carries, besides the user:
//
//   exp  when the token stops being accepted. Without it a token was good
//        forever: the 30 days lived only in the cookie's maxAge, which is a
//        hint to the browser and nothing at all to a copied token.
//   v    the user's token_version at the time of issue. Bumping that column
//        makes every token already issued to them fail the check in
//        /api/auth/me — the only way there is to sign somebody out of a phone
//        you don't have in your hand.
//
// Tokens issued before both fields existed have no `exp` and are rejected, so
// everyone signs in once after this ships.

const encoder = new TextEncoder();
const decoder = new TextDecoder();

// Matches the cookie's maxAge in the login route. Kept at 30 days because this
// is a phone app on a shop floor: a shorter session would mean signing in
// mid-job, and the revocation switch above is the answer to a lost phone.
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;

function secret() {
  const value = process.env.AUTH_SECRET;
  // Fail closed, and loudly. This used to fall back to a hardcoded development
  // string, which meant an environment missing the variable would happily sign
  // and accept tokens with a key printed in the git history — anyone could mint
  // a session for any user, and nothing anywhere would look wrong.
  if (!value) {
    throw new Error(
      'AUTH_SECRET is not set. Refusing to sign or verify sessions with a ' +
      'default key — set it to a long random string in the environment.',
    );
  }
  return encoder.encode(value);
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
  const now = Math.floor(Date.now() / 1000);
  const payload = toBase64Url(encoder.encode(JSON.stringify({
    id: user.id,
    username: user.username,
    name: user.display_name,
    v: user.token_version ?? 0,
    iat: now,
    exp: now + SESSION_TTL_SECONDS,
  })));
  const key = await getKey('sign');
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  return `${payload}.${toBase64Url(new Uint8Array(sig))}`;
}

// Returns the user `{ id, username, name, v, iat, exp }`, or null if the token
// is missing, malformed, expired, or not signed by us.
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
    if (!user || !user.id || !user.username) return null;

    // A token with no expiry is one of the old unlimited ones. Treat a missing
    // `exp` as expired rather than as "never expires", so the change can't be
    // undone by replaying a cookie from before it.
    if (typeof user.exp !== 'number') return null;
    if (Math.floor(Date.now() / 1000) >= user.exp) return null;

    return user;
  } catch {
    return null;
  }
}
