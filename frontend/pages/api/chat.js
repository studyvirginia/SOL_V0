import openlit from "openlit";
openlit.init({
  applicationName: "SOL_Study_Assistant",
  otlpEndpoint: "http://127.0.0.1:4318",
  disabled: false,
});
// Verify the SDK is actually seeing our OpenRouter calls
console.log("LLM MONITORING: OpenLIT Active and capturing AI-SDK Spans...");

import fs from "fs";
import path from "path";
import { streamText, generateText, tool, jsonSchema } from "ai";
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
      description: "Search for and display a single validated educational image to support the text.",
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
];

// ── SDK tool() stubs ─────────────────────────────────────────────────────────
// streamText needs tool() definitions for its response type inference.
// The actual schemas are injected via the fetch interceptor above.
const EMPTY = jsonSchema({ type: "object", properties: {} });
const SDK_TOOLS = {
  showFlashcards: tool({ description: "Show flashcards",  parameters: EMPTY }),
  showMCQ:        tool({ description: "Show MCQ",         parameters: EMPTY }),
  showQuiz:       tool({ description: "Show quiz",        parameters: EMPTY }),
  showActions:    tool({ description: "Show actions",     parameters: EMPTY }),
  showImage:      tool({ 
    description: "Show a validated image", 
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
        return {
          role: "assistant",
          content: content || "",
          toolInvocations: msg.toolInvocations
        };
      }
      
      // Also handle tool-result role if it exists in the incoming history
      if (msg.role === "tool") {
        return msg;
      }

      return content ? { role, content } : (msg.toolInvocations ? { role, content: "", toolInvocations: msg.toolInvocations } : null);
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

  try {
    const courseData = await loadCourseRow(subject, course);
    const curriculumContext = buildCurriculumModeContext(courseData, effectiveRetrievalMode, lastMessage);

    const systemPrompt = buildLangChainSystemPrompt({
      messages: effectiveMessages,
      sessionSummary: mediumTermSummary,
      userFacts,
      curriculumContext,
    });

    const apiKey = loadOpenRouterKey();
    const modelId = process.env.CHAT_MODEL || "google/gemini-2.0-flash-lite-001";

    if (!apiKey) {
      console.error("Missing OPENROUTER_API_KEY");
      return res.status(500).json({ error: "Missing OpenRouter API key on the server" });
    }

    // ── Provider with schema-fix fetch interceptor ───────────────────────────
    // Replaces the SDK-mangled tool schemas (properties:{}) with correct ones.
    const openrouter = createOpenAICompatible({
      name: "openrouter",
      baseURL: "https://openrouter.ai/api/v1",
      apiKey,
      fetch: async (url, init) => {
        try {
          const body = JSON.parse(init.body);
          if (body.tools?.length) body.tools = OPENROUTER_TOOLS;
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
      maxSteps: 3,
      maxTokens: 4000,
      temperature: 0.15,
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
