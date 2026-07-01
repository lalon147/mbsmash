-- ============================================================
-- MB Smash Repair — Data Cleanup Migration 003
-- ============================================================
BEGIN;

-- ============================================================
-- REINFORCEMENT — merge misnamed entries into correct ones
-- ============================================================

-- FR RIO was actually FR REINFORCEMENT
UPDATE orders SET catalog_part_id = (SELECT id FROM parts_catalog WHERE part_name = 'FR REINFORCEMENT' LIMIT 1)
  WHERE catalog_part_id IN (SELECT id FROM parts_catalog WHERE part_name = 'FR RIO');
UPDATE parts_catalog SET active = false WHERE part_name = 'FR RIO';

-- REAR RIO was actually REAR REINFORCEMENT
UPDATE orders SET catalog_part_id = (SELECT id FROM parts_catalog WHERE part_name = 'REAR REINFORCEMENT' LIMIT 1)
  WHERE catalog_part_id IN (SELECT id FROM parts_catalog WHERE part_name = 'REAR RIO');
UPDATE parts_catalog SET active = false WHERE part_name = 'REAR RIO';

-- REAR REIN is just an abbreviation of REAR REINFORCEMENT
UPDATE orders SET catalog_part_id = (SELECT id FROM parts_catalog WHERE part_name = 'REAR REINFORCEMENT' LIMIT 1)
  WHERE catalog_part_id IN (SELECT id FROM parts_catalog WHERE part_name = 'REAR REIN');
UPDATE parts_catalog SET active = false WHERE part_name = 'REAR REIN';

-- ============================================================
-- INTERIOR / NON-EXTERIOR — deactivate (exterior focus)
-- ============================================================
UPDATE parts_catalog SET active = false WHERE part_name IN (
  'LEFT FRONT SEAT',
  'LEFT FRONT SEAT BELT',
  'LEFT REAR SEATBELT',
  'ROOF LINER',
  'SHOCK ABSORBER',
  'AIRBAG MODULE',
  'CURTAIN AIRBAG',
  'HORN',
  'SENSOR LOOM'
);

COMMIT;
