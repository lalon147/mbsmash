-- ============================================================
-- 021 — Stop offering rls_auto_enable() to the public API
--
-- Migration 020 revoked everything in `public` from anon and authenticated, but
-- the Supabase linter still reported this function as callable by both. The
-- reason is that Postgres grants EXECUTE on every new function to the pseudo-
-- role PUBLIC by default, and anon inherits it — the ACL read
--
--     {=X/postgres, postgres=X/postgres, service_role=X/postgres}
--
-- where the leading `=X` is that grant to PUBLIC. Revoking from anon by name
-- never touched it.
--
-- The exposure is theoretical: rls_auto_enable() returns event_trigger, which
-- PostgREST cannot serialise, so calling /rest/v1/rpc/rls_auto_enable answers
-- 400 rather than doing anything. But it is a SECURITY DEFINER function owned
-- by postgres, and those should not be on offer to an anonymous caller whether
-- or not today's plumbing happens to refuse the call.
--
-- This does not stop the event trigger firing. An event trigger runs as its
-- owner, which still holds EXECUTE; the grant being removed is only the one
-- that lets somebody else call the function directly.
-- ============================================================

BEGIN;

revoke all on function public.rls_auto_enable() from public, anon, authenticated;

do $$
begin
  if has_function_privilege('anon', 'public.rls_auto_enable()', 'EXECUTE')
     or has_function_privilege('authenticated', 'public.rls_auto_enable()', 'EXECUTE') then
    raise exception 'rls_auto_enable() is still executable by the public API roles';
  end if;
end $$;

COMMIT;
