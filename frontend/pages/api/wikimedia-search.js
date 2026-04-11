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

// Hardcode Flash Lite for ultra-cheap Stage 2 background verification
const STAGE_2_MODEL = "google/gemini-2.0-flash-lite-001";

async function fetchAndVerify(queryTerm, standardContext, openrouter, apiKey) {
  // 1. STAGE A: The Ai Search Architect Wrapper
  const searchQuery = `${queryTerm.trim()} filetype:bitmap|drawing`;
  const searchUrl = `https://commons.wikimedia.org/w/api.php?action=query&format=json&list=search&srnamespace=6&srsearch=${encodeURIComponent(searchQuery)}&srlimit=1`;
  
  const searchRes = await fetch(searchUrl, {
    headers: { "User-Agent": "SOLAssistant/2.0 (lincoln@studyvirginia.org) Bot" }
  });
  const searchData = await searchRes.json();

  if (!searchData.query || !searchData.query.search || searchData.query.search.length === 0) {
    return { success: false, reason: "No relevant Wikipedia images found.", fallback_query: "" };
  }

  const fileTitle = searchData.query.search[0].title;

  // 2. STAGE B: The Image Info Query
  const infoUrl = `https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&iiprop=url|extmetadata|mime&titles=${encodeURIComponent(fileTitle)}`;
  const infoRes = await fetch(infoUrl, {
    headers: { "User-Agent": "SOLAssistant/2.0 (lincoln@studyvirginia.org) Bot" }
  });

  const infoData = await infoRes.json();
  const pages = infoData.query?.pages;
  if (!pages) return { success: false, reason: "Verification fetch failed", fallback_query: "" };

  const pageId = Object.keys(pages)[0];
  const page = pages[pageId];

  if (!page.imageinfo || page.imageinfo.length === 0) {
    return { success: false, reason: "No image info found", fallback_query: "" };
  }

  const imageinfo = page.imageinfo[0];
  const mime = imageinfo.mime;
  
  // Explicitly reject unsupported document formats
  if (!mime.startsWith("image/")) {
    return { success: false, reason: `Unsupported file type (${mime})`, fallback_query: "" };
  }

  const extmetadata = imageinfo.extmetadata || {};
  const descriptionHTML = extmetadata.ImageDescription?.value || "";
  const cleanDescription = descriptionHTML.replace(/<[^>]+>/g, '').substring(0, 400);

  // 3. STAGE C: THE 2ND PHASE AI VERIFIER
  if (standardContext && apiKey) {
    const prompt = `You are an educational relevance verifier. Determine if the provided candidate image EXACTLY matches the original visual search term AND accurately supports the standard concept.

Original Search Term: ${queryTerm}
Standard Concept: ${standardContext}

Candidate Image File Name: ${fileTitle}
Candidate Image Description: ${cleanDescription}

CRITICAL RULES:
1. The description MUST be comprehensible in English. Reject foreign languages (like Arabic, Russian, etc.).
2. The image MUST be highly relevant, objective, and accurately describe the concept.
3. If it fails either rule, output {"approved": false, "fallback_query": "<simplified, broader English search term>"}.

OUTPUT FORMAT:
Provide your response strictly as valid JSON with NO markdown formatting:
{"approved": true|false, "fallback_query": "<string if false>"}`;

    const { text } = await generateText({
      model: openrouter(STAGE_2_MODEL),
      prompt,
      maxTokens: 50,
      temperature: 0.2, // Low temp for strictly formatted JSON validation
    });

    try {
      let cleanText = text.trim();
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.replace(/```json/g, '').replace(/```/g, '').trim();
      }
      
      const verifierResponse = JSON.parse(cleanText);
      
      if (verifierResponse && verifierResponse.approved !== true) {
        console.warn(`[Shield Reject] AI Verifier rejected title: ${fileTitle}. Fallback suggested: ${verifierResponse.fallback_query}`);
        return { 
          success: false, 
          reason: "Image failed 2nd-stage AI relevance verification.",
          fallback_query: verifierResponse.fallback_query
        };
      }
    } catch (e) {
      console.warn(`[Shield Error] Failed to parse Verifier JSON: ${text}`);
      // Fail safely if the AI hallucinated the format
      return { success: false, reason: "Verifier Output Format Error", fallback_query: "" };
    }
  }

  return {
    success: true,
    data: {
      url: imageinfo.url,
      sourceUrl: imageinfo.descriptionurl,
      mime,
      attribution: extmetadata.Attribution?.value || "",
      license: extmetadata.LicenseShortName?.value || "",
      usageTerms: extmetadata.UsageTerms?.value || "",
      description: cleanDescription,
      author: extmetadata.Artist?.value || "",
      fileTitle
    }
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({error: 'Method not allowed'});
  const { visual_search_term, standardContext } = req.body;
  
  if (!visual_search_term) return res.status(400).json({error: 'Missing visual_search_term'});

  try {
    const apiKey = loadOpenRouterKey();
    const openrouter = apiKey ? createOpenAICompatible({ name: "openrouter", baseURL: "https://openrouter.ai/api/v1", apiKey }) : null;

    // First attempt
    let result = await fetchAndVerify(visual_search_term, standardContext, openrouter, apiKey);

    // One-Shot Retry
    if (!result.success && result.fallback_query) {
      console.log(`[Shield Retry] Retrying with fallback query: "${result.fallback_query}"`);
      result = await fetchAndVerify(result.fallback_query, standardContext, openrouter, apiKey);
    }

    if (!result.success) {
      return res.status(404).json({ error: result.reason });
    }

    return res.status(200).json(result.data);

  } catch (error) {
    console.error("Wikimedia Backend Accuracy Shield Error:", error.message);
    return res.status(500).json({ error: error.message });
  }
}
