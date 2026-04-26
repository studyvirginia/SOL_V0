import { generateText } from 'ai';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';

const openrouter = createOpenAICompatible({
  name: "openrouter",
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

/**
 * Validates an image using a Vision model to ensure it matches the context and aesthetics.
 * @param {Object} image - The Openverse image object
 * @param {string} contextSnippet - The text paragraph the image supports
 * @returns {Object|null} - Approved image with caption or null if rejected
 */
export async function validateImage(image, contextSnippet) {
  // Use a Vision-capable model for "True" visual validation
  const modelId = "google/gemini-2.0-flash-001"; 

  const systemPrompt = `
You are a strict educational content validator. Your task is to analyze an image to see if it correctly supports a lesson paragraph.

**Lesson Context**: "${contextSnippet}"

**STRICT Validation Rules**:
1. QUALITY: Reject any low-resolution images, personal snapshots, watermarked content, or amateur photography.
2. RELEVANCE: The image must directly illustrate a concept from the lesson paragraph. No generic or tangential clipart.
3. AESTHETICS: The image must have a professional, "Silent Textbook" feel (clean background, clear subject).
4. REJECTION: If the image is a person's selfie, a casual social media photo, or looks like spam, set "approved": false.

**Response Format (JSON)**:
{
  "approved": boolean,
  "caption": "A single-sentence, professional textbook caption explicitly linking the visual content to the lesson context.",
  "reason": "Brief internal reason for approval/rejection"
}
`;

  try {
    const { text } = await generateText({
      model: openrouter(modelId),
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Does this image accurately and professionally illustrate the lesson context?" },
            { type: "image", image: image.url },
          ],
        },
      ],
    });

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    
    const result = JSON.parse(jsonMatch[0]);
    if (result.approved) {
      return {
        ...image,
        caption: result.caption
      };
    }
    console.log(`Image Rejected: ${image.title} - ${result.reason}`);
    return null;
  } catch (error) {
    console.error('Visual validation error:', error);
    // Fallback to title-based heuristic if vision fails
    if (image.title.toLowerCase().includes(contextSnippet.split(' ')[0].toLowerCase())) {
        return { ...image, caption: "Educational visual related to the topic." };
    }
    return null;
  }
}
