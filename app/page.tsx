"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthUser } from "./telegram-provider";

export default function Home() {
  const router = useRouter();
  const user = useAuthUser();

  useEffect(() => {
    if (!user) return;
    router.replace(user.onboardingCompleted ? "/marketplace" : "/onboarding");
  }, [user, router]);

  return <div className="flex min-h-screen items-center justify-center">Загрузка…</div>;
}
