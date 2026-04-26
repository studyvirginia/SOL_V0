import { generateText } from "ai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

function loadOpenRouterKey() {
  return process.env.OPENROUTER_API_KEY || "";
}

const openRouter = createOpenAICompatible({
  name: "openrouter",
  apiKey: loadOpenRouterKey(),
  baseURL: "https://openrouter.ai/api/v1",
});

// ── Openverse fetch ───────────────────────────────────────────────────────────
async function fetchOpenverseImage(query) {
  const params = new URLSearchParams({
    q: query,
    page_size: "5",
    filter_dead: "true",
    mature: "false",
    license_type: "commercial",
    // Suppress sensitive results (experimental flag, but safe default)
    // unstable__include_sensitive_results is false by default, so no need to send
  });

  const headers = { "User-Agent": "SOL-Study-Assistant/1.0 (openverse@wordpress.org)" };
  const apiKey = process.env.OPENVERSE_API_KEY;
  if (apiKey) headers["Authorization"] = `Bearer ${apiKey}`;

  const url = `https://api.openverse.org/v1/images/?${params.toString()}`;
  const res = await fetch(url, { headers });

  if (!res.ok) throw new Error(`Openverse returned ${res.status}`);
  const json = await res.json();
  return json.results || [];
}

// ── Llama 3 validator ─────────────────────────────────────────────────────────
async function validateWithLlama({ title, tags, query, lessonContext }) {
  const tagList = Array.isArray(tags) ? tags.map((t) => t.name).join(", ") : String(tags || "");

  const { text } = await generateText({
    model: openRouter("meta-llama/llama-3.1-8b-instruct"),
    system: `You are a quality-control editor for an educational platform for middle and high school students.
Your job is strict: either REJECT irrelevant images, or write a single, precise caption.`,
    prompt: `The student is learning about: ${lessonContext}
An image search for "${query}" returned:
  Title: "${title}"
  Tags: "${tagList}"

Rules:
- If the title/tags look like generic filenames (e.g. "DSC_0042", "IMG_1234"), personal photos, or unrelated garbage → output exactly: REJECT
- If the tags look entirely unrelated to the lesson topic → output exactly: REJECT
- If relevant: output ONLY a single sentence caption (no quotes, no prefix, no label) that connects this image to the lesson context.

Output:`,
    maxTokens: 80,
    temperature: 0.1,
  });

  const clean = text.trim();
  if (!clean || clean.toUpperCase() === "REJECT" || clean.toUpperCase().startsWith("REJECT")) {
    return null;
  }
  return clean;
}

// ── Handler ───────────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { query, lessonContext, subject, course } = req.body || {};
  if (!query || typeof query !== "string" || query.trim().length === 0) {
    return res.status(400).json({ error: "query is required" });
  }

  const safeQuery = query.trim().slice(0, 100); // hard cap — no runaway queries
  const context = lessonContext || `${subject || ""} ${course || ""}`.trim() || "general education";

  try {
    // 1. Fetch top candidates from Openverse
    const results = await fetchOpenverseImage(safeQuery);
    if (!results.length) {
      return res.status(404).json({ error: "no_result" });
    }

    // 2. Try each result in order until the validator approves one
    for (const img of results) {
      const title = img.title || "";
      const tags = img.tags || [];

      const caption = await validateWithLlama({
        title,
        tags,
        query: safeQuery,
        lessonContext: context,
      });

      if (!caption) continue; // validator rejected — try next

      // 3. Return the validated result
      return res.status(200).json({
        url: img.url,
        thumbnail: img.thumbnail,
        caption,
        attribution: img.attribution || "",
        license: img.license || "",
        foreignLandingUrl: img.foreign_landing_url || "",
      });
    }

    // All results rejected
    return res.status(404).json({ error: "no_result" });
  } catch (err) {
    console.error("[api/openverse] Error:", err.message || err);
    return res.status(404).json({ error: "no_result" });
  }
}
