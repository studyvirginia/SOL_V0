import fs from "fs";
import path from "path";
import { generateText } from "ai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

function loadOpenRouterKey() {
  if (process.env.OPENROUTER_API_KEY) return process.env.OPENROUTER_API_KEY.trim();
  try {
    const envPath = path.resolve(process.cwd(), ".env.local");
    if (!fs.existsSync(envPath)) return undefined;
    const contents = fs.readFileSync(envPath, "utf8");
    for (const line of contents.split(/\r?\n/)) {
      const [k, ...rest] = line.split("=");
      if (k?.trim() === "OPENROUTER_API_KEY") return rest.join("=").trim();
    }
  } catch (err) {
    console.error("Error loading .env.local for API key", err);
  }
  return undefined;
}

const SYSTEM_PROMPT = `You are an expert Virginia SOL educational tutor and "Search Architect."
Your task is to review a specific curriculum standard, provide a very brief 1-2 sentence explanation of the concept for a student, and then generate a highly structured Openverse search object.

Format (must be on its own line, valid JSON, no surrounding markdown):
%%IMAGE%%{"visual_search_term": "<search terms>", "preferred_extension": "svg|jpg|png", "source_priority": "museum|science|general"}%%END_IMAGE%%

FIELDS:
- visual_search_term: Clean, broad, and highly reliable search terms. Focus on famous or foundational examples.
- preferred_extension: Use "svg" for diagrams/geometry, "jpg" for photography/artifacts.
- source_priority: 
    - "museum" (History/Art)
    - "science" (Biology/Earth Science)
    - "general" (Generic educational topics)

RULES:
- Emit ONE image token per response. Place it after your brief explanation.
- BE CONSERVATIVE: If the curriculum standard is niche, search for a broad foundational concept.
- Do NOT wrap it in a code fence.`;

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { standard } = req.body;
  if (!standard) return res.status(400).json({ error: "Missing standard object" });

  const apiKey = loadOpenRouterKey();
  if (!apiKey) return res.status(500).json({ error: "Missing OpenRouter API key" });

  const modelId = process.env.CHAT_MODEL || "google/gemini-2.0-flash-lite-001";
  const openrouter = createOpenAICompatible({ name: "openrouter", baseURL: "https://openrouter.ai/api/v1", apiKey });

  const userPrompt = `Subject: ${standard.subject}
Course: ${standard.course}
Standard Code: ${standard.code}
Standard Description: ${standard.description}

Generate a short explanation for a student, followed by the image request token.`;

  try {
    const { text } = await generateText({
      model: openrouter(modelId),
      system: SYSTEM_PROMPT,
      prompt: userPrompt,
      maxTokens: 500,
      temperature: 0.2, // Low temperature for consistent JSON formatting
    });

    // Parse the token
    const tokenRegex = /%%IMAGE%%({.*?})%%END_IMAGE%%/s;
    const match = text.match(tokenRegex);
    let extractedPayload = null;
    let explanation = text;

    if (match && match[1]) {
      try {
        extractedPayload = JSON.parse(match[1]);
        explanation = text.replace(match[0], "").trim();
      } catch (e) {
        console.warn("Failed to parse token JSON:", match[1]);
      }
    }

    return res.status(200).json({ 
      rawText: text,
      explanation,
      payload: extractedPayload,
      model: modelId
    });

  } catch (err) {
    console.error("Test Prompt API Error:", err);
    return res.status(500).json({ error: "Failed to generate prompt via LLM" });
  }
}
