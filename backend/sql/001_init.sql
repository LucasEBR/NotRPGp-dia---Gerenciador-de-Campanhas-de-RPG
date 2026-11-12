-- NotRPGpédia — schema inicial (Postgres / Supabase)
-- Observação: "usuarios" espelha dados básicos do Supabase Auth (auth.users);
-- id aqui = auth.users.id (uuid), mantido via trigger ou inserido no primeiro login.

create extension if not exists "pgcrypto";

create table if not exists usuarios (
    id uuid primary key,
    nome text not null,
    email text not null unique,
    auth_provider text not null default 'email',
    criado_em timestamptz not null default now()
);

create table if not exists campanhas (
    id uuid primary key default gen_random_uuid(),
    mestre_id uuid not null references usuarios(id) on delete cascade,
    nome text not null,
    sistema_rpg text not null check (sistema_rpg in ('dnd5e', 'tormenta20', 'ordem_paranormal')),
    descricao text,
    qr_code_token text unique,
    qr_code_expira_em timestamptz,
    criado_em timestamptz not null default now()
);

create index if not exists idx_campanhas_mestre on campanhas(mestre_id);

-- N:N jogadores <-> campanhas
create table if not exists campanha_jogadores (
    id uuid primary key default gen_random_uuid(),
    campanha_id uuid not null references campanhas(id) on delete cascade,
    jogador_id uuid not null references usuarios(id) on delete cascade,
    entrou_em timestamptz not null default now(),
    unique (campanha_id, jogador_id)
);

create index if not exists idx_campanha_jogadores_campanha on campanha_jogadores(campanha_id);
create index if not exists idx_campanha_jogadores_jogador on campanha_jogadores(jogador_id);

-- 1:N jogador -> personagens
create table if not exists personagens (
    id uuid primary key default gen_random_uuid(),
    jogador_id uuid not null references usuarios(id) on delete cascade,
    campanha_id uuid not null references campanhas(id) on delete cascade,
    nome text not null,
    sistema_rpg text not null check (sistema_rpg in ('dnd5e', 'tormenta20', 'ordem_paranormal')),
    ficha jsonb not null default '{}'::jsonb,
    avatar_url text,
    criado_em timestamptz not null default now(),
    atualizado_em timestamptz not null default now()
);

create index if not exists idx_personagens_jogador on personagens(jogador_id);
create index if not exists idx_personagens_campanha on personagens(campanha_id);

create table if not exists sessoes (
    id uuid primary key default gen_random_uuid(),
    campanha_id uuid not null references campanhas(id) on delete cascade,
    data date not null,
    hora_inicio time not null,
    hora_fim time not null,
    marcada_com_conflito boolean not null default false,
    criado_em timestamptz not null default now(),
    check (hora_fim > hora_inicio)
);

create index if not exists idx_sessoes_campanha on sessoes(campanha_id);

-- disponibilidade recorrente semanal por jogador, no contexto de uma campanha
create table if not exists disponibilidades (
    id uuid primary key default gen_random_uuid(),
    usuario_id uuid not null references usuarios(id) on delete cascade,
    campanha_id uuid not null references campanhas(id) on delete cascade,
    dia_semana smallint not null check (dia_semana between 0 and 6), -- 0=domingo
    hora_inicio time not null,
    hora_fim time not null,
    disponivel boolean not null default true,
    unique (usuario_id, campanha_id, dia_semana, hora_inicio, hora_fim)
);

create index if not exists idx_disponibilidades_campanha on disponibilidades(campanha_id);
create index if not exists idx_disponibilidades_usuario on disponibilidades(usuario_id);

-- auditoria: quem estava em conflito quando a sessão foi marcada mesmo assim
create table if not exists sessao_conflitos (
    id uuid primary key default gen_random_uuid(),
    sessao_id uuid not null references sessoes(id) on delete cascade,
    usuario_id uuid not null references usuarios(id) on delete cascade,
    motivo text not null default 'indisponivel',
    criado_em timestamptz not null default now()
);

create index if not exists idx_sessao_conflitos_sessao on sessao_conflitos(sessao_id);
