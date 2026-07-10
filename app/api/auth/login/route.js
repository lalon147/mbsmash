import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { createAuthToken } from '@/lib/auth';
import { verifyPassword } from '@/lib/password.mjs';

// One message for "no such user" and "wrong password" alike — telling them
// apart would confirm which usernames exist.
const INVALID = 'Incorrect username or password.';

export async function POST(request) {
  try {
    const { username, password } = await request.json();
    if (!username?.trim() || !password) {
      return NextResponse.json({ error: INVALID }, { status: 401 });
    }

    const { rows } = await pool.query(
      `SELECT id, username, display_name, password_hash
       FROM users WHERE username = $1 AND active = true`,
      [username.trim().toLowerCase()],
    );

    const user = rows[0];
    if (!user || !verifyPassword(password, user.password_hash)) {
      return NextResponse.json({ error: INVALID }, { status: 401 });
    }

    const token = await createAuthToken(user);
    const response = NextResponse.json({
      ok: true,
      user: { username: user.username, name: user.display_name },
    });
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });
    return response;
  } catch (err) {
    console.error('POST /api/auth/login failed:', err);
    return NextResponse.json({ error: 'Could not sign in. Please try again.' }, { status: 500 });
  }
}
