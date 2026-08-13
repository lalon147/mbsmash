import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { createAuthToken, SESSION_TTL_SECONDS } from '@/lib/auth';
import { verifyPassword } from '@/lib/password.mjs';
import {
  clientIp, checkLoginThrottle, recordLoginFailure, clearLoginFailures,
} from '@/lib/login-throttle';

// One message for "no such user" and "wrong password" alike — telling them
// apart would confirm which usernames exist.
const INVALID = 'Incorrect username or password.';

export async function POST(request) {
  try {
    const { username, password } = await request.json();
    if (!username?.trim() || !password) {
      return NextResponse.json({ error: INVALID }, { status: 401 });
    }

    const name = username.trim().toLowerCase();
    const ip = clientIp(request);

    // Checked before the password, so a locked-out caller can't keep burning
    // scrypt work — each verify is 16 MB of hashing, which is a denial of
    // service in its own right if an attacker can fire them off freely.
    const { blocked, retryAfterSeconds } = await checkLoginThrottle(name, ip);
    if (blocked) {
      const minutes = Math.ceil(retryAfterSeconds / 60);
      return NextResponse.json(
        { error: `Too many sign-in attempts. Try again in ${minutes} minute${minutes === 1 ? '' : 's'}.` },
        { status: 429, headers: { 'Retry-After': String(retryAfterSeconds) } },
      );
    }

    const { rows } = await pool.query(
      `SELECT id, username, display_name, password_hash, token_version
       FROM users WHERE username = $1 AND active = true`,
      [name],
    );

    const user = rows[0];
    if (!user || !verifyPassword(password, user.password_hash)) {
      await recordLoginFailure(name, ip);
      return NextResponse.json({ error: INVALID }, { status: 401 });
    }

    await clearLoginFailures(name);

    const token = await createAuthToken(user);
    const response = NextResponse.json({
      ok: true,
      user: { username: user.username, name: user.display_name },
    });
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      // Always on. Modern browsers accept Secure cookies over http://localhost,
      // so tying this to NODE_ENV only ever risked sending the session in clear
      // over a non-local HTTP deployment.
      secure: true,
      sameSite: 'lax',
      maxAge: SESSION_TTL_SECONDS,
      path: '/',
    });
    return response;
  } catch (err) {
    console.error('POST /api/auth/login failed:', err);
    return NextResponse.json({ error: 'Could not sign in. Please try again.' }, { status: 500 });
  }
}
