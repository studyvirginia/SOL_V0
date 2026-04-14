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
import { generateObject } from "ai";
import { MatplotlibSchema } from "../../lib/matplotlibSchema";
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
- Import matplotlib.lines as mlines (already available)
- All text labels: fontsize=10
- Labeled points: ax.annotate(label, xy=(x,y), xytext=(p1, p2), textcoords='offset points', fontsize=10, arrowprops=dict(arrowstyle="->", alpha=0.5))
- Question/find points (listed below): plot as open hollow circles, NO label — ax.plot(x,y,'o',mfc='white',mec='#e11d48',ms=10,zorder=5)
- For function plots: use np.linspace, handle vertical asymptotes by splitting at discontinuities
- GEOMETRY & SCIENCE: Use mpatches (Circle, Rectangle, Polygon, Arc) for shapes. Use mlines.Line2D or ax.annotate with arrows for vectors/forces.
- COLOR PALETTE: primary: '#2563eb' (blue), secondary: '#16a34a' (green), tertiary: '#d97706' (orange), accent: '#e11d48' (red).
- End the code WITHOUT plt.savefig() or plt.close() — the executor handles that

=== GRAPH SPEC ===
Type: ${type}
${equations && equations.length > 0 ? `Equations: ${equations.join("  |  ")}` : ""}
${description ? `Visual Requirements: ${description}` : ""}
${pts ? `Label points: ${pts}` : ""}
${findPts ? `Question points (hollow dot, no label): ${findPts}` : ""}
${course ? `Course context: ${course}` : ""}
${notes ? `Additional Notes: ${notes}` : ""}

Output the Python code block now:`;
}

function runRenderer(spec) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.resolve(process.cwd(), "lib/matplotlib_data_renderer.py");
    const proc = spawn("/usr/local/bin/python3", [scriptPath], {
      timeout: 20000,
    });

    let stdout = "";
    let stderr = "";

    proc.stdin.on('error', (err) => {
      console.error('[matplotlib-generate] stdin error:', err);
      // Don't reject yet, wait for 'close' to get the full stderr
    });

    proc.stdin.write(JSON.stringify(spec));
    proc.stdin.end();

    proc.stdout.on("data", d => { stdout += d.toString(); });
    proc.stderr.on("data", d => { stderr += d.toString(); });

    proc.on("close", code => {
      if (code !== 0) {
        console.error(`[matplotlib-generate] Python failed with code ${code}. Stderr: ${stderr}`);
        reject(new Error(`Python exit ${code}: ${stderr || 'No stderr output'}`));
      } else {
        if (!stdout.trim()) {
          reject(new Error("Python renderer produced no output"));
        } else {
          resolve(stdout.trim());
        }
      }
    });

    proc.on("error", err => {
      console.error('[matplotlib-generate] spawn error:', err);
      reject(new Error(`Spawn error: ${err.message}`));
    });
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

  const systemPrompt = `You are an educational diagram generator. 
Generate a SINGLE structured JSON visual spec for the Virginia SOL standard provided.
Return EXACTLY ONE diagram object. Do NOT return an array.
Focus on mathematical accuracy, physical correctness, and clear labeling.
The student is learning ${course}.`;

  const userPrompt = `VA SOL ${type}: ${description}`;

  let model;
  try {
    console.log("[matplotlib-generate] Loading config for provider:", config?.provider);
    if (config.provider === "openrouter") {
      model = createOpenAICompatible({
        name: "openrouter",
        baseURL: "https://openrouter.ai/api/v1",
        apiKey: config.apiKey,
      })(config.model);
    } else {
      model = createMistral({ apiKey: config.apiKey })(config.model);
    }
    console.log("[matplotlib-generate] Model initialized:", config?.model);
  } catch (err) {
    console.error("[matplotlib-generate] Model init error:", err);
    return res.status(500).json({ error: `Model init error: ${err.message}` });
  }

  try {
    console.log("[matplotlib-generate] Starting generateObject call...");
    const { object: diagramSpec } = await generateObject({
      model,
      schema: MatplotlibSchema,
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.1,
    });
    console.log("[matplotlib-generate] generateObject success. Spec:", JSON.stringify(diagramSpec).slice(0, 100));

    console.log("[matplotlib-generate] Starting runRenderer...");
    const pngBase64 = await runRenderer(diagramSpec);
    console.log("[matplotlib-generate] runRenderer success. Base64 length:", pngBase64.length);
    
    return res.status(200).json({ 
      pngBase64, 
      title: diagramSpec.title, 
      spec: diagramSpec,
      promptUsed: { system: systemPrompt, user: userPrompt }
    });

  } catch (err) {
    console.error("[matplotlib-generate] generation or rendering error:", err);
    return res.status(500).json({ error: err.message });
  }
}
