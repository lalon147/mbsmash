-- ============================================================
-- MB Smash Repair — Data Cleanup Migration 001
-- ============================================================
BEGIN;

-- ============================================================
-- DEALERSHIPS
-- ============================================================

-- Merge PT into Preston Toyota
UPDATE orders      SET dealership_id         = 1 WHERE dealership_id         = (SELECT id FROM dealerships WHERE name = 'PT');
UPDATE parts_catalog SET default_dealership_id = 1 WHERE default_dealership_id = (SELECT id FROM dealerships WHERE name = 'PT');
DELETE FROM dealerships WHERE name = 'PT';

-- Renames
UPDATE dealerships SET name = 'Coburg North Wreckers'  WHERE name = 'ADIL';
UPDATE dealerships SET name = 'City Wreckers Melbourne' WHERE name = 'Arif';

-- ============================================================
-- PARTS CATALOG — fix double-spaces
-- ============================================================
UPDATE parts_catalog
  SET part_name = REGEXP_REPLACE(part_name, '\s{2,}', ' ', 'g')
  WHERE part_name ~ '\s{2,}';

-- ============================================================
-- PARTS CATALOG — fix misspellings (no existing correct entry)
-- ============================================================
UPDATE parts_catalog SET part_name = 'ABSORBER HOLDER'             WHERE part_name = 'ABSORVER HOLDER';
UPDATE parts_catalog SET part_name = 'ENERGY ABSORBER'             WHERE part_name = 'ENERGY ABSORVER';
UPDATE parts_catalog SET part_name = 'FOAM ABSORBER'               WHERE part_name = 'FOAM ABSORVER';
UPDATE parts_catalog SET part_name = 'ANTENNA ASSEMBLY'            WHERE part_name = 'ANTENA ASSEMBLY';
UPDATE parts_catalog SET part_name = 'SMALL CONDENSER'             WHERE part_name = 'SMALL CONDENSOR';
UPDATE parts_catalog SET part_name = 'EXTENSION REAR BAR'          WHERE part_name = 'EXTENTION REAR BAR';
UPDATE parts_catalog SET part_name = 'QUARTER PANEL'               WHERE part_name = 'QUATER PANEL';
UPDATE parts_catalog SET part_name = 'QUARTER PANEL LEFT'          WHERE part_name = 'QUATER PANEL LEFT';
UPDATE parts_catalog SET part_name = 'QUARTER PANEL MOULD'         WHERE part_name = 'QUATER PANEL MOULD';
UPDATE parts_catalog SET part_name = 'QUARTER PANEL MOULD REAR RH' WHERE part_name = 'QUATER PANEL MOULD REAR RH';
UPDATE parts_catalog SET part_name = 'TOP RADIATOR SUPPORT'        WHERE part_name = 'TOP RADIATOR SUPOORT';
UPDATE parts_catalog SET part_name = 'WHEEL ARCH MOULD'            WHERE part_name = 'WHELL ARCH MOULD';
UPDATE parts_catalog SET part_name = 'LOWER GRILL'                 WHERE part_name = 'LOWR GRILL';
UPDATE parts_catalog SET part_name = 'BONNET HINGES'               WHERE part_name = 'BONET HINGES';
UPDATE parts_catalog SET part_name = 'BONNET LOCK'                 WHERE part_name = 'BONET LOCK';
UPDATE parts_catalog SET part_name = 'BONNET PROTECTOR'            WHERE part_name = 'BONET PROTECTOR';
UPDATE parts_catalog SET part_name = 'BOTH BONNET HINGES'          WHERE part_name = 'BOTH BONET HINGED';
UPDATE parts_catalog SET part_name = 'VERTICAL BONNET SUPPORT'     WHERE part_name = 'VERTICAL MIDDLE BONET SUPPORT';

-- ============================================================
-- PARTS CATALOG — merge exact duplicates
-- (update orders snapshot link → canonical, then deactivate dupe)
-- ============================================================

-- BONET → BONNET
UPDATE orders SET catalog_part_id = (SELECT id FROM parts_catalog WHERE part_name = 'BONNET' LIMIT 1)
  WHERE catalog_part_id IN (SELECT id FROM parts_catalog WHERE part_name = 'BONET');
UPDATE parts_catalog SET active = false WHERE part_name = 'BONET';

-- BACKPANEL → BACK PANEL
UPDATE orders SET catalog_part_id = (SELECT id FROM parts_catalog WHERE part_name = 'BACK PANEL' LIMIT 1)
  WHERE catalog_part_id IN (SELECT id FROM parts_catalog WHERE part_name = 'BACKPANEL');
UPDATE parts_catalog SET active = false WHERE part_name = 'BACKPANEL';

-- BACKPANEL TRIM → BACK PANEL TRIM
UPDATE orders SET catalog_part_id = (SELECT id FROM parts_catalog WHERE part_name = 'BACK PANEL TRIM' LIMIT 1)
  WHERE catalog_part_id IN (SELECT id FROM parts_catalog WHERE part_name = 'BACKPANEL TRIM');
UPDATE parts_catalog SET active = false WHERE part_name = 'BACKPANEL TRIM';

-- BOOT LID → BOOTLID (one-word is industry standard)
UPDATE orders SET catalog_part_id = (SELECT id FROM parts_catalog WHERE part_name = 'BOOTLID' LIMIT 1)
  WHERE catalog_part_id IN (SELECT id FROM parts_catalog WHERE part_name = 'BOOT LID');
UPDATE parts_catalog SET active = false WHERE part_name = 'BOOT LID';

-- TAIL GATE → TAILGATE
UPDATE orders SET catalog_part_id = (SELECT id FROM parts_catalog WHERE part_name = 'TAILGATE' LIMIT 1)
  WHERE catalog_part_id IN (SELECT id FROM parts_catalog WHERE part_name = 'TAIL GATE');
UPDATE parts_catalog SET active = false WHERE part_name = 'TAIL GATE';

-- WEATHER STRIP → WEATHERSTRIP
UPDATE orders SET catalog_part_id = (SELECT id FROM parts_catalog WHERE part_name = 'WEATHERSTRIP' LIMIT 1)
  WHERE catalog_part_id IN (SELECT id FROM parts_catalog WHERE part_name = 'WEATHER STRIP');
UPDATE parts_catalog SET active = false WHERE part_name = 'WEATHER STRIP';

-- AIR BAG MODULE → AIRBAG MODULE
UPDATE orders SET catalog_part_id = (SELECT id FROM parts_catalog WHERE part_name = 'AIRBAG MODULE' LIMIT 1)
  WHERE catalog_part_id IN (SELECT id FROM parts_catalog WHERE part_name = 'AIR BAG MODULE');
UPDATE parts_catalog SET active = false WHERE part_name = 'AIR BAG MODULE';

-- CONDENSOR → CONDENSER
UPDATE orders SET catalog_part_id = (SELECT id FROM parts_catalog WHERE part_name = 'CONDENSER' LIMIT 1)
  WHERE catalog_part_id IN (SELECT id FROM parts_catalog WHERE part_name = 'CONDENSOR');
UPDATE parts_catalog SET active = false WHERE part_name = 'CONDENSOR';

-- FOGLIGHT COVER → FOG LIGHT COVER
UPDATE orders SET catalog_part_id = (SELECT id FROM parts_catalog WHERE part_name = 'FOG LIGHT COVER' LIMIT 1)
  WHERE catalog_part_id IN (SELECT id FROM parts_catalog WHERE part_name = 'FOGLIGHT COVER');
UPDATE parts_catalog SET active = false WHERE part_name = 'FOGLIGHT COVER';

-- RH FOGLIGHT → RH FOG LIGHT
UPDATE orders SET catalog_part_id = (SELECT id FROM parts_catalog WHERE part_name = 'RH FOG LIGHT' LIMIT 1)
  WHERE catalog_part_id IN (SELECT id FROM parts_catalog WHERE part_name = 'RH FOGLIGHT');
UPDATE parts_catalog SET active = false WHERE part_name = 'RH FOGLIGHT';

-- TAIL LIGHTS BOTH → BOTH TAIL LIGHTS
UPDATE orders SET catalog_part_id = (SELECT id FROM parts_catalog WHERE part_name = 'BOTH TAIL LIGHTS' LIMIT 1)
  WHERE catalog_part_id IN (SELECT id FROM parts_catalog WHERE part_name = 'TAIL LIGHTS BOTH');
UPDATE parts_catalog SET active = false WHERE part_name = 'TAIL LIGHTS BOTH';

-- BOTH BAR SLIDE / BOTH BAR SLIDED / BAR SLIDES BOTH → BOTH BAR SLIDES
UPDATE orders SET catalog_part_id = (SELECT id FROM parts_catalog WHERE part_name = 'BOTH BAR SLIDES' LIMIT 1)
  WHERE catalog_part_id IN (SELECT id FROM parts_catalog WHERE part_name IN ('BOTH BAR SLIDE','BOTH BAR SLIDED','BAR SLIDES BOTH'));
UPDATE parts_catalog SET active = false WHERE part_name IN ('BOTH BAR SLIDE','BOTH BAR SLIDED','BAR SLIDES BOTH');

-- NUM PLATE HOLDER / NUMPLATE HOLDER → NUMBER PLATE HOLDER
UPDATE orders SET catalog_part_id = (SELECT id FROM parts_catalog WHERE part_name = 'NUMBER PLATE HOLDER' LIMIT 1)
  WHERE catalog_part_id IN (SELECT id FROM parts_catalog WHERE part_name IN ('NUM PLATE HOLDER','NUMPLATE HOLDER'));
UPDATE parts_catalog SET active = false WHERE part_name IN ('NUM PLATE HOLDER','NUMPLATE HOLDER');

-- WHEEL ARCH MOULDING → WHEEL ARCH MOULD
UPDATE orders SET catalog_part_id = (SELECT id FROM parts_catalog WHERE part_name = 'WHEEL ARCH MOULD' LIMIT 1)
  WHERE catalog_part_id IN (SELECT id FROM parts_catalog WHERE part_name = 'WHEEL ARCH MOULDING');
UPDATE parts_catalog SET active = false WHERE part_name = 'WHEEL ARCH MOULDING';

-- ============================================================
-- PARTS CATALOG — consolidate FR BAR family
-- (user confirmed: FR BAR / FRONT BAR / FRONT BAR COVER = same part)
-- ============================================================
UPDATE orders SET catalog_part_id = (SELECT id FROM parts_catalog WHERE part_name = 'FR BAR' LIMIT 1)
  WHERE catalog_part_id IN (SELECT id FROM parts_catalog WHERE part_name IN (
    'FRONT BAR','FR BUMPER BAR','FRONT BAR COVER','COMPLETE FRONT BAR','FR BAR COVER UPPER'
  ));
UPDATE parts_catalog SET active = false WHERE part_name IN (
  'FRONT BAR','FR BUMPER BAR','FRONT BAR COVER','COMPLETE FRONT BAR','FR BAR COVER UPPER'
);

-- ============================================================
-- PARTS CATALOG — consolidate REAR BAR family → RR BAR
-- ============================================================
-- Rename REAR BAR to RR BAR (the canonical name from EPC)
UPDATE parts_catalog SET part_name = 'RR BAR' WHERE part_name = 'REAR BAR';
-- Merge aliases
UPDATE orders SET catalog_part_id = (SELECT id FROM parts_catalog WHERE part_name = 'RR BAR' LIMIT 1)
  WHERE catalog_part_id IN (SELECT id FROM parts_catalog WHERE part_name IN (
    'REAR BUMPER','R BAR','REAR BAR COVER'
  ));
UPDATE parts_catalog SET active = false WHERE part_name IN ('REAR BUMPER','R BAR','REAR BAR COVER');

-- ============================================================
-- PARTS CATALOG — mark junk inactive (not real parts)
-- ============================================================
-- Pure numbers (prices/amounts that got entered as part names)
UPDATE parts_catalog SET active = false WHERE part_name ~ '^[0-9]+$';

-- Clearly not parts
UPDATE parts_catalog SET active = false WHERE part_name IN (
  '2ND ACCIDENT',
  'ADIL',
  'APG',
  'SSS',
  'PORT MELBOURNE VOLK',
  'POLISH REAR BAR',
  '8484047060/SWITCH'
);

COMMIT;
