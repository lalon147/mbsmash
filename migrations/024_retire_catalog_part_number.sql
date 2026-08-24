-- ============================================================
-- 024 — Retire the shop-wide part number and price
--
-- The second half of 023. parts_catalog held one part_number and one
-- typical_price per part name, which is the assumption that put a Camry front
-- bar number on a Haval Jolion. Both are now read from what the shop has
-- actually ordered for that make, model and year, so the number offered for a
-- Camry front bar comes from the last Camry front bar and from nothing else.
--
-- Nothing is lost. Every number is still on the order it was typed on — that
-- is where the app reads them from now — and typical_price was null on all
-- 266 rows, so it never filled anything in.
--
-- RUN THIS AFTER the new code is deployed: the old build still selects
-- p.part_number when searching the catalog, and would 500 on every search
-- between the drop and the deploy.
-- ============================================================

BEGIN;

-- Nothing should be about to lose a number that isn't already on an order.
do $$
declare orphan text;
begin
  if exists (
    select 1 from information_schema.columns
     where table_name = 'parts_catalog' and column_name = 'part_number'
  ) then
    execute $q$
      select string_agg(p.part_name || ' (' || p.part_number || ')', ', ')
        from parts_catalog p
       where p.part_number is not null
         and not exists (
           select 1 from orders o
            where o.catalog_part_id = p.id and o.part_number = p.part_number
         )
    $q$ into orphan;
    if orphan is not null then
      raise notice 'Catalog number not held by any order, dropping it: %', orphan;
    end if;
  end if;
end $$;

drop index if exists parts_catalog_part_number_key;
alter table parts_catalog drop column if exists part_number;
alter table parts_catalog drop column if exists typical_price;

COMMIT;
