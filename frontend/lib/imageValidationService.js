import { generateText } from 'ai';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';

const openrouter = createOpenAICompatible({
  name: "openrouter",
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

/**
 * Validates an image against the lesson context and generates a caption.
 * @param {Object} image - The Openverse image object
 * @param {string} contextSnippet - The text paragraph the image supports
 * @returns {Object|null} - Approved image with caption or null if rejected
 */
export async function validateImage(image, contextSnippet) {
  const modelId = "meta-llama/llama-3.1-8b-instruct"; // As requested by user

  const systemPrompt = `
You are a strict educational content validator. Your task is to determine if a specific image correctly supports a given lesson paragraph.

**Image Title**: "${image.title}"
**Image Tags**: ${image.tags?.map(t => t.name).join(', ') || 'N/A'}

**Lesson Paragraph**: "${contextSnippet}"

**Rules**:
1. STRICT REJECTION: Reject any personal snapshots, amateur photography, noisy backgrounds, or "bullshit" generic clipart. 
2. AESTHETIC CHECK: The image must have a professional, "Silent Textbook" aesthetic (clean, clear subject, high educational value).
3. SOURCE CHECK: Favor diagrams, historical paintings, professional photography, or clear scientific specimens.
4. If approved, write a single-sentence, professional caption that explicitly links the visual to the text.
5. Respond in JSON format: { "approved": boolean, "caption": string, "reason": string }

**Aesthetics**: 
- The caption should sound like it belongs in a high-end history or science textbook.
- Reject anything that looks like a casual Flickr upload or a low-quality web asset.
`;

  try {
    const { text } = await generateText({
      model: openrouter(modelId),
      prompt: "Validate this image for the lesson context.",
      system: systemPrompt,
    });

    // Try to parse JSON from the response (aggressive extraction)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    
    const result = JSON.parse(jsonMatch[0]);
    if (result.approved) {
      return {
        ...image,
        caption: result.caption
      };
    }
    return null;
  } catch (error) {
    console.error('Image validation error:', error);
    return null;
  }
}
