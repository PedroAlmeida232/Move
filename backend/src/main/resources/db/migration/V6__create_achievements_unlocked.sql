-- Só o que precisa ser guardado: quando cada conquista foi desbloqueada.
-- O catálogo de conquistas fica no código (enum Achievement), sem tabela.
-- A chave primária garante o desbloqueio uma única vez por usuário.
-- RLS sem policies: só a API acessa.
create table achievements_unlocked (
    user_id     uuid        not null references users (id) on delete cascade,
    code        text        not null,
    unlocked_at timestamptz not null,
    primary key (user_id, code)
);
alter table achievements_unlocked enable row level security;
