"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, X, Lock } from "lucide-react";
import { onboardingSlides } from "../data";
import { Dots, PillButton, ScreenTitle } from "../ui";
import type { OnboardingSlide } from "../types";

function SlideContent({ slide }: { slide: OnboardingSlide }) {
  if (slide.kind === "intro") {
    const Icon = slide.icon;
    return (
      <div className="flex min-h-full flex-col items-center justify-center text-center">
        <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-[28px] bg-[#B8A9FF]/25">
          <Icon size={42} strokeWidth={1.8} className="text-[#7A67E0]" />
        </div>
        <ScreenTitle>{slide.title}</ScreenTitle>
        <p className="mt-4 max-w-[300px] text-[15px] leading-relaxed text-[#111111]/65">
          {slide.text}
        </p>
      </div>
    );
  }

  if (slide.kind === "compare") {
    return (
      <div className="pb-2 pt-1">
        <ScreenTitle>{slide.title}</ScreenTitle>
        <p className="mt-2 text-[14px] text-[#111111]/55">{slide.subtitle}</p>

        <div className="mt-6 space-y-3">
          <div className="rounded-[22px] bg-[#F2F2EF] p-4">
            <p className="mb-3 text-[13px] font-semibold text-[#111111]/45">Обычный ИИ-чат</p>
            <ul className="space-y-2.5">
              {slide.cons.map((c) => (
                <li key={c} className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#FF9FB2]/25">
                    <X size={13} strokeWidth={3} className="text-[#E86A85]" />
                  </span>
                  <span className="text-[13px] leading-snug text-[#111111]/70">{c}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-[22px] bg-[#B8A9FF]/15 p-4 ring-1 ring-inset ring-[#B8A9FF]/40">
            <p className="mb-3 text-[13px] font-semibold text-[#7A67E0]">Наш ассистент</p>
            <ul className="space-y-2.5">
              {slide.pros.map((p) => (
                <li key={p} className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#7BC47F]/25">
                    <Check size={13} strokeWidth={3} className="text-[#3FA85A]" />
                  </span>
                  <span className="text-[13px] leading-snug text-[#111111]/80">{p}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-4 flex items-start gap-2.5 rounded-[18px] bg-[#111111]/[0.04] px-4 py-3">
          <Lock size={15} className="mt-0.5 shrink-0 text-[#7A67E0]" />
          <p className="text-[12px] leading-relaxed text-[#111111]/60">{slide.privacyNote}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-2 pt-1">
      <ScreenTitle>{slide.title}</ScreenTitle>
      <p className="mt-2 text-[14px] text-[#111111]/55">{slide.subtitle}</p>
      <div className="mt-6 space-y-3">
        {slide.features.map((f) => {
          const Icon = f.icon;
          return (
            <div key={f.title} className="flex gap-3 rounded-[22px] bg-[#F2F2EF] p-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white">
                <Icon size={20} strokeWidth={1.8} className="text-[#7A67E0]" />
              </div>
              <div>
                <p className="text-[14px] font-semibold text-[#111111]">{f.title}</p>
                <p className="mt-0.5 text-[12.5px] leading-snug text-[#111111]/60">{f.text}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function OnboardingScreen({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  const slide = onboardingSlides[step];
  const isLast = step === onboardingSlides.length - 1;

  function next() {
    if (isLast) onDone();
    else setStep((s) => s + 1);
  }

  return (
    <div className="flex h-full flex-col px-6 pb-8 pt-4">
      <div className="relative flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.6}
            onDragEnd={(_, info) => {
              if (info.offset.x < -60) next();
              else if (info.offset.x > 60 && step > 0) setStep((s) => s - 1);
            }}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="absolute inset-0 overflow-y-auto"
          >
            <SlideContent slide={slide} />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-6 flex flex-col items-center gap-6">
        <Dots count={onboardingSlides.length} active={step} />
        <PillButton onClick={next} className="w-full">
          {isLast ? "Начать" : "Далее"}
        </PillButton>
      </div>
    </div>
  );
}
