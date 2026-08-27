-- ============================================================
-- 026 — SSS: the phone number, from the shop
--
-- SSS is the second-busiest supplier in the table (64 orders) and has had a
-- blank phone since the beginning. Migration 017 could not fill it in: three
-- letters is too short to search on and no listing came back under that name.
-- The number below came from the shop directly, which is a better source than
-- any directory would have been — nothing about it needs re-checking.
--
-- Written as "(03) 9288 7888" to match how every other number in this table
-- is formatted. The app dials whatever is in the column, spaces and all.
--
-- Still blank after this: SZS Auto Wreckers (0 orders) and Toylex (2), for the
-- same reason SSS was — see 017. Nobody has any published email except the
-- four suppliers that already have one.
--
-- The update only fills a blank, so a re-run cannot overwrite a correction
-- typed into the Suppliers tab afterwards.
-- ============================================================

BEGIN;

update dealerships
   set phone = '(03) 9288 7888'
 where name = 'SSS'
   and phone is null;

COMMIT;

-- After: SSS has a phone and its 64 orders can be chased by phone.
--   select name, phone, email from dealerships where name = 'SSS';
