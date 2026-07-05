-- ============================================================
-- MB Smash Repair — Migration 004: accident photos per vehicle
-- ============================================================
BEGIN;

create table if not exists vehicle_photos (
    id          bigint generated always as identity primary key,
    vehicle_id  bigint not null references vehicles(id) on delete cascade,
    data_url    text not null,          -- resized JPEG stored as a data URL
    created_at  timestamptz not null default now()
);

create index if not exists vehicle_photos_vehicle_idx on vehicle_photos (vehicle_id);

COMMIT;
