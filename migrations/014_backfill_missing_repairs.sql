-- ============================================================
-- 014 — Backfill repairs for cars booked in after 013
--
-- Migration 013 gave every vehicle a "Repair 1", but the code that creates a
-- vehicle was never taught to open one. So any car booked in since then has no
-- repair, and since every part must belong to one, those cars could not take a
-- single part — the app just reported "Could not add the part."
--
-- Vehicle creation now opens Repair 1 itself. This catches the cars added in
-- between. Safe to re-run: it only touches vehicles that still have no repair.
-- ============================================================

insert into repairs (vehicle_id, title, opened_date)
select v.id, 'Repair 1', coalesce(v.date_in, current_date)
from vehicles v
where not exists (select 1 from repairs r where r.vehicle_id = v.id);
