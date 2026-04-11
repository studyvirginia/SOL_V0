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
import { streamText, generateText } from "ai";
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
  if (process.env.OPENROUTER_API_KEY) return process.env.OPENROUTER_API_KEY.trim();
  try {
    const envPath = path.resolve(process.cwd(), ".env.local");
    if (!fs.existsSync(envPath)) return undefined;
    const contents = fs.readFileSync(envPath, "utf8");
    for (const line of contents.split(/\r?\n/)) {
      const [k, ...rest] = line.split("=");
      if (k?.trim() === "OPENROUTER_API_KEY") return rest.join("=").trim();
    }
  } catch (err) {
    console.error("Error loading .env.local for API key", err);
  }
  return undefined;
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
  const lastMessage = vercelMessages.length > 0 ? vercelMessages[vercelMessages.length - 1].content : "";

  if (!subject || !course || vercelMessages.length === 0) {
    return res.status(400).json({ error: "Missing required chat fields" });
  }

  const normalizedMessages = Array.isArray(vercelMessages)
    ? vercelMessages
        .map((msg) => {
          if (!msg || typeof msg !== "object") return null;
          const role = String(msg.role || "user").toLowerCase() === "assistant" ? "assistant" : "user";
          const content = String(msg.content || "").trim();
          return content ? { role, content } : null;
        })
        .filter(Boolean)
    : [];

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

  const effectiveMessages = normalizedMessages.length
    ? normalizedMessages
    : Array.isArray(storedSession?.messages) && storedSession.messages.length
    ? storedSession.messages
    : fallbackMemory.map((line) => ({ role: "user", content: line }));

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

    const openrouter = createOpenAICompatible({ name: "openrouter", baseURL: "https://openrouter.ai/api/v1", apiKey });

    // Stream the text directly from OpenRouter back to the client
    const result = streamText({
      model: openrouter(modelId),
      system: systemPrompt,
      experimental_telemetry: {
        isEnabled: true,
        functionId: "chat_api",
        metadata: { subject, course, retrievalMode: effectiveRetrievalMode },
      },
      messages: effectiveMessages,
      maxTokens: 4000,
      temperature: 0.15,
      async onFinish({ text }) {
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
      }
    });

    const customHeaders = {
       "x-curriculum-mode": curriculumContext.mode,
    };

    return result.pipeTextStreamToResponse(res, { headers: customHeaders });

  } catch (err) {
    console.error("Critical Chat API Error:", err);
    return res.status(500).json({ 
      error: "Server encountered a problem initializing the AI stream.", 
      details: err.message,
      type: "StreamingInitError"
    });
  }
}
