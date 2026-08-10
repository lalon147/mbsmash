-- ============================================================
-- 017 — Suppliers: phone numbers, and the one published email
--
-- Every dealership row had a blank phone and a blank email, which is why
-- neither the order email nor the call button on the chasing list could do
-- anything. These were looked up from each dealership's own website where it
-- has one, and from business directories where it doesn't.
--
-- Two things worth knowing about what came back:
--
--   * Franchised dealers almost never publish a parts email. They run a
--     "Parts enquiry" contact form instead, and the only address a search
--     turns up is some salesperson's personal one, which is the wrong thing
--     to send orders to. Exactly one real address was found — City Wreckers'.
--     The rest have to come from the shop's own email history with its reps.
--
--   * Several trade under a different name now than the one in this table:
--     South Morang Haval is South Morang GWM, Ralph D Silva is Ralph D'Silva
--     Nissan in Preston, Volvo Port Melbourne is Volvo Cars Melbourne. The
--     names here are left alone — they are what the shop calls them.
--
-- Every number is a main switchboard unless the comment says otherwise, and
-- each row carries where it came from so it can be re-checked. Only rows that
-- still have no phone are filled in, so this cannot overwrite a correction
-- typed into the Suppliers tab after the fact — including on a re-run.
--
-- NOT FILLED IN, because they could not be identified from the outside:
--   SSS (56 orders) and Toylex (2) — too short to search, no listing found.
-- ============================================================

BEGIN;

create temp table supplier_contacts (name text primary key, phone text, email text)
  on commit drop;

insert into supplier_contacts (name, phone, email) values
  -- prestontoyota.dealer.toyota.com.au — one number for every department.
  ('Preston Toyota',          '(03) 9478 1788', null),
  -- ralphdsilvanissan.com.au/contact-us — this is its parts/service line;
  -- sales is (03) 9471 0500.
  ('Ralph D Silva',           '(03) 8470 0999', null),
  -- citywrecker.com.au/contact-us — the only supplier with a published address.
  ('City Wreckers Melbourne', '(03) 9315 4000', 'info@citywrecker.com.au'),
  -- essendonhyundai.com.au/company/contact-us — single number, parts by form.
  ('Essendon Hyundai',        '(03) 9039 3538', null),
  -- honda.com.au/honda-centre/northern-honda — 100 Cooper St, Epping.
  ('Northern Honda',          '(03) 8407 8400', null),
  -- Directory listings; the dealership's own site refuses automated requests.
  ('Lexus Blackburn',         '(03) 9877 2788', null),
  -- Trades as South Morang GWM. Parts has its own line, so use it.
  ('South Morang Haval',      '(03) 8457 1650', null),
  ('Preston Mazda',           '(03) 8592 4631', null),
  ('Northern Nissan',         '(03) 9466 5888', null),
  ('Northern Motor Group',    '(03) 9466 5888', null),
  ('BYD Essendon',            '(03) 8521 1570', null),
  ('Volvo Port Melbourne',    '(03) 9998 7280', null),
  ('Chadstone Mitsubishi',    '(03) 8574 0000', null),
  -- WORTH CONFIRMING BEFORE RELYING ON IT: this is a Yellow Pages listing for
  -- "Coburg Nth Wreckers" at 15 Mercier St, which is probably the same yard
  -- under an abbreviated name, but nothing confirms it outright. It is the
  -- shop's third-biggest supplier, so someone there will know the number.
  ('Coburg North Wreckers',   '0421 701 967',   null);

update dealerships d
   set phone = coalesce(d.phone, c.phone),
       email = coalesce(d.email, c.email)
  from supplier_contacts c
 where d.name = c.name;

-- A name in the list that matches nothing means this table has been renamed
-- since — say so rather than silently filling in fifteen of sixteen.
do $$
declare missed text;
begin
  select string_agg(c.name, ', ') into missed
    from supplier_contacts c
    left join dealerships d on d.name = c.name
   where d.id is null;
  if missed is not null then
    raise notice 'No dealership matched: %', missed;
  end if;
end $$;

COMMIT;
