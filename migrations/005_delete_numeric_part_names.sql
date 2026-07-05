-- ============================================================
-- MB Smash Repair — Data Cleanup Migration 005
-- Part names that are just numbers (100, 200, …) were entered
-- by accident on 2026-07-01 — they are not real parts.
-- Removes the 13 catalog entries and the 13 orders pointing at them.
-- ============================================================
BEGIN;

DELETE FROM orders
 WHERE part_name ~ '^[0-9 .,]+$'
   AND catalog_part_id IN (SELECT id FROM parts_catalog WHERE part_name ~ '^[0-9 .,]+$');

DELETE FROM parts_catalog
 WHERE part_name ~ '^[0-9 .,]+$';

COMMIT;
