create extension if not exists pgcrypto;
create extension if not exists vector;

create table users (
  id uuid primary key default gen_random_uuid(),
  telegram_id bigint not null unique,
  username text,
  created_at timestamptz not null default now()
);

create table modules (
  id text primary key,
  title text not null,
  approach text not null,
  kb_namespace text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  module_id text references modules(id),
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  is_crisis boolean not null default false,
  created_at timestamptz not null default now()
);
create index messages_crisis_idx on messages (conversation_id) where is_crisis;

create table usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  conversation_id uuid references conversations(id) on delete set null,
  model text not null,
  input_tokens integer not null default 0,
  output_tokens integer not null default 0,
  created_at timestamptz not null default now()
);

create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references users(id) on delete cascade,
  tier text not null default 'free' check (tier in ('free', 'paid')),
  expires_at timestamptz,
  telegram_payment_charge_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- voyage-multilingual-2 выдаёт векторы размерности 1024
create table knowledge_chunks (
  id uuid primary key default gen_random_uuid(),
  kb_namespace text not null,
  source text,
  content text not null,
  embedding vector(1024) not null,
  created_at timestamptz not null default now()
);
create index knowledge_chunks_namespace_idx on knowledge_chunks (kb_namespace);
create index knowledge_chunks_embedding_idx on knowledge_chunks
  using ivfflat (embedding vector_cosine_ops) with (lists = 100);
