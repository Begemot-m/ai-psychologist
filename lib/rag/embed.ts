const VOYAGE_URL = "https://api.voyageai.com/v1/embeddings";
const MODEL = "voyage-multilingual-2";

export async function embedText(text: string, inputType: "query" | "document" = "query"): Promise<number[]> {
  const res = await fetch(VOYAGE_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.VOYAGE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ input: [text], model: MODEL, input_type: inputType }),
  });

  if (!res.ok) {
    throw new Error(`Voyage embeddings request failed: ${res.status}`);
  }

  const data = await res.json();
  return data.data[0].embedding as number[];
}
