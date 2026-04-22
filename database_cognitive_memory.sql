-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Cognitive Memory Table
CREATE TABLE IF NOT EXISTS public.cognitive_memory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  session_id UUID REFERENCES public.sessions ON DELETE SET NULL,
  content TEXT NOT NULL,
  embedding VECTOR(1536), -- 1536 for OpenAI small/large, adjust if using Gemini (768)
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.cognitive_memory ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own memory" ON public.cognitive_memory FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own memory" ON public.cognitive_memory FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Vector Search Function
CREATE OR REPLACE FUNCTION match_memories (
  query_embedding VECTOR(1536),
  match_threshold FLOAT,
  match_count INT,
  p_user_id UUID
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.id,
    m.content,
    1 - (m.embedding <=> query_embedding) AS similarity
  FROM public.cognitive_memory m
  WHERE m.user_id = p_user_id
    AND 1 - (m.embedding <=> query_embedding) > match_threshold
  ORDER BY m.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
