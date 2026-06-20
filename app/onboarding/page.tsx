"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { onboardingQuestions, type OnboardingTopic } from "@/config/onboarding";
import { useAuthUser } from "../telegram-provider";

export default function OnboardingPage() {
  const router = useRouter();
  const user = useAuthUser();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<OnboardingTopic[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const question = onboardingQuestions[step];
  const isLast = step === onboardingQuestions.length - 1;

  async function finish(finalAnswers: OnboardingTopic[]) {
    if (!user) return;
    setSubmitting(true);
    const res = await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, answers: finalAnswers }),
    });
    const data = await res.json().catch(() => ({}));
    router.push(
      data.recommendedModuleId
        ? `/marketplace?recommended=${data.recommendedModuleId}`
        : "/marketplace",
    );
  }

  function selectAnswer(value: OnboardingTopic) {
    const next = [...answers, value];
    if (isLast) {
      finish(next);
    } else {
      setAnswers(next);
      setStep(step + 1);
    }
  }

  async function skip() {
    if (!user) return;
    setSubmitting(true);
    await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id }),
    });
    router.push("/marketplace");
  }

  return (
    <main className="flex min-h-screen flex-col justify-center gap-6 px-6 py-10">
      <div className="text-sm text-[var(--muted)]">
        Вопрос {step + 1} из {onboardingQuestions.length}
      </div>
      <h1 className="text-3xl font-medium">{question.text}</h1>
      <div className="flex flex-col gap-3">
        {question.options.map((option) => (
          <button
            key={option.value}
            disabled={submitting}
            onClick={() => selectAnswer(option.value)}
            className="glass-card rounded-xl px-4 py-3 text-left transition hover:border-[var(--accent)]"
          >
            {option.label}
          </button>
        ))}
      </div>
      <button
        disabled={submitting}
        onClick={skip}
        className="text-sm text-[var(--muted)] underline"
      >
        Пройти позже
      </button>
    </main>
  );
}
