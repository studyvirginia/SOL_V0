-- Enable Vector Extension if not exists
CREATE EXTENSION IF NOT EXISTS vector;

-- Cognitive Memory Table (RAG Vector DB)
CREATE TABLE public.cognitive_memory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- NULL = System Memory
    session_id UUID,                                          -- NULL = Global standard
    content TEXT NOT NULL,
    embedding vector(1536),           -- V2 Blueprint: 1536 dim for OpenAI/Gemini
    metadata JSONB DEFAULT '{}'::jsonb, -- Store course, unit, cognitive tags
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS strictly
ALTER TABLE public.cognitive_memory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only insert their own cognitive memory"
    ON public.cognitive_memory FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only read their own cognitive memory"
    ON public.cognitive_memory FOR SELECT
    USING (auth.uid() = user_id OR user_id IS NULL);

-- V2 State Object Table
-- Replaces massive chat array polling with a lightweight JSON state machine
CREATE TABLE public.session_states (
    session_id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subject VARCHAR(255) NOT NULL,
    course VARCHAR(255) NOT NULL,
    last_shape VARCHAR(255),
    latest_score NUMERIC,
    state_object JSONB NOT NULL DEFAULT '{}'::jsonb, -- {"last_shape": "triangle", "vertices": "A,B,C"}
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.session_states ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users control their own session states"
    ON public.session_states FOR ALL
    USING (auth.uid() = user_id);

-- Match Memories RPC for RAG extraction
CREATE OR REPLACE FUNCTION match_memories(
    query_embedding vector(1536),
    match_threshold float,
    match_count int,
    p_user_id uuid
)
RETURNS TABLE (
    id uuid,
    content text,
    similarity float,
    metadata jsonb
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        cm.id,
        cm.content,
        1 - (cm.embedding <=> query_embedding) AS similarity,
        cm.metadata
    FROM cognitive_memory cm
    WHERE (cm.user_id = p_user_id OR cm.user_id IS NULL)
        AND 1 - (cm.embedding <=> query_embedding) > match_threshold
    ORDER BY cm.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;
-- Profiles Table for Student Preferences
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    is_dyslexic BOOLEAN DEFAULT FALSE,
    is_focus_mode BOOLEAN DEFAULT FALSE,
    academic_grade VARCHAR(50),
    preferred_theme VARCHAR(20) DEFAULT 'system',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Automatic Profile Creation on Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, is_dyslexic)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', FALSE);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Mastery Tracking Table
-- Stores student accuracy and progress per SOL standard
CREATE TABLE public.curriculum_mastery (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    standard_code TEXT NOT NULL,
    mastery_score INTEGER DEFAULT 0, -- 0 to 100 scale
    attempts_count INTEGER DEFAULT 0,
    last_attempt_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, standard_code)
);

ALTER TABLE public.curriculum_mastery ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users control their own mastery"
    ON public.curriculum_mastery FOR ALL
    USING (auth.uid() = user_id);

-- Student Notes Table
-- Persistent library for "Pinned" AI notes and explanations
CREATE TABLE public.student_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    standard_code TEXT,
    title TEXT,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.student_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users control their own notes"
    ON public.student_notes FOR ALL
    USING (auth.uid() = user_id);
