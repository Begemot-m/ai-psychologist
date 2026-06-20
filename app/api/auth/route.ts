import { NextRequest, NextResponse } from "next/server";
import { parseAndValidateInitData } from "@/lib/telegram/initData";
import { createServiceClient } from "@/lib/supabase/server";

const DEV_TELEGRAM_ID = 1;

export async function POST(req: NextRequest) {
  let telegramId: number;
  let username: string | null;

  const isDevBypass = req.headers.get("x-dev-bypass") === "true" && process.env.NODE_ENV !== "production";

  if (isDevBypass) {
    telegramId = DEV_TELEGRAM_ID;
    username = "dev_user";
  } else {
    const authHeader = req.headers.get("authorization") ?? "";
    const raw = authHeader.replace(/^tma\s+/i, "");
    if (!raw) {
      return NextResponse.json({ error: "missing init data" }, { status: 401 });
    }

    let initData;
    try {
      initData = parseAndValidateInitData(raw);
    } catch {
      return NextResponse.json({ error: "invalid init data" }, { status: 401 });
    }

    if (!initData.user) {
      return NextResponse.json({ error: "no user in init data" }, { status: 400 });
    }
    telegramId = initData.user.id;
    username = initData.user.username ?? null;
  }

  const supabase = createServiceClient();

  const { data: existing } = await supabase
    .from("users")
    .select("id, onboarding_completed_at, recommended_module_id")
    .eq("telegram_id", telegramId)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({
      user: {
        id: existing.id,
        onboardingCompleted: !!existing.onboarding_completed_at,
        recommendedModuleId: existing.recommended_module_id,
      },
    });
  }

  const { data: created, error } = await supabase
    .from("users")
    .insert({ telegram_id: telegramId, username })
    .select("id")
    .single();

  if (error || !created) {
    return NextResponse.json({ error: "failed to create user" }, { status: 500 });
  }

  return NextResponse.json({
    user: { id: created.id, onboardingCompleted: false, recommendedModuleId: null },
  });
}
