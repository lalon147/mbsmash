-- ============================================================
-- MB Smash Repair — Migration 007
-- 1. Invoice photo per order (uploaded after the part arrives).
-- 2. Historical spreadsheet orders were all imported as
--    'ordered', which froze the dashboard at 905 pending /
--    $5,797 outstanding. Those parts arrived long ago — mark
--    them received so the dashboard only tracks live work.
--    (received_date stays NULL: the real date is unknown, and
--    this keeps them out of "Received Today".)
-- ============================================================
BEGIN;

ALTER TABLE orders ADD COLUMN IF NOT EXISTS invoice_photo text;

UPDATE orders
   SET status = 'received'
 WHERE status = 'ordered'
   AND created_at < '2026-07-02';   -- seed import date; everything before Monday's go-live

COMMIT;
