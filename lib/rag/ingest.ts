import { readdirSync, readFileSync, statSync } from "fs";
import { join } from "path";
import { createServiceClient } from "@/lib/supabase/server";
import { embedText } from "./embed";

const SOURCE_DIR = join(__dirname, "ingest-source");
const CHUNK_SIZE = 800;

function chunkText(text: string): string[] {
  const paragraphs = text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const chunks: string[] = [];
  let current = "";

  for (const paragraph of paragraphs) {
    if ((current + "\n\n" + paragraph).length > CHUNK_SIZE && current) {
      chunks.push(current);
      current = paragraph;
    } else {
      current = current ? `${current}\n\n${paragraph}` : paragraph;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

async function ingestNamespace(namespace: string) {
  const supabase = createServiceClient();
  const dir = join(SOURCE_DIR, namespace);
  const files = readdirSync(dir).filter((f) => statSync(join(dir, f)).isFile() && f !== "README.md");

  for (const file of files) {
    const text = readFileSync(join(dir, file), "utf-8");
    const chunks = chunkText(text);

    for (const chunk of chunks) {
      const embedding = await embedText(chunk, "document");
      const { error } = await supabase
        .from("knowledge_chunks")
        .insert({ kb_namespace: namespace, source: file, content: chunk, embedding });
      if (error) {
        console.error(`Failed to insert chunk from ${namespace}/${file}:`, error.message);
      }
    }
    console.log(`Ingested ${chunks.length} chunks from ${namespace}/${file}`);
  }
}

async function main() {
  const namespaces = readdirSync(SOURCE_DIR).filter((f) => statSync(join(SOURCE_DIR, f)).isDirectory());
  for (const namespace of namespaces) {
    await ingestNamespace(namespace);
  }
}

main().then(() => console.log("Done."));
