/**
 * /api/matplotlib-generate
 *
 * Template-first graph generation for SOL V0.
 *
 * Flow:
 *   1. Receive graph spec from ChatWindow (type, equations, label_points, etc.)
 *   2. TRY: spawn matplotlib_gen.py in "template" mode → pre-built gallery template
 *   3. FALLBACK: if template fails (exit 3) → ask LLM to write code → run in "code" mode
 *   4. Second fallback: retry LLM with simpler prompt on code execution failure
 *
 * Returns: { pngBase64, title, source: "template"|"llm" }
 */

import fs from "fs";
import path from "path";
import { spawn } from "child_process";
import { generateText } from "ai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

// ─── Config ───────────────────────────────────────────────────────────────────

function loadApiConfig() {
  try {
    const envPath = path.resolve(process.cwd(), ".env.local");
    const env = { ...process.env };
    if (fs.existsSync(envPath)) {
      for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
        const eq = line.indexOf("=");
        if (eq > 0 && !line.trim().startsWith("#")) {
          env[line.slice(0, eq).trim()] = line.slice(eq + 1).trim();
        }
      }
    }
    if (env.OPENROUTER_API_KEY) {
      return {
        apiKey: env.OPENROUTER_API_KEY,
        // Use a more capable model for code generation since it needs to write correct Python
        model: "google/gemini-2.0-flash-001",
      };
    }
    return null;
  } catch { return null; }
}

// ─── Python Executor ──────────────────────────────────────────────────────────

function runPython(payload, timeoutMs = 25000) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.resolve(process.cwd(), "lib/matplotlib_gen.py");
    const pythonBin = path.resolve(process.cwd(), "venv/bin/python3");
    const proc = spawn(pythonBin, [scriptPath], { timeout: timeoutMs });

    let stdout = "";
    let stderr = "";

    proc.stdin.write(JSON.stringify(payload));
    proc.stdin.end();

    proc.stdout.on("data", d => { stdout += d.toString(); });
    proc.stderr.on("data", d => { stderr += d.toString(); });

    proc.on("close", exitCode => {
      if (exitCode === 3) {
        // Template-specific failure — request LLM fallback
        reject(Object.assign(new Error("TEMPLATE_FAILED"), { templateFailed: true, stderr }));
      } else if (exitCode !== 0) {
        reject(new Error(`Python exit ${exitCode}: ${stderr.slice(0, 500)}`));
      } else {
        resolve(stdout.trim());
      }
    });

    proc.on("error", err => reject(new Error(`Spawn error: ${err.message}`)));
  });
}

// ─── LLM Code Generator (Fallback Only) ───────────────────────────────────────

function buildFallbackPrompt({ type, equations, label_points, find, course, notes, description, fewShot }) {
  const pts = (label_points || [])
    .map(p => `(${p.x}, ${p.y})${p.label ? ` → "${p.label}"` : ""}`)
    .join(", ");
  const findPts = (find || []).map(p => `(${p.x}, ${p.y})`).join(", ");

  return `You are a matplotlib Python code generator for a K-12 math tutoring app.
Output ONLY a Python code block. No explanation, no prose, no markdown.

PRE-INJECTED: plt, np, math, mpatches, mlines. Do NOT import them.
Do NOT call plt.show() or plt.savefig() — the executor handles that.
Start with: fig, ax = plt.subplots(figsize=(7, 5))

STYLE (required):
- fig.patch.set_facecolor('white'); ax.set_facecolor('#fafafa')
- ax.grid(True, alpha=0.25, linestyle='--', linewidth=0.7)
- ax.spines['top'].set_visible(False); ax.spines['right'].set_visible(False)
- Title: ax.set_title(..., fontsize=13, fontweight='bold', pad=10)
- Colors: primary=#2563eb, secondary=#16a34a, tertiary=#d97706, accent=#7c3aed
- Labeled points: ax.plot(x,y,'o',color='#2563eb',ms=7,mec='white',mew=1.5)
- Find points: ax.plot(x,y,'o',mfc='white',mec='#e11d48',ms=11,mew=2) + annotate "?"

SPEC:
Type: ${type}
${equations?.length ? `Equations: ${equations.join(" | ")}` : ""}
${description ? `Description: ${description}` : ""}
${pts ? `Label points: ${pts}` : ""}
${findPts ? `Find points (hollow + "?" label): ${findPts}` : ""}
${course ? `Course: ${course}` : ""}
${notes ? `Notes: ${notes}` : ""}`;
}

function extractCode(text) {
  const fenced = text.match(/```(?:python)?\s*([\s\S]*?)```/);
  if (fenced) return fenced[1].trim();
  return text.trim();
}

// ─── Handler ──────────────────────────────────────────────────────────────────

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

  const spec = { type, equations, label_points, find, course, notes, description };

  // ── Step 1: Template mode ───────────────────────────────────────────────────
  try {
    const pngBase64 = await runPython({ mode: "template", spec, dpi, format: "svg" });
    const title = notes || (equations[0] ?? description).slice(0, 50);
    return res.status(200).json({ pngBase64, title, source: "template" });
  } catch (err) {
    if (!err.templateFailed) {
      // Real execution error — not a template-miss, log and try LLM anyway
      console.warn("[matplotlib-generate] template error (non-miss):", err.message);
    } else {
      console.log("[matplotlib-generate] template miss for type:", type, "— falling back to LLM");
    }
  }

  // ── Step 2: LLM code fallback ───────────────────────────────────────────────
  const config = loadApiConfig();
  if (!config) return res.status(500).json({ error: "No API key configured for LLM fallback" });

  // Load few-shot examples - REMOVED FOR PURE ZERO-SHOT TUNING
  let model;
  try {
    model = createOpenAICompatible({
      name: "openrouter",
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: config.apiKey,
    })(config.model);
  } catch (err) {
    return res.status(500).json({ error: `Model init error: ${err.message}` });
  }

  const fallbackSystemPrompt = buildFallbackPrompt({ type, equations, label_points, find, course, notes, description });

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const { text } = await generateText({
        model,
        system: fallbackSystemPrompt,
        prompt: attempt === 0
          ? "Generate the matplotlib Python code for the spec above."
          : "The previous code had an error. Generate a simpler, correct matplotlib code block for the same spec. Output ONLY code.",
        maxTokens: 1800,
        temperature: attempt === 0 ? 0.05 : 0.0,
      });

      const pythonCode = extractCode(text);
      if (!pythonCode) continue;

      const pngBase64 = await runPython({ mode: "code", code: pythonCode, dpi, format: "svg" });
      const title = notes || (equations[0] ?? description).slice(0, 50);
      return res.status(200).json({ pngBase64, title, source: "llm", pythonCode });
    } catch (err) {
      if (attempt === 1) {
        console.error("[matplotlib-generate] LLM fallback failed:", err.message);
        return res.status(500).json({ error: err.message });
      }
    }
  }

  return res.status(500).json({ error: "Graph generation failed after all attempts" });
}
