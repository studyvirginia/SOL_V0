import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { generateText } from "ai";
import { supabase } from "../../lib/supabaseClient";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { base64, fileName, fileType, sessionId } = req.body;

    if (!base64) return res.status(400).json({ error: "No file content provided" });

    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "Unauthorized" });

    const token = authHeader.split(" ")[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) return res.status(401).json({ error: "Invalid token" });

    // 1. Vision Analysis via OpenRouter (Gemini 2.0 Flash)
    const openrouter = createOpenAICompatible({
        name: "openrouter",
        baseURL: "https://openrouter.ai/api/v1",
        apiKey: process.env.OPENROUTER_API_KEY,
    });

    const { text: extractedText } = await generateText({
      model: openrouter("google/gemini-2.0-flash-001"),
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "You are the 'SOL Librarian'. Analyze this uploaded document (homework, note, or textbook scan). Extract all relevant academic text and summarize the key concepts aligned to Virginia SOL standards. Use structured markdown." },
            { type: "image", image: base64 }
          ]
        }
      ]
    });

    // 2. Persistent Storage (Student Notes)
    const { data: note, error: noteError } = await supabase
      .from('student_notes')
      .insert({
        user_id: user.id,
        title: `Library: ${fileName || 'Uploaded Material'}`,
        content: extractedText,
        standard_code: 'EXT' // 'EXT' for External/Library
      })
      .select()
      .single();

    if (noteError) throw noteError;

    // 3. Cognitive Memory (RAG)
    // In a full implementation, we would generate embeddings here. 
    // For now, we'll store it as content and let the background worker or next query index it.
    await supabase
      .from('cognitive_memory')
      .insert({
        user_id: user.id,
        session_id: sessionId,
        content: `[SOURCE: STUDENT UPLOAD] ${extractedText}`,
        metadata: { source: 'library', fileName }
      });

    return res.json({
      success: true,
      noteId: note.id,
      summary: extractedText.slice(0, 200) + "..."
    });

  } catch (err) {
    console.error("[Librarian Error]:", err);
    res.status(500).json({ error: "Ingestion failed", details: err.message });
  }
}
