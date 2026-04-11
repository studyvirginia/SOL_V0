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

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({error: 'Method not allowed'});
  const { visual_search_term, category_filter, preferred_mime, standardContext } = req.body;
  
  if (!visual_search_term) return res.status(400).json({error: 'Missing visual_search_term'});

  try {
    // 1. STAGE A: The Ai Search Architect (No Category Filter - precise keywords only)
    // Force Wikimedia to only return static images and vectors (no PDFs, Audio, Video)
    const searchQuery = `${visual_search_term.trim()} filetype:bitmap|drawing`;
    
    // Limit to 1 for speed and determinism right now
    const searchUrl = `https://commons.wikimedia.org/w/api.php?action=query&format=json&list=search&srnamespace=6&srsearch=${encodeURIComponent(searchQuery)}&srlimit=1`;
    
    const searchRes = await fetch(searchUrl, {
      headers: { "User-Agent": "SOLAssistant/2.0 (lincoln@studyvirginia.org) Bot" }
    });

    const searchData = await searchRes.json();

    if (!searchData.query || !searchData.query.search || searchData.query.search.length === 0) {
      return res.status(404).json({ error: "No relevant Wikipedia images found for this specific search term." });
    }

    const fileTitle = searchData.query.search[0].title;

    // 2. STAGE B: The Image Info Query
    const infoUrl = `https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&iiprop=url|extmetadata|mime&titles=${encodeURIComponent(fileTitle)}`;
    const infoRes = await fetch(infoUrl, {
      headers: { "User-Agent": "SOLAssistant/2.0 (lincoln@studyvirginia.org) Bot" }
    });

    const infoData = await infoRes.json();
    const pages = infoData.query?.pages;
    if (!pages) return res.status(404).json({ error: "No verified images found." });

    const pageId = Object.keys(pages)[0];
    const page = pages[pageId];

    if (!page.imageinfo || page.imageinfo.length === 0) {
      return res.status(404).json({ error: "No verified images found." });
    }

    const imageinfo = page.imageinfo[0];
    const url = imageinfo.url;
    const sourceUrl = imageinfo.descriptionurl;
    const mime = imageinfo.mime;
    
    // Explicitly reject unsupported document formats just in case Wikimedia sneaks one in
    if (!mime.startsWith("image/")) {
      console.warn(`[Shield Reject] Invalid file type: ${mime} for ${fileTitle}`);
      return res.status(404).json({ error: `Unsupported file type (${mime})` });
    }

    const extmetadata = imageinfo.extmetadata || {};
    
    const attribution = extmetadata.Attribution?.value || "";
    const license = extmetadata.LicenseShortName?.value || "";
    const usageTerms = extmetadata.UsageTerms?.value || "";
    const descriptionHTML = extmetadata.ImageDescription?.value || "";
    // Strip HTML from raw description for AI consumption
    const cleanDescription = descriptionHTML.replace(/<[^>]+>/g, '').substring(0, 400);

    // 3. STAGE C: THE 2ND PHASE AI VERIFIER (Accuracy Shield)
    if (standardContext) {
      const apiKey = loadOpenRouterKey();
      if (apiKey) {
        const modelId = process.env.CHAT_MODEL || "google/gemini-2.0-flash-lite-001";
        const openrouter = createOpenAICompatible({ name: "openrouter", baseURL: "https://openrouter.ai/api/v1", apiKey });

        const prompt = `You are an educational relevance verifier. Determine if the provided candidate image EXACTLY matches the original visual search term AND accurately supports the standard concept.

Original Search Term: ${visual_search_term}
Standard Concept: ${standardContext}

Candidate Image File Name: ${fileTitle}
Candidate Image Description: ${cleanDescription}

Is this image an EXACT match for the searched topic and relevant to the standard? Output exactly one word: YES or NO.`;

        const { text } = await generateText({
          model: openrouter(modelId),
          prompt,
          maxTokens: 5,
          temperature: 0,
        });

        if (!text.toUpperCase().includes("YES")) {
          console.warn(`[Shield Reject] AI Verifier rejected title: ${fileTitle}`);
          return res.status(404).json({ error: "Image failed 2nd-stage AI relevance verification." });
        }
      }
    }

    return res.status(200).json({
      url,
      sourceUrl,
      mime,
      attribution,
      license,
      usageTerms,
      description: cleanDescription,
      author: extmetadata.Artist?.value || "",
      fileTitle
    });

  } catch (error) {
    console.error("Wikimedia Backend Accuracy Shield Error:", error.message);
    return res.status(500).json({ error: error.message });
  }
}
