-- ============================================================
-- MB SMASH REPAIR — Parts Management Schema (PostgreSQL / Supabase)
-- ============================================================
-- Design notes:
--   * Every order is tied to a vehicle (vehicle_id NOT NULL).
--   * Ordering = pick a vehicle -> choose a catalog part -> create an order row.
--   * Catalog parts may be identified by part_number, part_name, or both.
--   * Dealership names are normalized into their own table to avoid the
--     "PT / P.T. / pt" duplication problem.
-- ============================================================

-- Drop in dependency order (safe re-run during setup)
drop table if exists invoice_lines cascade;
drop table if exists invoices cascade;
drop table if exists orders cascade;
drop table if exists parts_catalog cascade;
drop table if exists vehicles cascade;
drop table if exists dealerships cascade;

-- ------------------------------------------------------------
-- Dealerships / suppliers
-- ------------------------------------------------------------
create table dealerships (
    id          bigint generated always as identity primary key,
    name        text not null unique,
    phone       text,
    email       text,
    notes       text,
    created_at  timestamptz not null default now()
);

-- ------------------------------------------------------------
-- Parts catalog — the predefined list you order from
-- ------------------------------------------------------------
create table parts_catalog (
    id                      bigint generated always as identity primary key,
    part_number             text,                       -- official number e.g. 5211947949 (nullable)
    part_name               text not null,              -- e.g. "FR BAR"
    default_dealership_id   bigint references dealerships(id) on delete set null,
    typical_price           numeric(10,2),
    vehicle_make            text,                       -- optional, fill over time
    vehicle_model           text,                       -- optional
    active                  boolean not null default true,
    created_at              timestamptz not null default now()
);

-- A part_number, when present, should be unique in the catalog.
create unique index parts_catalog_part_number_key
    on parts_catalog (part_number)
    where part_number is not null;

-- Helps catalog search by name.
create index parts_catalog_part_name_idx on parts_catalog (lower(part_name));

-- ------------------------------------------------------------
-- Vehicles — one row per car in the shop
-- ------------------------------------------------------------
create table vehicles (
    id              bigint generated always as identity primary key,
    registration    text not null unique,
    make            text,
    model           text,
    customer_name   text,
    date_in         date default current_date,
    notes           text,
    created_at      timestamptz not null default now()
);

-- ------------------------------------------------------------
-- Orders — the per-car transactions (the heart of the system)
-- ------------------------------------------------------------
create type order_status as enum ('ordered', 'received', 'returned', 'cancelled');

create table orders (
    id                  bigint generated always as identity primary key,
    vehicle_id          bigint not null references vehicles(id) on delete cascade,
    catalog_part_id     bigint references parts_catalog(id) on delete set null,
    -- Snapshot fields: capture what was actually ordered even if the
    -- catalog entry later changes. part_name is always populated.
    part_name           text not null,
    part_number         text,
    dealership_id       bigint references dealerships(id) on delete set null,
    quantity            integer not null default 1 check (quantity > 0),
    unit_price          numeric(10,2),
    status              order_status not null default 'ordered',
    from_stock          boolean not null default false,   -- was this pulled from existing stock?
    order_date          date default current_date,
    expected_date       date,
    received_date       date,
    return_reason       text,
    notes               text,
    created_at          timestamptz not null default now()
);

create index orders_vehicle_idx   on orders (vehicle_id);
create index orders_status_idx    on orders (status);
create index orders_dealer_idx    on orders (dealership_id);

-- ------------------------------------------------------------
-- Invoices + lines (received-parts reconciliation)
-- ------------------------------------------------------------
create table invoices (
    id              bigint generated always as identity primary key,
    dealership_id   bigint references dealerships(id) on delete set null,
    invoice_number  text,
    invoice_date    date,
    total_amount    numeric(10,2),
    image_url       text,                       -- Supabase Storage reference
    created_at      timestamptz not null default now()
);

create table invoice_lines (
    id              bigint generated always as identity primary key,
    invoice_id      bigint not null references invoices(id) on delete cascade,
    order_id        bigint references orders(id) on delete set null,  -- links back to the order it fulfils
    part_name       text,
    part_number     text,
    quantity        integer default 1,
    unit_price      numeric(10,2),
    line_total      numeric(10,2)
);

create index invoice_lines_invoice_idx on invoice_lines (invoice_id);

-- ------------------------------------------------------------
-- Convenience view: cost per vehicle
-- ------------------------------------------------------------
create or replace view vehicle_cost_summary as
select
    v.id                                as vehicle_id,
    v.registration,
    count(o.id)                         as total_parts,
    count(o.id) filter (where o.status = 'received')  as received_parts,
    count(o.id) filter (where o.status = 'ordered')   as pending_parts,
    coalesce(sum(o.unit_price * o.quantity), 0)        as total_cost
from vehicles v
left join orders o on o.vehicle_id = v.id
group by v.id, v.registration;
