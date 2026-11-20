-- Treinos feitos. Datas em UTC; o app converte para o fuso local.
-- RLS sem policies: só a API acessa.

create table workout_sessions (
    id           uuid primary key,
    user_id      uuid        not null references users (id) on delete cascade,
    performed_at timestamptz not null,
    name         text
);
create index workout_sessions_user_performed_at on workout_sessions (user_id, performed_at);
alter table workout_sessions enable row level security;

-- O exercício é gravado pelo nome: o histórico sobrevive à edição do plano.
create table workout_sets (
    id            uuid primary key,
    session_id    uuid          not null references workout_sessions (id) on delete cascade,
    position      integer       not null,
    exercise_name text          not null,
    weight_kg     numeric(6, 2) not null check (weight_kg >= 0),
    reps          integer       not null check (reps >= 0),
    unique (session_id, position)
);
alter table workout_sets enable row level security;
