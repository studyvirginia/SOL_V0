import openlit from "openlit";
openlit.init({
  applicationName: "SOL_Study_Assistant",
  otlpEndpoint: "http://127.0.0.1:4318",
  disabled: false,
});
// Verify the SDK is actually seeing our OpenRouter calls
console.log("LLM MONITORING: OpenLIT Active and capturing AI-SDK Spans...");

export const maxDuration = 60;

import fs from "fs";
import path from "path";
import { streamText, generateText, tool, jsonSchema } from "ai";
import { z } from "zod";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import {
  loadCourseRow,
  buildCurriculumModeContext,
} from "../../lib/curriculumService";
import {
  buildLangChainSystemPrompt,
  buildShortTermMemory,
  buildMediumTermSummary,
} from "../../lib/sessionMemoryService";
import { readSession, writeSession } from "../../lib/sessionStore";

function loadOpenRouterKey() {
  return process.env.OPENROUTER_API_KEY;
}


function detectRetrievalModeFromMessage(message) {
  const text = String(message || "").toLowerCase();
  if (/(flashcard|flashcards|define|definition|term|vocab|memorize)/.test(text)) {
    return "flashcards";
  }
  if (/(practice|quiz|test|problem set|problems|worksheet|exam|worksheet)/.test(text)) {
    return "practice";
  }
  if (/(analogy|analogies|metaphor|metaphors|compare|comparison|similar to|as if)/.test(text)) {
    return "analogies";
  }
  if (/(study guide|study-guide|study plan|guide|outline|roadmap|review plan|review guide|review)/.test(text)) {
    return "study-guide";
  }
  if (/(mastery|master|advanced|big picture|high-level|overview|conceptual|deep understanding)/.test(text)) {
    return "mastery";
  }
  return "notes";
}

function getRandomCurriculumFocus(courseJson) {
  const domains = (courseJson.domains || []).filter(Boolean);
  if (!domains.length) return { subject: courseJson.subject, course: courseJson.course, domains: [] };

  const chosenDomain = domains[Math.floor(Math.random() * domains.length)];
  const standards = Array.isArray(chosenDomain.standards) ? chosenDomain.standards : [];
  const chosenStandard = standards.length
    ? standards[Math.floor(Math.random() * standards.length)]
    : null;

  return {
    subject: courseJson.subject,
    course: courseJson.course,
    domains: [
      {
        name: chosenDomain.name,
        standards: chosenStandard
          ? [
              {
                code: chosenStandard.code,
                description: chosenStandard.description,
                skills: chosenStandard.skills || [],
              },
            ]
          : [],
      },
    ],
  };
}

// ── Correct tool schemas sent directly to OpenRouter ────────────────────────
// The AI SDK providers (@ai-sdk/openai-compatible, @ai-sdk/openai) strip
// tool parameter properties to {} due to a schema serialization bug.
// We inject a custom fetch interceptor on the provider to replace the
// mangled schemas with correct ones before the request leaves the server.
const OPENROUTER_TOOLS = [
  {
    type: "function",
    function: {
      name: "showFlashcards",
      description: "Render an interactive flashcard deck for vocabulary or concept memorization.",
      parameters: {
        type: "object",
        properties: {
          cards: {
            type: "array", minItems: 3, maxItems: 20,
            items: {
              type: "object",
              properties: {
                front: { type: "string", description: "Term or question on the front" },
                back:  { type: "string", description: "Definition or answer on the back" },
              },
              required: ["front", "back"],
            },
          },
          actions: {
            type: "array", maxItems: 4,
            items: {
              type: "object",
              properties: {
                label:      { type: "string" },
                prompt:     { type: "string" },
                targetMode: { type: "string" },
                reason:     { type: "string" }
              },
              required: ["label", "prompt"],
            },
          },
        },
        required: ["cards"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "showMCQ",
      description: "Render a single multiple-choice practice question with answer feedback.",
      parameters: {
        type: "object",
        properties: {
          question:    { type: "string", description: "The question text" },
          options:     { type: "array", items: { type: "string" }, minItems: 2, maxItems: 5, description: "Answer choices" },
          answer:      { type: "integer", minimum: 0, description: "0-indexed correct answer" },
          explanation: { type: "string", description: "Explanation shown after the student answers" },
          mode:        { type: "string", enum: ["diagnostic", "practice"] },
          actions: {
            type: "array", maxItems: 4,
            items: {
              type: "object",
              properties: {
                label:      { type: "string" },
                prompt:     { type: "string" },
                targetMode: { type: "string" },
                reason:     { type: "string" }
              },
              required: ["label", "prompt"],
            },
          },
        },
        required: ["question", "options", "answer", "explanation"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "showQuiz",
      description: "Render a multi-question quiz for assessment or practice.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string" },
          mode:  { type: "string", enum: ["diagnostic", "practice"] },
          questions: {
            type: "array", minItems: 3, maxItems: 15,
            items: {
              type: "object",
              properties: {
                question:    { type: "string" },
                options:     { type: "array", items: { type: "string" }, minItems: 2, maxItems: 5 },
                answer:      { type: "integer", minimum: 0 },
                explanation: { type: "string" },
              },
              required: ["question", "options", "answer", "explanation"],
            },
          },
          actions: {
            type: "array", maxItems: 4,
            items: {
              type: "object",
              properties: {
                label:      { type: "string" },
                prompt:     { type: "string" },
                targetMode: { type: "string" },
                reason:     { type: "string" }
              },
              required: ["label", "prompt"],
            },
          },
        },
        required: ["title", "questions"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "showActions",
      description: "Render recommended next-step navigation buttons. Call at the end of every response.",
      parameters: {
        type: "object",
        properties: {
          actions: {
            type: "array", minItems: 1, maxItems: 4,
            items: {
              type: "object",
              properties: {
                label:      { type: "string", description: "Short button label (3-5 words max)" },
                prompt:     { type: "string", description: "The message to send when the student clicks this button" },
                targetMode: { type: "string", description: "Optional: the learning mode to switch to (e.g. 'flashcards', 'quiz', 'practice', 'notes')" },
                reason:     { type: "string", description: "One sentence explaining why this is recommended" },
              },
              required: ["label", "prompt"],
            },
          },
        },
        required: ["actions"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "showImage",
      description: "Display a validated educational image. CALL IMMEDIATELY after the paragraph it supports for a textbook flow.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Specific search term (e.g. 'Roman Aqueduct')" },
          contextSnippet: { type: "string", description: "The exact paragraph this image should support." },
        },
        required: ["query", "contextSnippet"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "showMath",
      description: "Render a high-fidelity interactive coordinate plane for math/geometry. Use this for Algebra, Geometry, Trigonometry, and Calculus visualizations.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "Title of the graph (e.g. 'Quadratic Transformation')" },
          labels: { type: "string", enum: ["integers", "pi"], description: "Axis labeling strategy." },
          gridType: { type: "string", enum: ["cartesian", "polar"], description: "The type of coordinate plane to render." },
          viewBox: {
            type: "object",
            properties: {
              x: { type: "array", items: { type: "number" }, minItems: 2, maxItems: 2 },
              y: { type: "array", items: { type: "number" }, minItems: 2, maxItems: 2 },
              padding: { type: "number" }
            }
          },
          layers: {
            type: "array",
            items: {
              type: "object",
              properties: {
                type: { type: "string", enum: ["function", "polar", "parametric", "point", "line", "text", "vector", "polygon"] },
                props: { type: "object" }
              }
            }
          }
        },
        required: ["layers"]
      },
    },
  },
  {
    type: "function",
    function: {
      name: "showPython",
      description: "Execute Python code to generate a scientific chart (Matplotlib). Use LaTeX mathtext (e.g., r'$x^2$') for all titles, labels, and annotations to ensure academic consistency.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string" },
          code: { type: "string", description: "Python code. Must call plt.show() to generate output." },
          caption: { type: "string" }
        },
        required: ["code", "title"]
      }
    }
  },
];

// ── SDK tool() stubs ─────────────────────────────────────────────────────────
// streamText needs tool() definitions for its response type inference.
// The actual schemas are injected via the fetch interceptor above.
const EMPTY = jsonSchema({ type: "object", properties: {} });

const actionsSchema = z.array(z.object({
  label: z.string(),
  prompt: z.string(),
  targetMode: z.string().optional(),
  reason: z.string().optional()
})).optional();

const mcqZodSchema = z.object({
  question: z.string(),
  options: z.array(z.string()).min(2).max(5),
  answer: z.number().int().min(0),
  explanation: z.string(),
  mode: z.enum(["diagnostic", "practice"]).optional(),
  actions: actionsSchema
}).superRefine((data, ctx) => {
  if (data.answer >= data.options.length) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Answer index ${data.answer} is out of bounds for options array of length ${data.options.length}. MUST be between 0 and ${data.options.length - 1}.`,
      path: ["answer"]
    });
  } else {
    // Cross-check that the correct answer is actually mentioned in the explanation
    const correctAnswerText = data.options[data.answer].trim();
    const normalize = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
    const normAns = normalize(correctAnswerText);
    const normExp = normalize(data.explanation);
    
    if (normAns.length > 0 && !normExp.includes(normAns) && !data.explanation.toLowerCase().includes("option")) {
       ctx.addIssue({
         code: z.ZodIssueCode.custom,
         message: `CRITICAL MATH/LOGIC ERROR: Your explanation DOES NOT contain the exact correct answer text ("${correctAnswerText}"). You either hallucinated an option or miscalculated. Re-evaluate step-by-step and regenerate valid options.`,
         path: ["explanation"]
       });
    }
  }
});

const quizZodSchema = z.object({
  title: z.string(),
  mode: z.enum(["diagnostic", "practice"]).optional(),
  questions: z.array(z.object({
    question: z.string(),
    options: z.array(z.string()).min(2).max(5),
    answer: z.number().int().min(0),
    explanation: z.string()
  })).min(1).max(15).superRefine((questions, ctx) => {
    questions.forEach((q, idx) => {
      if (q.answer >= q.options.length) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Question ${idx}: Answer index ${q.answer} is out of bounds for options array of length ${q.options.length}.`,
          path: [idx, "answer"]
        });
      } else {
        const correctAnswerText = q.options[q.answer].trim();
        const normalize = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
        const normAns = normalize(correctAnswerText);
        const normExp = normalize(q.explanation);
        
        if (normAns.length > 0 && !normExp.includes(normAns) && !q.explanation.toLowerCase().includes("option")) {
           ctx.addIssue({
             code: z.ZodIssueCode.custom,
             message: `CRITICAL ERROR on Q${idx}: Your explanation DOES NOT contain the correct answer text ("${correctAnswerText}"). You likely made a calculation error. Regenerate the question.`,
             path: [idx, "explanation"]
           });
        }
      }
    });
  }),
  actions: actionsSchema
});

const SDK_TOOLS = {
  showFlashcards: tool({ description: "Show flashcards",  parameters: EMPTY }),
  showMCQ:        tool({ description: "Show MCQ",         parameters: mcqZodSchema }),
  showQuiz:       tool({ description: "Show quiz",        parameters: quizZodSchema }),
  showActions:    tool({ description: "Show actions",     parameters: EMPTY }),
  showImage:      tool({ 
    description: "Insert a real-world photo or educational diagram. You HAVE this capability. NEVER apologize for image access. Provide a descriptive search query and context snippet.", 
    parameters: jsonSchema({ 
      type: "object", 
      properties: {
        query: { type: "string" },
        contextSnippet: { type: "string" }
      },
      required: ["query", "contextSnippet"]
    }),
    execute: async ({ query, contextSnippet }) => {
      const { searchOpenverse } = await import('../../lib/openverseService');
      const { validateImage } = await import('../../lib/imageValidationService');
      const results = await searchOpenverse(query);
      for (let i = 0; i < Math.min(results.length, 3); i++) {
        const validated = await validateImage(results[i], contextSnippet);
        if (validated) return validated;
      }
      return { error: "No suitable image found" };
    }
  }),

  showPython: tool({
    description: "Execute Python code to generate a scientific chart (Matplotlib).",
    parameters: jsonSchema({
      type: "object",
      properties: {
        title: { type: "string" },
        code: { type: "string" },
        caption: { type: "string" }
      },
      required: ["code", "title"]
    }),
    execute: async ({ code, title, caption }) => {
      try {
        const { Sandbox } = await import('@e2b/code-interpreter');
        const sb = await Sandbox.create({
          apiKey: process.env.E2B_API_KEY
        });
        
        const execution = await sb.runCode(code);
        await sb.kill();

        const imageResult = execution.results.find(r => r.png || r.jpeg || r.svg);
        if (!imageResult) {
          return { error: "No visualization generated. Ensure your code calls plt.show().", logs: execution.logs };
        }

        return { 
          chartData: imageResult.png || imageResult.jpeg || imageResult.svg,
          logs: execution.logs,
          title,
          code,
          caption
        };
      } catch (error) {
        return { error: error.message };
      }
    }
  }),
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const {
    messages: vercelMessages = [],
    subject,
    course,
    sessionId,
    shortTermMemory = [],
    sessionSummary = "",
    userFacts = {},
    retrievalMode,
    journey = {},
    curriculum,
  } = req.body || {};

  // useChat injects the last user message directly into the messages array.
  const rawLastMsg = vercelMessages.length > 0 ? vercelMessages[vercelMessages.length - 1] : null;
  let lastMessage = "";
  if (rawLastMsg) {
    if (typeof rawLastMsg.content === "string") lastMessage = rawLastMsg.content;
    else if (Array.isArray(rawLastMsg.content)) lastMessage = rawLastMsg.content.map(p => p.text || "").join("");
    else if (typeof rawLastMsg.text === "string") lastMessage = rawLastMsg.text;
    else if (typeof rawLastMsg.value === "string") lastMessage = rawLastMsg.value;
    else if (rawLastMsg.parts && Array.isArray(rawLastMsg.parts)) lastMessage = rawLastMsg.parts.map(p => p.text || "").join("");
  }
  lastMessage = lastMessage.trim();

  console.log("FULL REQ BODY:", JSON.stringify(req.body, null, 2));

  if (!subject || !course || !req.body?.messages) {
    return res.status(400).json({ error: "Missing required chat fields (subject, course, or messages)" });
  }

  const normalizedMessages = (Array.isArray(vercelMessages) ? vercelMessages : [])
    .map((msg) => {
      if (!msg) return null;
      const role = String(msg.role || "user").toLowerCase() === "assistant" ? "assistant" : "user";
      
      // Super-aggressive content extraction
      let content = "";
      if (typeof msg.content === "string") content = msg.content;
      else if (Array.isArray(msg.content)) content = msg.content.map(p => p.text || "").join("");
      else if (typeof msg.text === "string") content = msg.text;
      else if (typeof msg.value === "string") content = msg.value;
      else if (msg.parts && Array.isArray(msg.parts)) content = msg.parts.map(p => p.text || "").join("");
      
      content = content.trim();

      // Preserve native tool parts for history to prevent regeneration loops
      if (msg.role === "assistant" && Array.isArray(msg.toolInvocations)) {
        // Strip heavy base64 chartData from previous history so we don't blow up OpenRouter payload limits
        const safeToolInvocations = msg.toolInvocations.map(inv => {
          if (inv.result?.chartData) {
            return { ...inv, result: { ...inv.result, chartData: "[Base64 Image Omitted]" } };
          }
          return inv;
        });

        return {
          role: "assistant",
          content: content || "",
          toolInvocations: safeToolInvocations
        };
      }
      
      // Also handle tool-result role if it exists in the incoming history
      if (msg.role === "tool") {
        return msg;
      }

      return content ? { role, content } : (msg.toolInvocations ? { role, content: "", toolInvocations: msg.toolInvocations.map(inv => inv.result?.chartData ? { ...inv, result: { ...inv.result, chartData: "[Base64 Image Omitted]" } } : inv) } : null);
    })
    .filter(Boolean);

  console.log("DEBUG [api/chat]: Normalized Count:", normalizedMessages.length);

  let storedSession = null;
  if (sessionId) {
    try {
      storedSession = await readSession(sessionId);
    } catch (err) {
      console.warn("Unable to read stored session:", err?.message || err);
    }
  }

  const fallbackMemory = Array.isArray(shortTermMemory)
    ? shortTermMemory
        .map((m) => {
          if (typeof m === "string") return m.trim();
          if (m && typeof m === "object") return `${String(m.role || "User")} : ${String(m.content ?? "").trim()}`;
          return String(m).trim();
        })
        .filter(Boolean)
    : [];

  let effectiveMessages = normalizedMessages.length
    ? normalizedMessages
    : Array.isArray(storedSession?.messages) && storedSession.messages.length
    ? storedSession.messages
    : fallbackMemory.map((line) => ({ role: "user", content: line }));

  if (effectiveMessages.length === 0 && lastMessage) {
    effectiveMessages = [{ role: "user", content: lastMessage }];
  }

  if (effectiveMessages.length === 0) {
    console.error("Critical Error: effectiveMessages is empty despite validation.");
    return res.status(400).json({ error: "Conversation history is empty." });
  }

  // Fallback to extraction if not explicitly provided by the UI
  const effectiveRetrievalMode = retrievalMode || detectRetrievalModeFromMessage(lastMessage);
  const mediumTermSummary = sessionSummary || buildMediumTermSummary(effectiveMessages, effectiveRetrievalMode, userFacts);

  // ── Self-healing: detect if last assistant msg has a raw python code block ──
  // If so, and user says "graph it" / "run it" / "show it", inject a directive
  const lastAssistantMsg = effectiveMessages.slice().reverse().find(m => m.role === 'assistant');
  const lastUserMsg = lastMessage.toLowerCase();
  const isGraphItRequest = /(graph it|run it|show it|plot it|visualize it|draw it|execute it|use matplotlib|use python)/.test(lastUserMsg);
  
  if (isGraphItRequest && lastAssistantMsg) {
    const assistantText = typeof lastAssistantMsg.content === 'string' ? lastAssistantMsg.content : '';
    const codeBlockMatch = assistantText.match(/```python\n([\s\S]+?)```/);
    if (codeBlockMatch) {
      const extractedCode = codeBlockMatch[1].trim();
      console.log("🔧 Self-healing: detected python code block in prior response, injecting showPython directive");
      // Replace the last user message to make intent crystal clear
      const injectedInstruction = `The student wants you to render the following Python code using the showPython tool. Call showPython immediately with this exact code (add plt.show() if missing). Do not write any code blocks. Just call showPython now:\n\n\`\`\`python\n${extractedCode}\n\`\`\``;
      effectiveMessages = [...effectiveMessages.slice(0, -1), { role: 'user', content: injectedInstruction }];
    }
  }

  try {

    let courseData = null;
    let curriculumContext = "";
    if (curriculum && Array.isArray(curriculum)) {
      console.log(`Using custom curriculum for ${subject}/${course}`);
      const curriculumStr = curriculum.map(c => 
        c.type === 'domain' ? `\nDomain: ${c.title}` : `- Standard: ${c.title} (${c.description})`
      ).join('\n');
      curriculumContext = `The student is studying a custom course: ${course} (${subject}). Focus entirely on adapting to their specific requests and the provided area of focus. 
      Here is the overall curriculum outline for this course:
      ${curriculumStr}`;
    } else {
      try {
        courseData = await loadCourseRow(subject, course);
        curriculumContext = buildCurriculumModeContext(courseData, effectiveRetrievalMode, lastMessage);
      } catch (err) {
        console.warn(`Could not load static course data for ${subject}/${course}. Proceeding with custom context.`);
        curriculumContext = `The student is studying a custom course: ${course} (${subject}). Focus entirely on adapting to their specific requests and the provided area of focus.`;
      }
    }

    let systemPrompt = buildLangChainSystemPrompt({
      messages: effectiveMessages,
      sessionSummary: mediumTermSummary,
      userFacts,
      curriculumContext,
    });
    
    // Inject Session Journey Context
    if (journey.blocks && journey.blocks.length > 0) {
      const currentBlockIndex = journey.currentIndex || 0;
      const plannedSequence = journey.blocks.join(" -> ");
      const nextBlock = currentBlockIndex < journey.blocks.length - 1 ? journey.blocks[currentBlockIndex + 1] : "None (Session Complete)";
      systemPrompt += `\n\n--- SESSION NAVIGATION ---
The student has constructed a custom study session consisting of these blocks: [${plannedSequence}].
They are currently in the '${effectiveRetrievalMode}' block.
CRITICAL INSTRUCTION: When you believe the student has sufficiently completed the mission for the '${effectiveRetrievalMode}' mode, you MUST use the showActions tool to offer them a button to transition to the next block.
The next planned block is: ${nextBlock}. Set the action button's 'targetMode' to '${nextBlock}'.`;
    }

    // Inject a random seed to prevent identical generated questions when temperature is low
    systemPrompt += `\n[Internal Randomization Seed: ${Math.random()}]\nCRITICAL: Use this random seed to ensure that your generated examples, numbers, and scenarios are completely unique from previous interactions.`;

    const apiKey = loadOpenRouterKey();
    const modelId = process.env.CHAT_MODEL || "google/gemini-2.0-flash-lite-001";

    if (!apiKey) {
      console.error("Missing OPENROUTER_API_KEY");
      return res.status(500).json({ error: "Missing OpenRouter API key on the server" });
    }

    // ── Provider with schema-fix fetch interceptor ───────────────────────────
    // Replaces the SDK-mangled tool schemas (properties:{}) with correct ones.
    // Also forces tool_choice=required for visual prompts to prevent code blocks.
    const VISUAL_KEYWORDS = /matplotlib|use python|plot|visualize|draw a graph|draw the graph|show me a graph|scatter|histogram|3d surface|use mafs|show the (function|curve|equation|parabola|circle|triangle|vector|sine|cosine)|openverse|image|photo|diagram/i;
    const forceToolUse = VISUAL_KEYWORDS.test(lastMessage);

    const openrouter = createOpenAICompatible({
      name: "openrouter",
      baseURL: "https://openrouter.ai/api/v1",
      apiKey,
      fetch: async (url, init) => {
        try {
          const body = JSON.parse(init.body);
          if (body.tools?.length) {
            body.tools = OPENROUTER_TOOLS;
          }
          return await globalThis.fetch(url, { ...init, body: JSON.stringify(body) });
        } catch {
          return await globalThis.fetch(url, init);
        }
      },
    });

    // Use pipeTextStreamToResponse for Pages Router compatibility
    const result = streamText({
      model: openrouter(modelId),
      system: systemPrompt,
      messages: effectiveMessages,
      tools: SDK_TOOLS,
      toolChoice: forceToolUse ? "required" : "auto",
      maxSteps: 10,
      maxRetries: 3,
      maxTokens: 8000,
      temperature: 0.4,
      experimental_continueSteps: true,
      onFinish: async ({ text }) => {
        if (sessionId) {
          const updatedMessages = [...effectiveMessages, { role: "assistant", content: text }];
          const updatedSummary = buildMediumTermSummary(updatedMessages, effectiveRetrievalMode, userFacts);
          try {
            await writeSession(sessionId, {
              id: sessionId,
              subject,
              course,
              retrievalMode: effectiveRetrievalMode,
              userFacts,
              sessionSummary: updatedSummary,
              messages: updatedMessages,
            });
          } catch (err) {
            console.warn("Failed saving async stream background:", err);
          }
        }
      },
    });

    // Use pipeUIMessageStreamToResponse for native v6 compatibility
    return result.pipeUIMessageStreamToResponse(res, {
      headers: {
        "x-curriculum-mode": curriculumContext.mode,
      },
    });

  } catch (err) {
    console.error("Critical Chat API Error:", err);
    return res.status(500).json({ 
      error: err.message || "An unexpected error occurred in the chat pipeline.",
      type: err.name || "UnknownError"
    });
  }
}
