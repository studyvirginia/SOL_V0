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
    const model = openrouter('google/gemini-2.5-pro');

    const result = await generateObject({
      model,
      schema: z.object({
        curriculum: z.array(
          z.object({
            type: z.enum(["domain", "standard"]).describe("Whether this is a broad 'domain' or a specific 'standard'"),
            title: z.string().describe("The title of the domain or standard"),
            description: z.string().optional().describe("A brief description (required for standards, optional for domains)")
          })
        ).describe("The sequence of domains and standards synthesized from the provided text. A domain should group subsequent standards until the next domain.")
      }),
      system: `You are an expert curriculum designer. You will be provided with raw text (such as a textbook index, syllabus, or course outline). Your task is to synthesize this text into a structured, chronological curriculum outline consisting of 'domains' (broad units) and 'standards' (specific topics). Output ONLY valid JSON matching the schema.`,
      prompt: `Synthesize the following text into a curriculum outline:\n\n${text}`,
    });

    return res.status(200).json({ curriculum: result.object.curriculum });
  } catch (error) {
    console.error("Error generating curriculum:", error);
    return res.status(500).json({ error: error.message });
  }
}
