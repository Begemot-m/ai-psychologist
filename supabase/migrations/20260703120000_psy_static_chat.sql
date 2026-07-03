-- Таблицы для статического прототипа (GitHub Pages + Edge Function psy-chat):
-- кэш типовых ответов и дневные квоты на генерацию.

create table if not exists public.psy_cache (
  key text primary key,          -- sha256(model | нормализованное сообщение)
  reply text not null,
  model text not null default '',
  hits integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.psy_usage (
  device_id text not null,
  day date not null,
  used integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (device_id, day)
);

create index if not exists psy_usage_day_idx on public.psy_usage (day);

-- Доступ только сервисной ролью из Edge Function: RLS включён, политик нет,
-- поэтому anon/authenticated через PostgREST не читают и не пишут ничего.
alter table public.psy_cache enable row level security;
alter table public.psy_usage enable row level security;