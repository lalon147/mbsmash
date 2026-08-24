-- ============================================================
-- 022 — Suppliers: three the shop now orders from
--
-- Added at the shop's request: Essendon GWM, Arara Wreckers, SZS Auto
-- Wreckers. None of them have any orders behind them yet, so they sit at the
-- bottom of the dealership picker until they earn a place — which is the
-- ranking working as intended, not something to fix.
--
-- On the names: they are written the way the shop says them, the same rule
-- migration 017 followed. "SZS auto Wreckers" is capitalised as "SZS Auto
-- Wreckers" so it matches every other row in the table.
--
-- Phones were looked up the same way as 017 — from the dealer's own site
-- where there is one, a directory listing otherwise:
--
--   * Essendon GWM — essendongwm.com.au/parts, 600 Mt Alexander Rd, Moonee
--     Ponds. One switchboard number; parts is a web enquiry form, so there is
--     no published parts address to put in `email`. Note this is a different
--     business from South Morang Haval, which also trades as GWM now.
--
--   * Arara Wreckers — Yellow Pages / White Pages listings for Arara Auto
--     Wreckers, 9 Fordson Rd, Campbellfield (same number listed at their
--     Sydney Rd, Fawkner address). WORTH CONFIRMING: this is a directory
--     match on a slightly longer trading name, not the shop's own contact.
--
--   * SZS Auto Wreckers — nothing found under that name, same as SSS and
--     Toylex in 017. Left blank for someone at the shop to fill in from the
--     Suppliers tab.
--
-- Inserts are do-nothing on conflict and the update only fills blanks, so a
-- re-run cannot overwrite a number corrected in the Suppliers tab afterwards.
-- ============================================================

BEGIN;

create temp table new_suppliers (name text primary key, phone text, email text)
  on commit drop;

insert into new_suppliers (name, phone, email) values
  ('Essendon GWM',       '(03) 9080 1111', null),
  ('Arara Wreckers',     '(03) 9357 1676', null),
  ('SZS Auto Wreckers',  null,             null);

insert into dealerships (name, phone, email)
select name, phone, email from new_suppliers
on conflict (name) do nothing;

-- If a row was added by hand from the Suppliers tab before this ran, it exists
-- with a blank phone. Fill that in without touching anything already typed.
update dealerships d
   set phone = coalesce(d.phone, n.phone),
       email = coalesce(d.email, n.email)
  from new_suppliers n
 where d.name = n.name;

COMMIT;

-- After: the three rows exist with 0 orders each.
--   select d.name, d.phone, count(o.id) from dealerships d
--   left join orders o on o.dealership_id = d.id
--   where d.name in ('Essendon GWM','Arara Wreckers','SZS Auto Wreckers')
--   group by d.id order by d.name;
