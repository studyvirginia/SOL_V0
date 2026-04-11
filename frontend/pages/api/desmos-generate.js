/**
 * /api/desmos-generate
 * Phase 2 for the "desmos" engine.
 *
 * Receives: { type, equations, label_points, course, notes, description }
 * Returns:  { desmosState: { expressions, viewport, showGrid, showAxes,
 *                            degreeMode, polarMode, title } }
 */

import fs from "fs";
import path from "path";
import { generateText } from "ai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { createMistral } from "@ai-sdk/mistral";
import { buildDesmosPrompt, parseDesmosResponse } from "../../lib/desmosService";

function loadApiConfig() {
  try {
    const envPath = path.resolve(process.cwd(), ".env.local");
    const env = { ...process.env };
    if (fs.existsSync(envPath)) {
      for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
        const eq = line.indexOf("=");
        if (eq > 0) env[line.slice(0, eq).trim()] = line.slice(eq + 1).trim();
      }
    }
    if (env.OPENROUTER_API_KEY) {
      return { provider: "openrouter", apiKey: env.OPENROUTER_API_KEY, model: "google/gemini-2.0-flash-lite-001" };
    }
    if (env.MISTRAL_API_KEY) {
      return { provider: "mistral", apiKey: env.MISTRAL_API_KEY, model: "mistral-small-2506" };
    }
    return null;
  } catch { return null; }
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const {
    type = "function",
    equations = [],
    label_points = [],
    find = [],
    course = "",
    notes = "",
    description = "",
    boardExpressions = [],   // optional: expressions from the last completed graph in this session
  } = req.body || {};

  const hasContent = equations.length > 0 || description;
  if (!hasContent) return res.status(400).json({ error: "equations array is required" });

  const config = loadApiConfig();
  if (!config) return res.status(500).json({ error: "No API key configured" });

  const systemPrompt = buildDesmosPrompt(
    { type, equations, label_points, find, course, notes, description },
    boardExpressions,
  );

  try {
    let model;
    if (config.provider === "openrouter") {
      model = createOpenAICompatible({
        name: "openrouter",
        baseURL: "https://openrouter.ai/api/v1",
        apiKey: config.apiKey,
      })(config.model);
    } else {
      model = createMistral({ apiKey: config.apiKey })(config.model);
    }

    const { text } = await generateText({
      model,
      system: systemPrompt,
      prompt: "Generate the Desmos graph JSON for the spec above.",
      maxTokens: 1200,
      temperature: 0.05,
    });

    let desmosState = parseDesmosResponse(text);

    // One retry on failure
    if (!desmosState) {
      console.warn("[desmos-generate] first attempt failed, retrying. Raw:", text.slice(0, 200));
      const { text: text2 } = await generateText({
        model,
        system: systemPrompt,
        prompt: "Generate the Desmos graph JSON. Output ONLY the JSON code block, nothing else.",
        maxTokens: 1200,
        temperature: 0.0,
      });
      desmosState = parseDesmosResponse(text2);
      if (!desmosState) {
        console.error("[desmos-generate] retry also failed:", text2.slice(0, 300));
        return res.status(500).json({ error: "Model did not return valid Desmos JSON", raw: text2 });
      }
    }

    return res.status(200).json({ desmosState });
  } catch (err) {
    console.error("[desmos-generate] error:", err);
    return res.status(500).json({ error: err.message });
  }
}
