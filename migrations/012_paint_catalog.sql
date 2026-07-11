-- ============================================================
-- 012 — Paint items: a predefined catalog + per-vehicle selections
--
-- The Paint page and its APIs (app/api/paint-catalog, app/api/vehicles/[id]/paint)
-- have shipped for a while, but the tables they read were never created by a
-- migration — they were hand-made on the old database and lost in the move to
-- Supabase. So the predefined chip list came back empty and nothing displayed.
--
-- This recreates both tables and seeds the catalog with the common panels a
-- smash-repair job paints. Staff can still add more from the app ("Add new
-- paint part"), which inserts into paint_catalog.
--
--   paint_catalog        — the predefined list of paintable parts (the chips).
--   vehicle_paint_items  — which of those a given vehicle is set to paint,
--                          and whether each is still to_paint or painted.
-- ============================================================

create table if not exists paint_catalog (
    id          bigint generated always as identity primary key,
    part_name   text not null unique,
    sort_order  int not null default 0,
    active      boolean not null default true,
    created_at  timestamptz not null default now()
);

-- The POST route uppercases new names, so seed uppercase to match and keep the
-- unique index from splitting 'Bonnet' and 'BONNET' into two chips.
insert into paint_catalog (part_name, sort_order) values
    ('FRONT BUMPER',              1),
    ('REAR BUMPER',              2),
    ('BONNET',                   3),
    ('BOOT',                     4),
    ('ROOF',                     5),
    ('FRONT LEFT GUARD',         6),
    ('FRONT RIGHT GUARD',        7),
    ('FRONT LEFT DOOR',          8),
    ('FRONT RIGHT DOOR',         9),
    ('REAR LEFT DOOR',          10),
    ('REAR RIGHT DOOR',         11),
    ('REAR LEFT QUARTER PANEL', 12),
    ('REAR RIGHT QUARTER PANEL',13),
    ('LEFT SIDE MIRROR',        14),
    ('RIGHT SIDE MIRROR',       15),
    ('TAILGATE',                16),
    ('FUEL FLAP',               17)
on conflict (part_name) do nothing;

create table if not exists vehicle_paint_items (
    id          bigint generated always as identity primary key,
    vehicle_id  bigint not null references vehicles(id) on delete cascade,
    part_name   text not null,
    status      text not null default 'to_paint'
                check (status in ('to_paint', 'painted')),
    created_at  timestamptz not null default now()
);

create index if not exists vehicle_paint_items_vehicle_idx
    on vehicle_paint_items (vehicle_id, created_at);
