"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  BadgeCheck,
  Bell,
  BookOpen,
  Brain,
  ChevronRight,
  CircleHelp,
  Flame,
  Heart,
  Home as HomeIcon,
  Leaf,
  LockKeyholeOpen,
  MessageCircle,
  Moon,
  Orbit,
  Phone,
  RotateCcw,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
  Star,
  SunMedium,
  Target,
  Waves,
  Wind,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

type Stage = "onboarding" | "module" | "method" | "main" | "premium";
type Tab = "chat" | "programs" | "profile";
type Role = "assistant" | "user";

type ModuleOption = {
  id: string;
  title: string;
  caption: string;
  icon: LucideIcon;
  tone: "lavender" | "pink" | "green";
};

type MethodOption = {
  id: string;
  title: string;
  caption: string;
  icon: LucideIcon;
};

type Message = {
  id: string;
  role: Role;
  text: string;
};

const onboarding = [
  {
    title: "Сопровождение, а не терапия",
    text: "Помогаем разобраться в чувствах и подобрать инструменты самопомощи. Это не заменяет работу с живым специалистом.",
    icon: ShieldCheck,
  },
  {
    title: "Сначала понимаем состояние",
    text: "Мягко уточняем, что происходит, и собираем контекст без давления, оценок и канцелярита.",
    icon: Heart,
  },
  {
    title: "Не просто чат",
    text: "Внутри структурированные подходы, проверенные практикующими психологами: КПТ, ACT, гештальт и другие методы.",
    icon: Sparkles,
  },
  {
    title: "Все форматы открыты",
    text: "На этапе прототипа можно свободно пройти все модули, методы, программы и premium-экран без оплаты.",
    icon: LockKeyholeOpen,
  },
];

const modules: ModuleOption[] = [
  { id: "anxiety", title: "Тревожность", caption: "мысли, тело, сон", icon: Wind, tone: "lavender" },
  { id: "burnout", title: "Выгорание", caption: "ресурс и границы", icon: Flame, tone: "pink" },
  { id: "relations", title: "Отношения", caption: "контакт и опора", icon: Heart, tone: "green" },
  { id: "esteem", title: "Самооценка", caption: "внутренний критик", icon: Star, tone: "lavender" },
  { id: "sleep", title: "Сон", caption: "ритуалы и тревога", icon: Moon, tone: "pink" },
  { id: "crisis", title: "Кризис", caption: "план безопасности", icon: ShieldCheck, tone: "green" },
  { id: "psychiatry", title: "Терапия у психиатра", caption: "дневник состояния", icon: Brain, tone: "lavender" },
  { id: "grief", title: "Потеря и горе", caption: "бережное проживание", icon: Waves, tone: "pink" },
];

const methods: MethodOption[] = [
  { id: "cbt", title: "КПТ", caption: "мысли, действия и проверка гипотез", icon: Target },
  { id: "gestalt", title: "Гештальт", caption: "контакт с чувствами здесь и сейчас", icon: Orbit },
  { id: "analysis", title: "Психоанализ", caption: "повторяющиеся сценарии и смыслы", icon: Brain },
  { id: "act", title: "ACT / принятие", caption: "ценности, гибкость и опора", icon: Leaf },
  { id: "schema", title: "Схема-терапия", caption: "устойчивые паттерны и потребности", icon: Sparkles },
  { id: "mindfulness", title: "Майндфулнес", caption: "внимание к телу и настоящему моменту", icon: Wind },
];

const quickPrompts = ["Мне тревожно", "Не могу уснуть", "Расскажи технику", "Нужна опора"];

const scriptedReplies = [
  "Похоже, тревога сейчас пытается защитить тебя, но делает это слишком громко. Давай сначала снизим интенсивность, а уже потом будем разбираться.",
  "Заметь, где это ощущается в теле: грудь, живот, горло, плечи. Не надо ничего исправлять, просто отметь место и силу от 1 до 10.",
  "Попробуем технику 3-3-3: назови три предмета вокруг, три звука и три телесных ощущения. Это помогает мозгу вернуться в настоящий момент.",
  "Теперь коротко запиши мысль, которая сильнее всего разгоняет тревогу. Потом спроси себя: какие факты за нее, а какие против?",
  "Домашнее задание мягкое: сегодня один раз повтори технику 3-3-3 и отметь, на сколько пунктов изменилась тревога.",
];

const programs = [
  {
    title: "7 дней против тревоги",
    caption: "короткие ежедневные шаги",
    progress: 42,
    icon: Wind,
    days: ["Карта тревоги", "Дыхание 4-6", "Проверка мыслей", "Маленькое действие"],
  },
  {
    title: "Гигиена сна",
    caption: "ритм, вечерний ритуал, разгрузка",
    progress: 18,
    icon: Moon,
    days: ["Сонный дневник", "Тихий час", "Ритуал отключения"],
  },
  {
    title: "Опора на себя",
    caption: "самооценка без жесткости",
    progress: 64,
    icon: Leaf,
    days: ["Внутренний критик", "Факты обо мне", "Просьба о поддержке"],
  },
];

const profileItems = [
  { label: "Мои заметки", icon: BookOpen },
  { label: "Напоминания", icon: Bell },
  { label: "Настройки", icon: Settings },
  { label: "О приложении", icon: CircleHelp },
];

let messageCounter = 0;

function makeMessage(role: Role, text: string): Message {
  messageCounter += 1;
  return { id: `message-${messageCounter}`, role, text };
}

function haptic(style: "light" | "medium" = "light") {
  if (typeof window === "undefined") return;
  const telegram = (
    window as Window & {
      Telegram?: {
        WebApp?: {
          HapticFeedback?: {
            impactOccurred?: (style: "light" | "medium" | "heavy") => void;
            selectionChanged?: () => void;
          };
        };
      };
    }
  ).Telegram?.WebApp?.HapticFeedback;
  telegram?.impactOccurred?.(style);
  if (!telegram && navigator.vibrate) navigator.vibrate(style === "medium" ? 18 : 8);
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function toneClasses(tone: ModuleOption["tone"]) {
  return {
    lavender: "bg-[var(--lavender-soft)] text-[var(--lavender-deep)]",
    pink: "bg-[var(--pink-soft)] text-[var(--pink-deep)]",
    green: "bg-[var(--green-soft)] text-[var(--green-deep)]",
  }[tone];
}

function AppButton({
  children,
  onClick,
  variant = "dark",
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "dark" | "soft" | "ghost";
  className?: string;
}) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.96 }}
      onClick={() => {
        haptic("light");
        onClick?.();
      }}
      className={cx(
        "inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-5 text-[15px] font-semibold transition",
        variant === "dark" && "bg-[var(--ink)] text-white shadow-[0_18px_40px_rgba(17,17,17,0.14)]",
        variant === "soft" && "bg-white text-[var(--ink)] shadow-[0_12px_30px_rgba(17,17,17,0.07)]",
        variant === "ghost" && "bg-[var(--card)] text-[var(--ink)]",
        className,
      )}
    >
      {children}
    </motion.button>
  );
}

function ScreenShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--page)] text-[var(--ink)] sm:flex sm:items-center sm:justify-center sm:p-6">
      <div className="relative mx-auto flex h-[100svh] w-full max-w-[430px] overflow-hidden bg-[var(--app)] shadow-2xl sm:h-[calc(100svh-48px)] sm:max-h-[844px] sm:rounded-[42px] sm:border sm:border-black/10">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-16 bg-gradient-to-b from-[var(--app)] via-[var(--app)]/80 to-transparent" />
        <div className="pointer-events-none absolute -right-16 top-16 h-44 w-44 rounded-full bg-[var(--lavender)]/25 blur-3xl" />
        <div className="pointer-events-none absolute -left-16 top-56 h-36 w-36 rounded-full bg-[var(--pink)]/20 blur-3xl" />
        <div className="relative z-10 flex min-h-0 flex-1 flex-col">{children}</div>
      </div>
    </div>
  );
}

function TopBar({ compact = false }: { compact?: boolean }) {
  return (
    <div className="relative z-30 flex items-center justify-between px-5 pb-1 pt-[max(14px,env(safe-area-inset-top))] text-xs font-semibold text-black/55">
      <span>9:41</span>
      <span className={cx("rounded-full bg-white/80 px-3 py-1 shadow-sm", compact && "bg-[var(--card)]")}>
        AI-психолог · Mini App
      </span>
    </div>
  );
}

function FloatingMotes() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.span
          key={i}
          animate={{ y: [0, -14, 0], opacity: [0.35, 0.75, 0.35] }}
          transition={{ duration: 3.2 + i * 0.45, repeat: Infinity, ease: "easeInOut" }}
          className={cx(
            "absolute h-2 w-2 rounded-full",
            i % 2 ? "bg-[var(--pink)]" : "bg-[var(--lavender)]",
          )}
          style={{ left: `${18 + i * 17}%`, top: `${18 + i * 11}%` }}
        />
      ))}
    </div>
  );
}

function OnboardingScreen({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  const item = onboarding[step];
  const Icon = item.icon;
  const isLast = step === onboarding.length - 1;

  function next() {
    haptic("medium");
    if (isLast) onDone();
    else setStep((value) => value + 1);
  }

  return (
    <div className="relative flex h-full flex-col px-6 pb-7">
      <TopBar />
      <FloatingMotes />
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 28, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -24, scale: 0.98 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={(_, info) => {
              if (info.offset.x < -70) next();
              if (info.offset.x > 70 && step > 0) {
                haptic("light");
                setStep((value) => value - 1);
              }
            }}
            className="flex flex-col items-center"
          >
            <motion.div
              animate={{ rotate: [0, -3, 3, 0], y: [0, -4, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="relative mb-8 flex h-32 w-32 items-center justify-center rounded-[38px] bg-white shadow-[0_22px_60px_rgba(120,103,224,0.18)]"
            >
              <div className="absolute inset-4 rounded-[30px] bg-[var(--lavender-soft)]" />
              <Icon className="relative text-[var(--lavender-deep)]" size={48} strokeWidth={1.8} />
              <motion.span
                animate={{ scale: [1, 1.18, 1] }}
                transition={{ duration: 2.2, repeat: Infinity }}
                className="absolute -right-2 top-4 h-7 w-7 rounded-full bg-[var(--pink)]"
              />
            </motion.div>
            <h1 className="max-w-[330px] text-[34px] font-black leading-[0.98] tracking-[-0.04em]">
              {item.title}
            </h1>
            <p className="mt-5 max-w-[320px] text-[15px] leading-relaxed text-[var(--muted)]">{item.text}</p>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-center gap-2">
          {onboarding.map((entry, index) => (
            <motion.span
              key={entry.title}
              animate={{ width: index === step ? 28 : 8, opacity: index === step ? 1 : 0.28 }}
              className="h-2 rounded-full bg-[var(--lavender-deep)]"
            />
          ))}
        </div>
        <AppButton onClick={next} className="w-full">
          {isLast ? "Начать" : "Далее"}
          <ChevronRight size={18} />
        </AppButton>
      </div>
    </div>
  );
}

function ModuleScreen({ onSelect }: { onSelect: (module: ModuleOption) => void }) {
  return (
    <div className="flex h-full flex-col px-5 pb-5">
      <TopBar compact />
      <div className="mt-4">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--lavender-deep)]">
          Шаг 1 из 2 · всё бесплатно
        </p>
        <h1 className="mt-3 text-[32px] font-black leading-none tracking-[-0.04em]">
          С чем хочешь поработать?
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
          Все модули открыты для демо, чтобы перейти к основным окнам без paywall.
        </p>
      </div>
      <div className="mt-5 grid flex-1 grid-cols-2 gap-3 overflow-y-auto pb-2">
        {modules.map((module, index) => {
          const Icon = module.icon;
          return (
            <motion.button
              key={module.id}
              type="button"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.035 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                haptic("light");
                onSelect(module);
              }}
              className="group relative flex min-h-[142px] flex-col justify-between overflow-hidden rounded-[26px] bg-white p-4 text-left shadow-[0_12px_30px_rgba(17,17,17,0.06)]"
            >
              <motion.span
                animate={{ x: [0, 6, 0], y: [0, -5, 0] }}
                transition={{ duration: 3.4, repeat: Infinity, delay: index * 0.2 }}
                className={cx("absolute -right-5 -top-5 h-20 w-20 rounded-full opacity-60", toneClasses(module.tone))}
              />
              <span className="relative flex items-start justify-between">
                <span className={cx("flex h-11 w-11 items-center justify-center rounded-2xl", toneClasses(module.tone))}>
                  <Icon size={22} strokeWidth={1.9} />
                </span>
                <span className="rounded-full bg-[var(--green-soft)] px-2 py-1 text-[10px] font-black uppercase text-[var(--green-deep)]">
                  free
                </span>
              </span>
              <span className="relative">
                <span className="block text-[16px] font-extrabold leading-tight tracking-[-0.02em]">
                  {module.title}
                </span>
                <span className="mt-1 block text-xs text-[var(--muted)]">{module.caption}</span>
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

function MethodScreen({
  module,
  onBack,
  onSelect,
}: {
  module: ModuleOption;
  onBack: () => void;
  onSelect: (method: MethodOption) => void;
}) {
  return (
    <div className="flex h-full flex-col px-5 pb-5">
      <TopBar compact />
      <div className="mt-4">
        <button
          type="button"
          onClick={onBack}
          className="mb-4 rounded-full bg-[var(--card)] px-4 py-2 text-sm font-semibold"
        >
          Назад
        </button>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--lavender-deep)]">
          {module.title} · шаг 2 из 2
        </p>
        <h1 className="mt-3 text-[32px] font-black leading-none tracking-[-0.04em]">Выбери подход</h1>
        <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
          Для прототипа доступны все форматы работы. Выбор меняет тон чата и упражнения.
        </p>
      </div>
      <div className="mt-5 flex-1 space-y-3 overflow-y-auto pb-2">
        {methods.map((method, index) => {
          const Icon = method.icon;
          return (
            <motion.button
              key={method.id}
              type="button"
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.035 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                haptic("medium");
                onSelect(method);
              }}
              className="flex w-full items-center gap-3 rounded-[24px] bg-white p-4 text-left shadow-[0_12px_30px_rgba(17,17,17,0.055)]"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--lavender-soft)] text-[var(--lavender-deep)]">
                <Icon size={22} strokeWidth={1.9} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[16px] font-extrabold tracking-[-0.02em]">{method.title}</span>
                <span className="mt-0.5 block truncate text-xs text-[var(--muted)]">{method.caption}</span>
              </span>
              <BadgeCheck className="text-[var(--green-deep)]" size={20} />
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex justify-start">
      <div className="flex items-center gap-1 rounded-[22px] bg-[var(--card)] px-4 py-3">
        {[0, 1, 2].map((dot) => (
          <motion.span
            key={dot}
            animate={{ y: [0, -5, 0], opacity: [0.35, 1, 0.35] }}
            transition={{ duration: 0.9, repeat: Infinity, delay: dot * 0.14 }}
            className="h-1.5 w-1.5 rounded-full bg-black/45"
          />
        ))}
      </div>
    </motion.div>
  );
}

function ChatScreen({
  module,
  method,
  onPremium,
  onReset,
}: {
  module: ModuleOption;
  method: MethodOption;
  onPremium: () => void;
  onReset: () => void;
}) {
  const [messages, setMessages] = useState<Message[]>([
    makeMessage(
      "assistant",
      `Привет. Мы выбрали "${module.title}" и подход "${method.title}". Я рядом. Расскажи, что сейчас происходит?`,
    ),
  ]);
  const [input, setInput] = useState("");
  const [replyIndex, setReplyIndex] = useState(0);
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  function send(text: string) {
    const content = text.trim();
    if (!content || typing) return;
    haptic("light");
    setInput("");
    setMessages((current) => [...current, makeMessage("user", content)]);
    setTyping(true);
    window.setTimeout(() => {
      setMessages((current) => [...current, makeMessage("assistant", scriptedReplies[replyIndex % scriptedReplies.length])]);
      setReplyIndex((value) => value + 1);
      setTyping(false);
      haptic("medium");
    }, 850);
  }

  return (
    <div className="flex h-full flex-col">
      <header className="border-b border-black/5 bg-white/70 px-5 pb-3 pt-4 backdrop-blur">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[17px] font-extrabold tracking-[-0.03em]">
              {module.title} · {method.title}
            </p>
            <p className="mt-0.5 text-xs text-[var(--green-deep)]">Demo Free · без ограничений</p>
          </div>
          <button
            type="button"
            onClick={() => {
              haptic("light");
              onReset();
            }}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--card)]"
            aria-label="Сбросить выбор"
          >
            <RotateCcw size={17} />
          </button>
        </div>
      </header>
      <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={cx("flex", message.role === "user" ? "justify-end" : "justify-start")}
          >
            <div
              className={cx(
                "max-w-[82%] rounded-[24px] px-4 py-3 text-[14px] leading-relaxed",
                message.role === "user"
                  ? "bg-[var(--lavender)] text-[var(--ink)]"
                  : "bg-[var(--card)] text-[var(--ink)]",
              )}
            >
              {message.text}
            </div>
          </motion.div>
        ))}
        <AnimatePresence>{typing && <TypingIndicator />}</AnimatePresence>
        {messages.length > 5 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[24px] bg-[var(--pink-soft)] p-4"
          >
            <p className="text-sm font-extrabold">Premium доступен как демо</p>
            <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">
              Ничего не блокируем: можно открыть экран подписки и вернуться в чат.
            </p>
            <AppButton variant="soft" onClick={onPremium} className="mt-3 w-full">
              Посмотреть Premium
            </AppButton>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>
      <div className="border-t border-black/5 bg-white/85 px-4 pb-[max(10px,env(safe-area-inset-bottom))] pt-3 backdrop-blur">
        <div className="mb-2 flex gap-2 overflow-x-auto pb-1">
          {quickPrompts.map((prompt) => (
            <motion.button
              key={prompt}
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={() => send(prompt)}
              className="shrink-0 rounded-full bg-[var(--card)] px-4 py-2 text-xs font-semibold"
            >
              {prompt}
            </motion.button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && send(input)}
            placeholder="Напиши, что чувствуешь..."
            className="min-h-12 flex-1 rounded-full bg-[var(--card)] px-4 text-sm outline-none placeholder:text-black/35"
          />
          <motion.button
            type="button"
            whileTap={{ scale: 0.9 }}
            onClick={() => send(input)}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--ink)] text-white"
            aria-label="Отправить"
          >
            <Send size={18} />
          </motion.button>
        </div>
      </div>
    </div>
  );
}

function ProgramsScreen({ onPremium }: { onPremium: () => void }) {
  const [opened, setOpened] = useState<(typeof programs)[number] | null>(null);

  return (
    <div className="relative h-full overflow-hidden">
      <div className="flex h-full flex-col px-5 pb-5 pt-4">
        <h1 className="text-[32px] font-black leading-none tracking-[-0.04em]">Программы</h1>
        <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
          Все курсы открыты: короткие ежедневные шаги, прогресс и упражнения.
        </p>
        <div className="mt-5 flex-1 space-y-3 overflow-y-auto pb-2">
          {programs.map((program, index) => {
            const Icon = program.icon;
            return (
              <motion.button
                key={program.title}
                type="button"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  haptic("light");
                  setOpened(program);
                }}
                className="w-full rounded-[26px] bg-white p-4 text-left shadow-[0_12px_30px_rgba(17,17,17,0.055)]"
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--lavender-soft)] text-[var(--lavender-deep)]">
                    <Icon size={22} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[16px] font-extrabold tracking-[-0.02em]">{program.title}</span>
                    <span className="mt-1 block text-xs text-[var(--muted)]">{program.caption}</span>
                  </span>
                  <span className="rounded-full bg-[var(--green-soft)] px-2 py-1 text-[10px] font-black uppercase text-[var(--green-deep)]">
                    open
                  </span>
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--card)]">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${program.progress}%` }}
                      className="h-full rounded-full bg-[var(--lavender-deep)]"
                    />
                  </div>
                  <span className="text-xs font-bold text-black/45">{program.progress}%</span>
                </div>
              </motion.button>
            );
          })}
          <AppButton variant="ghost" onClick={onPremium} className="w-full">
            Посмотреть Premium-demo
          </AppButton>
        </div>
      </div>
      <AnimatePresence>
        {opened && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.32, ease: "easeOut" }}
            className="absolute inset-0 z-20 flex flex-col bg-[var(--app)] px-5 pb-5 pt-5"
          >
            <button
              type="button"
              onClick={() => setOpened(null)}
              className="mb-5 w-fit rounded-full bg-[var(--card)] px-4 py-2 text-sm font-semibold"
            >
              Назад
            </button>
            <h2 className="text-[30px] font-black leading-none tracking-[-0.04em]">{opened.title}</h2>
            <p className="mt-3 text-sm text-[var(--muted)]">{opened.caption}</p>
            <div className="mt-6 space-y-3">
              {opened.days.map((day, index) => (
                <div key={day} className="flex items-center gap-3 rounded-[22px] bg-white p-4">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--green-soft)] text-xs font-black text-[var(--green-deep)]">
                    {index + 1}
                  </span>
                  <span className="text-sm font-semibold">{day}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PremiumScreen({ onClose }: { onClose: () => void }) {
  const [success, setSuccess] = useState(false);
  const benefits = ["Все модули и методы", "Безлимит сообщений", "Программы и заметки", "Экспорт заметок"];

  function subscribe() {
    haptic("medium");
    setSuccess(true);
    window.setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 1300);
  }

  return (
    <div className="relative flex h-full flex-col px-5 pb-6 pt-5">
      <button
        type="button"
        onClick={onClose}
        className="ml-auto flex h-10 w-10 items-center justify-center rounded-full bg-[var(--card)]"
        aria-label="Закрыть"
      >
        <ChevronRight className="rotate-180" size={18} />
      </button>
      <div className="mt-5 text-center">
        <motion.div
          animate={{ rotate: [0, 4, -4, 0], scale: [1, 1.03, 1] }}
          transition={{ duration: 3.5, repeat: Infinity }}
          className="mx-auto flex h-24 w-24 items-center justify-center rounded-[32px] bg-[var(--lavender-soft)] text-[var(--lavender-deep)]"
        >
          <Sparkles size={42} />
        </motion.div>
        <h1 className="mt-6 text-[34px] font-black leading-none tracking-[-0.04em]">Premium</h1>
        <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
          Это демо-монетизация. Все форматы уже открыты, оплата не выполняется.
        </p>
      </div>
      <div className="mt-6 space-y-2">
        {benefits.map((benefit) => (
          <div key={benefit} className="flex items-center justify-between rounded-[20px] bg-white px-4 py-3">
            <span className="text-sm font-semibold">{benefit}</span>
            <BadgeCheck className="text-[var(--green-deep)]" size={18} />
          </div>
        ))}
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3">
        <button type="button" className="rounded-[24px] bg-white p-4 text-left">
          <span className="block text-sm font-extrabold">Месяц</span>
          <span className="mt-1 block text-xs text-[var(--muted)]">499 руб.</span>
        </button>
        <button type="button" className="relative rounded-[24px] bg-[var(--lavender-soft)] p-4 text-left">
          <span className="absolute -top-2 right-4 rounded-full bg-[var(--pink)] px-2 py-1 text-[10px] font-black text-white">
            выгодно
          </span>
          <span className="block text-sm font-extrabold">Год</span>
          <span className="mt-1 block text-xs text-[var(--muted)]">3 990 руб.</span>
        </button>
      </div>
      <div className="flex-1" />
      <AppButton onClick={subscribe} className="w-full">
        Показать успех
      </AppButton>
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-white/95 text-center backdrop-blur"
          >
            <motion.div
              initial={{ scale: 0.6, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 220, damping: 14 }}
              className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--green-soft)] text-[var(--green-deep)]"
            >
              <BadgeCheck size={38} />
            </motion.div>
            <p className="text-xl font-black tracking-[-0.03em]">Готово</p>
            <p className="mt-2 max-w-[260px] text-sm text-[var(--muted)]">Демо прошло успешно, деньги не списывались.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ProfileScreen({ onToast }: { onToast: (value: string) => void }) {
  return (
    <div className="flex h-full flex-col overflow-y-auto px-5 pb-28 pt-4">
      <h1 className="text-[32px] font-black leading-none tracking-[-0.04em]">Профиль</h1>
      <div className="mt-6 rounded-[28px] bg-white p-4 shadow-[0_12px_30px_rgba(17,17,17,0.055)]">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[var(--lavender)] to-[var(--pink)] text-lg font-black text-white">
            АН
          </div>
          <div>
            <p className="text-lg font-black tracking-[-0.03em]">Анна</p>
            <p className="mt-1 w-fit rounded-full bg-[var(--green-soft)] px-3 py-1 text-xs font-black text-[var(--green-deep)]">
              Demo Free · всё доступно
            </p>
          </div>
        </div>
      </div>
      <div className="mt-4 space-y-3">
        {profileItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.button
              key={item.label}
              type="button"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onToast("Раздел появится в следующей итерации")}
              className="flex w-full items-center justify-between rounded-[22px] bg-white p-4 text-left shadow-[0_10px_24px_rgba(17,17,17,0.045)]"
            >
              <span className="flex items-center gap-3 text-sm font-semibold">
                <Icon className="text-[var(--lavender-deep)]" size={19} />
                {item.label}
              </span>
              <ChevronRight className="text-black/25" size={18} />
            </motion.button>
          );
        })}
      </div>
      <div className="mt-5 rounded-[26px] bg-[var(--pink-soft)] p-4">
        <p className="text-sm font-extrabold">Если тебе плохо прямо сейчас</p>
        <p className="mt-2 text-xs leading-relaxed text-[var(--muted)]">
          Приложение сопровождает, но не заменяет психиатра, психотерапевта или экстренную помощь.
        </p>
        <a
          href="tel:88002000122"
          className="mt-3 flex items-center gap-2 rounded-full bg-white px-4 py-3 text-xs font-extrabold"
        >
          <Phone size={16} className="text-[var(--pink-deep)]" />
          8-800-2000-122
        </a>
      </div>
    </div>
  );
}

function BottomTabs({ active, onChange }: { active: Tab; onChange: (tab: Tab) => void }) {
  const tabs: Array<{ id: Tab; label: string; icon: LucideIcon }> = [
    { id: "chat", label: "Чат", icon: MessageCircle },
    { id: "programs", label: "Программы", icon: HomeIcon },
    { id: "profile", label: "Профиль", icon: SunMedium },
  ];

  return (
    <nav className="border-t border-black/5 bg-white/90 px-3 pb-[max(10px,env(safe-area-inset-bottom))] pt-2 backdrop-blur">
      <div className="grid grid-cols-3 gap-1 rounded-full bg-[var(--card)] p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const selected = active === tab.id;
          return (
            <motion.button
              key={tab.id}
              type="button"
              whileTap={{ scale: 0.94 }}
              onClick={() => {
                haptic("light");
                onChange(tab.id);
              }}
              className={cx(
                "relative flex flex-col items-center gap-1 rounded-full py-2 text-[11px] font-bold transition focus:outline-none",
                selected ? "text-[var(--ink)]" : "text-black/35",
              )}
            >
              {selected && (
                <motion.span
                  layoutId="active-tab"
                  className="absolute inset-0 rounded-full bg-white shadow-[0_8px_20px_rgba(17,17,17,0.08)]"
                />
              )}
              <Icon className="relative" size={20} />
              <span className="relative">{tab.label}</span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}

function MainTabs({
  module,
  method,
  onPremium,
  onReset,
}: {
  module: ModuleOption;
  method: MethodOption;
  onPremium: () => void;
  onReset: () => void;
}) {
  const [tab, setTab] = useState<Tab>("chat");
  const [toast, setToast] = useState<string | null>(null);

  function showToast(value: string) {
    haptic("light");
    setToast(value);
    window.setTimeout(() => setToast(null), 1600);
  }

  return (
    <div className="relative flex h-full flex-col">
      <div className="min-h-0 flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {tab === "chat" && <ChatScreen module={module} method={method} onPremium={onPremium} onReset={onReset} />}
            {tab === "programs" && <ProgramsScreen onPremium={onPremium} />}
            {tab === "profile" && <ProfileScreen onToast={showToast} />}
          </motion.div>
        </AnimatePresence>
      </div>
      <BottomTabs active={tab} onChange={setTab} />
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="absolute bottom-24 left-1/2 z-40 -translate-x-1/2 whitespace-nowrap rounded-full bg-[var(--ink)] px-4 py-2 text-xs font-semibold text-white shadow-xl"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Home() {
  const [stage, setStage] = useState<Stage>("onboarding");
  const [selectedModule, setSelectedModule] = useState<ModuleOption | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<MethodOption | null>(null);

  const content = useMemo(() => {
    if (stage === "onboarding") return <OnboardingScreen onDone={() => setStage("module")} />;
    if (stage === "module") {
      return (
        <ModuleScreen
          onSelect={(module) => {
            setSelectedModule(module);
            setStage("method");
          }}
        />
      );
    }
    if (stage === "method" && selectedModule) {
      return (
        <MethodScreen
          module={selectedModule}
          onBack={() => setStage("module")}
          onSelect={(method) => {
            setSelectedMethod(method);
            setStage("main");
          }}
        />
      );
    }
    if (stage === "premium") {
      return <PremiumScreen onClose={() => setStage("main")} />;
    }
    if (selectedModule && selectedMethod) {
      return (
        <MainTabs
          module={selectedModule}
          method={selectedMethod}
          onPremium={() => setStage("premium")}
          onReset={() => {
            setSelectedModule(null);
            setSelectedMethod(null);
            setStage("module");
          }}
        />
      );
    }
    return <ModuleScreen onSelect={(module) => {
      setSelectedModule(module);
      setStage("method");
    }} />;
  }, [selectedMethod, selectedModule, stage]);

  return (
    <ScreenShell>
      <AnimatePresence mode="wait">
        <motion.div
          key={stage}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          className="h-full"
        >
          {content}
        </motion.div>
      </AnimatePresence>
    </ScreenShell>
  );
}
