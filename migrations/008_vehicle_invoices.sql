-- ============================================================
-- 008 — Per-vehicle invoices (parts, wheel alignment, calibration)
--
-- Adds an editable list of invoice types and a vehicle_invoices table,
-- then moves the existing per-order invoice photos across as Parts invoices.
--
-- orders.invoice_photo is deliberately LEFT IN PLACE here. Dropping it while
-- the previous build is still serving traffic would break it. Run
-- 009_drop_order_invoice_photo.sql only once the new build is live and the
-- migrated invoices look right.
-- ============================================================

create table if not exists invoice_types (
    id          bigint generated always as identity primary key,
    name        text not null unique,
    sort_order  int not null default 0,
    active      boolean not null default true
);

insert into invoice_types (name, sort_order) values
    ('Parts',           1),
    ('Wheel alignment', 2),
    ('Calibration',     3)
on conflict (name) do nothing;

create table if not exists vehicle_invoices (
    id               bigint generated always as identity primary key,
    vehicle_id       bigint not null references vehicles(id) on delete cascade,
    invoice_type_id  bigint references invoice_types(id) on delete set null,
    amount           numeric(10,2),
    invoice_date     date,
    photo            text,          -- resized JPEG data URL, as with vehicle_photos
    -- Set only for rows carried over from orders.invoice_photo, so this
    -- migration stays idempotent and the origin of each row stays traceable.
    source_order_id  bigint references orders(id) on delete set null,
    created_at       timestamptz not null default now()
);

create index if not exists vehicle_invoices_vehicle_idx on vehicle_invoices (vehicle_id);
create unique index if not exists vehicle_invoices_source_order_idx
    on vehicle_invoices (source_order_id) where source_order_id is not null;

-- Carry the existing per-order invoice photos over. The amount is seeded from
-- what that order cost; the date from when it was received.
insert into vehicle_invoices (vehicle_id, invoice_type_id, amount, invoice_date, photo, source_order_id)
select o.vehicle_id,
       (select id from invoice_types where name = 'Parts'),
       o.unit_price * coalesce(o.quantity, 1),
       coalesce(o.received_date, o.created_at::date),
       o.invoice_photo,
       o.id
from orders o
where o.invoice_photo is not null
on conflict (source_order_id) where source_order_id is not null do nothing;
