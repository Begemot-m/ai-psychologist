"use client";

import { motion } from "framer-motion";
import { MessageCircle, LayoutGrid, User } from "lucide-react";
import type { Tab } from "./types";

const tabs: { id: Tab; label: string; icon: typeof MessageCircle }[] = [
  { id: "chat", label: "Чат", icon: MessageCircle },
  { id: "programs", label: "Программы", icon: LayoutGrid },
  { id: "profile", label: "Профиль", icon: User },
];

export function TabBar({
  active,
  onChange,
}: {
  active: Tab;
  onChange: (tab: Tab) => void;
}) {
  return (
    <div className="flex items-center justify-around border-t border-[#111111]/8 bg-white/95 px-2 pb-[max(10px,env(safe-area-inset-bottom))] pt-2 backdrop-blur">
      {tabs.map(({ id, label, icon: Icon }) => {
        const isActive = id === active;
        return (
          <motion.button
            key={id}
            type="button"
            whileTap={{ scale: 0.92 }}
            onClick={() => onChange(id)}
            className="flex flex-1 flex-col items-center gap-1 py-1"
          >
            <Icon
              size={22}
              strokeWidth={2.2}
              className={isActive ? "text-[#111111]" : "text-[#111111]/35"}
            />
            <span
              className={`text-[11px] font-medium ${
                isActive ? "text-[#111111]" : "text-[#111111]/35"
              }`}
            >
              {label}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
