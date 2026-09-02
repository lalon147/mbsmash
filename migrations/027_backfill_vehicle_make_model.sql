-- ============================================================
-- 027 — Vehicle make/model backfill: catalog rows, dealership
--       inference, and the make_id / model_id link
--
-- Context. Most vehicles carried a registration and nothing else: 158 of 245
-- had no make, 160 no model, 231 no year. The registration-only rows are the
-- old spreadsheet import, and they made every report useless — a breakdown of
-- the most-ordered parts by vehicle was ~70% "(unknown)".
--
-- Those were filled from CrashZone (scripts/crashzone_lookup.py), which holds
-- our own job history and returns make, model and date of manufacture for a
-- registration. It resolved 184 of 233, leaving 23 without a make. Its data is
-- entered by hand across many shops and arrives inconsistent, so everything was
-- mapped onto our makes/models tables first (scripts/cz_normalise.py):
-- TOYOTA/Toyota/TOYATA -> Toyota, HAVAL/GREAT WALL -> GWM, variant grades
-- trimmed to the model line (ES300H -> ES), spacing fixed (RAV 4 -> RAV4).
--
-- This migration does the three things that were left over.
--
-- 1. Five models that are real but were never in the catalog. They came in on
--    vehicles and would otherwise be invisible to the model dropdown, which
--    reads from `models`, not from vehicles.make/model.
--
-- 2. Six vehicles CrashZone had never seen, whose make is nonetheless known:
--    every part on them was supplied by a single-marque dealership. This rule
--    was checked against the 61 vehicles where the make was already recorded
--    and agreed on all 61, with no vehicle drawing parts from two different
--    marque dealers. Derived here rather than hardcoded so it stays honest —
--    it only ever touches a vehicle whose make is still blank. Expected:
--    0456PS, 2AV5ZK, 2CV4UL, S806DDV, XVR763 -> Toyota; 1QZ7D0 -> GWM.
--
-- 3. The make_id / model_id link. vehicles has both free-text make/model and
--    FKs into makes/models. The backfill script wrote only the text columns,
--    which left 135 vehicles with a make but no make_id. The app reads
--    COALESCE(mk.name, v.make) so they display correctly either way, but
--    /api/makes and /api/makes/[id]/models count usage through the FK to order
--    their dropdowns — so without this those 135 vehicles are invisible to the
--    counts. Matching is case-insensitive on the text, and only ever fills a
--    NULL id, so a link corrected by hand in the app survives a re-run.
--
-- Every statement is idempotent and additive: inserts are do-nothing on
-- conflict, updates are guarded on IS NULL. Nothing here overwrites a value
-- that is already set.
--
-- Not covered, on purpose: 138 vehicles still have no year (CrashZone carries
-- a date of manufacture on only about half its records), 17 still have no make
-- at all, and registrations ABCD and BCD are not real vehicles — the shop
-- confirmed that, but deleting rows with orders attached is a separate call.
-- ============================================================

BEGIN;

-- ------------------------------------------------------------
-- 1. Models that arrived on vehicles but have no catalog row
-- ------------------------------------------------------------
insert into models (make_id, name)
select mk.id, v.name
  from (values
          ('Toyota',  'Aurion'),
          ('Toyota',  'Hiace'),
          ('Hyundai', 'Ioniq'),
          ('Ford',    'Falcon'),
          ('Volvo',   'S90')
       ) as v(make, name)
  join makes mk on mk.name = v.make
on conflict (make_id, name) do nothing;

-- ------------------------------------------------------------
-- 2. Make inferred from a single-marque parts supplier
-- ------------------------------------------------------------
with marque (dealer, implies) as (
  values ('Preston Toyota',       'Toyota'),
         ('Lexus Blackburn',      'Lexus'),
         ('South Morang Haval',   'GWM'),
         ('Volvo Port Melbourne', 'Volvo'),
         ('Chadstone Mitsubishi', 'Mitsubishi'),
         ('Northern Honda',       'Honda'),
         ('Northern Nissan',      'Nissan'),
         ('Preston Mazda',        'Mazda')
),
inferred as (
  select o.vehicle_id, min(mq.implies) as make
    from orders o
    join dealerships d on d.id = o.dealership_id
    join marque mq     on mq.dealer = d.name
   group by o.vehicle_id
  having count(distinct mq.implies) = 1   -- never guess through a conflict
)
update vehicles v
   set make = i.make
  from inferred i
 where v.id = i.vehicle_id
   and nullif(btrim(v.make), '') is null;

-- ------------------------------------------------------------
-- 3. Link the free-text make/model to the catalog
-- ------------------------------------------------------------
update vehicles v
   set make_id = mk.id
  from makes mk
 where v.make_id is null
   and nullif(btrim(v.make), '') is not null
   and lower(btrim(v.make)) = lower(mk.name);

update vehicles v
   set model_id = mo.id
  from models mo
 where v.model_id is null
   and v.make_id  is not null
   and mo.make_id = v.make_id
   and nullif(btrim(v.model), '') is not null
   and lower(btrim(v.model)) = lower(mo.name);

COMMIT;

-- After this migration:
--   no make 17, no model 30, no year 138, complete 104 of 245.
--   make_id linked on 228, model_id on 215. The six inferred vehicles gain a
--   make but no model or year, so "complete" is unchanged by this migration.
--
--   select count(*) filter (where nullif(btrim(make),'')  is null) as no_make,
--          count(*) filter (where nullif(btrim(model),'') is null) as no_model,
--          count(*) filter (where year is null)                    as no_year,
--          count(*) filter (where make_id is not null)              as linked_make,
--          count(*) as total
--     from vehicles;
--
--   -- text and FK should now agree wherever both are set
--   select count(*) from vehicles v join makes mk on mk.id = v.make_id
--    where lower(btrim(v.make)) <> lower(mk.name);   -- expect 0
