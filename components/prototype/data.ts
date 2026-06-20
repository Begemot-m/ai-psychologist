import {
  Flame,
  HeartHandshake,
  Brain,
  Sparkles,
  Moon,
  AlertTriangle,
  Stethoscope,
  CloudRain,
} from "lucide-react";
import type {
  ModuleItem,
  MethodItem,
  OnboardingSlide,
  ChatIntent,
  ProgramItem,
  PlanFeature,
} from "./types";

export const onboardingSlides: OnboardingSlide[] = [
  {
    icon: HeartHandshake,
    title: "Это сопровождение, а не терапия",
    text: "Приложение помогает разобраться в чувствах и даёт практические инструменты самопомощи. Оно не заменяет работу с живым специалистом — но может стать опорой между встречами с ним или первым шагом к себе.",
  },
  {
    icon: Sparkles,
    title: "Как это работает",
    text: "Мы поможем понять, что ты сейчас чувствуешь, и подберём рабочие техники под конкретную ситуацию — без общих советов «просто расслабься».",
  },
  {
    icon: Brain,
    title: "Почему это не просто чат-бот",
    text: "В основе — модель, связанная с Claude и GPT, но дообученная командой практикующих психологов на выверенной базе методик. Не абстрактные советы, а структурированные подходы, проверенные специалистами.",
  },
];

export const modules: ModuleItem[] = [
  { id: "burnout", title: "Выгорание", icon: Flame, free: false },
  { id: "relationships", title: "Отношения", icon: HeartHandshake, free: false },
  { id: "anxiety", title: "Тревожность", icon: Brain, free: true },
  { id: "self-esteem", title: "Самооценка", icon: Sparkles, free: false },
  { id: "sleep", title: "Сон", icon: Moon, free: false },
  { id: "crisis", title: "Кризис / острое состояние", icon: AlertTriangle, free: false },
  { id: "psychiatry", title: "Сопровождение при терапии у психиатра", icon: Stethoscope, free: false },
  { id: "grief", title: "Потеря и горе", icon: CloudRain, free: false },
];

export const methods: MethodItem[] = [
  { id: "cbt", title: "КПТ", description: "Работаем с мыслями, которые усиливают чувство", free: true },
  { id: "gestalt", title: "Гештальт", description: "Через осознавание «здесь и сейчас»", free: false },
  { id: "psychoanalysis", title: "Психоанализ", description: "Исследуем глубинные причины и паттерны", free: false },
  { id: "act", title: "АСТ / терапия принятия", description: "Учимся принимать чувства, а не бороться", free: false },
  { id: "schema", title: "Схема-терапия", description: "Меняем устойчивые жизненные сценарии", free: false },
  { id: "mindfulness", title: "Майндфулнес", description: "Через внимательность к телу и дыханию", free: false },
];

export const chatIntents: ChatIntent[] = [
  {
    id: "anxiety",
    keywords: ["тревож", "беспоко", "паник", "страшно", "страх", "волну"],
    reply:
      "Слышу тебя. Тревога часто появляется, когда тело чувствует угрозу, а ум не может её точно назвать. Когда накатывает сильнее — днём, перед сном, в конкретных ситуациях?",
  },
  {
    id: "sleep",
    keywords: ["сон", "уснуть", "бессонниц", "не спится", "ночью", "просыпа"],
    reply:
      "Похоже, вечером голова «включается» именно тогда, когда тело хочет отдыхать — это очень частая история. Ты остаёшься один на один с мыслями, и тревога становится громче.",
  },
  {
    id: "technique",
    keywords: ["техник", "упражнен", "что делать", "помоги", "совет", "как"],
    reply:
      "Попробуем технику из КПТ — «Заземление 5-4-3-2-1». Перед сном назови: 5 вещей, которые видишь, 4 — которые слышишь, 3 — которые чувствуешь телом, 2 запаха, 1 вкус. Это возвращает внимание из мыслей в тело.",
  },
  {
    id: "homework",
    keywords: ["а дальше", "что теперь", "домашн", "дальше что", "и что"],
    reply:
      "Домашнее задание на эту неделю: попробуй технику 3 вечера и просто отметь у себя — стало чуть легче или нет. Это не экзамен, а наблюдение за собой.",
  },
  {
    id: "gratitude",
    keywords: ["спасибо", "помогло", "легче", "стало лучше", "благодар"],
    reply:
      "Очень рада это слышать. Маленькие шаги — это и есть путь. Хочешь, оставим технику как домашнее задание на неделю и посмотрим, что изменится?",
  },
  {
    id: "low",
    keywords: ["плохо", "грустно", "тяжело", "не могу", "устал", "выгор", "сил нет"],
    reply:
      "Звучит тяжело. Ты сейчас не одна с этим — и то, что ты говоришь об этом, уже шаг к тому, чтобы стало легче. Что именно сейчас даётся тяжелее всего?",
  },
];

export const chatFallbacks: string[] = [
  "Спасибо, что делишься. Расскажи немного подробнее — что сейчас происходит внутри, когда это случается?",
  "Я рядом. Попробуй описать это чувство — на что оно похоже, где в теле отзывается?",
  "Понимаю. Иногда сложно сразу подобрать слова, и это нормально. Что из этого откликается больше: тревога, усталость или что-то третье?",
];

export const chatChips = ["Мне тревожно", "Не могу уснуть", "Расскажи технику"];

export const programs: ProgramItem[] = [
  {
    id: "anxiety-week",
    title: "7 дней против тревоги",
    description: "Короткие практики на каждый день недели",
    free: true,
    progress: 40,
    days: [
      { title: "День 1 · Заметить тревогу", done: true },
      { title: "День 2 · Дыхание 4-7-8", done: true },
      { title: "День 3 · Заземление 5-4-3-2-1", done: false },
      { title: "День 4 · Письмо тревоге", done: false },
      { title: "День 5 · Тело и напряжение", done: false },
      { title: "День 6 · План на тревожный день", done: false },
      { title: "День 7 · Итоги недели", done: false },
    ],
  },
  {
    id: "sleep-hygiene",
    title: "Гигиена сна",
    description: "Мягкий перезапуск вечерних привычек",
    free: true,
    progress: 0,
    days: [
      { title: "День 1 · Вечерний ритуал", done: false },
      { title: "День 2 · Экран и свет", done: false },
      { title: "День 3 · Заземление перед сном", done: false },
    ],
  },
  {
    id: "self-support",
    title: "Опора на себя",
    description: "Работа с самооценкой и внутренним критиком",
    free: false,
    progress: 0,
    days: [
      { title: "День 1 · Голос внутреннего критика", done: false },
      { title: "День 2 · Откуда он взялся", done: false },
      { title: "День 3 · Опора на факты, а не оценки", done: false },
      { title: "День 4 · Список своих опор", done: false },
      { title: "День 5 · Письмо себе", done: false },
    ],
  },
];

export const planFeatures: PlanFeature[] = [
  { label: "1 модуль и 1 метод", free: true, premium: true },
  { label: "Все модули и методы", free: false, premium: true },
  { label: "Безлимитные сообщения в чате", free: false, premium: true },
  { label: "Все программы целиком", free: false, premium: true },
  { label: "Экспорт заметок", free: false, premium: true },
];
