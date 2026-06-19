import { createServiceClient } from "@/lib/supabase/server";
import { embedText } from "./embed";

export type RetrievedChunk = { content: string; source: string | null; similarity: number };

export async function retrieveContext(
  query: string,
  kbNamespace: string,
  matchCount = 5,
): Promise<RetrievedChunk[]> {
  const embedding = await embedText(query, "query");
  const supabase = createServiceClient();

  const { data, error } = await supabase.rpc("match_knowledge_chunks", {
    query_embedding: embedding,
    match_namespace: kbNamespace,
    match_count: matchCount,
  });

  if (error || !data) return [];
  return data as RetrievedChunk[];
}
