// Статический прототип для GitHub Pages: чат — главный экран.
// Онбординг = конструктор: шаг 1 «направление работы» (тема выбирает банк
// литературы/подходов), шаг 2 «метод» (в базе только КПТ, остальное — премиум).
// Тема и метод хранятся на каждый чат, уходят на сервер и меняют системный
// промпт нейронки. Пересобрать ассистента можно из настроек и при новом чате.

import { AnimatePresence, motion } from "framer-motion";
import {
  Brain,
  ChevronLeft,
  Compass,
  Flame,
  Flower2,
  HeartHandshake,
  History,
  Leaf,
  Lock,
  Moon,
  Orbit,
  Plus,
  Send,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  Sun,
  Trash2,
  Waves,
  Wind,
  X,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

const FN_URL = "https://abdlkghlchczwenobvkx.supabase.co/functions/v1/psy-chat";
const DAILY_LIMIT = 20;

type Role = "assistant" | "user";
type Message = { id: string; role: Role; text: string; system?: boolean };
type TopicId = "anxiety" | "relationships" | "self_esteem" | "burnout" | "mood" | "meaning";
type MethodId = "cbt" | "psycho" | "gestalt" | "positive";
type Tone = "lavender" | "pink" | "green" | "sun";
type Chat = { id: string; topic: TopicId; method: MethodId; title: string; messages: Message[]; updatedAt: number };
type Sheet = "none" | "techniques" | "profile" | "history" | "config";

const topics: Array<{ id: TopicId; title: string; caption: string; icon: LucideIcon; tone: Tone }> = [
  { id: "anxiety", title: "Тревога и стресс", caption: "беспокойство, паника, напряжение", icon: Wind, tone: "lavender" },
  { id: "relationships", title: "Отношения", caption: "близкие, партнёр, семья", icon: HeartHandshake, tone: "pink" },
  { id: "self_esteem", title: "Самооценка", caption: "самокритика, сравнение с другими", icon: Star, tone: "sun" },
  { id: "burnout", title: "Выгорание", caption: "усталость, нет сил, всё бесит", icon: Flame, tone: "pink" },
  { id: "mood", title: "Настроение и апатия", caption: "пусто, ничего не хочется", icon: Moon, tone: "green" },
  { id: "meaning", title: "Поиск себя", caption: "ценности, выборы, смысл", icon: Compass, tone: "lavender" },
];

const methods: Array<{
  id: MethodId;
  title: string;
  caption: string;
  icon: LucideIcon;
  tone: Tone;
  premium: boolean;
  greet: (topicLower: string) => string;
}> = [
  {
    id: "cbt",
    title: "КПТ",
    caption: "мысли, протоколы, маленькие шаги",
    icon: Brain,
    tone: "lavender",
    premium: false,
    greet: (t) =>
      `Я рядом. Тема — ${t}. Будем работать по КПТ: замечать мысли, проверять их на факты и пробовать маленькие шаги. С чего хочется начать?`,
  },
  {
    id: "psycho",
    title: "Психоанализ",
    caption: "глубинные причины и паттерны",
    icon: Orbit,
    tone: "pink",
    premium: true,
    greet: (t) => `Я рядом. Тема — ${t}. Пойдём вглубь без спешки: ассоциации, повторяющиеся сюжеты. С чего начнём?`,
  },
  {
    id: "gestalt",
    title: "Гештальт",
    caption: "чувства и потребности здесь и сейчас",
    icon: Flower2,
    tone: "green",
    premium: true,
    greet: (t) => `Я рядом. Тема — ${t}. Замедлимся и заметим, что с тобой прямо сейчас. Что откликается первым?`,
  },
  {
    id: "positive",
    title: "Позитивная терапия",
    caption: "ресурсы, сильные стороны, баланс",
    icon: Sun,
    tone: "sun",
    premium: true,
    greet: (t) => `Я рядом. Тема — ${t}. Начнём с опоры на твои ресурсы и сильные стороны. Что сейчас волнует больше всего?`,
  },
];

// Прототип: расширенная версия ещё не куплена, открыт только базовый метод.
const PREMIUM_UNLOCKED = false;

const welcomePoints: Array<{ icon: LucideIcon; title: string; caption: string }> = [
  { icon: ShieldCheck, title: "Не поддакивает", caption: "сначала уточнит, потом ответит" },
  { icon: Sparkles, title: "Собирается под тебя", caption: "тема и метод — твой выбор" },
  { icon: HeartHandshake, title: "Сопровождает, не указывает", caption: "методики из клинических руководств" },
];

const starterChips = ["Мне тревожно", "Не могу уснуть", "Всё раздражает", "Просто поговорить"];

const techniques: Array<{ icon: LucideIcon; title: string; caption: string; prompt: string }> = [
  { icon: Wind, title: "Дыхание 4-7-8", caption: "снять острую тревогу", prompt: "Проведи меня по дыхательной технике 4-7-8, шаг за шагом." },
  { icon: Waves, title: "Заземление 5-4-3-2-1", caption: "вернуться в «здесь и сейчас»", prompt: "Помоги мне заземлиться по технике 5-4-3-2-1." },
  { icon: Brain, title: "Разбор мысли", caption: "проверить мысль на факты", prompt: "Помоги разобрать одну тревожную мысль." },
  { icon: Leaf, title: "Пауза самосострадания", caption: "когда слишком строг к себе", prompt: "Мне нужна пауза самосострадания. Поведи меня по ней." },
];

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function toneClasses(tone: Tone) {
  return {
    lavender: "bg-[var(--lavender-soft)] text-[var(--lavender-deep)]",
    pink: "bg-[var(--pink-soft)] text-[var(--pink-deep)]",
    green: "bg-[var(--green-soft)] text-[var(--green-deep)]",
    sun: "bg-[var(--sun-soft)] text-[var(--sun-deep)]",
  }[tone];
}

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

type TgWindow = Window & {
  Telegram?: {
    WebApp?: {
      ready?: () => void;
      expand?: () => void;
      setHeaderColor?: (color: string) => void;
      setBackgroundColor?: (color: string) => void;
      HapticFeedback?: { impactOccurred?: (style: string) => void };
    };
  };
};

function haptic(style: "light" | "medium" = "light") {
  const tg = (window as TgWindow).Telegram?.WebApp;
  tg?.HapticFeedback?.impactOccurred?.(style);
  if (!tg && "vibrate" in navigator) navigator.vibrate?.(style === "light" ? 8 : 16);
}

function getDeviceId() {
  let id = localStorage.getItem("psy_device_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("psy_device_id", id);
  }
  return id;
}

function topicOf(id: TopicId) {
  return topics.find((t) => t.id === id) ?? topics[0];
}

function methodOf(id: MethodId) {
  return methods.find((m) => m.id === id) ?? methods[0];
}

const TOPIC_IDS = topics.map((t) => t.id) as string[];
const METHOD_IDS = methods.map((m) => m.id) as string[];

function normalizeChat(raw: Record<string, unknown>): Chat {
  const method = (METHOD_IDS.includes(raw.method as string) ? raw.method : METHOD_IDS.includes(raw.approach as string) ? raw.approach : "cbt") as MethodId;
  const topic = (TOPIC_IDS.includes(raw.topic as string) ? raw.topic : "anxiety") as TopicId;
  return {
    id: typeof raw.id === "string" ? raw.id : uid(),
    topic,
    method,
    title: typeof raw.title === "string" ? raw.title : "Разговор",
    messages: Array.isArray(raw.messages) ? (raw.messages as Message[]) : [],
    updatedAt: typeof raw.updatedAt === "number" ? raw.updatedAt : Date.now(),
  };
}

function loadChats(): Chat[] {
  try {
    const raw = localStorage.getItem("psy_chats_v1");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.slice(0, 30).map(normalizeChat);
    }
    const legacy = localStorage.getItem("psy_messages");
    if (legacy) {
      const messages = (JSON.parse(legacy) as Message[]).slice(-40);
      localStorage.removeItem("psy_messages");
      if (messages.length) return [normalizeChat({ id: uid(), messages, title: chatTitle(messages), updatedAt: Date.now() })];
    }
  } catch {
    /* повреждённое хранилище — начинаем с чистого */
  }
  return [];
}

function chatTitle(messages: Message[]): string {
  const first = messages.find((m) => m.role === "user" && !m.system);
  if (!first) return "Новый разговор";
  return first.text.length > 34 ? `${first.text.slice(0, 34)}…` : first.text;
}

function formatDay(ts: number) {
  const diff = Math.floor((new Date().setHours(0, 0, 0, 0) - new Date(ts).setHours(0, 0, 0, 0)) / 86400000);
  if (diff <= 0) return "сегодня";
  if (diff === 1) return "вчера";
  return new Date(ts).toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}

async function askAssistant(chat: Chat) {
  const response = await fetch(FN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      deviceId: getDeviceId(),
      topic: chat.topic,
      approach: chat.method,
      messages: chat.messages
        .filter((m) => !m.system)
        .slice(-10)
        .map((m) => ({ role: m.role, content: m.text.slice(0, 1200) })),
    }),
  });
  const data = (await response.json().catch(() => ({}))) as { reply?: string; remaining?: number; error?: string };
  if (response.status === 429) throw new Error(data.error === "daily_limit" ? "daily_limit" : "global_limit");
  if (!response.ok || !data.reply) throw new Error("network");
  return data;
}

function Orb({ thinking = false, size = 64 }: { thinking?: boolean; size?: number }) {
  return (
    <div className="siri-glow relative flex shrink-0 items-center justify-center" style={{ width: size, height: size }}>
      {[0, 1].map((ring) => (
        <motion.span
          key={ring}
          animate={{
            borderRadius: ["45% 55% 58% 42%", "62% 38% 44% 56%", "45% 55% 58% 42%"],
            scale: thinking ? [0.85, 1.16, 0.9] : [0.92, 1.05, 0.94],
            opacity: thinking ? [0.45, 0.75, 0.5] : [0.3, 0.48, 0.32],
            rotate: [0, ring ? -30 : 28, 0],
          }}
          transition={{ duration: thinking ? 1.3 + ring * 0.2 : 4.2 + ring * 0.6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0"
          style={{
            background:
              ring === 0
                ? "radial-gradient(circle at 35% 35%, rgba(114,231,255,.95), rgba(109,124,255,.42) 48%, transparent 70%)"
                : "radial-gradient(circle at 66% 38%, rgba(178,122,255,.9), rgba(255,133,202,.34) 46%, transparent 72%)",
            filter: "blur(5px)",
            mixBlendMode: "multiply",
          }}
        />
      ))}
      <motion.span
        animate={{
          borderRadius: ["37% 63% 57% 43%", "60% 40% 42% 58%", "37% 63% 57% 43%"],
          scale: thinking ? [1, 0.94, 1.06, 1] : [1, 1.03, 1],
        }}
        transition={{ duration: thinking ? 1 : 3.6, repeat: Infinity, ease: "easeInOut" }}
        className="relative border border-white/80 bg-white/72 shadow-[inset_0_1px_12px_rgba(255,255,255,0.94),0_16px_44px_rgba(95,105,216,0.2)] backdrop-blur-xl"
        style={{ width: size * 0.62, height: size * 0.62 }}
      />
    </div>
  );
}

function Dots() {
  return (
    <span className="inline-flex items-center gap-1.5">
      {[0, 1, 2].map((dot) => (
        <motion.span
          key={dot}
          animate={{ y: [0, -4, 0], opacity: [0.36, 1, 0.36] }}
          transition={{ duration: 0.72, repeat: Infinity, delay: dot * 0.14, ease: "easeInOut" }}
          className="h-1.5 w-1.5 rounded-full bg-[var(--siri-blue)]"
        />
      ))}
    </span>
  );
}

function IconButton({ icon: Icon, label, onClick }: { icon: LucideIcon; label: string; onClick: () => void }) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.92 }}
      onClick={() => {
        haptic();
        onClick();
      }}
      aria-label={label}
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/70 bg-white/64 text-[var(--ink)] shadow-[0_10px_26px_rgba(10,12,19,0.07)] backdrop-blur"
    >
      <Icon size={17} strokeWidth={2} />
    </motion.button>
  );
}

function Stepper({ step }: { step: 1 | 2 }) {
  return (
    <div className="flex items-center gap-1.5">
      {[1, 2].map((n) => (
        <span
          key={n}
          className={cx(
            "h-1.5 rounded-full transition-all duration-300",
            n === step ? "w-6 bg-[var(--lavender)]" : "w-1.5 bg-black/12",
          )}
        />
      ))}
    </div>
  );
}

function TopicRow({
  topic,
  active,
  delay = 0,
  onPick,
}: {
  topic: (typeof topics)[number];
  active?: boolean;
  delay?: number;
  onPick: (id: TopicId) => void;
}) {
  const Icon = topic.icon;
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3, ease: "easeOut" }}
      whileTap={{ scale: 0.97 }}
      onClick={() => {
        haptic("medium");
        onPick(topic.id);
      }}
      className={cx(
        "flex w-full items-center gap-3.5 rounded-[22px] border p-3.5 text-left backdrop-blur transition-shadow",
        active
          ? "border-[var(--lavender)] bg-white/85 shadow-[0_14px_36px_rgba(125,130,255,0.18)]"
          : "border-white/70 bg-white/62 shadow-[0_10px_28px_rgba(10,12,19,0.05)]",
      )}
    >
      <span className={cx("flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px]", toneClasses(topic.tone))}>
        <Icon size={20} strokeWidth={1.9} />
      </span>
      <span className="min-w-0">
        <span className="block text-[14.5px] font-bold leading-snug">{topic.title}</span>
        <span className="mt-0.5 block text-[12px] text-[var(--muted)]">{topic.caption}</span>
      </span>
    </motion.button>
  );
}

function MethodRow({
  method,
  active,
  locked,
  delay = 0,
  onPick,
}: {
  method: (typeof methods)[number];
  active?: boolean;
  locked?: boolean;
  delay?: number;
  onPick: (id: MethodId, locked: boolean) => void;
}) {
  const Icon = method.icon;
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3, ease: "easeOut" }}
      whileTap={{ scale: 0.97 }}
      onClick={() => {
        haptic(locked ? "light" : "medium");
        onPick(method.id, !!locked);
      }}
      className={cx(
        "relative flex w-full items-center gap-3.5 rounded-[22px] border p-3.5 text-left backdrop-blur transition-shadow",
        active && !locked
          ? "border-[var(--lavender)] bg-white/85 shadow-[0_14px_36px_rgba(125,130,255,0.18)]"
          : "border-white/70 bg-white/62 shadow-[0_10px_28px_rgba(10,12,19,0.05)]",
        locked && "opacity-70",
      )}
    >
      <span className={cx("flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px]", toneClasses(method.tone))}>
        <Icon size={20} strokeWidth={1.9} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[14.5px] font-bold leading-snug">{method.title}</span>
        <span className="mt-0.5 block text-[12px] text-[var(--muted)]">{method.caption}</span>
      </span>
      {locked ? (
        <span className="flex shrink-0 items-center gap-1 rounded-full bg-black/6 px-2.5 py-1 text-[10px] font-extrabold uppercase text-black/45">
          <Lock size={11} /> Расшир.
        </span>
      ) : (
        <span className="shrink-0 rounded-full bg-[var(--green-soft)] px-2.5 py-1 text-[10px] font-extrabold uppercase text-[var(--green-deep)]">
          базовый
        </span>
      )}
    </motion.button>
  );
}

// Пошаговый конструктор ассистента. Онбординг добавляет вводный экран,
// «новый чат» и «пересборка» стартуют сразу с выбора направления.
function Wizard({
  mode,
  initialTopic,
  onComplete,
  onCancel,
}: {
  mode: "onboarding" | "new";
  initialTopic?: TopicId;
  onComplete: (topic: TopicId, method: MethodId) => void;
  onCancel?: () => void;
}) {
  const [phase, setPhase] = useState<"intro" | "topic" | "method">(mode === "onboarding" ? "intro" : "topic");
  const [topic, setTopic] = useState<TopicId | null>(initialTopic ?? null);

  return (
    <div className="flex h-full min-h-0 flex-col overflow-y-auto px-6 pb-[max(20px,env(safe-area-inset-bottom))] pt-[max(20px,env(safe-area-inset-top))]">
      {(phase !== "intro" || onCancel) && (
        <div className="flex shrink-0 items-center justify-between pb-4">
          <button
            type="button"
            onClick={() => {
              haptic();
              if (phase === "method") setPhase("topic");
              else if (phase === "topic" && mode === "onboarding") setPhase("intro");
              else onCancel?.();
            }}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/70 bg-white/64 text-black/55"
            aria-label="Назад"
          >
            <ChevronLeft size={18} />
          </button>
          {phase !== "intro" && <Stepper step={phase === "topic" ? 1 : 2} />}
          <span className="w-9" />
        </div>
      )}

      <AnimatePresence mode="wait">
        {phase === "intro" && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="flex min-h-full flex-col"
          >
            <div className="flex flex-col items-center pt-2 text-center">
              <Orb size={100} />
              <h1 className="font-display mt-6 text-[27px] font-bold leading-[1.12]">
                Соберём ассистента
                <br />
                под тебя
              </h1>
            </div>
            <div className="mt-7 flex flex-col gap-2.5">
              {welcomePoints.map((point, index) => {
                const Icon = point.icon;
                return (
                  <motion.div
                    key={point.title}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.12 + index * 0.09, duration: 0.3, ease: "easeOut" }}
                    className="flex items-center gap-3.5 rounded-[20px] border border-white/70 bg-white/60 px-4 py-3 backdrop-blur"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-[var(--lavender-soft)] text-[var(--lavender-deep)]">
                      <Icon size={18} strokeWidth={1.9} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[14px] font-bold leading-snug">{point.title}</span>
                      <span className="block text-[12px] text-[var(--muted)]">{point.caption}</span>
                    </span>
                  </motion.div>
                );
              })}
            </div>
            <div className="mt-auto pt-8">
              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  haptic("medium");
                  setPhase("topic");
                }}
                className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full bg-[var(--ink)] text-[15px] font-bold text-white shadow-[0_18px_44px_rgba(17,17,17,0.16)]"
              >
                <Sparkles size={17} />
                Собрать
              </motion.button>
              <p className="mt-3 text-center text-[11px] text-black/38">Не терапия и не медпомощь. В кризис — 112.</p>
            </div>
          </motion.div>
        )}

        {phase === "topic" && (
          <motion.div
            key="topic"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="flex min-h-full flex-col"
          >
            <p className="text-[11px] font-extrabold uppercase tracking-wide text-[var(--lavender-deep)]">Шаг 1 · направление</p>
            <h1 className="font-display mt-1.5 text-[24px] font-bold leading-[1.15]">О чём хочешь поговорить?</h1>
            <p className="mt-2 text-[12.5px] leading-relaxed text-[var(--muted)]">
              По теме подберём подходящую базу материалов и фокус разговора.
            </p>
            <div className="mt-5 flex flex-col gap-2.5 pb-4">
              {topics.map((item, index) => (
                <TopicRow
                  key={item.id}
                  topic={item}
                  active={topic === item.id}
                  delay={0.06 + index * 0.05}
                  onPick={(id) => {
                    setTopic(id);
                    setPhase("method");
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}

        {phase === "method" && topic && (
          <motion.div
            key="method"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="flex min-h-full flex-col"
          >
            <p className="text-[11px] font-extrabold uppercase tracking-wide text-[var(--lavender-deep)]">Шаг 2 · метод</p>
            <h1 className="font-display mt-1.5 text-[24px] font-bold leading-[1.15]">Как будем работать?</h1>
            <p className="mt-2 text-[12.5px] leading-relaxed text-[var(--muted)]">
              Метод определяет стиль ответов. В базовой версии открыта КПТ.
            </p>
            <div className="mt-5 flex flex-col gap-2.5">
              {methods.map((item, index) => {
                const locked = item.premium && !PREMIUM_UNLOCKED;
                return (
                  <MethodRow
                    key={item.id}
                    method={item}
                    locked={locked}
                    delay={0.06 + index * 0.05}
                    onPick={(id, isLocked) => {
                      if (isLocked) return;
                      onComplete(topic, id);
                    }}
                  />
                );
              })}
            </div>
            <p className="mt-4 rounded-[18px] border border-[var(--sun-soft)] bg-[var(--sun-soft)] px-4 py-3 text-center text-[11.5px] font-semibold leading-relaxed text-[var(--sun-deep)]">
              Психоанализ, гештальт и позитивная терапия появятся в расширенной версии.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SheetShell({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="absolute inset-0 z-40 flex flex-col justify-end">
      <motion.button
        type="button"
        aria-label="Закрыть"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/24 backdrop-blur-[2px]"
      />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 380, damping: 38 }}
        className="relative max-h-[80%] overflow-y-auto rounded-t-[30px] border-t border-white/80 bg-[var(--app)]/97 px-6 pb-[max(20px,env(safe-area-inset-bottom))] pt-3 shadow-[0_-18px_60px_rgba(10,12,19,0.18)] backdrop-blur-2xl"
      >
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-black/12" />
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-[19px] font-bold">{title}</h2>
          <IconButton icon={X} label="Закрыть" onClick={onClose} />
        </div>
        {children}
      </motion.div>
    </div>
  );
}

export default function App() {
  const [chats, setChats] = useState<Chat[]>(loadChats);
  const [currentId, setCurrentId] = useState<string | null>(() => localStorage.getItem("psy_current_chat"));
  const [wizardMode, setWizardMode] = useState<"onboarding" | "new" | null>(() =>
    localStorage.getItem("psy_intro_v3") === "1" && chats.length ? null : "onboarding",
  );
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [sheet, setSheet] = useState<Sheet>("none");
  const [remaining, setRemaining] = useState<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const chat = chats.find((c) => c.id === currentId) ?? chats[0] ?? null;
  const topic = chat ? topicOf(chat.topic) : topics[0];
  const method = chat ? methodOf(chat.method) : methods[0];

  useEffect(() => {
    const tg = (window as TgWindow).Telegram?.WebApp;
    tg?.ready?.();
    tg?.expand?.();
    tg?.setHeaderColor?.("#f8f9fd");
    tg?.setBackgroundColor?.("#f8f9fd");
  }, []);

  useEffect(() => {
    localStorage.setItem("psy_chats_v1", JSON.stringify(chats.slice(0, 30)));
  }, [chats]);

  useEffect(() => {
    if (chat) localStorage.setItem("psy_current_chat", chat.id);
  }, [chat]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat?.messages.length, thinking]);

  function completeWizard(topicId: TopicId, methodId: MethodId) {
    const fresh: Chat = { id: uid(), topic: topicId, method: methodId, title: "Новый разговор", messages: [], updatedAt: Date.now() };
    setChats((current) => [fresh, ...current].slice(0, 30));
    setCurrentId(fresh.id);
    localStorage.setItem("psy_intro_v3", "1");
    setWizardMode(null);
    setSheet("none");
  }

  function patchChat(id: string, patch: (c: Chat) => Chat) {
    setChats((current) => current.map((c) => (c.id === id ? patch(c) : c)).sort((a, b) => b.updatedAt - a.updatedAt));
  }

  function deleteChat(id: string) {
    haptic("medium");
    setChats((current) => current.filter((c) => c.id !== id));
    if (currentId === id) setCurrentId(null);
  }

  async function send(text: string) {
    const content = text.trim();
    if (!content || thinking || !chat) return;
    haptic();
    setInput("");
    setSheet("none");
    const userMessage: Message = { id: uid(), role: "user", text: content };
    const afterUser = { ...chat, messages: [...chat.messages, userMessage], updatedAt: Date.now() };
    patchChat(chat.id, () => ({ ...afterUser, title: chatTitle(afterUser.messages) }));
    setThinking(true);
    try {
      const data = await askAssistant(afterUser);
      if (typeof data.remaining === "number") setRemaining(data.remaining);
      patchChat(chat.id, (c) => ({
        ...c,
        messages: [...c.messages, { id: uid(), role: "assistant", text: data.reply! }],
        updatedAt: Date.now(),
      }));
      haptic("medium");
    } catch (error) {
      const kind = error instanceof Error ? error.message : "network";
      const message =
        kind === "daily_limit"
          ? "На сегодня лимит сообщений закончился — это защита от перегрузки. Возвращайся завтра. Если тяжело прямо сейчас: 112 или 8-800-2000-122."
          : kind === "global_limit"
            ? "Сервису сейчас пишет слишком много людей, и дневной запас генераций исчерпан. Попробуй чуть позже."
            : "Не получилось связаться с сервером. Проверь интернет и попробуй ещё раз.";
      if (kind === "daily_limit") setRemaining(0);
      patchChat(chat.id, (c) => ({
        ...c,
        messages: [...c.messages, { id: uid(), role: "assistant", text: message, system: true }],
        updatedAt: Date.now(),
      }));
    } finally {
      setThinking(false);
    }
  }

  return (
    <div className="min-h-screen overflow-x-clip bg-[var(--page)] text-[var(--ink)] sm:flex sm:items-center sm:justify-center sm:p-6">
      <div className="luxury-grain relative mx-auto flex h-[100svh] w-full max-w-[430px] overflow-hidden bg-[var(--app)] shadow-[0_30px_100px_rgba(12,12,12,0.18)] sm:h-[calc(100svh-48px)] sm:max-h-[844px] sm:rounded-[46px] sm:border sm:border-white/80">
        <div className="pointer-events-none absolute -right-20 top-12 h-52 w-52 rounded-full bg-[var(--siri-blue)]/14 blur-3xl" />
        <div className="pointer-events-none absolute -left-24 top-72 h-48 w-48 rounded-full bg-[var(--siri-cyan)]/13 blur-3xl" />
        <div className="pointer-events-none absolute bottom-8 right-10 h-44 w-44 rounded-full bg-[var(--siri-violet)]/11 blur-3xl" />

        <div className="relative z-10 flex min-h-0 min-w-0 flex-1 flex-col">
          {wizardMode || !chat ? (
            <Wizard
              mode={wizardMode ?? "onboarding"}
              onComplete={completeWizard}
              onCancel={wizardMode === "new" && chat ? () => setWizardMode(null) : undefined}
            />
          ) : (
            <>
              <header className="flex shrink-0 items-center justify-between gap-3 px-5 pb-2 pt-[max(16px,env(safe-area-inset-top))]">
                <div className="flex min-w-0 items-center gap-3">
                  <Orb thinking={thinking} size={44} />
                  <button type="button" onClick={() => setSheet("config")} className="min-w-0 text-left">
                    <p className="font-display truncate text-[16px] font-bold leading-tight">{topic.title}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wide text-black/36">
                      {thinking ? "подбираю ответ…" : `${method.title} · настроить`}
                    </p>
                  </button>
                </div>
                <div className="flex gap-2">
                  <IconButton icon={History} label="История чатов" onClick={() => setSheet("history")} />
                  <IconButton icon={SlidersHorizontal} label="Профиль" onClick={() => setSheet("profile")} />
                </div>
              </header>

              <div className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden px-5 py-3">
                <div className="flex flex-col gap-3">
                  <div className="flex justify-start">
                    <div className="max-w-[86%] rounded-[22px] rounded-bl-[8px] border border-white/70 bg-white/64 px-4 py-3 text-[14px] leading-relaxed backdrop-blur">
                      {method.greet(topic.title.toLowerCase())}
                    </div>
                  </div>

                  {chat.messages.length === 0 && (
                    <div className="mt-1 flex flex-wrap gap-2">
                      {starterChips.map((chip) => (
                        <motion.button
                          key={chip}
                          type="button"
                          whileTap={{ scale: 0.96 }}
                          onClick={() => send(chip)}
                          className="rounded-full border border-white/80 bg-white/78 px-3.5 py-2 text-[12.5px] font-bold text-[var(--ink)]/80 shadow-[0_8px_22px_rgba(10,12,19,0.05)] backdrop-blur"
                        >
                          {chip}
                        </motion.button>
                      ))}
                    </div>
                  )}

                  {chat.messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.24, ease: "easeOut" }}
                      className={cx("flex", message.role === "user" ? "justify-end" : "justify-start")}
                    >
                      <div
                        className={cx(
                          "max-w-[86%] whitespace-pre-wrap px-4 py-3 text-[14px] leading-relaxed",
                          message.role === "user"
                            ? "rounded-[22px] rounded-br-[8px] bg-[var(--ink)] text-white shadow-[0_14px_30px_rgba(10,12,19,0.15)]"
                            : cx(
                                "rounded-[22px] rounded-bl-[8px] border border-white/70 bg-white/64 text-[var(--ink)] backdrop-blur",
                                message.system && "border-[var(--sun-soft)] bg-[var(--sun-soft)]",
                              ),
                        )}
                      >
                        {message.text}
                      </div>
                    </motion.div>
                  ))}

                  {thinking && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 pl-2 text-[12px] font-semibold text-black/38">
                      Думаю <Dots />
                    </motion.div>
                  )}
                  <div ref={bottomRef} />
                </div>
              </div>

              <div className="shrink-0 px-5 pb-[max(14px,env(safe-area-inset-bottom))] pt-2">
                {remaining !== null && remaining <= 3 && (
                  <p className="mb-1.5 text-center text-[11px] font-bold text-black/40">осталось сообщений на сегодня: {remaining}</p>
                )}
                <div className="flex items-center gap-2 rounded-full border border-white/80 bg-white/78 p-2 shadow-[0_18px_52px_rgba(10,12,19,0.09)] backdrop-blur-2xl">
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      haptic();
                      setSheet("techniques");
                    }}
                    aria-label="Техники"
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--lavender-soft)] text-[var(--lavender-deep)]"
                  >
                    <Plus size={19} />
                  </motion.button>
                  <input
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    onKeyDown={(event) => event.key === "Enter" && send(input)}
                    placeholder="Напиши, что происходит…"
                    className="h-11 min-w-0 flex-1 bg-transparent px-1 text-[15px] font-semibold outline-none placeholder:text-black/32"
                  />
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.9 }}
                    onClick={() => send(input)}
                    disabled={thinking}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--ink)] text-white shadow-[0_14px_34px_rgba(10,12,19,0.2)] disabled:opacity-60"
                    aria-label="Отправить"
                  >
                    <Send size={17} />
                  </motion.button>
                </div>
              </div>
            </>
          )}

          <AnimatePresence>
            {sheet === "techniques" && (
              <SheetShell title="Техники" onClose={() => setSheet("none")}>
                <p className="mb-4 text-[12.5px] leading-relaxed text-[var(--muted)]">Ассистент проведёт по шагам прямо в чате.</p>
                <div className="flex flex-col gap-2.5">
                  {techniques.map((technique) => {
                    const Icon = technique.icon;
                    return (
                      <motion.button
                        key={technique.title}
                        type="button"
                        whileTap={{ scale: 0.98 }}
                        onClick={() => send(technique.prompt)}
                        className="flex items-center gap-4 rounded-[22px] border border-white/70 bg-white/70 p-4 text-left shadow-[0_10px_28px_rgba(10,12,19,0.05)]"
                      >
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] bg-[var(--green-soft)] text-[var(--green-deep)]">
                          <Icon size={20} strokeWidth={1.9} />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-[14.5px] font-bold">{technique.title}</span>
                          <span className="mt-0.5 block text-[12px] text-[var(--muted)]">{technique.caption}</span>
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </SheetShell>
            )}

            {sheet === "history" && (
              <SheetShell title="Чаты" onClose={() => setSheet("none")}>
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    haptic();
                    setSheet("none");
                    setWizardMode("new");
                  }}
                  className="mb-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--ink)] text-[14px] font-bold text-white shadow-[0_14px_34px_rgba(10,12,19,0.16)]"
                >
                  <Plus size={16} />
                  Собрать новый чат
                </motion.button>
                <div className="flex flex-col gap-2">
                  {chats.map((item) => {
                    const itemTopic = topicOf(item.topic);
                    const Icon = itemTopic.icon;
                    return (
                      <div
                        key={item.id}
                        className={cx(
                          "flex items-center gap-3 rounded-[20px] border p-3",
                          item.id === chat?.id ? "border-[var(--lavender)] bg-white/85" : "border-white/70 bg-white/62",
                        )}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            haptic();
                            setCurrentId(item.id);
                            setSheet("none");
                          }}
                          className="flex min-w-0 flex-1 items-center gap-3 text-left"
                        >
                          <span className={cx("flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px]", toneClasses(itemTopic.tone))}>
                            <Icon size={17} strokeWidth={1.9} />
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate text-[13.5px] font-bold">{item.title}</span>
                            <span className="block text-[11.5px] text-[var(--muted)]">
                              {itemTopic.title} · {methodOf(item.method).title} · {formatDay(item.updatedAt)}
                            </span>
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteChat(item.id)}
                          aria-label="Удалить чат"
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-black/30"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    );
                  })}
                  {chats.length === 0 && <p className="py-4 text-center text-[12.5px] text-[var(--muted)]">Пока пусто — собери новый чат.</p>}
                </div>
              </SheetShell>
            )}

            {sheet === "config" && chat && (
              <SheetShell title="Настроить ассистента" onClose={() => setSheet("none")}>
                <p className="text-[11px] font-extrabold uppercase tracking-wide text-[var(--lavender-deep)]">Направление</p>
                <div className="mt-2.5 flex flex-col gap-2">
                  {topics.map((item) => (
                    <TopicRow
                      key={item.id}
                      topic={item}
                      active={chat.topic === item.id}
                      onPick={(id) => {
                        patchChat(chat.id, (c) => ({ ...c, topic: id, updatedAt: Date.now() }));
                        haptic();
                      }}
                    />
                  ))}
                </div>
                <p className="mt-5 text-[11px] font-extrabold uppercase tracking-wide text-[var(--lavender-deep)]">Метод</p>
                <div className="mt-2.5 flex flex-col gap-2">
                  {methods.map((item) => {
                    const locked = item.premium && !PREMIUM_UNLOCKED;
                    return (
                      <MethodRow
                        key={item.id}
                        method={item}
                        active={chat.method === item.id}
                        locked={locked}
                        onPick={(id, isLocked) => {
                          if (isLocked) return;
                          patchChat(chat.id, (c) => ({ ...c, method: id, updatedAt: Date.now() }));
                          haptic();
                        }}
                      />
                    );
                  })}
                </div>
                <p className="mt-4 rounded-[18px] border border-[var(--sun-soft)] bg-[var(--sun-soft)] px-4 py-3 text-center text-[11.5px] font-semibold leading-relaxed text-[var(--sun-deep)]">
                  Другие методы откроются в расширенной версии.
                </p>
                <button
                  type="button"
                  onClick={() => setSheet("none")}
                  className="mt-3 min-h-12 w-full rounded-full bg-[var(--ink)] text-[14px] font-bold text-white shadow-[0_14px_34px_rgba(10,12,19,0.16)]"
                >
                  Готово
                </button>
              </SheetShell>
            )}

            {sheet === "profile" && (
              <SheetShell title="Профиль" onClose={() => setSheet("none")}>
                <div className="rounded-[22px] border border-white/70 bg-white/70 p-4 shadow-[0_10px_28px_rgba(10,12,19,0.05)]">
                  <div className="flex items-baseline justify-between">
                    <p className="text-[13px] font-bold">Сообщения сегодня</p>
                    <p className="text-[13px] font-extrabold text-[var(--lavender-deep)]">
                      {remaining ?? DAILY_LIMIT} из {DAILY_LIMIT}
                    </p>
                  </div>
                  <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-black/8">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[var(--siri-blue)] to-[var(--siri-violet)] transition-all"
                      style={{ width: `${Math.max(4, ((remaining ?? DAILY_LIMIT) / DAILY_LIMIT) * 100)}%` }}
                    />
                  </div>
                  <p className="mt-2 text-[11.5px] leading-relaxed text-[var(--muted)]">
                    Лимит обновляется каждый день и защищает сервис от перегрузки.
                  </p>
                </div>

                {chat && (
                  <button
                    type="button"
                    onClick={() => {
                      haptic();
                      setSheet("config");
                    }}
                    className="mt-3 flex w-full items-center justify-between rounded-[22px] border border-white/70 bg-white/70 p-4 text-left shadow-[0_10px_28px_rgba(10,12,19,0.05)]"
                  >
                    <span>
                      <span className="block text-[13px] font-bold">Настройка ассистента</span>
                      <span className="mt-0.5 block text-[12px] text-[var(--muted)]">
                        {topic.title} · {method.title}
                      </span>
                    </span>
                    <SlidersHorizontal size={18} className="text-black/40" />
                  </button>
                )}

                <div className="mt-3 rounded-[22px] border border-[var(--pink-soft)] bg-[var(--pink-soft)] p-4">
                  <p className="text-[13px] font-bold text-[var(--pink-deep)]">Если совсем тяжело</p>
                  <p className="mt-1.5 text-[12.5px] leading-relaxed text-[var(--ink)]/75">
                    Экстренная помощь — <b>112</b>
                    <br />
                    Телефон доверия (бесплатно, круглосуточно) — <b>8-800-2000-122</b>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    haptic();
                    localStorage.removeItem("psy_intro_v3");
                    setSheet("none");
                    setWizardMode("onboarding");
                  }}
                  className="mt-3 min-h-11 w-full rounded-full bg-white/80 text-[13.5px] font-bold text-[var(--ink)] shadow-[0_8px_22px_rgba(10,12,19,0.05)]"
                >
                  Пройти знакомство заново
                </button>

                <p className="mt-4 text-center text-[11px] leading-relaxed text-black/36">
                  Ассистент не ставит диагнозы и не заменяет работу с живым специалистом.
                </p>
              </SheetShell>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
