import { generateText } from 'ai';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { z } from 'zod';

const openrouter = createOpenAICompatible({
  name: "openrouter",
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

export const maxDuration = 60;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'Missing text' });
  }

  try {
    const result = await generateText({
      model: openrouter('openai/gpt-4o-mini'),
      system: `You are an expert curriculum designer. You will be provided with raw text (such as a textbook index, syllabus, or course outline). Your task is to synthesize this text into a structured, chronological curriculum outline consisting of 'domains' (broad units) and 'standards' (specific topics). Output ONLY valid JSON matching this exact structure:

{
  "domains": [
    {
      "title": "Unit 1: [Name of Unit based on text]",
      "standards": [
        {
          "title": "[Specific Topic based on text]",
          "description": "A brief description of what this topic entails based on the provided text",
          "key_concepts": [
            "Important concept or term 1",
            "Crucial formula or equation 2"
          ]
        }
      ]
    }
  ]
}

CRITICAL: DO NOT copy the placeholder text from the example above. You MUST generate the curriculum based entirely on the user's provided text. Extract any relevant key concepts, terms, or formulas into the key_concepts array for each standard.
DO NOT wrap the output in markdown code blocks. Output raw JSON only.`,
      prompt: `Synthesize the following text into a curriculum outline:\n\n${text}`,
    });

    let parsed;
    try {
      const cleaned = result.text.replace(/```json/gi, '').replace(/```/g, '').trim();
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (match) {
        parsed = JSON.parse(match[0]);
      } else {
        parsed = JSON.parse(cleaned);
      }
    } catch (e) {
      throw new Error("Failed to parse AI output as JSON: " + result.text);
    }

    const flatCurriculum = [];
    const domains = parsed.domains || parsed.curriculum?.domains || (Array.isArray(parsed) ? parsed : []);
    
    if (domains && Array.isArray(domains)) {
      for (const domain of domains) {
        flatCurriculum.push({ type: 'domain', title: domain.title || "Untitled Domain" });
        if (domain.standards && Array.isArray(domain.standards)) {
          for (const standard of domain.standards) {
            flatCurriculum.push({ 
              type: 'standard', 
              title: standard.title, 
              description: standard.description || "",
              key_concepts: Array.isArray(standard.key_concepts) ? standard.key_concepts : []
            });
          }
        }
      }
    }

    return res.status(200).json({ curriculum: flatCurriculum });
  } catch (error) {
    console.error("Error generating curriculum:", error);
    return res.status(500).json({ error: error.message });
  }
}
