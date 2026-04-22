import { solveMCQ, validateMCQ } from "../../lib/criticAgentService";
import { validateMcqLogic } from "../../lib/sympyService";
import { supabase } from "../../lib/supabaseClient";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { type, question, options, answerIndex, correct_answer, distractors, subject, context } = req.body;

    // 1. Determine Validation Engine
    const isMath = subject?.toLowerCase().includes("math") || 
                   subject?.toLowerCase().includes("algebra") || 
                   subject?.toLowerCase().includes("geometry");

    if (isMath) {
      // Deterministic Math Validation (SymPy)
      // Map JSON to the format math_validator.py expects
      const mcqData = {
        type: type || "generic", // e.g. "equation_solution"
        context: context || { equation: question },
        correct_answer: correct_answer || options[answerIndex],
        distractors: distractors || options.filter((_, i) => i !== answerIndex)
      };

      const result = await validateMcqLogic(mcqData);
      return res.json({
          engine: "sympy",
          isValid: result.is_valid,
          errors: result.errors,
          verifiedAnswer: result.verified_answer
      });
    } else {
      // Agentic Conceptual Validation (Critic)
      const apiKey = process.env.OPENROUTER_API_KEY;
      
      const criticSolution = await solveMCQ(question, options, apiKey);
      if (!criticSolution) {
        return res.json({ engine: "critic", isValid: true, warning: "Solver unreachable" });
      }

      // Check if critic agrees with generator
      // Note: Generator uses strings, solver uses index
      const matches = parseInt(answerIndex) === criticSolution.answer;

      return res.json({
          engine: "critic",
          isValid: matches,
          reasoning: criticSolution.reasoning,
          criticAnswer: criticSolution.answer
      });
    }
  } catch (err) {
    console.error("[Validation API Error]:", err);
    res.status(500).json({ error: "Internal validation failure", details: err.message });
  }
}
