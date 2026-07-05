-- ============================================================
-- MB Smash Repair — Data Cleanup Migration 006
-- Seed-imported entries that are not real part names.
-- ============================================================
BEGIN;

-- ============================================================
-- QUANTITY BAKED INTO THE NAME — rename, move quantity to the order
-- ============================================================

-- 2X HEADLIGHT CHROME was HEADLIGHT CHROME x2
UPDATE orders SET part_name = 'HEADLIGHT CHROME', quantity = 2
  WHERE catalog_part_id IN (SELECT id FROM parts_catalog WHERE part_name = '2X HEADLIGHT CHROME');
UPDATE parts_catalog SET part_name = 'HEADLIGHT CHROME' WHERE part_name = '2X HEADLIGHT CHROME';

-- 4 SENSOR BRACKET was SENSOR BRACKET x4
UPDATE orders SET part_name = 'SENSOR BRACKET', quantity = 4
  WHERE catalog_part_id IN (SELECT id FROM parts_catalog WHERE part_name = '4 SENSOR BRACKET');
UPDATE parts_catalog SET part_name = 'SENSOR BRACKET' WHERE part_name = '4 SENSOR BRACKET';

-- ============================================================
-- DUPLICATES — merge into the existing REAR BADGES ALL entry
-- ============================================================
UPDATE orders SET
    catalog_part_id = (SELECT id FROM parts_catalog WHERE part_name = 'REAR BADGES ALL' LIMIT 1),
    part_name = 'REAR BADGES ALL'
  WHERE catalog_part_id IN (SELECT id FROM parts_catalog WHERE part_name IN ('ALL REAR BADGED', 'ALL REAR BADGES'));
DELETE FROM parts_catalog WHERE part_name IN ('ALL REAR BADGED', 'ALL REAR BADGES');

-- ============================================================
-- NOT PARTS AT ALL — a note, a person's name, an unknown code.
-- Remove the catalog entries and the orders created from them.
-- ============================================================
DELETE FROM orders
  WHERE catalog_part_id IN (SELECT id FROM parts_catalog WHERE part_name IN ('2ND ACCIDENT', 'ADIL', 'APG'));
DELETE FROM parts_catalog WHERE part_name IN ('2ND ACCIDENT', 'ADIL', 'APG');

COMMIT;
