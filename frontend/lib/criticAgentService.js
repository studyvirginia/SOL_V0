import { generateText } from "ai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

/**
 * Critic Agent: Solver Service
 * Uses a reasoning-heavy model to 'blind solve' a multiple choice question.
 * Returns the index of the correct answer and a brief explanation.
 */
export async function solveMCQ(question, options, apiKeyOverride) {
  const apiKey = apiKeyOverride || process.env.OPENROUTER_API_KEY;
  // We use a reasoning model for high accuracy verification
  const solverModelId = process.env.SOLVER_MODEL || "google/gemini-2.0-flash-thinking-exp:free";

  if (!apiKey) {
    throw new Error("Missing OPENROUTER_API_KEY for Critic Agent");
  }

  const openrouter = createOpenAICompatible({
    name: "openrouter",
    baseURL: "https://openrouter.ai/api/v1",
    apiKey,
  });

  const prompt = `
You are a 'Critic Agent' for a Virginia SOL Study Assistant.
Your task is to solve the following multiple-choice question WITHOUT seeing the generator's provided answer key.

QUESTION:
${question}

OPTIONS:
${options.map((opt, i) => `${i}. ${opt}`).join("\n")}

INSTRUCTIONS:
1. Reason through the problem step-by-step.
2. Identify the correct answer from the provided options.
3. Return ONLY a JSON object in this format: {"answer": <number>, "reasoning": "<string>"}
  `.trim();

  try {
    const { text } = await generateText({
      model: openrouter(solverModelId),
      prompt,
      temperature: 0, // Deterministic for validation
    });

    // Clean potential markdown wrapping
    const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const result = JSON.parse(jsonStr);
    
    return {
      answer: parseInt(result.answer),
      reasoning: result.reasoning
    };
  } catch (err) {
    console.error("Critic Agent Solver Error:", err);
    return null;
  }
}

/**
 * Compares the Generator's MCQ with the Critic's solution.
 */
export function validateMCQ(generatorMCQ, criticSolution) {
  if (!criticSolution) return { valid: true, warning: "Solver unreachable" }; // Fallback to trust if solver fails
  
  const matches = generatorMCQ.answer === criticSolution.answer;
  
  return {
    valid: matches,
    criticAnswer: criticSolution.answer,
    criticReasoning: criticSolution.reasoning
  };
}
