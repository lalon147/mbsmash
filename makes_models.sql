-- ============================================================
-- MAKES & MODELS — schema additions + starter seed
-- Run AFTER schema.sql (and any time; uses drop-if-exists).
-- ============================================================

drop table if exists models cascade;
drop table if exists makes cascade;

create table makes (
    id    bigint generated always as identity primary key,
    name  text not null unique
);

create table models (
    id       bigint generated always as identity primary key,
    make_id  bigint not null references makes(id) on delete cascade,
    name     text not null,
    unique (make_id, name)
);
create index models_make_idx on models (make_id);

-- Link vehicles to makes/models (nullable; free-text still allowed as fallback)
alter table vehicles add column if not exists make_id  bigint references makes(id)  on delete set null;
alter table vehicles add column if not exists model_id bigint references models(id) on delete set null;

-- Seed makes
insert into makes (name) values ('Toyota');
insert into makes (name) values ('Lexus');
insert into makes (name) values ('Mazda');
insert into makes (name) values ('Nissan');
insert into makes (name) values ('Honda');
insert into makes (name) values ('Hyundai');
insert into makes (name) values ('Kia');
insert into makes (name) values ('Mitsubishi');
insert into makes (name) values ('Ford');
insert into makes (name) values ('Volkswagen');
insert into makes (name) values ('Subaru');
insert into makes (name) values ('Holden');
insert into makes (name) values ('BMW');
insert into makes (name) values ('Mercedes-Benz');
insert into makes (name) values ('Audi');
insert into makes (name) values ('Suzuki');
insert into makes (name) values ('Isuzu');
insert into makes (name) values ('Volvo');
insert into makes (name) values ('GWM');
insert into makes (name) values ('MG');

-- Seed models
insert into models (make_id, name) values ((select id from makes where name = 'Toyota'), 'Corolla');
insert into models (make_id, name) values ((select id from makes where name = 'Toyota'), 'Camry');
insert into models (make_id, name) values ((select id from makes where name = 'Toyota'), 'Kluger');
insert into models (make_id, name) values ((select id from makes where name = 'Toyota'), 'RAV4');
insert into models (make_id, name) values ((select id from makes where name = 'Toyota'), 'Hilux');
insert into models (make_id, name) values ((select id from makes where name = 'Toyota'), 'LandCruiser');
insert into models (make_id, name) values ((select id from makes where name = 'Toyota'), 'Prado');
insert into models (make_id, name) values ((select id from makes where name = 'Toyota'), 'Yaris');
insert into models (make_id, name) values ((select id from makes where name = 'Toyota'), 'C-HR');
insert into models (make_id, name) values ((select id from makes where name = 'Toyota'), 'Fortuner');
insert into models (make_id, name) values ((select id from makes where name = 'Toyota'), '86');
insert into models (make_id, name) values ((select id from makes where name = 'Lexus'), 'IS');
insert into models (make_id, name) values ((select id from makes where name = 'Lexus'), 'ES');
insert into models (make_id, name) values ((select id from makes where name = 'Lexus'), 'RX');
insert into models (make_id, name) values ((select id from makes where name = 'Lexus'), 'NX');
insert into models (make_id, name) values ((select id from makes where name = 'Lexus'), 'UX');
insert into models (make_id, name) values ((select id from makes where name = 'Lexus'), 'LX');
insert into models (make_id, name) values ((select id from makes where name = 'Lexus'), 'LS');
insert into models (make_id, name) values ((select id from makes where name = 'Lexus'), 'GX');
insert into models (make_id, name) values ((select id from makes where name = 'Mazda'), 'Mazda2');
insert into models (make_id, name) values ((select id from makes where name = 'Mazda'), 'Mazda3');
insert into models (make_id, name) values ((select id from makes where name = 'Mazda'), 'Mazda6');
insert into models (make_id, name) values ((select id from makes where name = 'Mazda'), 'CX-3');
insert into models (make_id, name) values ((select id from makes where name = 'Mazda'), 'CX-30');
insert into models (make_id, name) values ((select id from makes where name = 'Mazda'), 'CX-5');
insert into models (make_id, name) values ((select id from makes where name = 'Mazda'), 'CX-8');
insert into models (make_id, name) values ((select id from makes where name = 'Mazda'), 'CX-9');
insert into models (make_id, name) values ((select id from makes where name = 'Mazda'), 'BT-50');
insert into models (make_id, name) values ((select id from makes where name = 'Mazda'), 'MX-5');
insert into models (make_id, name) values ((select id from makes where name = 'Nissan'), 'Micra');
insert into models (make_id, name) values ((select id from makes where name = 'Nissan'), 'Pulsar');
insert into models (make_id, name) values ((select id from makes where name = 'Nissan'), 'X-Trail');
insert into models (make_id, name) values ((select id from makes where name = 'Nissan'), 'Qashqai');
insert into models (make_id, name) values ((select id from makes where name = 'Nissan'), 'Navara');
insert into models (make_id, name) values ((select id from makes where name = 'Nissan'), 'Patrol');
insert into models (make_id, name) values ((select id from makes where name = 'Nissan'), 'Juke');
insert into models (make_id, name) values ((select id from makes where name = 'Nissan'), 'Pathfinder');
insert into models (make_id, name) values ((select id from makes where name = 'Nissan'), 'Leaf');
insert into models (make_id, name) values ((select id from makes where name = 'Honda'), 'Jazz');
insert into models (make_id, name) values ((select id from makes where name = 'Honda'), 'Civic');
insert into models (make_id, name) values ((select id from makes where name = 'Honda'), 'Accord');
insert into models (make_id, name) values ((select id from makes where name = 'Honda'), 'CR-V');
insert into models (make_id, name) values ((select id from makes where name = 'Honda'), 'HR-V');
insert into models (make_id, name) values ((select id from makes where name = 'Honda'), 'Odyssey');
insert into models (make_id, name) values ((select id from makes where name = 'Hyundai'), 'i20');
insert into models (make_id, name) values ((select id from makes where name = 'Hyundai'), 'i30');
insert into models (make_id, name) values ((select id from makes where name = 'Hyundai'), 'Accent');
insert into models (make_id, name) values ((select id from makes where name = 'Hyundai'), 'Elantra');
insert into models (make_id, name) values ((select id from makes where name = 'Hyundai'), 'Kona');
insert into models (make_id, name) values ((select id from makes where name = 'Hyundai'), 'Tucson');
insert into models (make_id, name) values ((select id from makes where name = 'Hyundai'), 'Santa Fe');
insert into models (make_id, name) values ((select id from makes where name = 'Hyundai'), 'Venue');
insert into models (make_id, name) values ((select id from makes where name = 'Hyundai'), 'iLoad');
insert into models (make_id, name) values ((select id from makes where name = 'Kia'), 'Picanto');
insert into models (make_id, name) values ((select id from makes where name = 'Kia'), 'Rio');
insert into models (make_id, name) values ((select id from makes where name = 'Kia'), 'Cerato');
insert into models (make_id, name) values ((select id from makes where name = 'Kia'), 'Seltos');
insert into models (make_id, name) values ((select id from makes where name = 'Kia'), 'Sportage');
insert into models (make_id, name) values ((select id from makes where name = 'Kia'), 'Sorento');
insert into models (make_id, name) values ((select id from makes where name = 'Kia'), 'Carnival');
insert into models (make_id, name) values ((select id from makes where name = 'Kia'), 'Stinger');
insert into models (make_id, name) values ((select id from makes where name = 'Mitsubishi'), 'Mirage');
insert into models (make_id, name) values ((select id from makes where name = 'Mitsubishi'), 'ASX');
insert into models (make_id, name) values ((select id from makes where name = 'Mitsubishi'), 'Eclipse Cross');
insert into models (make_id, name) values ((select id from makes where name = 'Mitsubishi'), 'Outlander');
insert into models (make_id, name) values ((select id from makes where name = 'Mitsubishi'), 'Pajero');
insert into models (make_id, name) values ((select id from makes where name = 'Mitsubishi'), 'Pajero Sport');
insert into models (make_id, name) values ((select id from makes where name = 'Mitsubishi'), 'Triton');
insert into models (make_id, name) values ((select id from makes where name = 'Ford'), 'Fiesta');
insert into models (make_id, name) values ((select id from makes where name = 'Ford'), 'Focus');
insert into models (make_id, name) values ((select id from makes where name = 'Ford'), 'Mondeo');
insert into models (make_id, name) values ((select id from makes where name = 'Ford'), 'Puma');
insert into models (make_id, name) values ((select id from makes where name = 'Ford'), 'Escape');
insert into models (make_id, name) values ((select id from makes where name = 'Ford'), 'Everest');
insert into models (make_id, name) values ((select id from makes where name = 'Ford'), 'Ranger');
insert into models (make_id, name) values ((select id from makes where name = 'Ford'), 'Mustang');
insert into models (make_id, name) values ((select id from makes where name = 'Volkswagen'), 'Polo');
insert into models (make_id, name) values ((select id from makes where name = 'Volkswagen'), 'Golf');
insert into models (make_id, name) values ((select id from makes where name = 'Volkswagen'), 'Passat');
insert into models (make_id, name) values ((select id from makes where name = 'Volkswagen'), 'T-Cross');
insert into models (make_id, name) values ((select id from makes where name = 'Volkswagen'), 'T-Roc');
insert into models (make_id, name) values ((select id from makes where name = 'Volkswagen'), 'Tiguan');
insert into models (make_id, name) values ((select id from makes where name = 'Volkswagen'), 'Touareg');
insert into models (make_id, name) values ((select id from makes where name = 'Volkswagen'), 'Amarok');
insert into models (make_id, name) values ((select id from makes where name = 'Subaru'), 'Impreza');
insert into models (make_id, name) values ((select id from makes where name = 'Subaru'), 'WRX');
insert into models (make_id, name) values ((select id from makes where name = 'Subaru'), 'Liberty');
insert into models (make_id, name) values ((select id from makes where name = 'Subaru'), 'XV');
insert into models (make_id, name) values ((select id from makes where name = 'Subaru'), 'Forester');
insert into models (make_id, name) values ((select id from makes where name = 'Subaru'), 'Outback');
insert into models (make_id, name) values ((select id from makes where name = 'Subaru'), 'BRZ');
insert into models (make_id, name) values ((select id from makes where name = 'Holden'), 'Barina');
insert into models (make_id, name) values ((select id from makes where name = 'Holden'), 'Cruze');
insert into models (make_id, name) values ((select id from makes where name = 'Holden'), 'Commodore');
insert into models (make_id, name) values ((select id from makes where name = 'Holden'), 'Astra');
insert into models (make_id, name) values ((select id from makes where name = 'Holden'), 'Trax');
insert into models (make_id, name) values ((select id from makes where name = 'Holden'), 'Captiva');
insert into models (make_id, name) values ((select id from makes where name = 'Holden'), 'Colorado');
insert into models (make_id, name) values ((select id from makes where name = 'BMW'), '1 Series');
insert into models (make_id, name) values ((select id from makes where name = 'BMW'), '2 Series');
insert into models (make_id, name) values ((select id from makes where name = 'BMW'), '3 Series');
insert into models (make_id, name) values ((select id from makes where name = 'BMW'), '5 Series');
insert into models (make_id, name) values ((select id from makes where name = 'BMW'), 'X1');
insert into models (make_id, name) values ((select id from makes where name = 'BMW'), 'X3');
insert into models (make_id, name) values ((select id from makes where name = 'BMW'), 'X5');
insert into models (make_id, name) values ((select id from makes where name = 'Mercedes-Benz'), 'A-Class');
insert into models (make_id, name) values ((select id from makes where name = 'Mercedes-Benz'), 'C-Class');
insert into models (make_id, name) values ((select id from makes where name = 'Mercedes-Benz'), 'E-Class');
insert into models (make_id, name) values ((select id from makes where name = 'Mercedes-Benz'), 'GLA');
insert into models (make_id, name) values ((select id from makes where name = 'Mercedes-Benz'), 'GLC');
insert into models (make_id, name) values ((select id from makes where name = 'Mercedes-Benz'), 'GLE');
insert into models (make_id, name) values ((select id from makes where name = 'Audi'), 'A1');
insert into models (make_id, name) values ((select id from makes where name = 'Audi'), 'A3');
insert into models (make_id, name) values ((select id from makes where name = 'Audi'), 'A4');
insert into models (make_id, name) values ((select id from makes where name = 'Audi'), 'Q2');
insert into models (make_id, name) values ((select id from makes where name = 'Audi'), 'Q3');
insert into models (make_id, name) values ((select id from makes where name = 'Audi'), 'Q5');
insert into models (make_id, name) values ((select id from makes where name = 'Audi'), 'Q7');
insert into models (make_id, name) values ((select id from makes where name = 'Suzuki'), 'Swift');
insert into models (make_id, name) values ((select id from makes where name = 'Suzuki'), 'Baleno');
insert into models (make_id, name) values ((select id from makes where name = 'Suzuki'), 'Vitara');
insert into models (make_id, name) values ((select id from makes where name = 'Suzuki'), 'S-Cross');
insert into models (make_id, name) values ((select id from makes where name = 'Suzuki'), 'Jimny');
insert into models (make_id, name) values ((select id from makes where name = 'Isuzu'), 'D-Max');
insert into models (make_id, name) values ((select id from makes where name = 'Isuzu'), 'MU-X');
insert into models (make_id, name) values ((select id from makes where name = 'Volvo'), 'XC40');
insert into models (make_id, name) values ((select id from makes where name = 'Volvo'), 'XC60');
insert into models (make_id, name) values ((select id from makes where name = 'Volvo'), 'XC90');
insert into models (make_id, name) values ((select id from makes where name = 'Volvo'), 'S60');
insert into models (make_id, name) values ((select id from makes where name = 'GWM'), 'Haval H6');
insert into models (make_id, name) values ((select id from makes where name = 'GWM'), 'Haval Jolion');
insert into models (make_id, name) values ((select id from makes where name = 'GWM'), 'Ute');
insert into models (make_id, name) values ((select id from makes where name = 'MG'), 'MG3');
insert into models (make_id, name) values ((select id from makes where name = 'MG'), 'ZS');
insert into models (make_id, name) values ((select id from makes where name = 'MG'), 'HS');
