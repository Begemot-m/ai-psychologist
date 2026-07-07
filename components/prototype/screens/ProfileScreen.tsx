"use client";

import { motion } from "framer-motion";
import { NotebookPen, BellRing, Settings, Info, ChevronRight, PhoneCall } from "lucide-react";
import { Card, ScreenTitle } from "../ui";

const menuItems = [
  { icon: NotebookPen, label: "Мои заметки" },
  { icon: BellRing, label: "Напоминания" },
  { icon: Settings, label: "Настройки" },
  { icon: Info, label: "О приложении" },
];

export function ProfileScreen({
  isPro,
  onShowToast,
}: {
  isPro: boolean;
  onShowToast: (message: string) => void;
}) {
  return (
    <div className="flex h-full flex-col overflow-y-auto px-6 pb-6 pt-4">
      <ScreenTitle>Профиль</ScreenTitle>

      <div className="mt-6 flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#B8A9FF] to-[#FF9FB2] text-[20px] font-bold text-white">
          АН
        </div>
        <div>
          <p className="text-[17px] font-semibold text-[#111111]">Анна</p>
          <span
            className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-[12px] font-semibold ${
              isPro ? "bg-[#B8A9FF]/20 text-[#7A67E0]" : "bg-[#F2F2EF] text-[#111111]/55"
            }`}
          >
            {isPro ? "Premium" : "Free"}
          </span>
        </div>
      </div>

      <div className="mt-6 space-y-2.5">
        {menuItems.map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Card
                onClick={() => onShowToast("Этот раздел появится позже")}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} strokeWidth={1.8} className="text-[#7A67E0]" />
                  <span className="text-[14px] font-medium text-[#111111]">{item.label}</span>
                </div>
                <ChevronRight size={16} className="text-[#111111]/30" />
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-6 rounded-[20px] bg-[#FFF1F5] p-4">
        <p className="text-[12px] leading-relaxed text-[#111111]/60">
          Это приложение сопровождает, но не заменяет работу с психиатром или психотерапевтом.
          В кризисных ситуациях, пожалуйста, обращайся за помощью к специалистам.
        </p>
        <a
          href="tel:88002501859"
          className="mt-3 flex flex-col gap-0.5 rounded-2xl bg-white px-4 py-3"
        >
          <span className="flex items-center gap-2 text-[13px] font-semibold text-[#111111]">
            <PhoneCall size={15} className="text-[#FF6E8A]" />
            Горячая линия первой психологической помощи Красного Креста
          </span>
          <span className="pl-[23px] text-[12px] text-[#111111]/55">
            Бесплатно, круглосуточно — 8&nbsp;800&nbsp;250&nbsp;18&nbsp;59
          </span>
        </a>
      </div>
    </div>
  );
}
