/**
 * /api/geogebra-generate
 * Phase 2 for the "geogebra" engine.
 *
 * Receives: { type, equations, label_points, course, notes }
 * Returns:  { ggbState: { cmds, view, showGrid, title } }
 */

import fs from "fs";
import path from "path";
import { generateText } from "ai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { createMistral } from "@ai-sdk/mistral";
import { buildGeoGebraPrompt, parseGeoGebraResponse } from "../../lib/geogebraService";

/**
 * Server-side type correction — fixes common Phase 1 mis-classifications.
 * Phase 1 LLM may emit type:"function" for graphs that are clearly trig,
 * polar, inequality, or piecewise. Correct here before building the prompt.
 */
function autoCorrectType(type, equations) {
  if (!equations.length) return type;
  const eqs = equations.join(" ").toLowerCase();

  // Only auto-correct when Phase 1 chose "function" (most common mis-route)
  if (type !== "function") return type;

  if (/\b(sin|cos|tan|sec|csc|cot|arcsin|arccos|arctan)\b/.test(eqs)) return "trig";
  if (/\br\s*=|\btheta\b|\bpolar\b/.test(eqs))                         return "polar";
  if (/[<>]/.test(eqs))                                                  return "inequality";
  if (/\bif\b|\{.*\|/.test(eqs))                                        return "piecewise";
  if (/\b(polygon|circle|triangle|segment|line|angle)\b/.test(eqs) &&
      !/y\s*=/.test(eqs))                                                return "geometry";

  return type;
}

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
    boardCmds = [],   // optional: cmds from the last completed GeoGebra graph
  } = req.body || {};

  const hasContent = equations.length > 0 || description;
  if (!hasContent) return res.status(400).json({ error: "equations array is required" });

  const config = loadApiConfig();
  if (!config) return res.status(500).json({ error: "No API key configured" });

  const correctedType = autoCorrectType(type, equations);
  if (correctedType !== type) {
    console.info(`[geogebra-generate] type auto-corrected: ${type} → ${correctedType}`);
  }

  const systemPrompt = buildGeoGebraPrompt({ type: correctedType, equations, label_points, find, course, notes, description }, boardCmds);

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
      prompt: "Generate the GeoGebra commands JSON for the spec above.",
      maxTokens: 1200,
      temperature: 0.05,
    });

    let ggbState = parseGeoGebraResponse(text);

    // One retry on failure
    if (!ggbState) {
      console.warn("[geogebra-generate] first attempt failed, retrying. Raw:", text.slice(0, 200));
      const { text: text2 } = await generateText({
        model,
        system: systemPrompt,
        prompt: "Generate the GeoGebra commands JSON. Output ONLY the JSON code block, nothing else.",
        maxTokens: 1200,
        temperature: 0.0,
      });
      ggbState = parseGeoGebraResponse(text2);
      if (!ggbState) {
        console.error("[geogebra-generate] retry also failed:", text2.slice(0, 300));
        return res.status(500).json({ error: "Model did not return valid GeoGebra JSON", raw: text2 });
      }
    }

    return res.status(200).json({ ggbState });
  } catch (err) {
    console.error("[geogebra-generate] error:", err);
    return res.status(500).json({ error: err.message });
  }
}
