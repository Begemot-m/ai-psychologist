"use client";

import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import type { ReactNode } from "react";

export function PillButton({
  children,
  onClick,
  variant = "primary",
  className = "",
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
  type?: "button" | "submit";
}) {
  const variants: Record<string, string> = {
    primary: "bg-[#B8A9FF] text-[#111111]",
    secondary: "bg-[#F2F2EF] text-[#111111]",
    ghost: "bg-transparent text-[#111111] border border-[#111111]/10",
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      whileTap={{ scale: 0.96 }}
      className={`flex items-center justify-center gap-2 rounded-full px-6 py-3.5 font-semibold text-[15px] ${variants[variant]} ${className}`}
    >
      {children}
    </motion.button>
  );
}

export function Card({
  children,
  onClick,
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <motion.div
      onClick={onClick}
      whileTap={onClick ? { scale: 0.97 } : undefined}
      className={`rounded-[24px] bg-[#F2F2EF] p-4 ${onClick ? "cursor-pointer" : ""} ${className}`}
    >
      {children}
    </motion.div>
  );
}

export function ProBadge() {
  return (
    <span className="flex items-center gap-1 rounded-full bg-[#111111] px-2.5 py-1 text-[11px] font-bold text-white">
      <Lock size={11} strokeWidth={2.5} />
      PRO
    </span>
  );
}

export function Chip({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.94 }}
      className="shrink-0 rounded-full border border-[#111111]/10 bg-white px-4 py-2 text-[13px] font-medium text-[#111111] whitespace-nowrap"
    >
      {children}
    </motion.button>
  );
}

export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#111111]/10">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="h-full rounded-full bg-[#B8A9FF]"
      />
    </div>
  );
}

export function Dots({ count, active }: { count: number; active: number }) {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className={`h-2 rounded-full transition-all ${
            i === active ? "w-6 bg-[#B8A9FF]" : "w-2 bg-[#111111]/15"
          }`}
        />
      ))}
    </div>
  );
}

export function ScreenTitle({ children }: { children: ReactNode }) {
  return (
    <h1 className="text-[28px] font-extrabold leading-[1.1] tracking-[-0.03em] text-[#111111]">
      {children}
    </h1>
  );
}

export function Toast({ message }: { message: string | null }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: message ? 1 : 0, y: message ? 0 : 20 }}
      className="pointer-events-none absolute bottom-24 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#111111] px-4 py-2.5 text-[13px] font-medium text-white shadow-lg"
    >
      {message}
    </motion.div>
  );
}
