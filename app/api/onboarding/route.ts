import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { recommendModuleId, type OnboardingTopic } from "@/config/onboarding";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const userId = body?.userId as string | undefined;
  const answers = body?.answers as OnboardingTopic[] | undefined;

  if (!userId) {
    return NextResponse.json({ error: "missing userId" }, { status: 400 });
  }

  const recommendedModuleId = answers?.length ? recommendModuleId(answers) : null;

  const supabase = createServiceClient();
  const { error } = await supabase
    .from("users")
    .update({
      onboarding_completed_at: new Date().toISOString(),
      recommended_module_id: recommendedModuleId,
    })
    .eq("id", userId);

  if (error) {
    return NextResponse.json({ error: "failed to save onboarding" }, { status: 500 });
  }

  return NextResponse.json({ recommendedModuleId });
}
