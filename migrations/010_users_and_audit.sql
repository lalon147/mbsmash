-- ============================================================
-- 010 — Named users, and a full audit trail of every change
--
-- Until now the app had one shared shop password and no notion of who was
-- using it, so nothing could be attributed. This adds:
--
--   users       — one row per staff member, each with their own password.
--   change_log  — one row per changed field, per edit. 'created' and 'deleted'
--                 get a single row with field/old_value/new_value left null.
--
-- Rows in one edit share changed_at exactly, because now() is the transaction
-- start time and every write below runs inside one transaction. The UI groups
-- on that to show "Sam changed price and quantity" as a single entry.
--
-- Passwords are NOT seeded here — hashing needs scrypt, so the three users are
-- created by scripts/create-users.mjs, which prints the generated passwords once.
-- ============================================================

begin;

create table if not exists users (
    id             bigint generated always as identity primary key,
    username       text not null unique,
    display_name   text not null,
    password_hash  text not null,
    active         boolean not null default true,
    created_at     timestamptz not null default now()
);

create table if not exists change_log (
    id           bigint generated always as identity primary key,
    entity_type  text   not null,   -- 'vehicle' | 'order' | 'invoice' | 'photo'
    entity_id    bigint not null,
    -- Every audited record hangs off a vehicle, so the whole history of a car
    -- is one indexed read rather than a query per part and per invoice.
    vehicle_id   bigint references vehicles(id) on delete cascade,
    -- Kept on delete: losing a user must not silently orphan their edits.
    user_id      bigint references users(id) on delete set null,
    action       text not null check (action in ('created', 'updated', 'deleted')),
    field        text,              -- null for created/deleted
    old_value    text,
    new_value    text,
    changed_at   timestamptz not null default now()
);

create index if not exists change_log_entity_idx
    on change_log (entity_type, entity_id, changed_at desc);
create index if not exists change_log_vehicle_idx
    on change_log (vehicle_id, changed_at desc);

commit;
