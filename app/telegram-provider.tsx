"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { init, retrieveRawInitData } from "@telegram-apps/sdk-react";

export type AuthUser = {
  id: string;
  onboardingCompleted: boolean;
  recommendedModuleId: string | null;
};

const AuthContext = createContext<AuthUser | null>(null);

export function useAuthUser() {
  return useContext(AuthContext);
}

export function TelegramProvider({ children }: { children: ReactNode }) {
  const [raw, setRaw] = useState<string | undefined>(undefined);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    try {
      init();
      setRaw(retrieveRawInitData());
    } catch {
      // не внутри Telegram (например, локальная разработка в браузере)
      setRaw(undefined);
    }
    setInitialized(true);
  }, []);

  if (!initialized) return null;
  return <AuthGate raw={raw}>{children}</AuthGate>;
}

function AuthGate({ raw, children }: { raw: string | undefined; children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "no-telegram" | "auth-failed">("loading");

  useEffect(() => {
    const isDev = process.env.NODE_ENV !== "production";
    const isPreview = process.env.NEXT_PUBLIC_PREVIEW_MODE === "true";
    if (!raw && !isDev && !isPreview) {
      setStatus("no-telegram");
      return;
    }
    fetch("/api/auth", {
      method: "POST",
      headers: raw ? { Authorization: `tma ${raw}` } : { "x-dev-bypass": "true" },
    })
      .then((res) => {
        if (!res.ok) throw new Error("auth failed");
        return res.json();
      })
      .then((data) => {
        setUser(data.user);
        setStatus("ready");
      })
      .catch(() => setStatus("auth-failed"));
  }, [raw]);

  if (status === "loading") {
    return <div className="flex min-h-screen items-center justify-center">Загрузка…</div>;
  }
  if (status === "no-telegram") {
    return (
      <div className="flex min-h-screen items-center justify-center px-6 text-center">
        Откройте приложение через Telegram
      </div>
    );
  }
  if (status === "auth-failed") {
    return (
      <div className="flex min-h-screen items-center justify-center px-6 text-center text-sm text-[var(--muted)]">
        Не удалось авторизоваться — проверь SUPABASE_URL и SUPABASE_SERVICE_ROLE_KEY в .env
        (см. логи сервера для деталей).
      </div>
    );
  }
  return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>;
}
