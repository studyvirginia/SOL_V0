import { defineCatalog } from "@json-render/core";
import { schema } from "@json-render/react/schema";
import { z } from "zod";

/**
 * SOL Study Assistant Component Catalog
 * 
 * Defines the structured UI components that the AI can generate.
 * These match the existing interactive elements in the system.
 */
export const solCatalog = defineCatalog(schema, {
  components: {
    // 1. Flashcards for memorization
    Flashcards: {
      props: z.object({
        cards: z.array(z.object({
          front: z.string().describe("The term or question on the front of the card"),
          back: z.string().describe("The definition or answer on the back of the card")
        }))
      }),
      description: "A deck of interactive flashcards for vocabulary or concept memorization."
    },

    // 2. Adaptive Multiple Choice Question
    MCQ: {
      props: z.object({
        question: z.string().describe("The question text"),
        options: z.array(z.string()).describe("List of possible answers"),
        answer: z.number().int().describe("The 0-indexed position of the correct answer"),
        explanation: z.string().describe("Explanation shown after the student answers"),
        mode: z.enum(['diagnostic', 'practice']).optional().default('practice').describe("Feedback mode")
      }),
      description: "A single multiple-choice practice question with immediate feedback and explanation."
    },

    // 3. Full Quiz for assessment
    Quiz: {
      props: z.object({
        title: z.string().describe("The title of the quiz"),
        mode: z.enum(['diagnostic', 'practice']).optional().default('practice').describe("Feedback mode"),
        questions: z.array(z.object({
          question: z.string(),
          options: z.array(z.string()),
          answer: z.number().int(),
          explanation: z.string()
        }))
      }),
      description: "A multi-question assessment to measure mastery of a topic."
    },

    // 4. Quick Actions / Navigation
    Actions: {
      props: z.object({
        actions: z.array(z.union([
          z.string().describe("A mode ID (e.g. 'flashcards', 'mastery')"),
          z.object({
            label: z.string().describe("Label for the button"),
            prompt: z.string().describe("The prompt to send when clicked"),
            targetMode: z.string().optional().describe("The mode to switch to")
          })
        ]))
      }),
      description: "Recommended next steps or navigation buttons for the student."
    },

    // 5. Educational Graphs
    Graph: {
      props: z.object({
        type: z.enum(["illustration", "investigation", "construction"]).default("illustration"),
        question: z.string().optional().describe("Question associated with the graph"),
        config: z.record(z.any()).describe("Dynamic graph configuration (GeoGebra/Desmos specific data)")
      }),
      description: "Dynamic interactive mathematical diagrams or illustrations."
    }
  },
  actions: {
    // We can define custom actions here if needed
  }
});
