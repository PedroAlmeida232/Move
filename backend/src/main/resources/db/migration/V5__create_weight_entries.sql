-- Peso e medidas. entry_date é o dia local de quem se pesou; um registro por dia.
-- RLS sem policies: só a API acessa.
create table weight_entries (
    user_id    uuid          not null references users (id) on delete cascade,
    entry_date date          not null,
    weight_kg  numeric(4, 1) not null check (weight_kg between 20 and 400),
    waist_cm   numeric(4, 1) check (waist_cm between 20 and 300),
    primary key (user_id, entry_date)
);
alter table weight_entries enable row level security;
