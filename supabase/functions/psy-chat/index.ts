// Edge Function psy-chat — серверный прокси к Groq для статического прототипа
// на GitHub Pages. Ключ Groq живёт только здесь (секреты Supabase), на клиент
// не попадает. Экономия: кэш типовых ответов в psy_cache, дневная квота
// per-device и глобальный дневной потолок в psy_usage. Кризисные сообщения
// перехватываются до LLM и получают фиксированный протокол.

import { createClient } from "jsr:@supabase/supabase-js@2";

const ALLOWED_ORIGINS = new Set([
  "https://begemot-m.github.io",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
]);

const DAILY_LIMIT = Number(Deno.env.get("PSY_DAILY_LIMIT") ?? "20");
const GLOBAL_DAILY_LIMIT = Number(Deno.env.get("PSY_GLOBAL_DAILY_LIMIT") ?? "300");
const MODEL = Deno.env.get("PSY_GROQ_MODEL") || "llama-3.3-70b-versatile";
const MAX_BODY_BYTES = 24 * 1024;

const SYSTEM_PROMPT = `Ты — ассистент бережной психологической поддержки. Твоя роль — сопровождать человека, а не руководить им.

Стиль:
- Пиши по-русски, на «ты», тепло, но по делу. 2–5 коротких предложений.
- Никакого поддакивания и дежурной похвалы. Не начинай с «Отлично», «Прекрасный вопрос», «Понимаю тебя» без содержания.
- Не пересказывай слова человека своими словами без цели. Не давай списков советов, пока прямо не попросили.
- В одном ответе — одна мысль и максимум один вопрос.

Метод:
- Сначала проясни состояние и контекст, потом предлагай один маленький конкретный шаг.
- Опирайся на проверенные подходы: КПТ (работа с мыслями), ACT (ценности и принятие), гештальт (чувства и потребности), майндфулнес (дыхание, заземление).
- Не обесценивай чувства и не спорь с болью. Не решай за человека, что ему делать.
- Если человек просит технику (4-7-8, заземление 5-4-3-2-1, разбор мысли, самосострадание) — веди по шагам, по одному шагу за сообщение, дожидаясь ответа.

Границы безопасности:
- Ты не врач и не психотерапевт: никаких диагнозов, препаратов, дозировок и обещаний результата.
- Живой специалист важнее любого чата — мягко напоминай об этом, когда уместно.
- Если человек пишет о желании умереть, самоповреждении или насилии — прекрати обычный диалог: признай тяжесть, скажи, что он не один, направь к экстренной помощи (112, телефон доверия 8-800-2000-122) и к живому человеку рядом.`;

// Выбранный пользователем подход определяет, КАК ассистент ведёт разговор.
const APPROACH_PROMPTS: Record<string, string> = {
  cbt: `Выбранный подход: КПТ. Работай по протоколам когнитивно-поведенческой терапии: помогай замечать автоматические мысли, называть когнитивные искажения, проверять мысли фактами через сократический диалог. Предлагай структурированные упражнения — дневник мыслей СМЭР, поведенческие эксперименты, шкалирование тревоги 0–10. Веди протоколы по шагам, по одному шагу за сообщение.`,
  psycho: `Выбранный подход: психоанализ. Работай в психоаналитическом ключе: свободные ассоциации, повторяющиеся паттерны, детский опыт, сны, защитные механизмы. Не давай протоколов и упражнений — исследуй связи и предлагай интерпретации осторожно, как гипотезы («возможно…», «как будто…»), оставляя человеку право не согласиться.`,
  gestalt: `Выбранный подход: гештальт. Фокус на «здесь и сейчас», чувствах и телесных ощущениях, неудовлетворённых потребностях. Помогай переводить рассказ о событиях в контакт с переживанием («что ты чувствуешь, когда говоришь это?»), предлагай эксперименты: пустой стул, усиление чувства, я-высказывания.`,
  mindful: `Выбранный подход: ACT и майндфулнес. Работай через принятие и осознанность: помогай замечать мысли на расстоянии (когнитивная разделённость), возвращаться к дыханию и телу, опираться на ценности и делать маленькие шаги в их сторону. Предлагай короткие практики осознанности по шагам.`,
  positive: `Выбранный подход: позитивная психотерапия (по Пезешкиану). Опирайся на ресурсы и сильные стороны человека, а не только на проблему. Используй баланс сфер жизни (тело, деятельность, контакты, смысл), метафоры и притчи, помогай увидеть в трудности точку роста. Мягко, без обесценивания.`,
};

// Направление (тема) выбирает «банк» материалов и фокус разговора.
const TOPIC_HINTS: Record<string, string> = {
  anxiety: "Основная тема — тревога и стресс. Опирайся на материалы по работе с тревогой: тревожные мысли, телесное напряжение, избегание, паника.",
  relationships: "Основная тема — отношения (партнёр, семья, близкие). Опирайся на материалы по коммуникации, границам, привязанности и конфликтам.",
  self_esteem: "Основная тема — самооценка и самокритика. Опирайся на материалы по самоценности, работе с внутренним критиком и сравнением себя с другими.",
  burnout: "Основная тема — выгорание и усталость. Опирайся на материалы по ресурсам, восстановлению, границам нагрузки и балансу.",
  mood: "Основная тема — сниженное настроение и апатия. Опирайся на материалы по поведенческой активации и работе с ангедонией. Будь особенно внимателен к признакам кризиса.",
  meaning: "Основная тема — поиск себя, ценности и смысл. Опирайся на материалы по ценностям, жизненным выборам и самоопределению.",
};

const CRISIS_REPLY = `Мне важно, что ты написал об этом — на такое нужна смелость.

Похоже, тебе сейчас по-настоящему тяжело. С таким состоянием не стоит оставаться один на один, и честнее сказать прямо: я ассистент, и моих возможностей здесь мало.

Пожалуйста, обратись к живым людям, которые могут помочь прямо сейчас:
• Экстренная помощь — 112
• Телефон доверия (бесплатно, круглосуточно) — 8-800-2000-122

Если рядом есть человек, которому доверяешь — близкий, друг, врач — позвони или напиши ему прямо сейчас. Я останусь здесь и продолжу разговор, когда захочешь.`;

// Грубый детектор кризиса до LLM: лучше ложное срабатывание, чем пропуск.
const CRISIS_PATTERNS: RegExp[] = [
  /суицид/i,
  /покончить с собой/i,
  /не хочу (больше )?жить/i,
  /убить себя/i,
  /убью себя/i,
  /самоповрежден/i,
  /режу себя/i,
  /порезать (себя|вены)/i,
  /вскрыть вены/i,
  /повеситься/i,
  /спрыгнуть с (крыши|моста)/i,
  /наглотаться таблеток/i,
  /передозировк/i,
  /хочу умереть/i,
  /лучше бы (я|меня) умер/i,
  /причин(ить|ю) (себе|ему|ей) вред/i,
];

type ChatMessage = { role: "user" | "assistant"; content: string };

function corsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("Origin") ?? "";
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGINS.has(origin) ? origin : "https://begemot-m.github.io",
    "Access-Control-Allow-Headers": "authorization, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
}

function json(req: Request, body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(req), "Content-Type": "application/json" },
  });
}

function adminClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
}

/** Нормализация для ключа кэша: регистр, ё, пунктуация, пробелы. */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .replaceAll("ё", "е")
    .replace(/[^a-zа-я0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

async function sha256(text: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function callGroq(system: string, messages: ChatMessage[]): Promise<string> {
  const apiKey = Deno.env.get("PSY_GROQ_API_KEY") || Deno.env.get("GROQ_API_KEY");
  if (!apiKey) throw new Error("Groq API key is not configured");
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.6,
      max_tokens: 400,
      messages: [{ role: "system", content: system }, ...messages],
    }),
  });
  if (!response.ok) {
    console.error("Groq error:", response.status, await response.text().catch(() => ""));
    throw new Error("AI provider error");
  }
  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error("Empty AI response");
  return String(text).trim();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders(req) });
  if (req.method !== "POST") return json(req, { error: "Method not allowed" }, 405);

  const origin = req.headers.get("Origin");
  if (origin && !ALLOWED_ORIGINS.has(origin)) return json(req, { error: "Forbidden" }, 403);

  try {
    const raw = await req.text();
    if (raw.length > MAX_BODY_BYTES) return json(req, { error: "Payload too large" }, 413);
    let body: { deviceId?: unknown; messages?: unknown };
    try {
      body = JSON.parse(raw);
    } catch {
      return json(req, { error: "Invalid JSON" }, 400);
    }

    const bodyApproach = (body as { approach?: unknown }).approach;
    const approach = typeof bodyApproach === "string" && bodyApproach in APPROACH_PROMPTS ? bodyApproach : "cbt";
    const bodyTopic = (body as { topic?: unknown }).topic;
    const topic = typeof bodyTopic === "string" && bodyTopic in TOPIC_HINTS ? bodyTopic : "";
    const system = [SYSTEM_PROMPT, topic ? TOPIC_HINTS[topic] : "", APPROACH_PROMPTS[approach]]
      .filter(Boolean)
      .join("\n\n");

    const deviceId = typeof body.deviceId === "string" ? body.deviceId : "";
    if (!/^[a-z0-9-]{8,64}$/i.test(deviceId)) return json(req, { error: "Bad deviceId" }, 400);

    const rawMessages = Array.isArray(body.messages) ? body.messages : [];
    const messages: ChatMessage[] = rawMessages
      .filter(
        (m): m is ChatMessage =>
          !!m &&
          typeof m === "object" &&
          ((m as ChatMessage).role === "user" || (m as ChatMessage).role === "assistant") &&
          typeof (m as ChatMessage).content === "string",
      )
      .slice(-12)
      .map((m) => ({ role: m.role, content: m.content.slice(0, 1200).trim() }))
      .filter((m) => m.content.length > 0);

    const last = messages[messages.length - 1];
    if (!last || last.role !== "user") return json(req, { error: "Last message must be from user" }, 400);

    const db = adminClient();
    const today = new Date().toISOString().slice(0, 10);

    const { data: usageRow } = await db
      .from("psy_usage")
      .select("used")
      .eq("device_id", deviceId)
      .eq("day", today)
      .maybeSingle();
    const used = usageRow?.used ?? 0;

    // Кризис — фиксированный протокол: без LLM, без квоты, всегда доступен.
    if (CRISIS_PATTERNS.some((p) => p.test(last.content))) {
      return json(req, { reply: CRISIS_REPLY, crisis: true, cached: false, remaining: Math.max(0, DAILY_LIMIT - used) });
    }

    // Кэш типовых открывающих сообщений: короткая фраза в начале диалога.
    const norm = normalize(last.content);
    const cacheable = messages.length <= 2 && norm.length > 0 && norm.length <= 120;
    const cacheKey = cacheable ? await sha256(`${MODEL}|${topic}|${approach}|${norm}`) : "";
    if (cacheable) {
      const { data: hit } = await db.from("psy_cache").select("reply, hits").eq("key", cacheKey).maybeSingle();
      if (hit) {
        db.from("psy_cache").update({ hits: hit.hits + 1 }).eq("key", cacheKey).then(() => {});
        return json(req, { reply: hit.reply, cached: true, remaining: Math.max(0, DAILY_LIMIT - used) });
      }
    }

    // Квоты: сначала персональная, затем глобальный потолок на день.
    if (used >= DAILY_LIMIT) return json(req, { error: "daily_limit", remaining: 0 }, 429);
    const { data: dayRows } = await db.from("psy_usage").select("used").eq("day", today);
    const totalToday = (dayRows ?? []).reduce((sum, r) => sum + (r.used ?? 0), 0);
    if (totalToday >= GLOBAL_DAILY_LIMIT) return json(req, { error: "global_limit", remaining: Math.max(0, DAILY_LIMIT - used) }, 429);

    const reply = await callGroq(system, messages);

    await db.from("psy_usage").upsert({
      device_id: deviceId,
      day: today,
      used: used + 1,
      updated_at: new Date().toISOString(),
    });
    if (cacheable) {
      await db.from("psy_cache").upsert({ key: cacheKey, reply, model: MODEL });
    }

    return json(req, { reply, cached: false, remaining: Math.max(0, DAILY_LIMIT - used - 1) });
  } catch (err) {
    console.error("psy-chat error:", err);
    return json(req, { error: "Internal error" }, 500);
  }
});