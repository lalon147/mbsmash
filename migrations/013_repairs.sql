-- ============================================================
-- 013 — Repairs: separate each accident's parts for the same car
--
-- A car keeps one row (one registration) for its whole life, but it can come
-- through the shop more than once — a fresh accident months later. Until now
-- every order hung straight off the vehicle, so a second accident's parts piled
-- in with the first and the ordering list turned into a confusing mix.
--
-- This adds a "repair" (a job / an accident) between the vehicle and its orders.
-- Each accident is its own repair with its own parts list; the car still has one
-- registration and its full history stays intact.
--
--   repairs            — one row per accident/job for a vehicle.
--   orders.repair_id   — which repair a part belongs to.
-- ============================================================

create table if not exists repairs (
    id           bigint generated always as identity primary key,
    vehicle_id   bigint not null references vehicles(id) on delete cascade,
    title        text,                                   -- e.g. "Rear-end"; blank falls back to "Repair N" in the app
    status       text not null default 'open'
                 check (status in ('open', 'closed')),
    opened_date  date not null default current_date,
    closed_date  date,
    notes        text,
    created_at   timestamptz not null default now()
);

create index if not exists repairs_vehicle_idx on repairs (vehicle_id, created_at);

-- Link orders to a repair. Nullable for now so the backfill can run; made NOT
-- NULL at the end once every existing order has a repair. Deleting a repair
-- takes its parts with it, the same way deleting a vehicle already does.
alter table orders add column if not exists repair_id bigint
    references repairs(id) on delete cascade;

-- Backfill: give every vehicle that has no repair yet a single "Repair 1",
-- opened on the day the car was booked in (falling back to today).
insert into repairs (vehicle_id, title, opened_date)
select v.id, 'Repair 1', coalesce(v.date_in, current_date)
from vehicles v
where not exists (select 1 from repairs r where r.vehicle_id = v.id);

-- Move every existing order onto its vehicle's (now sole) repair.
update orders o
set repair_id = r.id
from repairs r
where r.vehicle_id = o.vehicle_id
  and o.repair_id is null;

-- Every order now belongs to a repair, and every new one must too.
alter table orders alter column repair_id set not null;

create index if not exists orders_repair_idx on orders (repair_id);
