-- ============================================================
-- 016 — Suppliers: fold "PT" into "Preston Toyota"
--
-- The same supplier is in the table twice, under the abbreviation used on the
-- day and under its full name. It is exactly the problem the schema comment
-- warned about ("PT / P.T. / pt") and the one migration 015 fixed for part
-- names, only here it splits 206 orders down the middle: 100 against PT and
-- 106 against Preston Toyota. Anything that counts orders per supplier — the
-- most-used-first ordering of the dealership list, a spend-per-supplier
-- question later — reads both halves as two smaller suppliers.
--
-- Preston Toyota survives, because the picker should read the way the shop
-- would say it out loud to someone who doesn't already know the abbreviation.
--
-- Orders keep their part, cost and dates untouched; only which supplier row
-- they point at changes. Nothing here deletes an order.
-- ============================================================

BEGIN;

-- Merging into a row that isn't there would blank the dealership on 100 orders
-- instead of moving them. Stop rather than do that.
do $$
begin
  if exists (select 1 from dealerships where name = 'PT')
     and not exists (select 1 from dealerships where name = 'Preston Toyota') then
    raise exception 'Preston Toyota is missing, so PT has nowhere to merge into.';
  end if;
end $$;

-- Both ids up front. A re-run finds no PT and every statement below no-ops,
-- so this migration is safe to apply twice.
create temp table pt_merge on commit drop as
  select (select id from dealerships where name = 'PT')             as from_id,
         (select id from dealerships where name = 'Preston Toyota') as to_id;

-- PT is the row with a phone number written on it in some future where someone
-- filled one in; don't lose it just because it's the row being retired.
update dealerships d
   set phone = coalesce(d.phone, pt.phone),
       email = coalesce(d.email, pt.email),
       notes = coalesce(d.notes, pt.notes)
  from pt_merge m
  join dealerships pt on pt.id = m.from_id
 where d.id = m.to_id;

update orders
   set dealership_id = (select to_id from pt_merge)
 where dealership_id = (select from_id from pt_merge);

update parts_catalog
   set default_dealership_id = (select to_id from pt_merge)
 where default_dealership_id = (select from_id from pt_merge);

update invoices
   set dealership_id = (select to_id from pt_merge)
 where dealership_id = (select from_id from pt_merge);

delete from dealerships
 where id = (select from_id from pt_merge)
   and id is not null;

-- Nothing should still point at the retired row.
do $$
declare stragglers int;
begin
  select count(*) into stragglers
    from orders o
    left join dealerships d on d.id = o.dealership_id
   where o.dealership_id is not null and d.id is null;
  if stragglers > 0 then
    raise exception '% orders point at a dealership that no longer exists.', stragglers;
  end if;
end $$;

COMMIT;

-- After: Preston Toyota carries all 206 orders and PT is gone.
--   select name, count(*) from orders o join dealerships d on d.id = o.dealership_id
--   group by name order by 2 desc;
