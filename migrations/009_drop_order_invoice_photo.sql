-- ============================================================
-- 009 — Drop the per-order invoice photo column
--
-- DESTRUCTIVE, and IRREVERSIBLE. Run this only after:
--   1. 008_vehicle_invoices.sql has been applied, and
--   2. the build that no longer reads orders.invoice_photo is live, and
--   3. the migrated invoices have been eyeballed in the app.
--
-- Everything below runs in one transaction on purpose. psql does NOT stop on
-- error by default, so a bare `raise exception` guard would print its warning
-- and then let the ALTER TABLE run anyway. Inside a transaction the raise
-- aborts it, the ALTER never commits, and the photos survive.
-- ============================================================

begin;

do $$
declare
    stranded int;
begin
    select count(*) into stranded
    from orders o
    where o.invoice_photo is not null
      and not exists (
          select 1 from vehicle_invoices vi where vi.source_order_id = o.id
      );

    if stranded > 0 then
        raise exception
            'Refusing to drop orders.invoice_photo: % photo(s) not migrated. Run 008 first.', stranded;
    end if;
end $$;

alter table orders drop column if exists invoice_photo;

commit;
