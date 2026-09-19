import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { createAuthToken } from '@/lib/auth';

// Portfolio visitors land here and are signed straight in as the demo user,
// so they can click around without being handed a password.
//
// Off unless DEMO_USERNAME names an account — an environment without it (a
// preview, a fresh checkout) answers 404 rather than signing anybody in. The
// session is deliberately short: a demo cookie that lived the full 30 days
// would be a long-lived key to the shop's data sitting in strangers' browsers.
const DEMO_SESSION_TTL_SECONDS = 60 * 60 * 2;

export async function GET(request) {
  const username = process.env.DEMO_USERNAME?.trim().toLowerCase();
  if (!username) {
    return new NextResponse('Not found', { status: 404 });
  }

  try {
    const { rows } = await pool.query(
      `SELECT id, username, display_name, token_version
       FROM users WHERE username = $1 AND active = true`,
      [username],
    );
    const user = rows[0];
    if (!user) {
      console.error(`GET /demo: DEMO_USERNAME "${username}" is not an active user`);
      return new NextResponse('Demo is not available right now.', { status: 503 });
    }

    const token = await createAuthToken(user, DEMO_SESSION_TTL_SECONDS);
    const response = NextResponse.redirect(new URL('/', request.url));
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: DEMO_SESSION_TTL_SECONDS,
      path: '/',
    });
    return response;
  } catch (err) {
    console.error('GET /demo failed:', err);
    return new NextResponse('Demo is not available right now.', { status: 500 });
  }
}
