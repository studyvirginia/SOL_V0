import { embed } from "ai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

/**
 * Embeddings Service
 * Generates vector representations of text for semantic search.
 */
export async function getEmbedding(text, apiKeyOverride) {
  const apiKey = apiKeyOverride || process.env.OPENROUTER_API_KEY;
  const embeddingModelId = process.env.EMBEDDING_MODEL || "openai/text-embedding-3-small";

  if (!apiKey) {
    throw new Error("Missing OPENROUTER_API_KEY for Embeddings Service");
  }

  const openrouter = createOpenAICompatible({
    name: "openrouter",
    baseURL: "https://openrouter.ai/api/v1",
    apiKey,
  });

  try {
    const { embedding } = await embed({
      model: openrouter.embedding(embeddingModelId),
      value: text,
    });
    return embedding;
  } catch (err) {
    console.error("Embeddings Generation Error:", err);
    return null;
  }
}
