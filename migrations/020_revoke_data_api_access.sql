-- ============================================================
-- 020 — Take the public API's access away, rather than relying on RLS alone
--
-- The 2026-08-12 review found Supabase's Data API serving this whole database
-- to the public `anon` role: RLS off on all 16 tables and full
-- SELECT/INSERT/UPDATE/DELETE/TRUNCATE on every one. Anyone holding the
-- project's anon key — a key Supabase designs to be public — could read the
-- customer list and the password hashes, or delete the lot, without ever
-- touching the login page.
--
-- Enabling RLS on 2026-08-13 closed it: with row level security on and no
-- policies, those roles match no rows at all. But that protection is one
-- permissive policy away from being undone, and the Supabase dashboard offers
-- to add exactly such a policy in a couple of clicks. The grants themselves are
-- still sitting there underneath.
--
-- So take the grants away too. Then a policy added by accident grants access to
-- nothing, because there is no table privilege left for it to sit on top of.
--
-- This cannot affect the app. It connects as `postgres` — the owner of every
-- one of these tables, with rolbypassrls — over DATABASE_URL, and has never
-- used PostgREST or supabase-js for anything. `anon` and `authenticated` exist
-- here only because every Supabase project has them.
--
-- If Supabase Auth is ever adopted for something, these grants come back
-- deliberately, table by table, alongside the policies that constrain them.
--
-- The two functions revoked at the end are the companion to the RLS change:
-- rls_auto_enable() is an event trigger that switches RLS on for any new table,
-- and Supabase lints it as callable by anon over /rest/v1/rpc. It isn't really
-- callable — PostgREST cannot serialise an event_trigger return and answers 400
-- — but a SECURITY DEFINER function owned by postgres should not be offered to
-- the public API regardless.
-- ============================================================

BEGIN;

revoke all on all tables    in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;
revoke all on all functions in schema public from anon, authenticated;
revoke usage on schema public from anon, authenticated;

-- Without this, the next table created by postgres would hand `anon` the same
-- access all over again — Supabase's stock default privileges grant it.
alter default privileges in schema public
  revoke all on tables from anon, authenticated;
alter default privileges in schema public
  revoke all on sequences from anon, authenticated;
alter default privileges in schema public
  revoke all on functions from anon, authenticated;

-- Prove it rather than assume it: fail the migration if either role can still
-- reach the two tables that matter most.
do $$
declare leaked text;
begin
  select string_agg(format('%s on %s', role_name, tbl), ', ')
    into leaked
    from (
      select r.rolname as role_name, c.relname as tbl
        from pg_class c
        join pg_namespace n on n.oid = c.relnamespace
        cross join (select rolname from pg_roles where rolname in ('anon','authenticated')) r
       where n.nspname = 'public'
         and c.relkind = 'r'
         and c.relname in ('users','vehicles','orders','change_log')
         and has_table_privilege(r.rolname, c.oid, 'SELECT, INSERT, UPDATE, DELETE')
    ) still_readable;

  if leaked is not null then
    raise exception 'Data API access not fully revoked: %', leaked;
  end if;
end $$;

COMMIT;
