"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { activeModules, comingSoonModules } from "@/config/modules";
import { useAuthUser } from "../telegram-provider";

export default function MarketplacePage() {
  const router = useRouter();
  const user = useAuthUser();
  const searchParams = useSearchParams();
  const recommendedId = searchParams.get("recommended") ?? user?.recommendedModuleId ?? null;
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function selectModule(moduleId: string) {
    if (!user) return;
    setPendingId(moduleId);
    const res = await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, moduleId }),
    });
    const data = await res.json().catch(() => ({}));
    if (data.conversationId) {
      router.push(`/chat/${data.conversationId}`);
    } else {
      setPendingId(null);
    }
  }

  return (
    <main className="flex min-h-screen flex-col gap-8 px-6 py-10">
      <h1 className="text-3xl font-semibold">Выбери модуль</h1>

      <div className="flex flex-col gap-4">
        {activeModules.map((module) => (
          <div
            key={module.id}
            className="glass-card rounded-2xl p-5"
            style={{
              borderColor: module.id === recommendedId ? module.ui_accent : undefined,
            }}
          >
            <div className="flex items-center gap-2">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: module.ui_accent }}
              />
              <h2 className="text-lg font-medium">{module.title}</h2>
              {module.id === recommendedId && (
                <span className="rounded-full bg-[var(--accent)] px-2 py-0.5 text-xs text-white">
                  Рекомендуем
                </span>
              )}
            </div>
            <p className="mt-2 text-sm text-[var(--muted)]">{module.description}</p>
            <button
              disabled={pendingId === module.id}
              onClick={() => selectModule(module.id)}
              className="mt-4 rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[var(--accent-strong)]"
            >
              {pendingId === module.id ? "Открываем…" : "Выбрать"}
            </button>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="text-sm uppercase tracking-wide text-[var(--muted)]">Скоро</h3>
        {comingSoonModules.map((module) => (
          <div
            key={module.title}
            className="glass-card rounded-2xl border-dashed p-4 opacity-50"
          >
            <h4 className="font-medium">{module.title}</h4>
            <p className="text-sm text-[var(--muted)]">{module.description}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
