import { generateText } from 'ai';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';

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

    const result = await generateText({
      model,
      system: `You are an expert curriculum designer. You will be provided with raw text (such as a textbook index, syllabus, or course outline). 
Your task is to synthesize this text into a structured, chronological curriculum outline consisting of 'domains' (broad units) and 'standards' (specific topics).
You MUST output ONLY a valid JSON array and NOTHING ELSE. No markdown formatting, no backticks, no explanations.
The JSON array must contain objects with this structure:
{
  "type": "domain" or "standard",
  "title": "Name of the domain or standard",
  "description": "Brief description (optional for domains, required for standards)"
}`,
      prompt: `Synthesize the following text into a JSON curriculum outline:\n\n${text}`,
    });

    let rawJson = result.text.trim();
    // Sometimes LLMs still add markdown backticks despite instructions
    if (rawJson.startsWith('```json')) {
      rawJson = rawJson.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    } else if (rawJson.startsWith('```')) {
      rawJson = rawJson.replace(/^```\n?/, '').replace(/\n?```$/, '');
    }

    const curriculum = JSON.parse(rawJson);

    return res.status(200).json({ curriculum });
  } catch (error) {
    console.error("Error generating curriculum:", error);
    return res.status(500).json({ error: error.message });
  }
}
