-- ============================================================
-- 015 — Parts catalog: merge the spelling variants of the same part
--
-- The catalog grew a name at a time, straight from whatever was typed on the
-- day, so the same part sits in it three or four times: LOWER GRILL / LWR GRILL
-- / LOWR GRILL, BONET / BONNET, RH FR DOOR / RH FRONT DOOR / FRONT RH DOOR.
-- Searching "grill" then offers the same thing repeatedly and the order history
-- for a part is split across its spellings.
--
-- This folds each cluster onto one name. Which spelling survives:
--   * an outright misspelling never wins (BONET, CONDENSOR, ABSORVER, QUATER,
--     WHELL, ANTENA, SUPOORT, LOWR);
--   * where a side is named, the shop's LH/RH-first convention wins, so the
--     picker reads consistently (RH TAIL LIGHT, not TAIL LIGHT RH);
--   * otherwise the spelling already used on the most orders wins, so the name
--     the shop actually types is the one that stays.
--
-- Orders keep their cost and dates untouched; they are repointed at the
-- surviving catalog row and their snapshot name is brought into line, so a car
-- ordered against "LWR GRILL" now reads "LOWER GRILL" everywhere.
--
-- Only the parts catalog is touched. Nothing here deletes an order.
-- ============================================================

BEGIN;

-- ------------------------------------------------------------
-- 1. Renames — a bad spelling with no correctly-spelled twin to merge into.
--    Run first, so a merge below can target the name this creates.
-- ------------------------------------------------------------
create temp table part_renames (from_name text primary key, to_name text not null)
  on commit drop;

insert into part_renames (from_name, to_name) values
  ('ANTENA ASSEMBLY',               'ANTENNA ASSEMBLY'),
  ('ABSORVER HOLDER',               'ABSORBER HOLDER'),
  ('ENERGY ABSORVER',               'ENERGY ABSORBER'),
  ('SMALL CONDENSOR',               'SMALL CONDENSER'),
  ('EXTENTION REAR BAR',            'EXTENSION REAR BAR'),
  ('QUATER PANEL',                  'QUARTER PANEL'),
  ('QUATER PANEL MOULD',            'QUARTER PANEL MOULD'),
  ('QUATER PANEL MOULD REAR RH',    'RH QUARTER PANEL MOULD'),
  ('LEFT QUARTER PANEL',            'LH QUARTER PANEL'),
  ('BONET HINGES',                  'BONNET HINGES'),
  ('BONET LOCK',                    'BONNET LOCK'),
  ('BONET PROTECTOR',               'BONNET PROTECTOR'),
  ('VERTICAL MIDDLE BONET SUPPORT', 'VERTICAL MIDDLE BONNET SUPPORT'),
  ('TAIL GATE BADGES',              'TAILGATE BADGES'),
  ('TOW COVER RH',                  'RH TOW COVER'),
  ('RH GUARD BRACKET METAL',        'RH GUARD METAL BRACKET'),
  ('RH FR DOOR TRIM',               'RH FRONT DOOR TRIM'),
  ('RH FR DOOR ADJUSTMENT',         'RH FRONT DOOR ADJUSTMENT'),
  ('LH  AND RH HEADLIGHT',          'BOTH HEADLIGHTS'),
  -- Quantity baked into the name; the orders pick it up in step 2.
  ('REAR REFLECTORX2',              'REAR REFLECTOR'),
  ('MUD FLAP X 2',                  'MUD FLAP'),
  ('WHEEL ALLOY X2',                'WHEEL ALLOY');

-- A rename onto a name that already exists would be a merge, not a rename, and
-- would leave two rows sharing one name. Stop rather than create that.
do $$
declare clash text;
begin
  select string_agg(r.to_name, ', ') into clash
    from part_renames r
    join parts_catalog p on p.part_name = r.to_name;
  if clash is not null then
    raise exception 'rename target already in the catalog: %', clash;
  end if;
end $$;

update parts_catalog p
   set part_name = r.to_name
  from part_renames r
 where p.part_name = r.from_name;

update orders o
   set part_name = r.to_name
  from part_renames r
 where o.part_name = r.from_name;

-- ------------------------------------------------------------
-- 2. Quantity written into the name — move it onto the order, where the app
--    can actually count it. Only orders still saying "1" are touched: one that
--    was already set to 4 means four of them, not four pairs.
-- ------------------------------------------------------------
create temp table part_pairs (part_name text primary key) on commit drop;

insert into part_pairs (part_name) values
  ('REAR REFLECTOR'),            -- was REAR REFLECTORX2, renamed above
  ('MUD FLAP'),                  -- was MUD FLAP X 2
  ('WHEEL ALLOY'),               -- was WHEEL ALLOY X2
  ('R BAR X 2'),
  ('FOG LIGHT X2'),
  ('TOW COVERX2'),
  ('TOW HOOK COVER*2'),
  ('WHEEL ARCH MOULD X2'),
  ('BOTH WHEEL ARCH MOULDING');

update orders o
   set quantity = 2
  from part_pairs q
 where o.quantity = 1
   and (o.catalog_part_id in (select id from parts_catalog where part_name = q.part_name)
        or (o.catalog_part_id is null and o.part_name = q.part_name));

-- ------------------------------------------------------------
-- 3. Merges — variant on the left, the name that survives on the right.
-- ------------------------------------------------------------
create temp table part_merges (variant text primary key, canonical text not null)
  on commit drop;

insert into part_merges (variant, canonical) values
  -- Grills
  ('LWR GRILL',                      'LOWER GRILL'),
  ('LOWR GRILL',                     'LOWER GRILL'),
  ('TOP  GRILL',                     'TOP GRILL'),
  ('TOP GRILL WITH CHROME',          'TOP GRILL CHROME'),
  ('GRILL MAIN',                     'MAIN GRILL'),

  -- Front bar
  ('FRONT BAR',                      'FR BAR'),
  ('FR BUMPER BAR',                  'FR BAR'),
  ('LWR FRONT BAR',                  'LWR FR BAR'),
  ('LOWER PART FR BAR',              'LWR FR BAR'),
  ('LOWER P FRONT BAR',              'LWR FR BAR'),

  -- Rear bar
  ('R BAR',                          'REAR BAR'),
  ('R BAR X 2',                      'REAR BAR'),
  ('REAR BUMPER',                    'REAR BAR'),
  ('LWR REAR  BAR',                  'LWR REAR BAR'),
  ('LWR R BAR',                      'LWR REAR BAR'),
  ('LWR RR BAR',                     'LWR REAR BAR'),
  ('LOWER REAR BAR',                 'LWR REAR BAR'),
  ('LOWER PART REAR BAR',            'LWR REAR BAR'),
  ('LWR REAR',                       'LWR REAR BAR'),
  ('LOWER REAR',                     'LWR REAR BAR'),
  ('LWR REAR CHROME',                'LWR REAR CHROME MOULD'),
  ('LOWER LIP MOULD LH',             'LH LOWER LIP MOULD'),

  -- Bar slides
  ('RH BAR  SLIDE',                  'RH BAR SLIDE'),
  ('BAR SLIDE RH',                   'RH BAR SLIDE'),
  ('LEFT BAR SLIDE',                 'LH BAR SLIDE'),
  ('BOTH BAR SLIDE',                 'BOTH BAR SLIDES'),
  ('BOTH BAR SLIDED',                'BOTH BAR SLIDES'),
  ('BAR SLIDES BOTH',                'BOTH BAR SLIDES'),
  ('LH AND RH BAR SLIDE',            'BOTH BAR SLIDES'),
  ('LH AND RIGHT BAR SLIDE',         'BOTH BAR SLIDES'),
  ('FR BOTH BAR SLIDE',              'BOTH FR BAR SLIDES'),
  ('BOTH FR BAR SLIDE',              'BOTH FR BAR SLIDES'),
  ('FR RH BAR SLIDE',                'RH FR BAR SLIDE'),
  ('RH BAR SLIDE FR',                'RH FR BAR SLIDE'),
  ('BOTH REAR BAR SLIDE',            'BOTH REAR BAR SLIDES'),

  -- Bonnet
  ('BONET',                          'BONNET'),
  ('BOTH BONET HINGED',              'BONNET HINGES'),
  ('HOOD LOCK',                      'BONNET LOCK'),

  -- Panels
  ('BACK PANEL',                     'BACKPANEL'),
  ('BACK PANEL TRIM',                'BACKPANEL TRIM'),
  ('BOOT LID',                       'BOOTLID'),
  ('TAIL GATE',                      'TAILGATE'),
  ('QUATER PANEL LEFT',              'LH QUARTER PANEL'),
  ('RH QUATER PANEL MOULD',          'RH QUARTER PANEL MOULD'),

  -- Doors
  ('LEFT HAND FRONT DOOR',           'LH FRONT DOOR'),
  ('FR LH DOOR',                     'LH FRONT DOOR'),
  ('LH FR DOOR',                     'LH FRONT DOOR'),
  ('RH FR DOOR',                     'RH FRONT DOOR'),
  ('FRONT RH DOOR',                  'RH FRONT DOOR'),
  ('LEFT HAND REAR DOOR',            'LH REAR DOOR'),
  ('REAR LEFT DOOR',                 'LH REAR DOOR'),
  ('REAR LH DOOR',                   'LH REAR DOOR'),
  ('LH R DOOR',                      'LH REAR DOOR'),
  ('REAR RH DOOR',                   'RH REAR DOOR'),

  -- Guards and liners
  ('GUARD LH',                       'LH GUARD'),
  ('RH  GUARD',                      'RH GUARD'),
  ('GUARD LINER LH',                 'LH GUARD LINER'),
  ('RH GUARD LNR',                   'RH GUARD LINER'),
  ('GUARD LINER RH FR',              'RH GUARD LINER FRONT'),

  -- Wheel arch mouldings
  ('WHELL ARCH MOULD',               'WHEEL ARCH MOULD'),
  ('WHEEL ARCH MOULDING',            'WHEEL ARCH MOULD'),
  ('WHEEL ARCH MOULD X2',            'WHEEL ARCH MOULD'),
  ('BOTH WHEEL ARCH MOULDING',       'WHEEL ARCH MOULD'),
  ('WHEEL ARCH MOULD RH',            'RH WHEEL ARCH MOULD'),
  ('WHEEL ARCH MOULD LH FRONT',      'LH WHEEL ARCH MOULD'),
  ('WHEEL ARCH MOULD FR LEFT',       'LH WHEEL ARCH MOULD'),

  -- Lights
  ('LEFT TAIL LIGHT',                'LH TAIL LIGHT'),
  ('TAIL LIGHT RH',                  'RH TAIL LIGHT'),
  ('TAIL LIGHTS BOTH',               'BOTH TAIL LIGHTS'),
  ('RH FOGLIGHT',                    'RH FOG LIGHT'),
  ('FOG LAMP RH',                    'RH FOG LIGHT'),
  ('FOGLIGHT COVER',                 'FOG LIGHT COVER'),
  ('FOG COVER',                      'FOG LIGHT COVER'),
  ('LH FOGLIGHT COVER',              'LH FOG LIGHT COVER'),
  ('LH FOG COVER',                   'LH FOG LIGHT COVER'),
  ('FOG LIGHT X2',                   'FOG LIGHT'),
  ('DRL RH',                         'RH DRL'),

  -- Reinforcement (the shop writes "RIO" and "REIN" for it)
  ('REAR REIN',                      'REAR REINFORCEMENT'),
  ('REAR RIO',                       'REAR REINFORCEMENT'),
  ('FR RIO',                         'FR REINFORCEMENT'),

  -- Absorbers, radiator support, cooling
  ('FOAM ABSORVER',                  'FOAM ABSORBER'),
  ('ABSORBER FOAM',                  'FOAM ABSORBER'),
  ('CONDENSOR',                      'CONDENSER'),
  ('TOP RADIATOR SUPOORT',           'TOP RADIATOR SUPPORT'),
  ('ENGINE COVER BOTTOM SPLASH TRAY','ENGINE SPLASH TRAY'),
  ('BOTTOM ENGINE SPLASH TRAY',      'ENGINE SPLASH TRAY'),

  -- Tow covers
  ('TOW COVER LH',                   'LH TOW COVER'),
  ('LH TOW HOOK COVER',              'LH TOW COVER'),
  ('RH TOW HOOK COVER',              'RH TOW COVER'),
  ('TOW HOOK COVER',                 'TOW COVER'),
  ('TOW COVERX2',                    'TOW COVER'),
  ('TOW HOOK COVER*2',               'TOW COVER'),

  -- Odds and ends
  ('AIR BAG MODULE',                 'AIRBAG MODULE'),
  ('WEATHERSTRIP',                   'WEATHER STRIP'),
  ('NUM PLATE HOLDER',               'NUMBER PLATE HOLDER'),
  ('NUMPLATE HOLDER',                'NUMBER PLATE HOLDER');

-- Every merge must land on a name that exists, and a survivor must not itself
-- be merged away — either would silently lose parts.
do $$
declare missing text; chained text;
begin
  select string_agg(m.canonical, ', ') into missing
    from part_merges m
    where not exists (select 1 from parts_catalog p where p.part_name = m.canonical);
  if missing is not null then
    raise exception 'merge target missing from the catalog: %', missing;
  end if;

  select string_agg(m.canonical, ', ') into chained
    from part_merges m
    where exists (select 1 from part_merges v where v.variant = m.canonical);
  if chained is not null then
    raise exception 'merge target is itself merged away: %', chained;
  end if;
end $$;

-- Move the orders across: the surviving catalog row, and its name in the
-- snapshot the order carries. Orders whose catalog row was already lost are
-- matched on that snapshot name instead.
update orders o
   set catalog_part_id = canon.id,
       part_name       = canon.part_name
  from part_merges m
  join parts_catalog canon on canon.part_name = m.canonical
  left join parts_catalog var on var.part_name = m.variant
 where o.catalog_part_id = var.id
    or (o.catalog_part_id is null and o.part_name = m.variant);

delete from parts_catalog p
 using part_merges m
 where p.part_name = m.variant;

-- ------------------------------------------------------------
-- 4. Entries that were never a part — a supplier's name, a part number typed
--    into the name box, an unreadable code. Hidden from the catalog rather
--    than deleted, so the orders written against them keep their cost.
-- ------------------------------------------------------------
update parts_catalog set active = false
 where part_name in ('SSS', 'PORT MELBOURNE VOLK', '6477033140C1');

-- The catalog list is now ordered by how often a part has been ordered, which
-- counts orders per catalog row on every search.
create index if not exists orders_catalog_part_idx on orders (catalog_part_id);

COMMIT;
