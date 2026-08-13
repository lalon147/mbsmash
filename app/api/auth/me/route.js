import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSessionUser, unauthorized } from '@/lib/session';

// The app calls this on load, which makes it the place to check the things the
// token can't answer on its own. Middleware verifies the signature and the
// expiry on every request — that runs on the Edge and has no database — so the
// two checks that need a row live here instead:
//
//   * token_version: bumping users.token_version invalidates every session that
//     user has, which is how someone gets signed out of a phone nobody can lay
//     hands on.
//   * active: a deactivated account used to keep working until its token aged
//     out, because `active` was only ever read at login.
//
// Both take effect the next time the app is opened rather than instantly. For a
// three-person shop that is the right trade — the alternative is a database
// read on every single request to every route.
export async function GET(request) {
  const user = await getSessionUser(request);
  if (!user) return unauthorized();

  try {
    const { rows: [row] } = await pool.query(
      `SELECT display_name, token_version FROM users WHERE id = $1 AND active = true`,
      [user.id],
    );

    if (!row || row.token_version !== (user.v ?? 0)) {
      const response = unauthorized();
      response.cookies.delete('auth_token');
      return response;
    }

    return NextResponse.json({ username: user.username, name: row.display_name });
  } catch (err) {
    // The session is cryptographically valid; only the revocation check failed.
    // Signing the shop out because a query errored would be the wrong call.
    console.error('GET /api/auth/me revocation check failed:', err);
    return NextResponse.json({ username: user.username, name: user.name });
  }
}
