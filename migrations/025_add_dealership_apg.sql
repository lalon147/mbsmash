-- ============================================================
-- 025 — Supplier: APG / All Crash Parts Group
--
-- Added at the shop's request. This one is not a dealership: it is an
-- aftermarket and certified-aftermarket crash parts wholesaler (bars, guards,
-- bonnets, lights), so unlike every other row in this table it is not tied to
-- one make. The make-based ranking in /api/dealerships will therefore never
-- push it up the list — expect to pick it by hand.
--
-- On the name: the shop says "APG / All Crash Parts Group". The registered
-- business is Auto Parts Group, and All Crash Parts is its collision-parts
-- brand; both halves are kept so a search for either finds the row. The name
-- column is free text — nothing splits or slugs it — so the slash is safe.
--
--   * APG, Victorian distribution centre — autopartsgroup.com.au/contact-us,
--     25 Ibis Circuit, Dandenong South. Two numbers are published; the first
--     goes in. This is the branch that serves Melbourne (it also covers Tas).
--
--   * The email is a real published trade address, salesmelb@ — only the
--     fourth supplier to have one, and the first that is an actual parts desk
--     rather than a general enquiries inbox. Order emails to APG will work
--     without anyone typing an address in first.
--
-- Worth knowing: "APG" was already in the original spreadsheet, recorded as a
-- part name. Migration 006 deleted it as a non-part along with 2ND ACCIDENT
-- and ADIL. It was a supplier written into the part column, and this is where
-- it belonged all along.
--
-- Insert is do-nothing on conflict and the update only fills blanks, so a
-- re-run cannot overwrite a contact corrected in the Suppliers tab afterwards.
-- ============================================================

BEGIN;

create temp table new_suppliers (name text primary key, phone text, email text)
  on commit drop;

insert into new_suppliers (name, phone, email) values
  ('APG / All Crash Parts Group', '(03) 9548 7109', 'salesmelb@autopartsgroup.com.au');

insert into dealerships (name, phone, email)
select name, phone, email from new_suppliers
on conflict (name) do nothing;

-- If the row was added by hand from the Suppliers tab before this ran, it
-- exists with blank contacts. Fill those in without touching anything typed.
update dealerships d
   set phone = coalesce(d.phone, n.phone),
       email = coalesce(d.email, n.email)
  from new_suppliers n
 where d.name = n.name;

COMMIT;

-- After: the row exists with 0 orders.
--   select d.name, d.phone, d.email, count(o.id) from dealerships d
--   left join orders o on o.dealership_id = d.id
--   where d.name = 'APG / All Crash Parts Group' group by d.id;
