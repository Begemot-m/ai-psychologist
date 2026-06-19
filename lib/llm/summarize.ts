import { getAnthropicClient, MODELS } from "@/lib/llm/anthropic";

type HistoryMessage = { role: "user" | "assistant"; content: string };

export async function summarizeHistory(
  previousSummary: string | null,
  messages: HistoryMessage[],
): Promise<string> {
  const anthropic = getAnthropicClient();
  const transcript = messages.map((m) => `${m.role}: ${m.content}`).join("\n");

  const response = await anthropic.messages.create({
    model: MODELS.haiku,
    max_tokens: 400,
    system:
      "Сожми историю переписки психологического чата в краткое резюме на русском: ключевые темы, эмоциональное состояние пользователя, договорённости. Без оценок и диагнозов. 5-8 предложений.",
    messages: [
      {
        role: "user",
        content: previousSummary
          ? `Предыдущее резюме:\n${previousSummary}\n\nНовые сообщения:\n${transcript}`
          : `Сообщения:\n${transcript}`,
      },
    ],
  });

  return response.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("");
}
