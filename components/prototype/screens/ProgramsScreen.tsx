"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, CheckCircle2, Circle } from "lucide-react";
import { programs } from "../data";
import { Card, ProBadge, ProgressBar, ScreenTitle } from "../ui";
import type { ProgramItem } from "../types";

export function ProgramsScreen({
  isPro,
  onLocked,
}: {
  isPro: boolean;
  onLocked: () => void;
}) {
  const [openProgram, setOpenProgram] = useState<ProgramItem | null>(null);

  function handleOpen(program: ProgramItem) {
    if (!program.free && !isPro) {
      onLocked();
      return;
    }
    setOpenProgram(program);
  }

  return (
    <div className="relative h-full overflow-hidden">
      <div className="flex h-full flex-col px-6 pb-6 pt-4">
        <ScreenTitle>Программы</ScreenTitle>
        <p className="mt-2 text-[14px] text-[#111111]/55">
          Структурированные курсы из коротких ежедневных шагов
        </p>

        <div className="mt-6 flex-1 space-y-3 overflow-y-auto pb-2">
          {programs.map((program, i) => {
            const locked = !program.free && !isPro;
            return (
              <motion.div
                key={program.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
              >
                <Card onClick={() => handleOpen(program)}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[15px] font-semibold text-[#111111]">{program.title}</p>
                      <p className="mt-0.5 text-[13px] text-[#111111]/55">{program.description}</p>
                    </div>
                    {locked && <ProBadge />}
                  </div>
                  {!locked && (
                    <div className="mt-3 flex items-center gap-2">
                      <ProgressBar value={program.progress} />
                      <span className="text-[12px] font-medium text-[#111111]/50">
                        {program.progress}%
                      </span>
                    </div>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {openProgram && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.32, ease: "easeOut" }}
            className="absolute inset-0 z-20 flex flex-col bg-white px-6 pb-6 pt-4"
          >
            <button
              type="button"
              onClick={() => setOpenProgram(null)}
              className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-[#F2F2EF]"
            >
              <ChevronLeft size={18} className="text-[#111111]" />
            </button>
            <ScreenTitle>{openProgram.title}</ScreenTitle>
            <p className="mt-2 text-[14px] text-[#111111]/55">{openProgram.description}</p>

            <div className="mt-6 flex-1 space-y-2 overflow-y-auto pb-2">
              {openProgram.days.map((day) => (
                <div
                  key={day.title}
                  className="flex items-center gap-3 rounded-[18px] bg-[#F2F2EF] px-4 py-3.5"
                >
                  {day.done ? (
                    <CheckCircle2 size={20} className="text-[#7A67E0]" />
                  ) : (
                    <Circle size={20} className="text-[#111111]/25" />
                  )}
                  <span
                    className={`text-[14px] ${
                      day.done ? "text-[#111111]/45 line-through" : "text-[#111111]"
                    }`}
                  >
                    {day.title}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
