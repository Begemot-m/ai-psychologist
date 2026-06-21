"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  BadgeCheck,
  BarChart3,
  Bell,
  BookOpen,
  Brain,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Flame,
  HeartHandshake,
  Home as HomeIcon,
  Leaf,
  MessageCircle,
  Moon,
  Orbit,
  Pause,
  Play,
  RotateCcw,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
  Star,
  SunMedium,
  Target,
  TimerReset,
  Waves,
  Wind,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

type Stage = "onboarding" | "intake" | "module" | "method" | "main" | "premium";
type Tab = "chat" | "programs" | "profile";
type Role = "assistant" | "user";
type Tone = "lavender" | "pink" | "green" | "sun";

type ModuleOption = {
  id: string;
  title: string;
  caption: string;
  description: string;
  outcomes: string[];
  tags: string[];
  prompt: string;
  icon: LucideIcon;
  tone: Tone;
};

type MethodOption = {
  id: string;
  title: string;
  caption: string;
  bestFor: string;
  howWorks: string;
  flow: string[];
  question: string;
  icon: LucideIcon;
  tone: Tone;
};

type IntakeQuestion = {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  options: Array<{ label: string; detail: string; icon: LucideIcon; value: string }>;
};

type Message = {
  id: string;
  role: Role;
  text: string;
};

const onboarding = [
  {
    title: "Психологический ассистент, который не поддакивает",
    text: "Обычный чат часто соглашается и быстро раздаёт советы. Здесь ответы построены как бережное сопровождение: сначала понять состояние, потом подобрать самопомощь.",
    icon: ShieldCheck,
  },
  {
    title: "Методики собирали практикующие психологи",
    text: "Внутри сценарии КПТ, ACT, гештальта, майндфулнеса и кризисной поддержки. Ассистент не спорит с болью и не обесценивает её.",
    icon: HeartHandshake,
  },
  {
    title: "Безопаснее, чем искать ответ в одиночку",
    text: "Мы отличаем поддержку от терапии, напоминаем про живых специалистов и помогаем делать маленькие действия, а не зависать в бесконечном диалоге.",
    icon: BadgeCheck,
  },
  {
    title: "Сначала спросим, потом ответим",
    text: "Перед чатом есть короткое анкетирование. Оно создаёт ощущение, что твоей ситуацией правда интересуются, а не кидают универсальную фразу.",
    icon: Sparkles,
  },
];

const intakeQuestions: IntakeQuestion[] = [
  {
    id: "state",
    eyebrow: "1 из 5",
    title: "Что сейчас сильнее всего давит?",
    subtitle: "Выбери главный фокус. Потом можно будет поменять.",
    options: [
      { label: "Тревога", detail: "много мыслей, напряжение, ожидание плохого", icon: Wind, value: "anxiety" },
      { label: "Усталость", detail: "нет сил, всё раздражает, хочется выключиться", icon: Flame, value: "burnout" },
      { label: "Отношения", detail: "сложно говорить, держать границы, не обвинять себя", icon: HeartHandshake, value: "relations" },
    ],
  },
  {
    id: "body",
    eyebrow: "2 из 5",
    title: "Где это заметнее?",
    subtitle: "Так ассистент подберёт более точное упражнение.",
    options: [
      { label: "В теле", detail: "ком в горле, грудь, живот, плечи", icon: Activity, value: "body" },
      { label: "В мыслях", detail: "прокручивание, катастрофы, самокритика", icon: Brain, value: "thoughts" },
      { label: "В поведении", detail: "избегание, срывы, прокрастинация", icon: Zap, value: "actions" },
    ],
  },
  {
    id: "intensity",
    eyebrow: "3 из 5",
    title: "Насколько это остро прямо сейчас?",
    subtitle: "Нам важно не перегрузить тебя техникой.",
    options: [
      { label: "3-4 из 10", detail: "неприятно, но могу размышлять", icon: Leaf, value: "mild" },
      { label: "5-7 из 10", detail: "накрывает, нужна опора и структура", icon: Waves, value: "medium" },
      { label: "8-10 из 10", detail: "очень тяжело, нужен максимально простой шаг", icon: ShieldCheck, value: "high" },
    ],
  },
  {
    id: "style",
    eyebrow: "4 из 5",
    title: "Какой тон сейчас нужен?",
    subtitle: "Ассистент не обязан звучать одинаково для всех.",
    options: [
      { label: "Мягко", detail: "больше поддержки, меньше анализа", icon: HeartHandshake, value: "soft" },
      { label: "Структурно", detail: "план, шаги, вопросы по делу", icon: Target, value: "structured" },
      { label: "Очень кратко", detail: "без длинных объяснений, только ближайший шаг", icon: TimerReset, value: "brief" },
    ],
  },
  {
    id: "goal",
    eyebrow: "5 из 5",
    title: "Что будет хорошим результатом сегодня?",
    subtitle: "Не «починить жизнь», а сделать один посильный сдвиг.",
    options: [
      { label: "Успокоиться", detail: "снизить интенсивность и вернуться в тело", icon: Wind, value: "calm" },
      { label: "Понять себя", detail: "назвать чувство и потребность", icon: CircleHelp, value: "understand" },
      { label: "Сделать шаг", detail: "выбрать действие на 10-15 минут", icon: Check, value: "step" },
    ],
  },
];

const modules: ModuleOption[] = [
  {
    id: "anxiety",
    title: "Тревожность",
    caption: "мысли, тело, сон",
    description: "Помогает снизить интенсивность тревоги, отделить факты от прогнозов и вернуть внимание в настоящий момент.",
    outcomes: ["быстрая стабилизация", "карта тревожной мысли", "план маленького действия"],
    tags: ["КПТ", "ACT", "дыхание"],
    prompt: "Начнём с того, как тревога звучит в голове и где живёт в теле.",
    icon: Wind,
    tone: "lavender",
  },
  {
    id: "burnout",
    title: "Выгорание",
    caption: "ресурс и границы",
    description: "Для состояния, когда всё стало слишком дорого по энергии: работа, люди, решения и даже отдых.",
    outcomes: ["оценка ресурса", "границы на сегодня", "мягкое восстановление"],
    tags: ["энергия", "границы", "ритм"],
    prompt: "Сначала поймём, где утекают силы и что можно снять уже сегодня.",
    icon: Flame,
    tone: "pink",
  },
  {
    id: "relations",
    title: "Отношения",
    caption: "контакт и опора",
    description: "Помогает не провалиться в вину или нападение, а сформулировать чувства, границы и просьбу.",
    outcomes: ["я-сообщение", "границы", "подготовка разговора"],
    tags: ["диалог", "границы", "эмоции"],
    prompt: "Разберём, что ты чувствуешь, чего хочешь и какой разговор будет бережным.",
    icon: HeartHandshake,
    tone: "green",
  },
  {
    id: "esteem",
    title: "Самооценка",
    caption: "критик и опора",
    description: "Для моментов, когда внутренний голос становится жёстче реальности и забирает право ошибаться.",
    outcomes: ["голос критика", "факты о себе", "поддерживающая формулировка"],
    tags: ["самокритика", "стыд", "опора"],
    prompt: "Посмотрим, где говорит критик, а где можно вернуть себе человеческий масштаб.",
    icon: Star,
    tone: "sun",
  },
  {
    id: "sleep",
    title: "Сон",
    caption: "вечер и разгрузка",
    description: "Помогает не спорить с бессонницей, а разгрузить голову и собрать вечерний ритуал.",
    outcomes: ["разгрузка мыслей", "ритуал сна", "снижение возбуждения"],
    tags: ["сон", "ритуал", "тело"],
    prompt: "Сделаем так, чтобы ночь перестала быть местом для тяжёлых переговоров с собой.",
    icon: Moon,
    tone: "lavender",
  },
  {
    id: "crisis",
    title: "Острое состояние",
    caption: "безопасность и первый шаг",
    description: "Максимально простая поддержка на ближайшие минуты: стабилизация, контакт с реальностью, план помощи.",
    outcomes: ["заземление", "план безопасности", "контакт с помощью"],
    tags: ["кризис", "простые шаги", "помощь"],
    prompt: "Сейчас не будем усложнять. Сначала безопасность и самый маленький следующий шаг.",
    icon: ShieldCheck,
    tone: "pink",
  },
];

const methods: MethodOption[] = [
  {
    id: "cbt",
    title: "КПТ",
    caption: "мысли, факты, действия",
    bestFor: "когда мысли разгоняют тревогу или самокритику",
    howWorks: "Помогает увидеть автоматическую мысль, проверить её на факты и выбрать действие, которое возвращает контроль.",
    flow: ["заметить мысль", "найти искажение", "проверить факты", "сделать маленький шаг"],
    question: "Какая мысль сейчас звучит громче всего?",
    icon: Target,
    tone: "lavender",
  },
  {
    id: "gestalt",
    title: "Гештальт",
    caption: "чувства и потребности",
    bestFor: "когда много эмоций, но сложно понять, о чём они",
    howWorks: "Возвращает внимание к переживанию здесь и сейчас: что ты чувствуешь, чего хочешь, где граница.",
    flow: ["назвать чувство", "найти потребность", "заметить границу", "сформулировать просьбу"],
    question: "Если чувство могло бы говорить, что бы оно попросило?",
    icon: Orbit,
    tone: "green",
  },
  {
    id: "act",
    title: "ACT",
    caption: "принятие и ценности",
    bestFor: "когда нельзя быстро убрать боль, но можно выбрать направление",
    howWorks: "Не спорит с переживанием, а помогает отделиться от мысли и сделать шаг в сторону ценностей.",
    flow: ["заметить мысль", "дать ей имя", "найти ценность", "выбрать действие"],
    question: "Что для тебя важно даже рядом с этой тревогой?",
    icon: Leaf,
    tone: "pink",
  },
  {
    id: "schema",
    title: "Схема-терапия",
    caption: "паттерны и режимы",
    bestFor: "когда ситуация повторяется и кажется знакомо болезненной",
    howWorks: "Помогает увидеть устойчивый сценарий, режим внутреннего критика или уязвимой части и дать ей другой ответ.",
    flow: ["узнать сценарий", "назвать режим", "отделить прошлое", "поддержать взрослую часть"],
    question: "На что из прошлого это похоже по ощущению?",
    icon: Sparkles,
    tone: "sun",
  },
  {
    id: "mindfulness",
    title: "Майндфулнес",
    caption: "тело и внимание",
    bestFor: "когда нужно быстро снизить накал и вернуться в тело",
    howWorks: "Через дыхание, ощущения и наблюдение помогает перестать слипаться с мыслью и стабилизироваться.",
    flow: ["дыхание", "ощущения", "звуки", "мягкое действие"],
    question: "Что ты замечаешь телом прямо сейчас?",
    icon: Wind,
    tone: "lavender",
  },
];

const scriptedReplies = [
  "Я не буду спорить с твоей тревогой или уговаривать тебя «просто успокоиться». Давай сначала снизим громкость состояния: поставь обе стопы на пол и найди глазами три спокойных объекта рядом.",
  "Теперь коротко: что тревога пытается предотвратить? Часто она звучит как защита, но выбирает слишком жёсткий способ. Мы можем поблагодарить её за сигнал и всё равно не отдавать ей руль.",
  "Техника на минуту: вдох на 4, выдох на 6. На выдохе расслабь челюсть и плечи. Повтори 5 циклов. Цель не «убрать всё», а снизить интенсивность хотя бы на один пункт.",
  "Если смотреть по КПТ, нам нужна мысль, которая разгоняет состояние. Запиши её одной фразой. Потом спросим: какие факты за неё, какие против, и какой более честный вариант звучит без самообмана.",
  "Мягкое задание: сегодня выбери одно действие на 10 минут, которое поддерживает тебя, а не доказывает твою продуктивность. После отметь: стало легче, тяжелее или так же?",
];

const programs = [
  {
    title: "7 дней против тревоги",
    caption: "короткие ежедневные шаги",
    progress: 42,
    icon: Wind,
    tone: "lavender" as Tone,
    goal: "снизить тревожный фон и вернуть чувство управляемости",
    stats: ["7 дней", "10 мин/день", "3 техники"],
    days: [
      { title: "Карта тревоги", detail: "отмечаем триггеры, мысли и телесные сигналы" },
      { title: "Дыхание 4-6", detail: "снижаем возбуждение нервной системы" },
      { title: "Проверка мысли", detail: "ищем факты вместо прогнозов" },
      { title: "Маленькое действие", detail: "возвращаем контроль через конкретный шаг" },
    ],
  },
  {
    title: "Гигиена сна",
    caption: "вечерний ритуал и разгрузка",
    progress: 18,
    icon: Moon,
    tone: "pink" as Tone,
    goal: "не бороться со сном, а снижать вечернее напряжение",
    stats: ["5 вечеров", "12 мин", "сонный дневник"],
    days: [
      { title: "Разгрузка головы", detail: "выносим мысли из кровати на бумагу" },
      { title: "Тихий час", detail: "собираем мягкий переход ко сну" },
      { title: "Если не уснулось", detail: "план без паники и самокритики" },
    ],
  },
  {
    title: "Опора на себя",
    caption: "самооценка без жесткости",
    progress: 64,
    icon: Leaf,
    tone: "green" as Tone,
    goal: "ослабить внутреннего критика и собрать факты поддержки",
    stats: ["6 шагов", "дневник", "границы"],
    days: [
      { title: "Голос критика", detail: "отделяем факт от нападения" },
      { title: "Факты обо мне", detail: "собираем доказательства устойчивости" },
      { title: "Просьба о поддержке", detail: "формулируем её без стыда" },
    ],
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

function haptic(style: "light" | "medium" | "heavy" = "light") {
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
  if (!telegram && navigator.vibrate) navigator.vibrate(style === "heavy" ? 22 : style === "medium" ? 14 : 7);
}

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

function toneFill(tone: Tone) {
  return {
    lavender: "from-[var(--lavender)] to-[var(--pink)]",
    pink: "from-[var(--pink)] to-[var(--sun)]",
    green: "from-[var(--green)] to-[var(--lavender)]",
    sun: "from-[var(--sun)] to-[var(--pink)]",
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
  variant?: "dark" | "soft" | "ghost" | "accent";
  className?: string;
}) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.965 }}
      whileHover={{ y: -1 }}
      onClick={() => {
        haptic("light");
        onClick?.();
      }}
      className={cx(
        "inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-5 text-[15px] font-bold transition focus:outline-none",
        variant === "dark" && "bg-[var(--ink)] text-white shadow-[0_18px_40px_rgba(17,17,17,0.14)]",
        variant === "soft" && "bg-white text-[var(--ink)] shadow-[0_12px_30px_rgba(17,17,17,0.07)]",
        variant === "ghost" && "bg-[var(--card)] text-[var(--ink)]",
        variant === "accent" && "bg-[var(--lavender)] text-[var(--ink)] shadow-[0_16px_38px_rgba(122,103,224,0.2)]",
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
      <div className="luxury-grain relative mx-auto flex h-[100svh] w-full max-w-[430px] overflow-hidden bg-[var(--app)] shadow-[0_30px_100px_rgba(54,35,72,0.22)] sm:h-[calc(100svh-48px)] sm:max-h-[844px] sm:rounded-[46px] sm:border sm:border-white/55">
        <div className="pointer-events-none absolute -right-20 top-12 h-52 w-52 rounded-full bg-[var(--lavender)]/30 blur-3xl" />
        <div className="pointer-events-none absolute -left-24 top-72 h-48 w-48 rounded-full bg-[var(--pink)]/22 blur-3xl" />
        <div className="pointer-events-none absolute bottom-8 right-10 h-44 w-44 rounded-full bg-[var(--sun)]/18 blur-3xl" />
        <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-14 bg-gradient-to-b from-[var(--app)]/90 to-transparent" />
        <div className="relative z-10 flex min-h-0 min-w-0 flex-1 flex-col">{children}</div>
      </div>
    </div>
  );
}

function TopBar({ label = "AI-психолог · Mini App" }: { label?: string }) {
  return (
    <div className="relative z-30 flex items-center justify-between px-5 pb-1 pt-[max(14px,env(safe-area-inset-top))] text-xs font-bold text-black/55">
      <span>9:41</span>
      <span className="rounded-full bg-white/86 px-3 py-1 shadow-[0_8px_22px_rgba(17,17,17,0.06)]">{label}</span>
    </div>
  );
}

function MotionGlyph({ icon: Icon, tone, active = false }: { icon: LucideIcon; tone: Tone; active?: boolean }) {
  return (
    <motion.div
      animate={active ? { y: [0, -5, 0], rotate: [0, -2, 2, 0] } : { y: [0, -3, 0] }}
      transition={{ duration: active ? 2.8 : 4, repeat: Infinity, ease: "easeInOut" }}
      className={cx(
        "relative flex h-16 w-16 shrink-0 items-center justify-center rounded-[24px] bg-white shadow-[0_16px_42px_rgba(17,17,17,0.08)]",
      )}
    >
      <motion.span
        animate={{ scale: active ? [1, 1.12, 1] : [1, 1.06, 1], opacity: [0.6, 0.9, 0.6] }}
        transition={{ duration: 2.4, repeat: Infinity }}
        className={cx("absolute inset-3 rounded-[18px]", toneClasses(tone))}
      />
      <Icon className="relative" size={28} strokeWidth={1.9} />
      <span className={cx("absolute -right-1 top-2 h-4 w-4 rounded-full bg-gradient-to-br", toneFill(tone))} />
    </motion.div>
  );
}

function VoiceOrb({ thinking = false, small = false }: { thinking?: boolean; small?: boolean }) {
  const size = small ? "h-20 w-20" : "h-[120px] w-[120px]";
  return (
    <div className={cx("siri-glow relative flex items-center justify-center", size)}>
      {[0, 1, 2, 3].map((ring) => (
        <motion.span
          key={ring}
          animate={{
            borderRadius: ["42% 58% 56% 44%", "58% 42% 45% 55%", "48% 52% 62% 38%", "42% 58% 56% 44%"],
            scale: thinking ? [0.74, 1.18 + ring * 0.05, 0.82] : [0.86, 1.02 + ring * 0.03, 0.88],
            opacity: thinking ? [0.72, 0.28, 0.58] : [0.42, 0.2, 0.36],
            rotate: [0, ring % 2 ? -28 : 28, 0],
          }}
          transition={{ duration: thinking ? 1.45 + ring * 0.2 : 4.8 + ring * 0.7, repeat: Infinity, ease: "easeInOut" }}
          className={cx(
            "absolute blur-[1px]",
            size,
            ring === 0 && "bg-[var(--lavender)]",
            ring === 1 && "bg-[var(--pink)]",
            ring === 2 && "bg-[var(--green)]",
            ring === 3 && "bg-[var(--sun)]",
          )}
        />
      ))}
      <motion.span
        animate={{
          borderRadius: ["35% 65% 56% 44%", "58% 42% 38% 62%", "45% 55% 64% 36%", "35% 65% 56% 44%"],
          scale: thinking ? [1, 0.92, 1.06, 0.98, 1] : [1, 1.035, 1],
        }}
        transition={{ duration: thinking ? 1.05 : 3.6, repeat: Infinity, ease: "easeInOut" }}
        className={cx(
          "relative bg-white/78 shadow-[inset_0_1px_12px_rgba(255,255,255,0.9),0_26px_80px_rgba(122,83,166,0.24)] backdrop-blur",
          small ? "h-11 w-11" : "h-[72px] w-[72px]",
        )}
      />
    </div>
  );
}

function VoiceBars({ thinking }: { thinking: boolean }) {
  return (
    <div className="flex h-6 items-center justify-center gap-1.5">
      {[0, 1, 2, 3, 4, 5, 6].map((bar) => (
        <motion.span
          key={bar}
          animate={{ height: thinking ? [8, 26 - Math.abs(3 - bar) * 3, 10] : [8, 13 + (bar % 3) * 2, 8], opacity: thinking ? [0.48, 1, 0.58] : [0.3, 0.6, 0.3] }}
          transition={{ duration: thinking ? 0.82 : 2.4, repeat: Infinity, delay: bar * 0.06, ease: "easeInOut" }}
          className="w-1.5 rounded-full bg-gradient-to-b from-[var(--pink)] via-[var(--lavender)] to-[var(--green)]"
        />
      ))}
    </div>
  );
}

function VoiceStage({ thinking, title, subtitle }: { thinking: boolean; title: string; subtitle: string }) {
  return (
    <div className="relative overflow-hidden rounded-[34px] border border-white/70 bg-white/50 px-4 pb-4 pt-4 shadow-[0_24px_68px_var(--soft-shadow)] backdrop-blur-2xl">
      <div className="absolute -left-10 top-8 h-32 w-32 rounded-full bg-[var(--pink)]/24 blur-3xl" />
      <div className="absolute -right-10 bottom-2 h-36 w-36 rounded-full bg-[var(--lavender)]/34 blur-3xl" />
      <div className="relative flex flex-col items-center text-center">
        <VoiceOrb thinking={thinking} />
        <VoiceBars thinking={thinking} />
        <p className="font-display text-[27px] leading-[1.02]">{title}</p>
        <p className="mt-1.5 max-w-[285px] text-[11px] font-semibold leading-relaxed text-[var(--muted)]">{subtitle}</p>
      </div>
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
    <div className="relative flex h-full flex-col px-6 pb-6">
      <TopBar />
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 28, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -24, scale: 0.98 }}
            transition={{ duration: 0.34, ease: "easeOut" }}
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
            <div className="mb-8">
              {step === 0 ? <VoiceOrb /> : <MotionGlyph icon={Icon} tone={step === 1 ? "green" : step === 2 ? "pink" : "lavender"} active />}
            </div>
            <p className="mb-3 rounded-full bg-white px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.12em] text-[var(--lavender-deep)] shadow-sm">
              не ChatGPT в другой обложке
            </p>
            <h1 className="max-w-[340px] text-[31px] font-extrabold leading-[1.02]">{item.title}</h1>
            <p className="mt-5 max-w-[330px] text-[15px] leading-relaxed text-[var(--muted)]">{item.text}</p>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-center gap-2">
          {onboarding.map((entry, index) => (
            <motion.span
              key={entry.title}
              animate={{ width: index === step ? 30 : 8, opacity: index === step ? 1 : 0.25 }}
              className="h-2 rounded-full bg-[var(--lavender-deep)]"
            />
          ))}
        </div>
        <AppButton onClick={next} className="w-full">
          {isLast ? "Собрать ассистента" : "Дальше"}
          <ChevronRight size={18} />
        </AppButton>
      </div>
    </div>
  );
}

function IntakeScreen({
  answers,
  onAnswer,
  onDone,
}: {
  answers: Record<string, string>;
  onAnswer: (id: string, value: string) => void;
  onDone: () => void;
}) {
  const [step, setStep] = useState(0);
  const question = intakeQuestions[step];
  const selected = answers[question.id];
  const isLast = step === intakeQuestions.length - 1;
  const progress = ((step + 1) / intakeQuestions.length) * 100;

  function next() {
    if (!selected) return;
    haptic("medium");
    if (isLast) onDone();
    else setStep((value) => value + 1);
  }

  return (
    <div className="flex h-full min-w-0 flex-col px-5 pb-5">
      <TopBar label="настройка ассистента" />
      <div className="mt-4">
        <div className="h-2 overflow-hidden rounded-full bg-black/5">
          <motion.div className="h-full rounded-full bg-[var(--ink)]" animate={{ width: `${progress}%` }} />
        </div>
        <p className="mt-4 text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--lavender-deep)]">{question.eyebrow}</p>
        <h1 className="mt-2 text-[29px] font-extrabold leading-[1.04]">{question.title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">{question.subtitle}</p>
      </div>
      <div className="mt-5 min-h-0 flex-1 space-y-3 overflow-y-auto pb-2">
        <AnimatePresence mode="popLayout">
          {question.options.map((option, index) => {
            const Icon = option.icon;
            const active = selected === option.value;
            return (
              <motion.button
                key={option.value}
                type="button"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ delay: index * 0.04 }}
                whileTap={{ scale: 0.985 }}
                onClick={() => {
                  haptic("light");
                  onAnswer(question.id, option.value);
                }}
                className={cx(
                  "flex w-full items-start gap-3 rounded-[26px] border p-4 text-left transition",
                  active ? "border-[var(--ink)] bg-white shadow-[0_18px_38px_rgba(17,17,17,0.08)]" : "border-transparent bg-white/72",
                )}
              >
                <span className={cx("flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl", active ? "bg-[var(--lavender-soft)] text-[var(--lavender-deep)]" : "bg-[var(--card)] text-black/45")}>
                  <Icon size={22} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[16px] font-extrabold">{option.label}</span>
                  <span className="mt-1 block text-[13px] leading-relaxed text-[var(--muted)]">{option.detail}</span>
                </span>
                {active && <BadgeCheck className="mt-1 text-[var(--green-deep)]" size={20} />}
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>
      <div className="flex gap-2">
        {step > 0 && (
          <AppButton variant="ghost" onClick={() => setStep((value) => value - 1)} className="w-14 px-0">
            <ChevronLeft size={18} />
          </AppButton>
        )}
        <AppButton onClick={next} className="flex-1" variant={selected ? "dark" : "ghost"}>
          {isLast ? "Показать подходы" : "Продолжить"}
          <ChevronRight size={18} />
        </AppButton>
      </div>
    </div>
  );
}

function ModuleScreen({ onSelect, answers }: { onSelect: (module: ModuleOption) => void; answers: Record<string, string> }) {
  const recommendedIndex = Math.max(0, modules.findIndex((module) => module.id === answers.state));
  const [activeIndex, setActiveIndex] = useState(recommendedIndex);
  const active = modules[activeIndex] ?? modules[0];
  const ActiveIcon = active.icon;

  return (
    <div className="flex h-full min-w-0 flex-col px-5 pb-5">
      <TopBar label="конструктор" />
      <div className="mt-4">
        <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--lavender-deep)]">персональная сборка</p>
        <h1 className="mt-2 text-[30px] font-extrabold leading-[1.02]">Выбери фокус работы</h1>
        <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
          Мы уже учли ответы анкеты. Можно взять рекомендацию или пролистать другие направления.
        </p>
      </div>
      <div className="mt-5 flex min-w-0 gap-3 overflow-x-auto pb-2">
        {modules.map((module, index) => {
          const Icon = module.icon;
          const selected = index === activeIndex;
          return (
            <motion.button
              key={module.id}
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                haptic("light");
                setActiveIndex(index);
              }}
              className={cx(
                "w-[132px] shrink-0 rounded-[28px] border p-3 text-left transition",
                selected ? "border-[var(--ink)] bg-white shadow-[0_16px_38px_rgba(17,17,17,0.08)]" : "border-transparent bg-white/60",
              )}
            >
              <span className={cx("mb-4 flex h-12 w-12 items-center justify-center rounded-2xl", toneClasses(module.tone))}>
                <Icon size={22} />
              </span>
              <span className="block text-[15px] font-extrabold leading-tight">{module.title}</span>
              <span className="mt-1 block text-[11px] text-[var(--muted)]">{module.caption}</span>
            </motion.button>
          );
        })}
      </div>
      <motion.div
        key={active.id}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-3 min-h-0 flex-1 overflow-hidden rounded-[34px] bg-white p-5 shadow-[0_18px_42px_rgba(17,17,17,0.07)]"
      >
        <div className="flex items-start gap-4">
          <MotionGlyph icon={ActiveIcon} tone={active.tone} active />
          <div className="min-w-0">
            <p className="text-xl font-extrabold">{active.title}</p>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{active.description}</p>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {active.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-[var(--card)] px-3 py-1.5 text-[11px] font-bold text-black/55">
              {tag}
            </span>
          ))}
        </div>
        <div className="mt-5 space-y-2">
          {active.outcomes.map((outcome) => (
            <div key={outcome} className="flex items-center gap-2 text-sm font-bold">
              <Check className="text-[var(--green-deep)]" size={16} />
              {outcome}
            </div>
          ))}
        </div>
        <div className="mt-5 rounded-[22px] bg-[var(--app)] p-4 text-[13px] leading-relaxed text-black/62">
          {active.prompt}
        </div>
      </motion.div>
      <AppButton onClick={() => onSelect(active)} className="mt-4 w-full">
        Выбрать направление
        <ChevronRight size={18} />
      </AppButton>
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
  const [activeIndex, setActiveIndex] = useState(0);
  const active = methods[activeIndex];
  const ActiveIcon = active.icon;

  return (
    <div className="flex h-full flex-col px-5 pb-5">
      <TopBar label={module.title} />
      <div className="mt-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => {
            haptic("light");
            onBack();
          }}
          className="rounded-full bg-[var(--card)] px-4 py-2 text-sm font-bold"
        >
          Назад
        </button>
        <span className="rounded-full bg-[var(--green-soft)] px-3 py-1 text-[11px] font-extrabold text-[var(--green-deep)]">
          всё открыто
        </span>
      </div>
      <h1 className="mt-4 text-[30px] font-extrabold leading-none">Как будем работать?</h1>
      <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
        Не просто список школ: каждый подход меняет вопросы, тон и тип упражнений.
      </p>
      <div className="mt-5 flex min-w-0 gap-3 overflow-x-auto pb-3">
        {methods.map((method, index) => {
          const Icon = method.icon;
          const selected = index === activeIndex;
          return (
            <motion.button
              key={method.id}
              type="button"
              whileTap={{ scale: 0.965 }}
              onClick={() => {
                haptic("light");
                setActiveIndex(index);
              }}
              className={cx(
                "w-[188px] shrink-0 rounded-[30px] border p-4 text-left transition",
                selected ? "border-[var(--ink)] bg-white shadow-[0_18px_42px_rgba(17,17,17,0.08)]" : "border-transparent bg-white/62",
              )}
            >
              <span className={cx("mb-4 flex h-12 w-12 items-center justify-center rounded-2xl", toneClasses(method.tone))}>
                <Icon size={22} />
              </span>
              <span className="block text-[17px] font-extrabold">{method.title}</span>
              <span className="mt-1 block text-xs leading-relaxed text-[var(--muted)]">{method.caption}</span>
            </motion.button>
          );
        })}
      </div>
      <motion.div
        key={active.id}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-0 flex-1 overflow-y-auto rounded-[34px] bg-white p-5 shadow-[0_18px_42px_rgba(17,17,17,0.07)]"
      >
        <div className="flex items-start gap-4">
          <MotionGlyph icon={ActiveIcon} tone={active.tone} active />
          <div>
            <p className="text-xl font-extrabold">{active.title}</p>
            <p className="mt-2 text-xs font-bold uppercase tracking-[0.08em] text-[var(--lavender-deep)]">
              лучше всего: {active.bestFor}
            </p>
          </div>
        </div>
        <p className="mt-5 text-sm leading-relaxed text-[var(--muted)]">{active.howWorks}</p>
        <div className="mt-5 grid grid-cols-2 gap-2">
          {active.flow.map((step, index) => (
            <div key={step} className="rounded-[18px] bg-[var(--app)] p-3">
              <span className="text-[11px] font-extrabold text-black/35">0{index + 1}</span>
              <p className="mt-1 text-xs font-bold leading-snug">{step}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 rounded-[22px] bg-[var(--lavender-soft)] p-4">
          <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[var(--lavender-deep)]">первый вопрос</p>
          <p className="mt-2 text-sm font-bold leading-relaxed">{active.question}</p>
        </div>
      </motion.div>
      <AppButton onClick={() => onSelect(active)} className="mt-4 w-full">
        Собрать чат
        <Sparkles size={18} />
      </AppButton>
    </div>
  );
}

function PremiumChatScreen({
  module,
  method,
  onReset,
}: {
  module: ModuleOption;
  method: MethodOption;
  onReset: () => void;
}) {
  const [messages, setMessages] = useState<Message[]>([
    makeMessage(
      "assistant",
      `Я рядом. Сценарий уже настроен: «${module.title}» и подход «${method.title}». Начнём не с советов, а с понимания: что сейчас самое тяжёлое?`,
    ),
  ]);
  const [input, setInput] = useState("");
  const [replyIndex, setReplyIndex] = useState(0);
  const [thinking, setThinking] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  function send(text: string) {
    const content = text.trim();
    if (!content || thinking) return;
    haptic("light");
    setInput("");
    setMessages((current) => [...current, makeMessage("user", content)]);
    setThinking(true);
    window.setTimeout(() => {
      setMessages((current) => [...current, makeMessage("assistant", scriptedReplies[replyIndex % scriptedReplies.length])]);
      setReplyIndex((value) => value + 1);
      setThinking(false);
      haptic("medium");
    }, 1650);
  }

  return (
    <div className="relative flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-[var(--app)]">
      <div className="pointer-events-none absolute -left-28 top-8 h-72 w-72 rounded-full bg-[var(--pink)]/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-28 top-44 h-80 w-80 rounded-full bg-[var(--lavender)]/28 blur-3xl" />
      <header className="relative z-10 shrink-0 px-4 pb-3 pt-[max(14px,env(safe-area-inset-top))]">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <p className="font-display truncate text-[22px] leading-none">{module.title}</p>
            <p className="mt-1 text-[11px] font-bold uppercase text-black/45">{method.title} · free</p>
          </div>
          <motion.button
            type="button"
            whileTap={{ scale: 0.92 }}
            onClick={() => {
              haptic("light");
              onReset();
            }}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/70 bg-white/58 shadow-[0_14px_34px_rgba(44,26,18,0.08)] backdrop-blur"
            aria-label="Сбросить выбор"
          >
            <RotateCcw size={17} />
          </motion.button>
        </div>
      </header>

      <div className="relative z-10 shrink-0 px-4">
        <VoiceStage
          thinking={thinking}
          title={thinking ? "Слушаю глубже" : "Можно писать"}
          subtitle={thinking ? "Сверяю тон, отделяю поддержку от советов и подбираю один бережный следующий шаг." : "Без меню действий. Просто опиши состояние своими словами, а я отвечу как психологический ассистент."}
        />
      </div>

      <div className="relative z-10 min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-3">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className={cx("flex", message.role === "user" ? "justify-end" : "justify-start")}
            >
              <div
                className={cx(
                  "max-w-[86%] rounded-[28px] px-4 py-3 text-[14px] leading-relaxed shadow-[0_16px_36px_rgba(44,26,18,0.07)]",
                  message.role === "user"
                    ? "rounded-br-[10px] bg-[var(--ink)] text-white"
                    : "rounded-bl-[10px] border border-white/72 bg-white/72 text-[var(--ink)] backdrop-blur",
                )}
              >
                {message.text}
              </div>
            </motion.div>
          ))}
          {thinking && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
              <div className="rounded-[24px] rounded-bl-[10px] border border-white/70 bg-white/55 px-4 py-3 shadow-[0_16px_36px_rgba(44,26,18,0.06)] backdrop-blur">
                <VoiceBars thinking />
              </div>
            </motion.div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="relative z-10 shrink-0 px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-2">
        <div className="flex items-center gap-2 rounded-full border border-white/70 bg-white/68 p-2 shadow-[0_18px_52px_rgba(44,26,18,0.1)] backdrop-blur-2xl">
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && send(input)}
            placeholder="Напиши, что происходит..."
            className="h-11 min-w-0 flex-1 bg-transparent px-3 text-[15px] font-semibold outline-none placeholder:text-black/36"
          />
          <motion.button
            type="button"
            whileTap={{ scale: 0.9 }}
            onClick={() => send(input)}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--ink)] text-white shadow-[0_14px_34px_rgba(23,17,17,0.22)]"
            aria-label="Отправить"
          >
            <Send size={17} />
          </motion.button>
        </div>
      </div>
    </div>
  );
}

function MeditationTimer() {
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(180);
  const progress = ((180 - seconds) / 180) * 100;

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setSeconds((value) => {
        if (value <= 1) {
          setRunning(false);
          haptic("heavy");
          return 180;
        }
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [running]);

  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const rest = (seconds % 60).toString().padStart(2, "0");

  return (
    <div className="relative overflow-hidden rounded-[34px] bg-[var(--ink)] p-5 text-white shadow-[0_20px_46px_rgba(17,17,17,0.18)]">
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[var(--lavender)]/50 blur-2xl" />
      <div className="absolute -bottom-12 left-8 h-32 w-32 rounded-full bg-[var(--pink)]/35 blur-2xl" />
      <div className="relative flex items-center gap-4">
        <div className="relative flex h-24 w-24 items-center justify-center">
          <motion.div
            animate={{ scale: running ? [1, 1.12, 1] : [1, 1.04, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 rounded-full bg-white/12"
          />
          <div
            className="absolute inset-1 rounded-full"
            style={{ background: `conic-gradient(var(--lavender) ${progress}%, rgba(255,255,255,.16) ${progress}%)` }}
          />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-[var(--ink)] text-lg font-extrabold">
            {minutes}:{rest}
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xl font-extrabold">3 минуты тишины</p>
          <p className="mt-2 text-xs leading-relaxed text-white/68">
            Дыхание 4-6, мягкий фокус на теле, без требования «успокоиться идеально».
          </p>
          <button
            type="button"
            onClick={() => {
              haptic("medium");
              setRunning((value) => !value);
            }}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-extrabold text-[var(--ink)]"
          >
            {running ? <Pause size={14} /> : <Play size={14} />}
            {running ? "Пауза" : "Начать"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ProgramsScreen({ onPremium }: { onPremium: () => void }) {
  const [opened, setOpened] = useState<(typeof programs)[number] | null>(null);

  return (
    <div className="relative h-full min-w-0 overflow-hidden">
      <div className="flex h-full min-w-0 flex-col px-5 pb-5 pt-4">
        <h1 className="text-[30px] font-extrabold leading-none">Практики</h1>
        <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
          Не библиотека карточек, а конкретные сценарии: что делать, сколько времени и зачем.
        </p>
        <div className="mt-4 min-h-0 flex-1 overflow-y-auto pb-2">
          <MeditationTimer />
          <div className="mt-4 space-y-3">
            {programs.map((program, index) => {
              const Icon = program.icon;
              return (
                <motion.button
                  key={program.title}
                  type="button"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  whileTap={{ scale: 0.985 }}
                  onClick={() => {
                    haptic("light");
                    setOpened(program);
                  }}
                  className="w-full rounded-[28px] bg-white p-4 text-left shadow-[0_12px_30px_rgba(17,17,17,0.055)]"
                >
                  <div className="flex items-start gap-3">
                    <span className={cx("flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl", toneClasses(program.tone))}>
                      <Icon size={22} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[16px] font-extrabold">{program.title}</span>
                      <span className="mt-1 block text-xs text-[var(--muted)]">{program.caption}</span>
                    </span>
                    <ChevronRight className="text-black/25" size={18} />
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {program.stats.map((stat) => (
                      <div key={stat} className="rounded-[16px] bg-[var(--app)] px-2 py-2 text-center text-[10px] font-extrabold text-black/55">
                        {stat}
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--card)]">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${program.progress}%` }} className="h-full rounded-full bg-[var(--lavender-deep)]" />
                    </div>
                    <span className="text-xs font-extrabold text-black/45">{program.progress}%</span>
                  </div>
                </motion.button>
              );
            })}
            <AppButton variant="ghost" onClick={onPremium} className="w-full">
              Посмотреть Premium-demo
            </AppButton>
          </div>
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
              className="mb-4 w-fit rounded-full bg-[var(--card)] px-4 py-2 text-sm font-bold"
            >
              Назад
            </button>
            <h2 className="text-[29px] font-extrabold leading-none">{opened.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">{opened.goal}</p>
            <div className="mt-5 grid grid-cols-3 gap-2">
              {opened.stats.map((stat) => (
                <div key={stat} className="rounded-[18px] bg-white p-3 text-center">
                  <BarChart3 className="mx-auto mb-2 text-[var(--lavender-deep)]" size={16} />
                  <p className="text-[10px] font-extrabold text-black/55">{stat}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 min-h-0 flex-1 space-y-3 overflow-y-auto pb-2">
              {opened.days.map((day, index) => (
                <div key={day.title} className="rounded-[24px] bg-white p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--green-soft)] text-xs font-extrabold text-[var(--green-deep)]">
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-sm font-extrabold">{day.title}</p>
                      <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">{day.detail}</p>
                    </div>
                  </div>
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
      <button type="button" onClick={onClose} className="ml-auto flex h-10 w-10 items-center justify-center rounded-full bg-[var(--card)]" aria-label="Закрыть">
        <ChevronLeft size={18} />
      </button>
      <div className="mt-5 text-center">
        <VoiceOrb />
        <h1 className="mt-6 text-[34px] font-extrabold leading-none">Premium</h1>
        <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">Демо-монетизация. Все форматы уже открыты, оплата не выполняется.</p>
      </div>
      <div className="mt-6 space-y-2">
        {benefits.map((benefit) => (
          <div key={benefit} className="flex items-center justify-between rounded-[20px] bg-white px-4 py-3">
            <span className="text-sm font-bold">{benefit}</span>
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
          <span className="absolute -top-2 right-4 rounded-full bg-[var(--pink)] px-2 py-1 text-[10px] font-extrabold text-white">выгодно</span>
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-white/95 text-center backdrop-blur">
            <motion.div initial={{ scale: 0.6, rotate: -10 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 220, damping: 14 }} className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--green-soft)] text-[var(--green-deep)]">
              <BadgeCheck size={38} />
            </motion.div>
            <p className="text-xl font-extrabold">Готово</p>
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
      <h1 className="text-[30px] font-extrabold leading-none">Профиль</h1>
      <div className="mt-5 rounded-[28px] bg-white p-4 shadow-[0_12px_30px_rgba(17,17,17,0.055)]">
        <div className="flex items-center gap-4">
          <VoiceOrb small />
          <div>
            <p className="text-lg font-extrabold">Анна</p>
            <p className="mt-1 w-fit rounded-full bg-[var(--green-soft)] px-3 py-1 text-xs font-extrabold text-[var(--green-deep)]">Demo Free · всё доступно</p>
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
              <span className="flex items-center gap-3 text-sm font-bold">
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
        <p className="mt-2 text-xs leading-relaxed text-[var(--muted)]">Приложение сопровождает, но не заменяет психиатра, психотерапевта или экстренную помощь.</p>
        <a href="tel:88002000122" className="mt-3 flex items-center gap-2 rounded-full bg-white px-4 py-3 text-xs font-extrabold">
          <ShieldCheck size={16} className="text-[var(--pink-deep)]" />
          8-800-2000-122
        </a>
      </div>
    </div>
  );
}

function BottomTabs({ active, onChange }: { active: Tab; onChange: (tab: Tab) => void }) {
  const tabs: Array<{ id: Tab; label: string; icon: LucideIcon }> = [
    { id: "chat", label: "Чат", icon: MessageCircle },
    { id: "programs", label: "Практики", icon: HomeIcon },
    { id: "profile", label: "Профиль", icon: SunMedium },
  ];

  return (
    <nav className="shrink-0 bg-transparent px-3 pb-[max(10px,env(safe-area-inset-bottom))] pt-2">
      <div className="grid grid-cols-3 gap-1 rounded-full border border-white/70 bg-white/62 p-1 shadow-[0_18px_52px_rgba(44,26,18,0.1)] backdrop-blur-2xl">
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
              className={cx("relative flex flex-col items-center gap-1 rounded-full py-2 text-[11px] font-extrabold transition focus:outline-none", selected ? "text-[var(--ink)]" : "text-black/35")}
            >
              {selected && <motion.span layoutId="active-tab" className="absolute inset-0 rounded-full bg-white shadow-[0_8px_20px_rgba(44,26,18,0.08)]" />}
              <Icon className="relative" size={19} />
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
    <div className="relative flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="h-full">
            {tab === "chat" && <PremiumChatScreen module={module} method={method} onReset={onReset} />}
            {tab === "programs" && <ProgramsScreen onPremium={onPremium} />}
            {tab === "profile" && <ProfileScreen onToast={showToast} />}
          </motion.div>
        </AnimatePresence>
      </div>
      <BottomTabs active={tab} onChange={setTab} />
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }} className="absolute bottom-24 left-1/2 z-40 -translate-x-1/2 whitespace-nowrap rounded-full bg-[var(--ink)] px-4 py-2 text-xs font-bold text-white shadow-xl">
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Home() {
  const [stage, setStage] = useState<Stage>("onboarding");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selectedModule, setSelectedModule] = useState<ModuleOption | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<MethodOption | null>(null);

  function resetConstructor() {
    setSelectedModule(null);
    setSelectedMethod(null);
    setStage("intake");
  }

  const content = useMemo(() => {
    if (stage === "onboarding") return <OnboardingScreen onDone={() => setStage("intake")} />;
    if (stage === "intake") {
      return (
        <IntakeScreen
          answers={answers}
          onAnswer={(id, value) => setAnswers((current) => ({ ...current, [id]: value }))}
          onDone={() => setStage("module")}
        />
      );
    }
    if (stage === "module") {
      return (
        <ModuleScreen
          answers={answers}
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
    if (stage === "premium") return <PremiumScreen onClose={() => setStage("main")} />;
    if (selectedModule && selectedMethod) {
      return (
        <MainTabs
          module={selectedModule}
          method={selectedMethod}
          onPremium={() => setStage("premium")}
          onReset={resetConstructor}
        />
      );
    }
    return <OnboardingScreen onDone={() => setStage("intake")} />;
  }, [answers, selectedMethod, selectedModule, stage]);

  return (
    <ScreenShell>
      <AnimatePresence mode="wait">
        <motion.div
          key={stage}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          className="h-full min-h-0"
        >
          {content}
        </motion.div>
      </AnimatePresence>
    </ScreenShell>
  );
}


