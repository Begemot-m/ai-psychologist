import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { getModuleById } from "@/config/modules";
import { classifyCrisis } from "@/lib/safety/classifyCrisis";
import { crisisProtocolMessage } from "@/config/crisisResources";
import { checkQuota } from "@/lib/billing/quota";
import { retrieveContext } from "@/lib/rag/retrieve";
import { getAnthropicClient } from "@/lib/llm/anthropic";
import { summarizeHistory } from "@/lib/llm/summarize";
import { isPreviewMode, previewCannedReplies } from "@/lib/preview";

const SUMMARIZE_THRESHOLD = 20;
const KEEP_RECENT = 6;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const conversationId = body?.conversationId as string | undefined;
  const content = (body?.content as string | undefined)?.trim();

  if (!conversationId || !content) {
    return NextResponse.json({ error: "missing conversationId or content" }, { status: 400 });
  }

  if (isPreviewMode() && conversationId.startsWith("preview-")) {
    const reply = previewCannedReplies[content.length % previewCannedReplies.length];
    return NextResponse.json({ reply, isCrisis: false });
  }

  const supabase = createServiceClient();

  const { data: conversation } = await supabase
    .from("conversations")
    .select("id, user_id, module_id, summary, summarized_through_message_count")
    .eq("id", conversationId)
    .single();

  if (!conversation || !conversation.module_id) {
    return NextResponse.json({ error: "conversation not found" }, { status: 404 });
  }

  const module = getModuleById(conversation.module_id);
  if (!module) {
    return NextResponse.json({ error: "module not found" }, { status: 404 });
  }

  const crisisStatus = await classifyCrisis(content);

  await supabase.from("messages").insert({
    conversation_id: conversationId,
    role: "user",
    content,
    is_crisis: crisisStatus === "crisis",
  });

  if (crisisStatus === "crisis") {
    await supabase.from("messages").insert({
      conversation_id: conversationId,
      role: "assistant",
      content: crisisProtocolMessage,
      is_crisis: true,
    });
    return NextResponse.json({ reply: crisisProtocolMessage, isCrisis: true });
  }

  const quota = await checkQuota(conversation.user_id);
  if (!quota.allowed) {
    return NextResponse.json(
      { error: "quota_exceeded", tier: quota.tier, used: quota.used, limit: quota.limit },
      { status: 402 },
    );
  }

  const { data: allMessages } = await supabase
    .from("messages")
    .select("role, content")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  const messages = allMessages ?? [];
  let summary = conversation.summary as string | null;
  let summarizedThrough = conversation.summarized_through_message_count ?? 0;

  if (messages.length - summarizedThrough > SUMMARIZE_THRESHOLD) {
    const toSummarize = messages.slice(summarizedThrough, messages.length - KEEP_RECENT);
    summary = await summarizeHistory(
      summary,
      toSummarize.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
    );
    summarizedThrough = messages.length - KEEP_RECENT;
    await supabase
      .from("conversations")
      .update({ summary, summarized_through_message_count: summarizedThrough })
      .eq("id", conversationId);
  }

  const recentWindow = messages.slice(summarizedThrough);
  const knowledge = await retrieveContext(content, module.kb_namespace);
  const knowledgeBlock = knowledge.length
    ? knowledge.map((chunk, i) => `[${i + 1}] ${chunk.content}`).join("\n\n")
    : "Подходящих материалов из базы знаний не найдено — отвечай на основе системного промпта.";

  const systemBlocks: Array<{ type: "text"; text: string; cache_control?: { type: "ephemeral" } }> = [
    { type: "text", text: module.system_prompt, cache_control: { type: "ephemeral" } },
    { type: "text", text: `Материалы из базы знаний:\n${knowledgeBlock}`, cache_control: { type: "ephemeral" } },
  ];
  if (summary) {
    systemBlocks.push({ type: "text", text: `Контекст предыдущего разговора: ${summary}` });
  }

  const anthropic = getAnthropicClient();
  const response = await anthropic.messages.create({
    model: quota.model,
    max_tokens: 1024,
    system: systemBlocks,
    messages: recentWindow.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
  });

  const reply = response.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("");

  await supabase.from("messages").insert({
    conversation_id: conversationId,
    role: "assistant",
    content: reply,
    is_crisis: false,
  });

  await supabase.from("usage").insert({
    user_id: conversation.user_id,
    conversation_id: conversationId,
    model: quota.model,
    input_tokens: response.usage.input_tokens,
    output_tokens: response.usage.output_tokens,
  });

  return NextResponse.json({ reply, isCrisis: false });
}
