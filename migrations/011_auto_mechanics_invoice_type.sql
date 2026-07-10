-- ============================================================
-- 011 — 'Auto Mechanics' invoice type
--
-- Types are also addable from the UI, but the ones the shop always uses are
-- seeded here so a fresh database comes up with the same list as production.
--
-- sort_order is read off the current maximum rather than hardcoded to 4: a type
-- added through the UI before this migration runs would otherwise collide with
-- it and the two would order arbitrarily.
-- ============================================================

begin;

insert into invoice_types (name, sort_order)
values ('Auto Mechanics', (select coalesce(max(sort_order), 0) + 1 from invoice_types))
on conflict (name) do update set active = true;

commit;
