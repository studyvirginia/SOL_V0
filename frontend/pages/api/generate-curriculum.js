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
        domains: z.array(
          z.object({
            title: z.string().describe("The name of the broad domain or unit (e.g., 'Unit 1: Fundamentals')"),
            standards: z.array(
              z.object({
                title: z.string().describe("The specific topic or standard title (e.g., 'Introduction to Limits')"),
                description: z.string().describe("A brief description of what the standard entails")
              })
            ).describe("The specific topics/standards within this domain.")
          })
        ).describe("The sequence of domains synthesized from the provided text.")
      }),
      system: `You are an expert curriculum designer. You will be provided with raw text (such as a textbook index, syllabus, or course outline). Your task is to synthesize this text into a structured, chronological curriculum outline consisting of 'domains' (broad units) and 'standards' (specific topics). Output ONLY valid JSON matching the schema.`,
      prompt: `Synthesize the following text into a curriculum outline:\n\n${text}`,
    });

    const flatCurriculum = [];
    if (result.object.domains) {
      for (const domain of result.object.domains) {
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
