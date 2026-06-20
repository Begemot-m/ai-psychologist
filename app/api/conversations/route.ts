import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { getModuleById } from "@/config/modules";
import { isPreviewMode } from "@/lib/preview";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const userId = body?.userId as string | undefined;
  const moduleId = body?.moduleId as string | undefined;

  if (!userId || !moduleId || !getModuleById(moduleId)) {
    return NextResponse.json({ error: "invalid userId or moduleId" }, { status: 400 });
  }

  if (isPreviewMode()) {
    return NextResponse.json({ conversationId: `preview-${moduleId}` });
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("conversations")
    .insert({ user_id: userId, module_id: moduleId })
    .select("id")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "failed to create conversation" }, { status: 500 });
  }

  return NextResponse.json({ conversationId: data.id });
}
