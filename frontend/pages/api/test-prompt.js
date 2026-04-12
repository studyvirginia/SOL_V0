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
Your task is to review a specific curriculum standard, provide a very brief 1-2 sentence explanation of the concept for a student, and then generate a highly structured Openverse search strategy.

Format (must be on its own line, valid JSON, no surrounding markdown):
%%IMAGE%%{"title_match_query": "<exact museum title>", "descriptive_keywords": "<long keyword list>", "preferred_extension": "svg|jpg|png", "source_priority": "museum|science|general"}%%END_IMAGE%%

FIELDS:
- title_match_query: PREDICT what a professional museum or library would title this image (e.g., "Medical illustration of the human digestive system"). Use "double quotes" for exact academic terms (e.g., "Mitosis").
- descriptive_keywords: A detailed list of 4-6 descriptive keywords to use if the title search fails.
- preferred_extension: Use "svg" for diagrams/geometry, "jpg" for photography/artifacts.
- source_priority: "museum" | "science" | "general".

RULES:
- Emit ONE image token per response. Place it after your brief explanation.
- BE CONSERVATIVE: Focus on foundational concepts that are guaranteed to have high-quality institutional images.
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
