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

const SOURCE_MAP = {
  museum: "met,clevelandmuseum,brooklynmuseum,smithsonian_institution,smithsonian_national_museum_of_natural_history,smithsonian_american_art_museum,smithsonian_air_and_space_museum",
  science: "nasa,inaturalist,phylopic",
  general: "wikimedia,flickr"
};

async function fetchAndVerify(query, searchType, preferredExtension, sourcePriority, standardContext, openrouter, apiKey) {
  // Constructed Openverse URL
  // searchType can be 'title' (exact field search) or 'general' (q parameter)
  let url = `https://api.openverse.engineering/v1/images/?license_type=commercial,modification&include_sensitive_results=false&page_size=1`;
  
  if (searchType === 'title') {
    // Advanced: Search specifically in the Title field for highest relevance
    url += `&title=${encodeURIComponent(query)}`;
  } else {
    // Broad: Use general query across all fields (tags, description, etc.)
    url += `&q=${encodeURIComponent(query)}`;
  }

  if (preferredExtension) {
    url += `&extension=${preferredExtension}`;
  }
  
  if (sourcePriority && SOURCE_MAP[sourcePriority]) {
    url += `&source=${SOURCE_MAP[sourcePriority]}`;
  }

  console.log(`[Shield Fetch] Type: ${searchType}, URL: ${url}`);

  const response = await fetch(url, {
    headers: { "User-Agent": "SOLAssistant/4.0 (lincoln@studyvirginia.org) Bot" }
  });

  const data = await response.json();

  if (!data.results || data.results.length === 0) {
    return { success: false, reason: "No high-precision title matches found.", fallback_needed: searchType === 'title' };
  }

  const image = data.results[0];
  
  // Layer 3 Safety: Manual Sensitivity Scan
  if (image.sensitivity && image.sensitivity.length > 0) {
    console.warn(`[Shield Reject] Sensitive content flagged: ${image.sensitivity.join(', ')}`);
    return { success: false, reason: "Educational Meta-Match Rejected: Sensitive Content.", fallback_needed: false };
  }

  // Stage 3: The AI Verifier (Meta-Match)
  if (standardContext && apiKey && openrouter) {
    const tagsStr = (image.tags || []).map(t => t.name).join(', ');
    const prompt = `You are an Educational Meta-Match Verifier. 
Verify if the image text-metadata (Title/Tags) matches the curriculum standard. **NOTE: You are only scanning text, NOT the image itself.**

Original Search: ${query}
Standard Context: ${standardContext}

Image Metadata to Verify:
- Title: ${image.title}
- Provider: ${image.provider}
- Tags/Topics: ${tagsStr}

CRITICAL RULES:
1. Reject if Title/Tags are in a non-English language.
2. Reject if the metadata indicates this is an unrelated object.
3. If it fails, output {"approved": false, "fallback_query": "<alternative search query>"}.

OUTPUT FORMAT (JSON ONLY):
{"approved": true|false, "fallback_query": "<string>"}`;

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
        console.warn(`[Shield Reject] Educational Meta-Match Rejected for: ${image.title}. Fallback suggested: ${verifierResponse.fallback_query}`);
        return { 
          success: false, 
          reason: "Educational Meta-Match Rejected by AI Verifier.", 
          fallback_query: verifierResponse.fallback_query 
        };
      }
    } catch (e) {
      return { success: false, reason: "Verifier Output Format Error", fallback_needed: false };
    }
  }

  return {
    success: true,
    data: {
      url: image.url,
      thumbnail: image.thumbnail,
      sourceUrl: image.foreign_landing_url,
      attribution: `${image.title} via ${image.provider.toUpperCase()}`,
      license: image.license,
      provider: image.provider,
      title: image.title
    }
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({error: 'Method not allowed'});
  const { title_match_query, descriptive_keywords, preferred_extension, source_priority, standardContext } = req.body;
  
  if (!title_match_query) return res.status(400).json({error: 'Missing search terms'});

  try {
    const apiKey = loadOpenRouterKey();
    const openrouter = apiKey ? createOpenAICompatible({ name: "openrouter", baseURL: "https://openrouter.ai/api/v1", apiKey }) : null;

    // STEP 1: High-Precision "Title Match" Search
    let result = await fetchAndVerify(title_match_query, 'title', preferred_extension, source_priority, standardContext, openrouter, apiKey);

    // STEP 2: Fallback to "Descriptive Keywords" Search
    if (!result.success && result.fallback_needed) {
      console.log(`[Shield Fallback] No Title match. Trying descriptive keywords: "${descriptive_keywords}"`);
      result = await fetchAndVerify(descriptive_keywords, 'general', preferred_extension, source_priority, standardContext, openrouter, apiKey);
    }

    // STEP 3: Final Intelligent Check Retry
    if (!result.success && result.fallback_query) {
       console.log(`[Shield Retry] Final attempt with Verifier-suggested term: "${result.fallback_query}"`);
       result = await fetchAndVerify(result.fallback_query, 'general', null, null, standardContext, openrouter, apiKey);
    }

    if (!result.success) {
      return res.status(404).json({ error: result.reason });
    }

    return res.status(200).json(result.data);

  } catch (error) {
    console.error("Openverse Engine Reliability Error:", error.message);
    return res.status(500).json({ error: error.message });
  }
}
