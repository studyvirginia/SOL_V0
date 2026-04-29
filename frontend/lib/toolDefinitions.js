import { z } from "zod";

/**
 * SOL Study Assistant — Vercel AI SDK Tool Definitions
 *
 * These are the SINGLE SOURCE OF TRUTH for:
 *   1. What the AI is allowed to call (backend: registered in streamText)
 *   2. What the frontend renderer expects (component routing in ChatWindow)
 *
 * Rules:
 *   - No `execute` functions — all tools are handled client-side.
 *   - Schemas are locked to existing React prop signatures.
 *   - `renderFormatting` replaces the legacy [h]/[c]/[t] tag system.
 */

// ── Shared colour enum used by renderFormatting ───────────────────────────────
const ColorEnum = z.enum([
  "yellow", "amber", "green", "teal", "blue",
  "indigo", "purple", "rose", "red", "gray", "muted",
]).optional();

// ── Tool: renderFormatting ────────────────────────────────────────────────────
// The centralized formatting engine. Replaces all legacy annotation tags.
// The AI calls this when text requires digital ink, blurs, color labels, or
// complex math blocks. Standard lists/bullets stay as plain Markdown text.
export const renderFormattingSchema = z.object({
  chunks: z.array(
    z.object({
      text: z.string().describe("The text content of this chunk"),
      type: z.enum([
        // ── Plain text / basic typography ──────────────────────────────
        "standard",       // Default unformatted text
        "bold",           // Core principles or final answers
        "italic",         // Variables in a sentence or shifting tone
        "code-inline",    // Mono-spaced code or specific string references

        // ── KaTeX math ────────────────────────────────────────────────
        "math-inline",    // Inline equation within a sentence
        "math-display",   // Full-width centered equation block

        // ── RoughNotation digital ink ─────────────────────────────────
        "rough-highlight",      // Thick marker highlight (key terms/defs)
        "rough-circle",         // Animated circle (pinpoint an error/coord)
        "rough-underline",      // Squiggly underline (secondary attention)
        "rough-box",            // Rectangle enclosing a formula/answer
        "rough-strike-through", // Line through misconceptions
        "rough-crossed-off",    // X-mark for invalid assumptions
        "rough-bracket",        // [ ] brackets for grouping steps

        // ── Misc ──────────────────────────────────────────────────────
        "color",  // Colored text label (semantic labeling of variables)
        "blur",   // Hover/click to reveal (spoilers, answers)
      ]).describe("The visual format to apply to this chunk"),

      // Optional color override for RoughNotation ink and text labels
      color: ColorEnum.describe("Text color for 'color' type"),
      roughColor: ColorEnum.describe("Ink color for rough-* types"),
    })
  ).describe("Array of styled text chunks that form a rich formatted message"),
});

// ── Tool: MCQ ────────────────────────────────────────────────────────────────
// Locked to AdaptiveMCQ.js prop signature exactly.
export const mcqSchema = z.object({
  question: z.string().describe("The question text. ALWAYS use $ for inline math and $$ for display math."),
  options: z.array(z.string()).describe("List of possible answers. Use $ for math."),
  answer: z.number().int().describe("0-indexed position of the correct answer"),
  explanation: z.string().describe("Explanation shown after the student answers. ALWAYS use $ for inline math and $$ for display math."),
  mode: z.enum(["diagnostic", "practice"]).optional().default("practice").describe("Feedback mode"),
});

// ── Tool: Flashcards ─────────────────────────────────────────────────────────
// Locked to FlashcardDeck.js prop signature exactly.
export const flashcardsSchema = z.object({
  cards: z.array(
    z.object({
      front: z.string().describe("The term or question on the front of the card. ALWAYS use $ for inline math."),
      back: z.string().describe("The definition or answer on the back of the card. ALWAYS use $ for inline math."),
    })
  ).describe("Array of flashcard pairs"),
});

// ── Tool: Actions ────────────────────────────────────────────────────────────
// Locked to QuickActions.js prop signature exactly.
export const actionsSchema = z.object({
  actions: z.array(
    z.union([
      z.string().describe("A mode ID (e.g. 'flashcards', 'mastery')"),
      z.object({
        label: z.string().describe("Label for the button"),
        prompt: z.string().describe("The prompt to send when clicked"),
        targetMode: z.string().optional().describe("The mode to switch to"),
      }),
    ])
  ).describe("Recommended next steps or navigation buttons"),
});

// ── Tool: Quiz ───────────────────────────────────────────────────────────────
// Locked to QuizRunner.js prop signature exactly.
export const quizSchema = z.object({
  title: z.string().describe("The title of the quiz"),
  mode: z.enum(["diagnostic", "practice"]).optional().default("practice").describe("Feedback mode"),
  questions: z.array(
    z.object({
      question: z.string().describe("The question text. ALWAYS use $ for inline math and $$ for display math."),
      options: z.array(z.string()).describe("List of possible answers. Use $ for math."),
      answer: z.number().int().describe("0-indexed position of the correct answer"),
      explanation: z.string().describe("Explanation shown after the student answers. ALWAYS use $ for inline math and $$ for display math."),
    })
  ).describe("Array of quiz questions"),
});

/**
 * Assembled tool definitions object for use in streamText().
 * Note: No execute() — all tools force client-side handling.
 */
export const SOL_TOOLS = {
  renderFormatting: {
    description:
      "Renders a sequence of richly formatted text chunks with optional digital ink (RoughNotation), KaTeX math, blurred spoilers, or colored text labels. " +
      "Call this ONLY when the text requires one of these effects. " +
      "Do NOT use this for plain explanations, bullet lists, or standard markdown — those should be plain text content instead.",
    parameters: renderFormattingSchema,
  },

  MCQ: {
    description:
      "Renders a single multiple-choice practice question with immediate feedback and explanation. " +
      "Use for diagnostic checks, practice problems, or any single-question assessment.",
    parameters: mcqSchema,
  },

  Flashcards: {
    description:
      "Renders an interactive flashcard deck for vocabulary or concept memorization. " +
      "Use when the student asks for flashcards, key terms, or a vocabulary review.",
    parameters: flashcardsSchema,
  },

  Actions: {
    description:
      "Renders recommended next-step navigation buttons for the student. " +
      "Include at the end of EVERY response that is a logical break point. " +
      "Use mode IDs from the pillar structure for string actions.",
    parameters: actionsSchema,
  },

  Quiz: {
    description:
      "Renders a full multi-question assessment to measure mastery of a topic. " +
      "Use when the student requests a full quiz, practice test, or comprehensive review.",
    parameters: quizSchema,
  },
};
