# ai-psychologist

Прототип Telegram Mini App «AI-психолог» — бережное психологическое сопровождение со встроенным
кризисным слоем безопасности, подбором модулей/подходов и базой знаний (RAG).

См. [PLAN.md](./PLAN.md) и [ARCHITECTURE.md](./ARCHITECTURE.md).

## Стек

Next.js 16 (App Router, TS, Tailwind) · Supabase + pgvector · Anthropic (Sonnet/Haiku) ·
Voyage AI (эмбеддинги) · grammY (Telegram-бот) · bun

## Что нужно подготовить перед запуском

1. **Bun** — `npm install -g bun`.
2. **Supabase-проект** — создать на supabase.com, включить расширение `vector`, взять
   `Project URL`, `service_role key`, `anon key`.
3. **Telegram-бот** — создать через [@BotFather](https://t.me/BotFather), получить токен,
   настроить Mini App (Bot Settings → Menu Button / Web App) на URL задеплоенного приложения.
4. **Anthropic API key** — console.anthropic.com.
5. **Voyage AI API key** — voyage AI (бесплатный trial-тир), используется для эмбеддингов RAG.

## Установка

```bash
bun install
cp .env.example .env
# заполнить .env реальными значениями из шагов выше
```

## База данных

Выполнить миграции из `db/migrations/` по порядку (через Supabase SQL Editor или `psql`):

```
0001_init.sql
0002_onboarding.sql
0003_seed_modules.sql
0004_rag_match_function.sql
0005_conversation_summary.sql
```

## База знаний (RAG)

Положить разрешённые материалы в `lib/rag/ingest-source/<namespace>/*.md`
(namespace — `burnout` или `self_esteem`, см. `config/modules/*.json`), затем:

```bash
bun run rag:ingest
```

## Запуск

```bash
bun run dev          # мини-апп на http://localhost:3000
bun run bot:dev       # Telegram-бот в режиме long-polling (для локальной разработки)
```

Для продакшена мини-апп деплоится на Vercel, а вебхук бота указывается на
`https://<домен>/api/telegram/webhook` (через `setWebhook` Bot API), с секретом из
`TELEGRAM_WEBHOOK_SECRET`.

Открыть мини-апп можно только через Telegram (кнопка из `/start` бота) — вне Telegram
`initData` не валидируется и показывается экран «Откройте приложение через Telegram».

## Быстрый тест в браузере (без Telegram)

В режиме разработки (`bun run dev`, `NODE_ENV=development`) `/api/auth` принимает заголовок
`x-dev-bypass: true` вместо настоящей `initData` и логинит фиксированного тестового
пользователя — `app/telegram-provider.tsx` делает это автоматически, если страница открыта не
из Telegram. Этот обход полностью отключён при `NODE_ENV=production`.

Минимум для живого теста онбординга → маркетплейса → чата в обычном браузере:

1. реальный Supabase-проект с накаченными миграциями (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`);
2. реальный `ANTHROPIC_API_KEY`.

`VOYAGE_API_KEY` и `TELEGRAM_BOT_TOKEN` можно оставить пустыми — RAG-контекст просто не
подключится (чат всё равно ответит), а бот не нужен для теста в браузере.

## Структура

См. раздел «Структура репозитория» в [ARCHITECTURE.md](./ARCHITECTURE.md).
