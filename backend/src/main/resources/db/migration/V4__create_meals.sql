-- Refeições e metas de dieta. RLS sem policies: só a API acessa.

-- eaten_on é o dia local de quem comeu (o app manda a data, não um instante UTC).
create table meals (
    id         uuid primary key,
    user_id    uuid          not null references users (id) on delete cascade,
    eaten_on   date          not null,
    name       text          not null,
    kcal       integer       not null check (kcal >= 0),
    protein_g  numeric(5, 1) not null check (protein_g >= 0),
    carbs_g    numeric(5, 1) not null check (carbs_g >= 0),
    fat_g      numeric(5, 1) not null check (fat_g >= 0),
    created_at timestamptz   not null default now()
);
create index meals_user_eaten_on on meals (user_id, eaten_on);
alter table meals enable row level security;

-- Sem linha: vale a meta padrão do protótipo (2000 kcal, 140 g de proteína).
create table diet_goals (
    user_id   uuid    primary key references users (id) on delete cascade,
    kcal      integer not null check (kcal > 0),
    protein_g integer not null check (protein_g >= 0)
);
alter table diet_goals enable row level security;
