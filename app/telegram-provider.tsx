"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { init, useRawInitData } from "@telegram-apps/sdk-react";

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
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    try {
      init();
    } catch {
      // не внутри Telegram (например, локальная разработка в браузере)
    }
    setInitialized(true);
  }, []);

  if (!initialized) return null;
  return <AuthGate>{children}</AuthGate>;
}

function AuthGate({ children }: { children: ReactNode }) {
  const raw = useRawInitData();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    if (!raw) {
      setStatus("error");
      return;
    }
    fetch("/api/auth", {
      method: "POST",
      headers: { Authorization: `tma ${raw}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("auth failed");
        return res.json();
      })
      .then((data) => {
        setUser(data.user);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, [raw]);

  if (status === "loading") {
    return <div className="flex min-h-screen items-center justify-center">Загрузка…</div>;
  }
  if (status === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center px-6 text-center">
        Откройте приложение через Telegram
      </div>
    );
  }
  return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>;
}
