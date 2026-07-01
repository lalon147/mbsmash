-- ============================================================
-- MB Smash Repair — Data Cleanup Migration 002
-- ============================================================
BEGIN;

-- ============================================================
-- DOORS — standardise to [SIDE] [POSITION] DOOR
-- Canonical: LH FR DOOR, RH FR DOOR, LH REAR DOOR, RH REAR DOOR
-- ============================================================

-- LH FR DOOR  ← FR LH DOOR, LH FRONT DOOR, LEFT HAND FRONT DOOR, LH FR DOOR (canonical, keep)
UPDATE orders SET catalog_part_id = (SELECT id FROM parts_catalog WHERE part_name = 'LH FR DOOR' LIMIT 1)
  WHERE catalog_part_id IN (SELECT id FROM parts_catalog WHERE part_name IN (
    'FR LH DOOR','LH FRONT DOOR','LEFT HAND FRONT DOOR'
  ));
UPDATE parts_catalog SET active = false WHERE part_name IN (
  'FR LH DOOR','LH FRONT DOOR','LEFT HAND FRONT DOOR'
);

-- RH FR DOOR  ← FRONT RH DOOR, RH FRONT DOOR
UPDATE orders SET catalog_part_id = (SELECT id FROM parts_catalog WHERE part_name = 'RH FR DOOR' LIMIT 1)
  WHERE catalog_part_id IN (SELECT id FROM parts_catalog WHERE part_name IN (
    'FRONT RH DOOR','RH FRONT DOOR'
  ));
UPDATE parts_catalog SET active = false WHERE part_name IN ('FRONT RH DOOR','RH FRONT DOOR');

-- LH REAR DOOR  ← LH R DOOR, REAR LEFT DOOR, REAR LH DOOR, LEFT HAND REAR DOOR
UPDATE orders SET catalog_part_id = (SELECT id FROM parts_catalog WHERE part_name = 'LH REAR DOOR' LIMIT 1)
  WHERE catalog_part_id IN (SELECT id FROM parts_catalog WHERE part_name IN (
    'LH R DOOR','REAR LEFT DOOR','REAR LH DOOR','LEFT HAND REAR DOOR'
  ));
UPDATE parts_catalog SET active = false WHERE part_name IN (
  'LH R DOOR','REAR LEFT DOOR','REAR LH DOOR','LEFT HAND REAR DOOR'
);

-- RH REAR DOOR  ← REAR RH DOOR
UPDATE orders SET catalog_part_id = (SELECT id FROM parts_catalog WHERE part_name = 'RH REAR DOOR' LIMIT 1)
  WHERE catalog_part_id IN (SELECT id FROM parts_catalog WHERE part_name = 'REAR RH DOOR');
UPDATE parts_catalog SET active = false WHERE part_name = 'REAR RH DOOR';

-- ============================================================
-- LWR FR BAR family  ← LWR FRONT BAR, LOWER P FRONT BAR, LOWER PART FR BAR
-- ============================================================
UPDATE orders SET catalog_part_id = (SELECT id FROM parts_catalog WHERE part_name = 'LWR FR BAR' LIMIT 1)
  WHERE catalog_part_id IN (SELECT id FROM parts_catalog WHERE part_name IN (
    'LWR FRONT BAR','LOWER P FRONT BAR','LOWER PART FR BAR'
  ));
UPDATE parts_catalog SET active = false WHERE part_name IN (
  'LWR FRONT BAR','LOWER P FRONT BAR','LOWER PART FR BAR'
);

-- ============================================================
-- LWR RR BAR family  ← LWR REAR BAR (x2), LWR R BAR, LWR BAR, LOWER REAR BAR,
--                      MIDDLE REAR BAR, LOWER PART REAR BAR, LOWER REAR
-- Rename canonical first, then merge
-- ============================================================
-- Pick one LWR REAR BAR as canonical and rename it to LWR RR BAR
UPDATE parts_catalog SET part_name = 'LWR RR BAR'
  WHERE id = (SELECT id FROM parts_catalog WHERE part_name = 'LWR REAR BAR' ORDER BY id LIMIT 1);
-- Deactivate the second LWR REAR BAR duplicate
UPDATE parts_catalog SET active = false
  WHERE part_name = 'LWR REAR BAR';  -- any remaining ones after the rename

-- Now merge aliases into LWR RR BAR
UPDATE orders SET catalog_part_id = (SELECT id FROM parts_catalog WHERE part_name = 'LWR RR BAR' LIMIT 1)
  WHERE catalog_part_id IN (SELECT id FROM parts_catalog WHERE part_name IN (
    'LWR R BAR','LWR BAR','LOWER REAR BAR','MIDDLE REAR BAR','LOWER PART REAR BAR','LOWER REAR'
  ));
UPDATE parts_catalog SET active = false WHERE part_name IN (
  'LWR R BAR','LWR BAR','LOWER REAR BAR','MIDDLE REAR BAR','LOWER PART REAR BAR','LOWER REAR'
);

-- ============================================================
-- GRILL family — fix duplicates and clean naming
-- ============================================================
-- TOP GRILL has two active entries — keep one
UPDATE orders SET catalog_part_id = (SELECT id FROM parts_catalog WHERE part_name = 'TOP GRILL' ORDER BY id LIMIT 1)
  WHERE catalog_part_id IN (
    SELECT id FROM parts_catalog WHERE part_name = 'TOP GRILL' ORDER BY id OFFSET 1
  );
UPDATE parts_catalog SET active = false
  WHERE part_name = 'TOP GRILL' AND id != (SELECT id FROM parts_catalog WHERE part_name = 'TOP GRILL' ORDER BY id LIMIT 1);

-- TOP MAIN GRILL, GRILL MAIN → MAIN GRILL
UPDATE orders SET catalog_part_id = (SELECT id FROM parts_catalog WHERE part_name = 'MAIN GRILL' LIMIT 1)
  WHERE catalog_part_id IN (SELECT id FROM parts_catalog WHERE part_name IN ('TOP MAIN GRILL','GRILL MAIN'));
UPDATE parts_catalog SET active = false WHERE part_name IN ('TOP MAIN GRILL','GRILL MAIN');

-- LOWER GRILL has two active entries — keep one; merge LWR GRILL into it
UPDATE parts_catalog SET active = false
  WHERE part_name = 'LOWER GRILL' AND id != (SELECT id FROM parts_catalog WHERE part_name = 'LOWER GRILL' ORDER BY id LIMIT 1);
UPDATE orders SET catalog_part_id = (SELECT id FROM parts_catalog WHERE part_name = 'LOWER GRILL' LIMIT 1)
  WHERE catalog_part_id IN (SELECT id FROM parts_catalog WHERE part_name = 'LWR GRILL');
UPDATE parts_catalog SET active = false WHERE part_name = 'LWR GRILL';

-- ============================================================
-- BAR SLIDES — standardise direction prefixes
-- ============================================================
-- BOTH FR BAR SLIDE → BOTH FR BAR SLIDES (add S, consistent with BOTH REAR BAR SLIDES)
UPDATE parts_catalog SET part_name = 'BOTH FR BAR SLIDES' WHERE part_name = 'BOTH FR BAR SLIDE';
-- FR BOTH BAR SLIDE → BOTH FR BAR SLIDES
UPDATE orders SET catalog_part_id = (SELECT id FROM parts_catalog WHERE part_name = 'BOTH FR BAR SLIDES' LIMIT 1)
  WHERE catalog_part_id IN (SELECT id FROM parts_catalog WHERE part_name = 'FR BOTH BAR SLIDE');
UPDATE parts_catalog SET active = false WHERE part_name = 'FR BOTH BAR SLIDE';
-- LH AND RIGHT BAR SLIDE → LH AND RH BAR SLIDE
UPDATE parts_catalog SET part_name = 'LH AND RH BAR SLIDE' WHERE part_name = 'LH AND RIGHT BAR SLIDE';
-- LEFT BAR SLIDE → LH BAR SLIDE
UPDATE orders SET catalog_part_id = (SELECT id FROM parts_catalog WHERE part_name = 'LH BAR SLIDE' LIMIT 1)
  WHERE catalog_part_id IN (SELECT id FROM parts_catalog WHERE part_name = 'LEFT BAR SLIDE');
UPDATE parts_catalog SET active = false WHERE part_name = 'LEFT BAR SLIDE';
-- RH BAR SLIDE has two active entries — keep one
UPDATE orders SET catalog_part_id = (SELECT id FROM parts_catalog WHERE part_name = 'RH BAR SLIDE' ORDER BY id LIMIT 1)
  WHERE catalog_part_id IN (
    SELECT id FROM parts_catalog WHERE part_name = 'RH BAR SLIDE' ORDER BY id OFFSET 1
  );
UPDATE parts_catalog SET active = false
  WHERE part_name = 'RH BAR SLIDE' AND id != (SELECT id FROM parts_catalog WHERE part_name = 'RH BAR SLIDE' ORDER BY id LIMIT 1);
-- FR RH BAR SLIDE → RH FR BAR SLIDE (consistent prefix order)
UPDATE parts_catalog SET part_name = 'RH FR BAR SLIDE' WHERE part_name = 'FR RH BAR SLIDE';

-- ============================================================
-- REMAINING MISSPELLINGS
-- ============================================================
UPDATE parts_catalog SET part_name = 'RH QUARTER PANEL MOULD' WHERE part_name = 'RH QUATER PANEL MOULD';
UPDATE parts_catalog SET part_name = 'RH GUARD LINER'         WHERE part_name = 'RH GUARD LNR';
UPDATE parts_catalog SET part_name = 'LH FOG LIGHT COVER'     WHERE part_name = 'LH FOGLIGHT COVER';

-- ============================================================
-- REMAINING EXACT DUPLICATES
-- ============================================================
-- FOAM ABSORBER has two active entries
UPDATE parts_catalog SET active = false
  WHERE part_name = 'FOAM ABSORBER' AND id != (SELECT id FROM parts_catalog WHERE part_name = 'FOAM ABSORBER' ORDER BY id LIMIT 1);

-- WHEEL ARCH MOULD has two active entries
UPDATE parts_catalog SET active = false
  WHERE part_name = 'WHEEL ARCH MOULD' AND id != (SELECT id FROM parts_catalog WHERE part_name = 'WHEEL ARCH MOULD' ORDER BY id LIMIT 1);

-- TOP RADIATOR SUPPORT has two active entries
UPDATE parts_catalog SET active = false
  WHERE part_name = 'TOP RADIATOR SUPPORT' AND id != (SELECT id FROM parts_catalog WHERE part_name = 'TOP RADIATOR SUPPORT' ORDER BY id LIMIT 1);

-- R BAR COVER → RR BAR COVER (consistent with RR BAR)
UPDATE parts_catalog SET part_name = 'RR BAR COVER' WHERE part_name = 'R BAR COVER';
-- R BAR X 2 → RR BAR X2
UPDATE parts_catalog SET part_name = 'RR BAR X2' WHERE part_name = 'R BAR X 2';
-- CHROME MOULD R BAR → CHROME MOULD RR BAR
UPDATE parts_catalog SET part_name = 'CHROME MOULD RR BAR' WHERE part_name = 'CHROME MOULD R BAR';

-- GUARD LH → LH GUARD (consistent prefix format)
UPDATE orders SET catalog_part_id = (SELECT id FROM parts_catalog WHERE part_name = 'LH GUARD' LIMIT 1)
  WHERE catalog_part_id IN (SELECT id FROM parts_catalog WHERE part_name = 'GUARD LH');
UPDATE parts_catalog SET active = false WHERE part_name = 'GUARD LH';

-- ALL REAR BADGES / ALL REAR BADGED / REAR BADGES ALL → ALL REAR BADGES
UPDATE orders SET catalog_part_id = (SELECT id FROM parts_catalog WHERE part_name = 'ALL REAR BADGES' LIMIT 1)
  WHERE catalog_part_id IN (SELECT id FROM parts_catalog WHERE part_name IN ('ALL REAR BADGED','REAR BADGES ALL'));
UPDATE parts_catalog SET active = false WHERE part_name IN ('ALL REAR BADGED','REAR BADGES ALL');

-- TOW COVERX2 → TOW COVER X2 ; TOW HOOK COVER*2 → TOW HOOK COVER X2
UPDATE parts_catalog SET part_name = 'TOW COVER X2'       WHERE part_name = 'TOW COVERX2';
UPDATE parts_catalog SET part_name = 'TOW HOOK COVER X2'  WHERE part_name = 'TOW HOOK COVER*2';

-- REAR REFLECTORX2 → REAR REFLECTOR X2
UPDATE parts_catalog SET part_name = 'REAR REFLECTOR X2'  WHERE part_name = 'REAR REFLECTORX2';

-- ============================================================
-- GUARD LINER — standardise prefix order
-- ============================================================
-- GUARD LINER, GUARD LINER BRACKET, GUARD LINER LH, GUARD LINER RH FR, GUARD METAL BRACKET
-- → LH GUARD LINER, LH GUARD LINER BRACKET, RH GUARD LINER, RH GUARD LINER FR...
--   These are ambiguous without side — leave GUARD LINER as-is, fix GUARD LINER LH
UPDATE parts_catalog SET part_name = 'LH GUARD LINER' WHERE part_name = 'GUARD LINER LH';
-- Merge with existing LH GUARD LINER
UPDATE orders SET catalog_part_id = (SELECT id FROM parts_catalog WHERE part_name = 'LH GUARD LINER' ORDER BY id LIMIT 1)
  WHERE catalog_part_id IN (SELECT id FROM parts_catalog WHERE part_name = 'LH GUARD LINER' ORDER BY id OFFSET 1);
UPDATE parts_catalog SET active = false
  WHERE part_name = 'LH GUARD LINER' AND id != (SELECT id FROM parts_catalog WHERE part_name = 'LH GUARD LINER' ORDER BY id LIMIT 1);

COMMIT;
