"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, RotateCcw } from "lucide-react";
import { chatChips, chatFallbacks, chatIntents } from "../data";
import { Chip, PillButton } from "../ui";
import type { ChatMessage } from "../types";

let idCounter = 0;
function nextId() {
  idCounter += 1;
  return `msg-${idCounter}`;
}

const FREE_MESSAGE_LIMIT = 5;

function matchReply(text: string): string | null {
  const normalized = text.toLowerCase();
  const intent = chatIntents.find((i) => i.keywords.some((k) => normalized.includes(k)));
  return intent ? intent.reply : null;
}

export function ChatScreen({
  moduleTitle,
  methodTitle,
  isPro,
  onPaywall,
  onReset,
}: {
  moduleTitle: string;
  methodTitle: string;
  isPro: boolean;
  onPaywall: () => void;
  onReset: () => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: nextId(),
      role: "assistant",
      text: `Здравствуй. Хорошо, что ты здесь. Мы будем работать с темой «${moduleTitle}» в подходе «${methodTitle}» — я рядом и никуда не тороплюсь. Пусть это будет спокойное место, где можно говорить как есть.`,
    },
  ]);
  const [userMessageCount, setUserMessageCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const fallbackIndexRef = useRef(0);

  const finished = !isPro && userMessageCount >= FREE_MESSAGE_LIMIT;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, finished]);

  function send(text: string) {
    if (!text.trim() || finished || isTyping) return;
    setMessages((prev) => [...prev, { id: nextId(), role: "user", text }]);
    setInputValue("");
    setIsTyping(true);
    setTimeout(() => {
      const matched = matchReply(text);
      const reply = matched ?? chatFallbacks[fallbackIndexRef.current % chatFallbacks.length];
      if (!matched) fallbackIndexRef.current += 1;
      setMessages((prev) => [...prev, { id: nextId(), role: "assistant", text: reply }]);
      setIsTyping(false);
      setUserMessageCount((c) => c + 1);
    }, 1100);
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-[#111111]/8 px-6 pb-3 pt-4">
        <div>
          <p className="text-[15px] font-semibold text-[#111111]">
            {moduleTitle} · {methodTitle}
          </p>
          <p className="text-[12px] text-[#111111]/45">
            {isPro ? "Premium · без ограничений" : "Free · ограниченный чат"}
          </p>
        </div>
        <motion.button
          type="button"
          whileTap={{ scale: 0.9 }}
          onClick={onReset}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F2F2EF]"
        >
          <RotateCcw size={16} className="text-[#111111]/70" />
        </motion.button>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
        {messages.map((m) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[78%] rounded-[20px] px-4 py-3 text-[14px] leading-relaxed ${
                m.role === "user"
                  ? "bg-[#B8A9FF] text-[#111111]"
                  : "bg-[#F2F2EF] text-[#111111]"
              }`}
            >
              {m.text}
            </div>
          </motion.div>
        ))}

        <AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-start"
            >
              <div className="flex items-center gap-1 rounded-[20px] bg-[#F2F2EF] px-4 py-3.5">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="h-1.5 w-1.5 rounded-full bg-[#111111]/40"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {finished && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[20px] bg-[#FFF1F5] p-4 text-center"
          >
            <p className="text-[14px] font-semibold text-[#111111]">
              Бесплатные сообщения закончились
            </p>
            <p className="mt-1 text-[13px] text-[#111111]/60">
              Продолжить без ограничений — Premium
            </p>
            <PillButton onClick={onPaywall} className="mt-3 w-full" variant="primary">
              Открыть Premium
            </PillButton>
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      {!finished && (
        <div className="border-t border-[#111111]/8 px-4 pb-[max(10px,env(safe-area-inset-bottom))] pt-3">
          <div className="mb-2 flex gap-2 overflow-x-auto pb-1">
            {chatChips.map((chip) => (
              <Chip key={chip} onClick={() => send(chip)}>
                {chip}
              </Chip>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send(inputValue)}
              placeholder="Напиши, что чувствуешь…"
              className="flex-1 rounded-full bg-[#F2F2EF] px-4 py-3 text-[14px] text-[#111111] outline-none placeholder:text-[#111111]/40"
            />
            <motion.button
              type="button"
              whileTap={{ scale: 0.9 }}
              onClick={() => send(inputValue)}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#111111]"
            >
              <ArrowUp size={18} className="text-white" />
            </motion.button>
          </div>
        </div>
      )}
    </div>
  );
}
