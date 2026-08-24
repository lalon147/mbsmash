-- ============================================================
-- 023 — A part number belongs to a car, not to a name in a list
--
-- The catalog is a list of part names — FR BAR, RH HEADLIGHT — shared by every
-- car in the shop, and it carried one part_number per name. So the first number
-- typed off an invoice was written onto the name itself, and from then on every
-- car that ordered that part was pre-filled with it, silently, at the moment
-- the order was placed.
--
-- A front bar for a 2016 Camry is not the front bar for a 2017 Camry, let alone
-- for a Haval Jolion. The data already shows it: 521193T930 was typed once off
-- a Camry invoice and has since been carried onto a Kia Cerato and a GWM Haval
-- Jolion; 8114533S51, a Camry headlight, is on a Jolion too; 521590X908, a
-- Camry rear bar, is on a Lexus ES.
--
-- This migration does two things:
--
--   1. Gives a vehicle a year, so 2016 and 2017 Camrys are different cars.
--      Nullable, and blank on every car already in the table — there is no
--      source to backfill it from, and a guessed year is worse than none.
--
--   2. Clears the part numbers that were carried onto a car of a different
--      make from the one the number was typed on. Those are wrong outright.
--      Numbers someone actually typed are never touched, and neither are the
--      ones carried onto another Camry — they may well be right, and the app
--      now shows the number at order time for someone to check.
--
-- Both are additive as far as the running app is concerned, so this can go on
-- before the new code ships. Retiring the shop-wide part_number column, which
-- the old code still reads, waits for 024 and a deploy.
-- ============================================================

BEGIN;

-- ------------------------------------------------------------
-- 1. The model year
-- ------------------------------------------------------------
alter table vehicles add column if not exists year smallint;

-- A typo'd year is worse than a blank one: it quietly becomes a different car
-- and stops matching the parts that fit it. 1950 is older than anything that
-- comes through a smash repairer; the upper end allows next year's plates.
alter table vehicles drop constraint if exists vehicles_year_check;
alter table vehicles add constraint vehicles_year_check
  check (year is null or year between 1950 and extract(year from current_date)::int + 2);

-- Every fitment lookup is "this part, this make, this model, this year".
create index if not exists vehicles_make_model_year_idx
  on vehicles (lower(make), lower(model), year);
create index if not exists orders_catalog_part_number_idx
  on orders (catalog_part_id) where part_number is not null;

-- ------------------------------------------------------------
-- 2. The numbers that travelled to the wrong car
-- ------------------------------------------------------------
-- "Typed" means the audit log has someone setting part_number on that order.
-- Anything else arrived from the catalog pre-fill. A pre-filled number is only
-- cleared when the car it landed on is a different make from the car the number
-- was typed on — including when that car has no make recorded at all, which is
-- a match nobody can confirm.
create temp table typed_numbers on commit drop as
select distinct c.new_value as part_number, lower(v.make) as typed_make
  from change_log c
  join orders   o on o.id = c.entity_id and c.entity_type = 'order'
  join vehicles v on v.id = o.vehicle_id
 where c.field = 'part_number'
   and c.new_value is not null
   and v.make is not null;

create temp table cleared_orders on commit drop as
select o.id
  from orders o
  join vehicles v on v.id = o.vehicle_id
 where o.part_number is not null
   -- not typed on this order
   and not exists (
     select 1 from change_log c
      where c.entity_type = 'order' and c.entity_id = o.id and c.field = 'part_number'
   )
   -- and typed somewhere, on a car of another make
   and exists (
     select 1 from typed_numbers t
      where t.part_number = o.part_number
        and t.typed_make is distinct from lower(v.make)
   );

do $$
declare n int;
begin
  select count(*) into n from cleared_orders;
  raise notice 'Clearing % part number(s) carried onto a car of another make.', n;
end $$;

update orders set part_number = null
 where id in (select id from cleared_orders);

COMMIT;

-- After: no number is shared across makes any more.
--   select o.part_number, v.make, v.model, v.year, count(*)
--     from orders o join vehicles v on v.id = o.vehicle_id
--    where o.part_number is not null
--    group by 1,2,3,4 order by 1;
