-- ============================================================
-- 019 — Slow down password guessing, and make a session revocable
--
-- Two findings from the 2026-08-12 security review, both about the login:
--
--   * Nothing limited how fast someone could guess. Six wrong passwords in a
--     row came back as six plain 401s — no delay, no lockout — so the three
--     usernames could be attacked at whatever rate the network allowed.
--
--   * A session token, once issued, was good forever. It carried no expiry, and
--     nothing recorded anywhere could stop one working. Changing somebody's
--     password or setting active = false did nothing to a cookie already on a
--     phone, because `active` is only ever read at login.
--
-- `login_attempts` is the record the throttle counts. Only failures are kept —
-- a success clears the username's run, so normal use never accumulates rows and
-- a staff member who mistypes twice then gets in is not one attempt closer to a
-- lockout. Rows are pruned after a day, on write, so the table stays small
-- without a scheduled job.
--
-- `users.token_version` is the revocation switch. It is stamped into the token
-- at login and checked when the app loads; bumping it invalidates every session
-- that user currently has. Existing rows start at 0 and every token issued from
-- now on carries a version, so nobody is logged out by this migration itself.
-- (The tokens issued *before* this change are a separate matter: they have no
-- expiry field, so the new verifier rejects them and all three staff sign in
-- once more. That is the point of the change.)
-- ============================================================

BEGIN;

alter table users add column if not exists token_version integer not null default 0;

comment on column users.token_version is
  'Bump to sign this user out everywhere. Stamped into the session token at '
  'login and checked by /api/auth/me; a token carrying an older version is dead.';

create table if not exists login_attempts (
  id           bigserial primary key,
  username     text        not null,
  ip           text,
  attempted_at timestamptz not null default now()
);

comment on table login_attempts is
  'Failed logins only, for rate limiting. A successful login deletes the '
  'username''s rows. Pruned to 1 day on write.';

-- The throttle asks two questions on every login — "how many failures for this
-- username lately" and "how many from this IP lately" — so each gets an index
-- ordered the way it is read.
create index if not exists login_attempts_username_idx
  on login_attempts (username, attempted_at desc);

create index if not exists login_attempts_ip_idx
  on login_attempts (ip, attempted_at desc);

COMMIT;
