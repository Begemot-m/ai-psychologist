create or replace function match_knowledge_chunks(
  query_embedding vector(1024),
  match_namespace text,
  match_count int default 5
)
returns table (
  id uuid,
  content text,
  source text,
  similarity float
)
language sql stable
as $$
  select
    knowledge_chunks.id,
    knowledge_chunks.content,
    knowledge_chunks.source,
    1 - (knowledge_chunks.embedding <=> query_embedding) as similarity
  from knowledge_chunks
  where knowledge_chunks.kb_namespace = match_namespace
  order by knowledge_chunks.embedding <=> query_embedding
  limit match_count;
$$;
