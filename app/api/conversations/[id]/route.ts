import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { getModuleById } from "@/config/modules";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = createServiceClient();

  const { data: conversation } = await supabase
    .from("conversations")
    .select("id, module_id")
    .eq("id", id)
    .single();

  if (!conversation) {
    return NextResponse.json({ error: "conversation not found" }, { status: 404 });
  }

  const module = getModuleById(conversation.module_id ?? "");

  const { data: messages } = await supabase
    .from("messages")
    .select("role, content, is_crisis, created_at")
    .eq("conversation_id", id)
    .order("created_at", { ascending: true });

  return NextResponse.json({
    module: module
      ? { id: module.id, title: module.title, uiAccent: module.ui_accent }
      : null,
    messages: messages ?? [],
  });
}
