export type OnboardingTopic = "burnout" | "self_esteem" | "anxiety" | "relationships";

export type OnboardingQuestion = {
  id: string;
  text: string;
  options: { value: OnboardingTopic; label: string }[];
};

export const onboardingQuestions: OnboardingQuestion[] = [
  {
    id: "q1",
    text: "Что сейчас больше всего откликается?",
    options: [
      { value: "burnout", label: "Чувствую истощение и выгорание" },
      { value: "self_esteem", label: "Сложно опираться на себя" },
      { value: "anxiety", label: "Тревога и навязчивые мысли" },
      { value: "relationships", label: "Сложности в отношениях с близкими" },
    ],
  },
  {
    id: "q2",
    text: "Как давно это длится?",
    options: [
      { value: "burnout", label: "Несколько недель, уже накопилось" },
      { value: "self_esteem", label: "Сколько себя помню" },
      { value: "anxiety", label: "Накатывает волнами" },
      { value: "relationships", label: "С конкретного момента в отношениях" },
    ],
  },
  {
    id: "q3",
    text: "Чего хочется от поддержки сейчас?",
    options: [
      { value: "burnout", label: "Понять, как восстановить силы" },
      { value: "self_esteem", label: "Научиться слышать себя" },
      { value: "anxiety", label: "Справляться со вспышками тревоги" },
      { value: "relationships", label: "Разобраться в чувствах к другому человеку" },
    ],
  },
];

const topicToModule: Record<OnboardingTopic, string> = {
  burnout: "burnout_match",
  anxiety: "burnout_match",
  self_esteem: "self_esteem_gestalt",
  relationships: "self_esteem_gestalt",
};

export function recommendModuleId(answers: OnboardingTopic[]): string {
  const counts = new Map<OnboardingTopic, number>();
  for (const a of answers) counts.set(a, (counts.get(a) ?? 0) + 1);

  let top: OnboardingTopic = "burnout";
  let topCount = -1;
  for (const [topic, count] of counts) {
    if (count > topCount) {
      top = topic;
      topCount = count;
    }
  }
  return topicToModule[top];
}
