"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, X, PartyPopper } from "lucide-react";
import { planFeatures } from "../data";
import { PillButton, ScreenTitle } from "../ui";

type Period = "month" | "year";

export function PaywallScreen({
  isPro,
  onSubscribe,
  onClose,
}: {
  isPro: boolean;
  onSubscribe: () => void;
  onClose: () => void;
}) {
  const [period, setPeriod] = useState<Period>("year");
  const [success, setSuccess] = useState(false);

  function handleSubscribe() {
    setSuccess(true);
    setTimeout(() => {
      onSubscribe();
    }, 1400);
  }

  return (
    <div className="relative flex h-full flex-col px-6 pb-6 pt-4">
      <button
        type="button"
        onClick={onClose}
        className="absolute right-6 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-[#F2F2EF]"
      >
        <X size={18} className="text-[#111111]" />
      </button>

      <div className="mt-10 text-center">
        <ScreenTitle>Premium</ScreenTitle>
        <p className="mt-2 text-[14px] text-[#111111]/55">
          Все модули, методы и программы без ограничений
        </p>
      </div>

      <div className="mt-6 space-y-2.5">
        {planFeatures.map((f) => (
          <div key={f.label} className="flex items-center justify-between rounded-[16px] bg-[#F2F2EF] px-4 py-3">
            <span className="text-[13px] text-[#111111]">{f.label}</span>
            <div className="flex items-center gap-4">
              {f.free ? (
                <Check size={16} className="text-[#111111]/40" />
              ) : (
                <X size={16} className="text-[#111111]/20" />
              )}
              <Check size={16} className="text-[#7A67E0]" />
            </div>
          </div>
        ))}
        <div className="flex justify-end gap-4 px-4 text-[11px] font-medium text-[#111111]/40">
          <span className="w-4 text-center">Free</span>
          <span className="w-4 text-center">PRO</span>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setPeriod("month")}
          className={`rounded-[18px] border px-4 py-3.5 text-left transition-colors ${
            period === "month" ? "border-[#B8A9FF] bg-[#B8A9FF]/15" : "border-[#111111]/10"
          }`}
        >
          <p className="text-[14px] font-semibold text-[#111111]">Месяц</p>
          <p className="text-[12px] text-[#111111]/55">499 ₽/мес</p>
        </button>
        <button
          type="button"
          onClick={() => setPeriod("year")}
          className={`relative rounded-[18px] border px-4 py-3.5 text-left transition-colors ${
            period === "year" ? "border-[#B8A9FF] bg-[#B8A9FF]/15" : "border-[#111111]/10"
          }`}
        >
          <span className="absolute -top-2 right-3 rounded-full bg-[#FF9FB2] px-2 py-0.5 text-[10px] font-bold text-white">
            выгодно
          </span>
          <p className="text-[14px] font-semibold text-[#111111]">Год</p>
          <p className="text-[12px] text-[#111111]/55">3 990 ₽/год</p>
        </button>
      </div>

      <div className="flex-1" />

      <PillButton onClick={handleSubscribe} className="w-full" variant="primary">
        {isPro ? "Уже Premium" : "Оформить"}
      </PillButton>

      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-white/95 text-center"
          >
            <motion.div
              initial={{ scale: 0.6, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 12 }}
              className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#B8A9FF]/20"
            >
              <PartyPopper size={28} className="text-[#7A67E0]" />
            </motion.div>
            <p className="text-[18px] font-bold text-[#111111]">Готово! Теперь у тебя Premium</p>
            <p className="mt-1 text-[13px] text-[#111111]/55">Это демо — оплата не выполнялась</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
