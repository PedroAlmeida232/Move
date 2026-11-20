-- Perfil e plano semanal de treino. RLS sem policies: só a API acessa.

create table profiles (
    user_id uuid primary key references users (id) on delete cascade,
    name    text,
    goal    text
);
alter table profiles enable row level security;

create table plan_days (
    id      uuid primary key,
    user_id uuid    not null references users (id) on delete cascade,
    weekday integer not null check (weekday between 0 and 6),
    name    text    not null,
    unique (user_id, weekday)
);
alter table plan_days enable row level security;

create table plan_exercises (
    id          uuid primary key,
    plan_day_id uuid    not null references plan_days (id) on delete cascade,
    position    integer not null,
    name        text    not null,
    sets        integer not null check (sets > 0),
    reps        text    not null,
    side        text,
    note        text,
    unique (plan_day_id, position)
);
alter table plan_exercises enable row level security;
