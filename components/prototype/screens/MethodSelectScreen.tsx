"use client";

import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { methods } from "../data";
import { Card, ProBadge, ScreenTitle } from "../ui";
import type { MethodItem } from "../types";

export function MethodSelectScreen({
  onSelect,
  onLocked,
  onBack,
}: {
  onSelect: (method: MethodItem) => void;
  onLocked: () => void;
  onBack: () => void;
}) {
  return (
    <div className="flex h-full flex-col px-6 pb-6 pt-4">
      <button
        type="button"
        onClick={onBack}
        className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-[#F2F2EF]"
      >
        <ChevronLeft size={18} className="text-[#111111]" />
      </button>

      <p className="text-[13px] font-semibold uppercase tracking-wide text-[#7A67E0]">
        Шаг 2 из 2
      </p>
      <ScreenTitle>Какой подход ближе?</ScreenTitle>
      <p className="mt-2 text-[14px] text-[#111111]/55">
        От этого зависит, как ассистент будет с тобой говорить
      </p>

      <div className="mt-6 flex-1 space-y-3 overflow-y-auto pb-2">
        {methods.map((method, i) => (
          <motion.div
            key={method.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.3 }}
          >
            <Card
              onClick={() => (method.free ? onSelect(method) : onLocked())}
              className="flex items-center justify-between"
            >
              <div>
                <p className="text-[15px] font-semibold text-[#111111]">{method.title}</p>
                <p className="mt-0.5 text-[13px] text-[#111111]/55">{method.description}</p>
              </div>
              {!method.free && <ProBadge />}
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
