create table users (
    id           uuid primary key,
    firebase_uid text not null unique,
    email        text,
    created_at   timestamptz not null default now()
);

-- RLS sem policies: a API pública do Supabase não expõe os dados.
-- Toda tabela nova repete isso.
alter table users enable row level security;
