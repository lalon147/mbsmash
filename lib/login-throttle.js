import pool from '@/lib/db';

// Rate limiting for the login, counted in Postgres rather than in memory.
//
// In-process counters are worthless here: the app runs as serverless functions,
// so consecutive guesses can land on different instances that each think they
// are seeing the first attempt. The database is the only thing all of them
// share.
//
// Two limits, because they fail differently. The per-username one is what stops
// a password being guessed; the per-IP one is what stops the three usernames
// being worked through in parallel from one place.

const WINDOW_MINUTES   = 15;
const MAX_PER_USERNAME = 10;
const MAX_PER_IP       = 20;

// Old rows are pruned on write rather than by a scheduled job. A day is far
// longer than the window needs, and keeps a little history to look at after
// something suspicious.
const KEEP_HOURS = 24;

/**
 * The caller's address, as Vercel reports it. `x-forwarded-for` is a list when
 * the request passed through more than one proxy, and the first entry is the
 * client. Null when there is no header at all — a local request, say — which
 * simply means the per-IP limit doesn't apply to it.
 */
export function clientIp(request) {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim() || null;
  return request.headers.get('x-real-ip') || null;
}

/**
 * Whether this login should be refused before the password is even checked.
 * Returns `{ blocked, retryAfterSeconds }`.
 *
 * On a database error this reports "not blocked". That is a deliberate trade:
 * refusing every login because the throttle's own query failed would take the
 * shop offline, and the same database is about to be asked for the user row
 * anyway — so a failure here is a bug to fix, not an outage to cause.
 */
export async function checkLoginThrottle(username, ip) {
  try {
    const { rows: [counts] } = await pool.query(
      `SELECT
         count(*) FILTER (WHERE username = $1)              AS by_username,
         count(*) FILTER (WHERE ip = $2 AND $2 IS NOT NULL) AS by_ip,
         max(attempted_at)                                  AS latest
       FROM login_attempts
       WHERE attempted_at > now() - ($3 || ' minutes')::interval
         AND (username = $1 OR (ip = $2 AND $2 IS NOT NULL))`,
      [username, ip, String(WINDOW_MINUTES)],
    );

    const blocked =
      Number(counts.by_username) >= MAX_PER_USERNAME ||
      Number(counts.by_ip) >= MAX_PER_IP;

    if (!blocked) return { blocked: false, retryAfterSeconds: 0 };

    // The lockout runs from the most recent attempt, so guessing again while
    // blocked extends it rather than sitting out a fixed sentence.
    const since = counts.latest ? (Date.now() - new Date(counts.latest).getTime()) / 1000 : 0;
    const retryAfterSeconds = Math.max(1, Math.ceil(WINDOW_MINUTES * 60 - since));
    return { blocked: true, retryAfterSeconds };
  } catch (err) {
    console.error('Login throttle check failed (allowing the attempt):', err);
    return { blocked: false, retryAfterSeconds: 0 };
  }
}

/** Record a failed attempt, and prune anything older than KEEP_HOURS. */
export async function recordLoginFailure(username, ip) {
  try {
    await pool.query(
      `INSERT INTO login_attempts (username, ip) VALUES ($1, $2)`,
      [username, ip],
    );
    await pool.query(
      `DELETE FROM login_attempts WHERE attempted_at < now() - ($1 || ' hours')::interval`,
      [String(KEEP_HOURS)],
    );
  } catch (err) {
    console.error('Could not record a failed login:', err);
  }
}

/**
 * Wipe a username's failures after they get in. Someone who mistypes twice and
 * then signs in correctly should not be two attempts closer to a lockout for
 * the next quarter of an hour.
 */
export async function clearLoginFailures(username) {
  try {
    await pool.query(`DELETE FROM login_attempts WHERE username = $1`, [username]);
  } catch (err) {
    console.error('Could not clear failed logins:', err);
  }
}
