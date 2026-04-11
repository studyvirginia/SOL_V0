/**
 * /api/matplotlib-generate
 * Generates a matplotlib PNG for a given graph spec.
 *
 * Receives: { type, equations, label_points, find, course, notes, description, dpi }
 * Returns:  { pngBase64: "...", title: "..." }
 *
 * Flow: build LLM prompt → LLM generates Python matplotlib code →
 *       spawn matplotlib_gen.py to execute it → return base64 PNG
 */

import fs from "fs";
import path from "path";
import { spawn } from "child_process";
import { generateText } from "ai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { createMistral } from "@ai-sdk/mistral";

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

function buildMatplotlibPrompt({ type, equations, label_points, find, course, notes, description }) {
  const pts = (label_points || [])
    .map(p => `(${p.x}, ${p.y})${p.label ? ` → "${p.label}"` : ""}`)
    .join(", ");
  const findPts = (find || [])
    .map(p => `(${p.x}, ${p.y})`)
    .join(", ");

  return `You are a matplotlib Python code generator for a K-12 math tutoring app.
Output ONLY a Python code block (no explanation, no markdown prose). The script will be exec'd.

REQUIREMENTS:
- Use matplotlib Agg backend (already set). Do NOT call plt.show().
- Start with: fig, ax = plt.subplots(figsize=(7, 5))
- White figure background: fig.patch.set_facecolor('white'); ax.set_facecolor('#fafafa')
- Clean, textbook-quality style. Use ax.spines for axis lines.
- Font: ax.set_title(..., fontsize=13, fontweight='bold', pad=10)
- Grid: ax.grid(True, alpha=0.3, linestyle='--')
- Import numpy as np (already available as np)
- Import matplotlib.patches as mpatches (already available)
- All text labels: fontsize=10
- Labeled points: ax.annotate(label, xy=(x,y), xytext=(x+offset, y+offset), fontsize=10, ...)
- Question/find points (listed below): plot as open hollow circles, NO label — ax.plot(x, y, 'o', mfc='white', mec='#e11d48', ms=10, zorder=5)
- For function plots: use np.linspace, handle vertical asymptotes by splitting at discontinuities
- Color palette: primary curve: '#2563eb', secondary: '#16a34a', tertiary: '#d97706', accent: '#7c3aed'
- End the code WITHOUT plt.savefig() or plt.close() — the executor handles that

=== GRAPH SPEC ===
Type: ${type}
${equations && equations.length > 0 ? `Equations: ${equations.join("  |  ")}` : ""}
${description ? `Description: ${description}` : ""}
${pts ? `Label points: ${pts}` : ""}
${findPts ? `Question points (hollow dot, no label): ${findPts}` : ""}
${course ? `Course: ${course}` : ""}
${notes ? `Notes: ${notes}` : ""}

Output the Python code block now:`;
}

function runPython(code, dpi = 150) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.resolve(process.cwd(), "lib/matplotlib_gen.py");
    const proc = spawn("python3", [scriptPath], {
      timeout: 20000,
    });

    let stdout = "";
    let stderr = "";

    proc.stdin.write(JSON.stringify({ code, dpi }));
    proc.stdin.end();

    proc.stdout.on("data", d => { stdout += d.toString(); });
    proc.stderr.on("data", d => { stderr += d.toString(); });

    proc.on("close", code => {
      if (code !== 0) {
        reject(new Error(`Python exit ${code}: ${stderr.slice(0, 500)}`));
      } else {
        resolve(stdout.trim());
      }
    });

    proc.on("error", err => reject(new Error(`Spawn error: ${err.message}`)));
  });
}

function extractCode(text) {
  // Strip markdown code fences if present
  const fenced = text.match(/```(?:python)?\s*([\s\S]*?)```/);
  if (fenced) return fenced[1].trim();
  return text.trim();
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
    dpi = 150,
  } = req.body || {};

  const hasContent = equations.length > 0 || description;
  if (!hasContent) return res.status(400).json({ error: "equations or description required" });

  const config = loadApiConfig();
  if (!config) return res.status(500).json({ error: "No API key configured" });

  const systemPrompt = buildMatplotlibPrompt({ type, equations, label_points, find, course, notes, description });

  let model;
  try {
    if (config.provider === "openrouter") {
      model = createOpenAICompatible({
        name: "openrouter",
        baseURL: "https://openrouter.ai/api/v1",
        apiKey: config.apiKey,
      })(config.model);
    } else {
      model = createMistral({ apiKey: config.apiKey })(config.model);
    }
  } catch (err) {
    return res.status(500).json({ error: `Model init error: ${err.message}` });
  }

  let pythonCode;
  try {
    const { text } = await generateText({
      model,
      system: systemPrompt,
      prompt: "Generate the matplotlib Python code for the spec above.",
      maxTokens: 1500,
      temperature: 0.05,
    });
    pythonCode = extractCode(text);
  } catch (err) {
    return res.status(500).json({ error: `LLM error: ${err.message}` });
  }

  if (!pythonCode) {
    return res.status(500).json({ error: "LLM returned empty code" });
  }

  let pngBase64;
  try {
    pngBase64 = await runPython(pythonCode, dpi);
  } catch (err) {
    // One retry with a simpler fallback prompt
    console.warn("[matplotlib-generate] first attempt failed, retrying:", err.message);
    try {
      const { text: text2 } = await generateText({
        model,
        system: systemPrompt,
        prompt: "The previous code had an error. Generate a simpler, correct matplotlib Python code block for the same spec. Output ONLY the code, no explanation.",
        maxTokens: 1500,
        temperature: 0.0,
      });
      pythonCode = extractCode(text2);
      pngBase64 = await runPython(pythonCode, dpi);
    } catch (err2) {
      console.error("[matplotlib-generate] retry failed:", err2.message);
      return res.status(500).json({ error: err2.message, code: pythonCode });
    }
  }

  const title = equations.length > 0
    ? equations[0].replace(/^y\s*=\s*/, "").slice(0, 40)
    : description.slice(0, 40);

  return res.status(200).json({ pngBase64, title, pythonCode });
}
