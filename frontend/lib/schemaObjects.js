import { z } from 'zod';

// Phase 10: Zod Migration Schemas 
// These enforce strict compliance from the LLM, physically stopping Hallucinations by front-loading evidence requirements.

export const flashcardSchema = z.object({
  front: z.string().describe("The term, concept, or question to be tested."),
  back: z.string().describe("The definition, explanation, or answer."),
  standard_alignment: z.string().optional().describe("The specific SOL standard this flashcard targets (e.g., 'WHI.2a').")
});

export const flashcardDeckSchema = z.object({
  title: z.string(),
  cards: z.array(flashcardSchema).describe("An array of highly rigorous study flashcards.")
});

export const mcqSchema = z.object({
  question: z.string().describe("The rigorous multiple choice prompt."),
  evidence_quote: z.string().describe("A direct quote from the curriculum standard or provided notes that mathematically or historically proves the correct answer. Write this BEFORE the distractors."),
  correct_answer: z.string().describe("The absolute correct answer."),
  distractors: z.array(z.string()).length(3).describe("Three plausible distractors. These must NOT be 'joke' answers, and they must NOT be technically correct under any interpretation."),
  explanation: z.string().describe("Why the correct answer is right, and why the distractors are wrong based on the evidence quote."),
  standard_alignment: z.string().optional().describe("The Virginia SOL Standard code aligning to this question."),
  math_context: z.object({
    type: z.enum(["equation_solution", "expression_equivalence", "generic"]),
    equation: z.string().optional().describe("The raw LaTeX or Python-style equation if applicable."),
    expression: z.string().optional().describe("The math expression being simplified or evaluated."),
    variable: z.string().optional().default("x")
  }).optional().describe("Metadata for the SymPy math validator. ONLY include for Math/Science questions.")
});

export const quizDeckSchema = z.object({
    title: z.string(),
    questions: z.array(mcqSchema).describe("A complete benchmark assessment matching the rigors of an SOL exam.")
});
