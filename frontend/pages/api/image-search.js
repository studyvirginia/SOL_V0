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

const STAGE_2_MODEL = "google/gemini-2.0-flash-lite-001";

// Elite Source Slugs for Openverse
const SOURCE_MAP = {
  museum: "met,clevelandmuseum,brooklynmuseum,smithsonian_institution,smithsonian_national_museum_of_natural_history,smithsonian_american_art_museum,smithsonian_air_and_space_museum",
  science: "nasa,inaturalist,phylopic",
  general: "wikimedia,flickr"
};

async function fetchAndVerify(searchTerms, preferredExtension, sourcePriority, standardContext, openrouter, apiKey) {
  // 1. Construct Openverse URL
  // We use license_type=commercial,modification for better academic freedom
  let url = `https://api.openverse.engineering/v1/images/?q=${encodeURIComponent(searchTerms)}&license_type=commercial,modification&include_sensitive_results=false&page_size=1`;
  
  if (preferredExtension) {
    url += `&extension=${preferredExtension}`;
  }
  
  if (sourcePriority && SOURCE_MAP[sourcePriority]) {
    url += `&source=${SOURCE_MAP[sourcePriority]}`;
  }

  const response = await fetch(url, {
    headers: { "User-Agent": "SOLAssistant/3.0 (lincoln@studyvirginia.org) Bot" }
  });

  const data = await response.json();

  if (!data.results || data.results.length === 0) {
    return { success: false, reason: "No quality images found in Openverse elite sources.", fallback_query: searchTerms };
  }

  const image = data.results[0];
  
  // Layer 3 Safety: Manual Sensitivity Scan
  if (image.sensitivity && image.sensitivity.length > 0) {
    console.warn(`[Shield Reject] Sensitive content flagged: ${image.sensitivity.join(', ')}`);
    return { success: false, reason: "Sensitive content blocked by shield.", fallback_query: "" };
  }

  // Stage 3: The AI Verifier (Hardcoded Flash Lite)
  if (standardContext && apiKey && openrouter) {
    const tagsStr = (image.tags || []).map(t => t.name).join(', ');
    const prompt = `You are an educational relevance verifier for Openverse media.
Determine if the provided candidate image EXACTLY matches the original visual search term AND supports the standard concept.

Original Search Term: ${searchTerms}
Standard Concept: ${standardContext}

Candidate Title: ${image.title}
Candidate Provider: ${image.provider}
Candidate Tags: ${tagsStr}

CRITICAL RULES:
1. The title and tags MUST be primarily in English. Reject foreign languages.
2. The image MUST be an EXACT match for the searched topic.
3. If it fails, output {"approved": false, "fallback_query": "<simplified English search term>"}.

OUTPUT FORMAT (Strict JSON, no markdown):
{"approved": true|false, "fallback_query": "<string if false>"}`;

    const { text } = await generateText({
      model: openrouter(STAGE_2_MODEL),
      prompt,
      maxTokens: 50,
      temperature: 0,
    });

    try {
      let cleanText = text.trim();
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.replace(/```json/g, '').replace(/```/g, '').trim();
      }
      const verifierResponse = JSON.parse(cleanText);
      
      if (!verifierResponse.approved) {
        console.warn(`[Shield Reject] Openverse Verifier rejected: ${image.title}. Fallback: ${verifierResponse.fallback_query}`);
        return { success: false, reason: "Visual match rejected by AI verifier.", fallback_query: verifierResponse.fallback_query };
      }
    } catch (e) {
      return { success: false, reason: "Verifier format error", fallback_query: "" };
    }
  }

  return {
    success: true,
    data: {
      url: image.url,
      thumbnail: image.thumbnail,
      sourceUrl: image.foreign_landing_url,
      attribution: `${image.title} by ${image.creator || 'Unknown'} via ${image.provider.toUpperCase()} (License: ${image.license.toUpperCase()})`,
      license: image.license,
      provider: image.provider,
      title: image.title
    }
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({error: 'Method not allowed'});
  const { visual_search_term, preferred_extension, source_priority, standardContext } = req.body;
  
  if (!visual_search_term) return res.status(400).json({error: 'Missing visual_search_term'});

  try {
    const apiKey = loadOpenRouterKey();
    const openrouter = apiKey ? createOpenAICompatible({ name: "openrouter", baseURL: "https://openrouter.ai/api/v1", apiKey }) : null;

    // Attempt 1
    let result = await fetchAndVerify(visual_search_term, preferred_extension, source_priority, standardContext, openrouter, apiKey);

    // One-Shot Retry
    if (!result.success && result.fallback_query) {
      console.log(`[Shield Retry] Openverse Retrying with: "${result.fallback_query}"`);
      // For retry, we drop the source priority and extension to be as broad as possible
      result = await fetchAndVerify(result.fallback_query, null, null, standardContext, openrouter, apiKey);
    }

    if (!result.success) {
      return res.status(404).json({ error: result.reason });
    }

    return res.status(200).json(result.data);

  } catch (error) {
    console.error("Openverse Proxy Error:", error.message);
    return res.status(500).json({ error: error.message });
  }
}
