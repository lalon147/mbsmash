-- ============================================================
-- 018 — vehicle_cost_summary reads as the caller, not as its owner
--
-- A Postgres view runs against its underlying tables with the permissions of
-- whoever *created* it, not whoever queries it. This one was created by
-- `postgres`, so any role allowed to select from the view read vehicles and
-- orders with the owner's rights — around any grant or row-level policy on the
-- tables themselves. That is what the Supabase linter means by "Security
-- Definer View", and it makes the view a way back into data the tables have
-- been locked down.
--
-- `security_invoker` (Postgres 15+; this server is 17.6) flips it: the view
-- resolves with the querying role's own permissions, so revoking a grant on
-- `vehicles` actually revokes it here too. Nothing about the results changes
-- for a caller who was entitled to the rows anyway.
--
-- Worth knowing: the app never queries this view — it is a convenience left
-- over from the original schema, and every figure in it is computed in the
-- dashboard's own SQL. It is kept because it is useful by hand in the SQL
-- editor, and fixed rather than dropped for the same reason.
--
-- This does NOT close the separate, larger hole found in the same review: the
-- `anon` and `authenticated` roles still hold full read/write on every table in
-- `public`, so there is currently nothing for this to protect. Revoking those
-- grants is the fix that matters, and this one is what stops the view being a
-- back door once they are gone.
-- ============================================================

BEGIN;

alter view public.vehicle_cost_summary set (security_invoker = on);

-- Fail loudly rather than reporting success on a view that never got the
-- option — a silent no-op here would leave the linter finding open.
--
-- reloptions holds whatever spelling the ALTER used: Postgres accepts on, true,
-- 1 and yes and stores the literal text, so match the value rather than testing
-- the array for one exact string.
do $$
begin
  if not exists (
    select 1
      from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
      cross join lateral unnest(coalesce(c.reloptions, '{}')) as opt
     where n.nspname = 'public'
       and c.relname = 'vehicle_cost_summary'
       and opt ~* '^security_invoker=(on|true|1|yes)$'
  ) then
    raise exception 'security_invoker was not set on public.vehicle_cost_summary';
  end if;
end $$;

COMMIT;
