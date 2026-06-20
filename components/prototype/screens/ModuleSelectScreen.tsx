"use client";

import { motion } from "framer-motion";
import { modules } from "../data";
import { Card, ProBadge, ScreenTitle } from "../ui";
import type { ModuleItem } from "../types";

export function ModuleSelectScreen({
  onSelect,
  onLocked,
}: {
  onSelect: (module: ModuleItem) => void;
  onLocked: () => void;
}) {
  return (
    <div className="flex h-full flex-col px-6 pb-6 pt-4">
      <p className="text-[13px] font-semibold uppercase tracking-wide text-[#7A67E0]">
        Шаг 1 из 2
      </p>
      <ScreenTitle>С чем хочешь поработать?</ScreenTitle>
      <p className="mt-2 text-[14px] text-[#111111]/55">
        Выбери, что сейчас откликается больше всего
      </p>

      <div className="mt-6 grid flex-1 grid-cols-2 gap-3 overflow-y-auto pb-2">
        {modules.map((module, i) => {
          const Icon = module.icon;
          return (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
            >
              <Card
                onClick={() => (module.free ? onSelect(module) : onLocked())}
                className="flex h-[140px] flex-col justify-between"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white">
                    <Icon size={20} strokeWidth={1.8} className="text-[#7A67E0]" />
                  </div>
                  {!module.free && <ProBadge />}
                </div>
                <span className="text-[15px] font-semibold leading-snug text-[#111111]">
                  {module.title}
                </span>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
