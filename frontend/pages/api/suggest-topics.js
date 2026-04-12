import { generateText } from "ai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import path from "path";
import fs from "fs";

function loadOpenRouterKey() {
  if (process.env.OPENROUTER_API_KEY) return process.env.OPENROUTER_API_KEY.trim();
  const candidatePaths = [
    path.resolve(process.cwd(), ".env.local"),
    path.resolve(process.cwd(), "frontend", ".env.local"),
    path.resolve(process.cwd(), "..", ".env.local"),
  ];
  try {
    for (const envPath of [...new Set(candidatePaths)]) {
      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, "utf-8");
        const match = content.match(/OPENROUTER_API_KEY\s*=\s*(.*)/);
        if (match) {
          const trimmed = match[1].trim();
          return trimmed.replace(/^["']|["']$/g, "").trim();
        }
      }
    }
  } catch (e) {
    console.error("Error finding API key in .env.local:", e);
  }
  return "";
}

const openRouter = createOpenAICompatible({
  name: "openrouter",
  apiKey: loadOpenRouterKey(),
  baseURL: "https://openrouter.ai/api/v1",
});

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { subject, course } = req.body;
  if (!course) return res.status(400).json({ error: "Course is required" });

  try {
    const { text } = await generateText({
      model: openRouter("meta-llama/llama-3.1-8b-instruct"),
      system: `You are a curriculum expert for Virginia SOL math/science/history/english. 
Given a course, suggest exactly 5 specific and focused concept review topics that would make for a good short "Concept Quiz".
Examples for Algebra I: "Solving Multi-Step Equations", "Factoring Trinomials (a=1)", "Graphing Linear Inequalities", "Direct Variation", "Laws of Exponents".
Return ONLY a raw JSON array of 5 strings. No other text.`,
      prompt: `Suggest 5 concept quiz topics for the course: ${course} in the subject: ${subject}.`,
    });

    let topics = [];
    try {
      topics = JSON.parse(text.match(/\[.*\]/s)?.[0] || text);
    } catch (e) {
      // Fallback if parsing fails
      topics = text.split("\n").map(t => t.replace(/^\d+\.\s*/, "").replace(/["',-]/g, "").trim()).filter(t => t.length > 3).slice(0, 5);
    }

    return res.status(200).json({ topics });
  } catch (error) {
    console.error("Topic suggestion error:", error);
    return res.status(500).json({ error: "Failed to generate topics" });
  }
}
