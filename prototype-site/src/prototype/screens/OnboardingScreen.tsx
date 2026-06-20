"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { onboardingSlides } from "../data";
import { Dots, PillButton, ScreenTitle } from "../ui";

export function OnboardingScreen({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  const slide = onboardingSlides[step];
  const isLast = step === onboardingSlides.length - 1;
  const Icon = slide.icon;

  function next() {
    if (isLast) {
      onDone();
    } else {
      setStep((s) => s + 1);
    }
  }

  return (
    <div className="flex h-full flex-col px-6 pb-8 pt-4">
      <div className="flex flex-1 flex-col items-center justify-center text-center">
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
            className="flex flex-col items-center"
          >
            <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-[28px] bg-[#B8A9FF]/25">
              <Icon size={42} strokeWidth={1.8} className="text-[#7A67E0]" />
            </div>
            <ScreenTitle>{slide.title}</ScreenTitle>
            <p className="mt-4 max-w-[280px] text-[15px] leading-relaxed text-[#111111]/65">
              {slide.text}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex flex-col items-center gap-6">
        <Dots count={onboardingSlides.length} active={step} />
        <PillButton onClick={next} className="w-full">
          {isLast ? "Начать" : "Далее"}
        </PillButton>
      </div>
    </div>
  );
}
