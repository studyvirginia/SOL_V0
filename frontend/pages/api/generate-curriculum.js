import { generateObject } from 'ai';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { z } from 'zod';

const openrouter = createOpenAICompatible({
  name: "openrouter",
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

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
      maxTokens: 4000,
      system: `You are an expert curriculum designer. You will be provided with raw text (such as a textbook index, syllabus, or course outline). Your task is to synthesize this text into a structured, chronological curriculum outline consisting of 'domains' (broad units) and 'standards' (specific topics). Output ONLY valid JSON matching this exact structure:

{
  "domains": [
    {
      "title": "Unit 1: Fundamentals",
      "standards": [
        {
          "title": "Introduction to Limits",
          "description": "A brief description of what the standard entails"
        }
      ]
    }
  ]
}

DO NOT wrap the output in markdown code blocks. Output raw JSON only.`,
      prompt: `Synthesize the following text into a curriculum outline:\n\n${text}`,
    });

    let parsed;
    try {
      parsed = JSON.parse(result.text.replace(/```json/g, '').replace(/```/g, '').trim());
    } catch (e) {
      throw new Error("Failed to parse AI output as JSON: " + result.text);
    }

    const flatCurriculum = [];
    if (parsed.domains) {
      for (const domain of parsed.domains) {
        flatCurriculum.push({ type: 'domain', title: domain.title });
        if (domain.standards) {
          for (const standard of domain.standards) {
            flatCurriculum.push({ type: 'standard', title: standard.title, description: standard.description });
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
