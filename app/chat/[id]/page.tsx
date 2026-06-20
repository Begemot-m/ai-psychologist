"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";

type ChatMessage = { role: "user" | "assistant"; content: string; is_crisis: boolean };

export default function ChatPage() {
  const params = useParams<{ id: string }>();
  const conversationId = params.id;

  const [moduleTitle, setModuleTitle] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [paywall, setPaywall] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/conversations/${conversationId}`)
      .then((res) => res.json())
      .then((data) => {
        setModuleTitle(data.module?.title ?? null);
        setMessages(data.messages ?? []);
      });
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send() {
    const content = input.trim();
    if (!content || sending) return;
    setInput("");
    setSending(true);
    setPaywall(false);
    setMessages((prev) => [...prev, { role: "user", content, is_crisis: false }]);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId, content }),
    });

    if (res.status === 402) {
      setPaywall(true);
      setSending(false);
      return;
    }

    const data = await res.json().catch(() => ({}));
    if (data.reply) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply, is_crisis: !!data.isCrisis },
      ]);
    }
    setSending(false);
  }

  return (
    <main className="flex min-h-screen flex-col">
      <header className="border-b border-[var(--surface-border)] px-6 py-5">
        <h1 className="text-xl font-medium">{moduleTitle ?? "Чат"}</h1>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto px-6 py-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[80%] rounded-2xl px-4 py-2 ${
              m.role === "user" ? "ml-auto bg-[var(--accent-strong)] text-white" : "glass-card"
            } ${m.is_crisis ? "border border-amber-400" : ""}`}
          >
            {m.content}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {paywall && (
        <div className="px-6 py-2 text-sm text-amber-400">
          Бесплатный лимит сообщений на сегодня исчерпан. Оформи подписку через Telegram Stars,
          чтобы продолжить с моделью Sonnet.
        </div>
      )}

      <div className="flex gap-2 border-t border-[var(--surface-border)] px-6 py-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Напиши сообщение…"
          className="flex-1 rounded-lg border border-[var(--surface-border)] bg-[var(--surface)] px-4 py-2.5 outline-none"
        />
        <button
          onClick={send}
          disabled={sending}
          className="rounded-lg bg-[var(--accent-strong)] px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
        >
          Отправить
        </button>
      </div>
    </main>
  );
}
