import { getAnthropicClient, MODELS } from "@/lib/llm/anthropic";

const CLASSIFIER_PROMPT = `Ты — классификатор риска для психологического чат-бота. Тебе дают одно сообщение пользователя. Ответь ровно одним словом: "crisis", если в сообщении есть признаки суицидальных мыслей, самоповреждения, угрозы другим людям, острого психического кризиса или насилия. Иначе ответь "normal". Никаких пояснений, только одно слово.`;

export async function classifyCrisis(message: string): Promise<"crisis" | "normal"> {
  const anthropic = getAnthropicClient();
  const response = await anthropic.messages.create({
    model: MODELS.haiku,
    max_tokens: 5,
    system: CLASSIFIER_PROMPT,
    messages: [{ role: "user", content: message }],
  });

  const text = response.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("")
    .toLowerCase();

  return text.includes("crisis") ? "crisis" : "normal";
}
