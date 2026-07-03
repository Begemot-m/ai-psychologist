// Статический прототип для GitHub Pages: чат — главный экран.
// Онбординг: короткое знакомство → выбор подхода (конструктор). Подход
// уходит на сервер и меняет системный промпт (КПТ → протоколы, психоанализ →
// интерпретации и т.д.). История — отдельные чаты, техники и профиль — шторки.

import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  Brain,
  Flower2,
  HeartHandshake,
  History,
  Leaf,
  Moon,
  Plus,
  Send,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
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
type ApproachId = "cbt" | "psycho" | "gestalt" | "mindful";
type Chat = { id: string; approach: ApproachId; title: string; messages: Message[]; updatedAt: number };
type Sheet = "none" | "techniques" | "profile" | "history" | "approach";
type Tone = "lavender" | "pink" | "green" | "sun";

const approaches: Array<{
  id: ApproachId;
  title: string;
  caption: string;
  icon: LucideIcon;
  tone: Tone;
  greeting: string;
}> = [
  {
    id: "cbt",
    title: "КПТ",
    caption: "мысли, протоколы, маленькие шаги",
    icon: Brain,
    tone: "lavender",
    greeting:
      "Я рядом. Будем работать в духе КПТ: замечать мысли, проверять их на факты и пробовать маленькие шаги. Что сейчас происходит?",
  },
  {
    id: "psycho",
    title: "Психоанализ",
    caption: "глубинные причины и паттерны",
    icon: Moon,
    tone: "pink",
    greeting:
      "Я рядом. Пойдём вглубь без спешки: ассоциации, повторяющиеся сюжеты, то, что обычно остаётся за кадром. С чего хочется начать?",
  },
  {
    id: "gestalt",
    title: "Гештальт",
    caption: "чувства здесь и сейчас",
    icon: Flower2,
    tone: "sun",
    greeting:
      "Я рядом. Давай замедлимся и заметим, что с тобой прямо сейчас — в мыслях и в теле. Что откликается первым?",
  },
  {
    id: "mindful",
    title: "ACT · майндфулнес",
    caption: "принятие, ценности, практики",
    icon: Leaf,
    tone: "green",
    greeting:
      "Я рядом. Будем учиться смотреть на мысли со стороны и опираться на твои ценности. Что сейчас волнует больше всего?",
  },
];

const welcomePoints: Array<{ icon: LucideIcon; title: string; caption: string }> = [
  { icon: ShieldCheck, title: "Не поддакивает", caption: "сначала уточнит, потом ответит" },
  { icon: BookOpen, title: "Методики из руководств", caption: "КПТ · психоанализ · гештальт · ACT" },
  { icon: HeartHandshake, title: "Сопровождает, не указывает", caption: "собран вместе с психологами" },
];

const starterChips = ["Мне тревожно", "Не могу уснуть", "Выгорание", "Просто поговорить"];

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

function approachOf(id: ApproachId) {
  return approaches.find((a) => a.id === id) ?? approaches[0];
}

function loadChats(): Chat[] {
  try {
    const raw = localStorage.getItem("psy_chats_v1");
    if (raw) {
      const parsed = JSON.parse(raw) as Chat[];
      if (Array.isArray(parsed)) return parsed.slice(0, 30);
    }
    // Миграция со старого формата одной сплошной переписки.
    const legacy = localStorage.getItem("psy_messages");
    if (legacy) {
      const messages = (JSON.parse(legacy) as Message[]).slice(-40);
      localStorage.removeItem("psy_messages");
      if (messages.length) {
        return [{ id: uid(), approach: "cbt", title: chatTitle(messages), messages, updatedAt: Date.now() }];
      }
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
  const date = new Date(ts);
  const today = new Date();
  const diff = Math.floor((today.setHours(0, 0, 0, 0) - new Date(ts).setHours(0, 0, 0, 0)) / 86400000);
  if (diff <= 0) return "сегодня";
  if (diff === 1) return "вчера";
  return date.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}

async function askAssistant(chat: Chat) {
  const response = await fetch(FN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      deviceId: getDeviceId(),
      approach: chat.approach,
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

function ApproachCard({
  approach,
  active = false,
  delay = 0,
  onPick,
}: {
  approach: (typeof approaches)[number];
  active?: boolean;
  delay?: number;
  onPick: (id: ApproachId) => void;
}) {
  const Icon = approach.icon;
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.34, ease: "easeOut" }}
      whileTap={{ scale: 0.97 }}
      onClick={() => {
        haptic("medium");
        onPick(approach.id);
      }}
      className={cx(
        "flex w-full items-center gap-4 rounded-[24px] border p-4 text-left backdrop-blur transition-shadow",
        active
          ? "border-[var(--lavender)] bg-white/85 shadow-[0_16px_40px_rgba(125,130,255,0.18)]"
          : "border-white/70 bg-white/62 shadow-[0_12px_32px_rgba(10,12,19,0.05)]",
      )}
    >
      <span className={cx("flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px]", toneClasses(approach.tone))}>
        <Icon size={22} strokeWidth={1.9} />
      </span>
      <span className="min-w-0">
        <span className="block text-[15px] font-bold leading-snug">{approach.title}</span>
        <span className="mt-0.5 block text-[12.5px] text-[var(--muted)]">{approach.caption}</span>
      </span>
    </motion.button>
  );
}

function Onboarding({ onDone }: { onDone: (approach: ApproachId) => void }) {
  const [step, setStep] = useState<0 | 1>(0);
  return (
    <div className="flex h-full min-h-0 flex-col overflow-y-auto px-6 pb-[max(20px,env(safe-area-inset-bottom))] pt-[max(28px,env(safe-area-inset-top))]">
      <AnimatePresence mode="wait">
        {step === 0 ? (
          <motion.div
            key="hello"
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="flex min-h-full flex-col"
          >
            <div className="flex flex-col items-center text-center">
              <Orb size={104} />
              <h1 className="font-display mt-6 text-[28px] font-bold leading-[1.12]">
                Ассистент, который
                <br />
                не поддакивает
              </h1>
            </div>
            <div className="mt-8 flex flex-col gap-2.5">
              {welcomePoints.map((point, index) => {
                const Icon = point.icon;
                return (
                  <motion.div
                    key={point.title}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + index * 0.09, duration: 0.32, ease: "easeOut" }}
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
                  setStep(1);
                }}
                className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full bg-[var(--ink)] text-[15px] font-bold text-white shadow-[0_18px_44px_rgba(17,17,17,0.16)]"
              >
                <Sparkles size={17} />
                Дальше
              </motion.button>
              <p className="mt-3 text-center text-[11px] text-black/38">Не терапия и не медицинская помощь. В кризис — 112.</p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="approach"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="flex min-h-full flex-col"
          >
            <h1 className="font-display text-[26px] font-bold leading-[1.15]">С каким подходом начнём?</h1>
            <p className="mt-2 text-[13px] leading-relaxed text-[var(--muted)]">
              От этого зависит, как ассистент поведёт разговор. Поменять можно в любой момент.
            </p>
            <div className="mt-6 flex flex-col gap-2.5">
              {approaches.map((approach, index) => (
                <ApproachCard key={approach.id} approach={approach} delay={0.1 + index * 0.08} onPick={onDone} />
              ))}
            </div>
            <button
              type="button"
              onClick={() => setStep(0)}
              className="mt-auto pt-6 text-center text-[12.5px] font-bold text-black/40"
            >
              ← назад
            </button>
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
        className="relative max-h-[78%] overflow-y-auto rounded-t-[30px] border-t border-white/80 bg-[var(--app)]/97 px-6 pb-[max(20px,env(safe-area-inset-bottom))] pt-3 shadow-[0_-18px_60px_rgba(10,12,19,0.18)] backdrop-blur-2xl"
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
  const [introSeen, setIntroSeen] = useState(() => localStorage.getItem("psy_intro_v3") === "1");
  const [chats, setChats] = useState<Chat[]>(loadChats);
  const [currentId, setCurrentId] = useState<string | null>(() => localStorage.getItem("psy_current_chat"));
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [sheet, setSheet] = useState<Sheet>("none");
  const [remaining, setRemaining] = useState<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const chat = chats.find((c) => c.id === currentId) ?? chats[0] ?? null;
  const approach = chat ? approachOf(chat.approach) : approaches[0];

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

  function newChat(approachId: ApproachId) {
    const fresh: Chat = { id: uid(), approach: approachId, title: "Новый разговор", messages: [], updatedAt: Date.now() };
    setChats((current) => [fresh, ...current].slice(0, 30));
    setCurrentId(fresh.id);
    setSheet("none");
  }

  function patchChat(id: string, patch: (c: Chat) => Chat) {
    setChats((current) =>
      current
        .map((c) => (c.id === id ? patch(c) : c))
        .sort((a, b) => b.updatedAt - a.updatedAt),
    );
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
      const text =
        kind === "daily_limit"
          ? "На сегодня лимит сообщений закончился — это защита от перегрузки. Возвращайся завтра. Если тяжело прямо сейчас: 112 или 8-800-2000-122."
          : kind === "global_limit"
            ? "Сервису сейчас пишет слишком много людей, и дневной запас генераций исчерпан. Попробуй чуть позже."
            : "Не получилось связаться с сервером. Проверь интернет и попробуй ещё раз.";
      if (kind === "daily_limit") setRemaining(0);
      patchChat(chat.id, (c) => ({
        ...c,
        messages: [...c.messages, { id: uid(), role: "assistant", text, system: true }],
        updatedAt: Date.now(),
      }));
    } finally {
      setThinking(false);
    }
  }

  const showOnboarding = !introSeen;
  const noChat = !chat;

  return (
    <div className="min-h-screen overflow-x-clip bg-[var(--page)] text-[var(--ink)] sm:flex sm:items-center sm:justify-center sm:p-6">
      <div className="luxury-grain relative mx-auto flex h-[100svh] w-full max-w-[430px] overflow-hidden bg-[var(--app)] shadow-[0_30px_100px_rgba(12,12,12,0.18)] sm:h-[calc(100svh-48px)] sm:max-h-[844px] sm:rounded-[46px] sm:border sm:border-white/80">
        <div className="pointer-events-none absolute -right-20 top-12 h-52 w-52 rounded-full bg-[var(--siri-blue)]/14 blur-3xl" />
        <div className="pointer-events-none absolute -left-24 top-72 h-48 w-48 rounded-full bg-[var(--siri-cyan)]/13 blur-3xl" />
        <div className="pointer-events-none absolute bottom-8 right-10 h-44 w-44 rounded-full bg-[var(--siri-violet)]/11 blur-3xl" />

        <div className="relative z-10 flex min-h-0 min-w-0 flex-1 flex-col">
          {showOnboarding || noChat ? (
            <Onboarding
              onDone={(approachId) => {
                localStorage.setItem("psy_intro_v3", "1");
                setIntroSeen(true);
                newChat(approachId);
              }}
            />
          ) : (
            <>
              <header className="flex shrink-0 items-center justify-between gap-3 px-5 pb-2 pt-[max(16px,env(safe-area-inset-top))]">
                <div className="flex min-w-0 items-center gap-3">
                  <Orb thinking={thinking} size={44} />
                  <div className="min-w-0">
                    <p className="font-display truncate text-[17px] font-bold leading-tight">AI-психолог</p>
                    <button
                      type="button"
                      onClick={() => setSheet("approach")}
                      className="mt-0.5 flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wide text-black/36"
                    >
                      {thinking ? "подбираю ответ…" : `${approach.title} · сменить`}
                    </button>
                  </div>
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
                      {approach.greeting}
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
                <p className="mb-4 text-[12.5px] leading-relaxed text-[var(--muted)]">
                  Ассистент проведёт по шагам прямо в чате.
                </p>
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
                    setSheet("approach");
                  }}
                  className="mb-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--ink)] text-[14px] font-bold text-white shadow-[0_14px_34px_rgba(10,12,19,0.16)]"
                >
                  <Plus size={16} />
                  Новый чат
                </motion.button>
                <div className="flex flex-col gap-2">
                  {chats.map((item) => {
                    const itemApproach = approachOf(item.approach);
                    const Icon = itemApproach.icon;
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
                          <span className={cx("flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px]", toneClasses(itemApproach.tone))}>
                            <Icon size={17} strokeWidth={1.9} />
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate text-[13.5px] font-bold">{item.title}</span>
                            <span className="block text-[11.5px] text-[var(--muted)]">
                              {itemApproach.title} · {formatDay(item.updatedAt)}
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
                  {chats.length === 0 && (
                    <p className="py-4 text-center text-[12.5px] text-[var(--muted)]">Пока пусто — начни новый чат.</p>
                  )}
                </div>
              </SheetShell>
            )}

            {sheet === "approach" && (
              <SheetShell title="Новый чат: подход" onClose={() => setSheet("none")}>
                <p className="mb-4 text-[12.5px] leading-relaxed text-[var(--muted)]">
                  Подход определяет, как ассистент поведёт разговор. Для текущего чата подход сохраняется — новый выбор откроет новый чат.
                </p>
                <div className="flex flex-col gap-2.5">
                  {approaches.map((item) => (
                    <ApproachCard key={item.id} approach={item} active={item.id === chat?.approach} onPick={newChat} />
                  ))}
                </div>
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
                    setSheet("none");
                    setIntroSeen(false);
                    localStorage.removeItem("psy_intro_v3");
                  }}
                  className="mt-3 min-h-11 w-full rounded-full bg-white/80 text-[13.5px] font-bold text-[var(--ink)] shadow-[0_8px_22px_rgba(10,12,19,0.05)]"
                >
                  Посмотреть знакомство ещё раз
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
