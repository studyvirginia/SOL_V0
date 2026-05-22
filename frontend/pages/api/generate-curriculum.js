import { generateObject } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { z } from 'zod';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
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
    const model = google('gemini-2.5-pro');

    const result = await generateObject({
      model,
      schema: z.object({
        curriculum: z.array(
          z.union([
            z.object({
              type: z.literal("domain"),
              title: z.string().describe("The name of the broad domain or unit (e.g., 'Unit 1: Fundamentals')")
            }),
            z.object({
              type: z.literal("standard"),
              title: z.string().describe("The specific topic or standard title (e.g., 'Introduction to Limits')"),
              description: z.string().describe("A brief description of what the standard entails")
            })
          ])
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
