import { GRAPH_REQUEST_SCHEMA } from "./graphSchema";
import { OPENVERSE_REQUEST_SCHEMA } from "./imageSchema";
import { MODE_MAP } from "./modeMap";

export function formatConversationMessage(message) {
  if (!message || typeof message !== "object") return String(message || "").trim();
  const role = message.role === "assistant" ? "Assistant" : "User";
  return `${role}: ${String(message.content || "").trim()}`;
}

export function buildShortTermMemory(messages = [], maxEntries = 6) {
  if (!Array.isArray(messages)) return [];
  return messages
    .slice(-maxEntries)
    .map((message) => formatConversationMessage(message))
    .filter(Boolean);
}

export function buildUserFactsText(userFacts = {}) {
  if (!userFacts || typeof userFacts !== "object") return "";
  const facts = [];
  if (userFacts.gradeLevel) facts.push(`Grade level: ${userFacts.gradeLevel}`);
  if (userFacts.areaOfFocus) facts.push(`Session focus: ${userFacts.areaOfFocus}`);
  if (userFacts.focusTopic) facts.push(`Focus topic: ${userFacts.focusTopic}`);
  if (userFacts.preferences) facts.push(`Learning preferences: ${userFacts.preferences}`);
  if (userFacts.needs) facts.push(`Learning needs: ${userFacts.needs}`);
  if (userFacts.languageSupport) facts.push(`Language support: ${userFacts.languageSupport}`);
  if (facts.length === 0) return "";
  return `Student personalization facts: ${facts.join("; ")}`;
}

export function buildMemoryStack({ messages = [], sessionSummary = "", userFacts = {}, curriculumContext = {} }) {
  return {
    longTermFactsText: buildUserFactsText(userFacts),
    shortTermMemory: buildShortTermMemory(messages, 6),
    mediumTermSummary: sessionSummary || "No medium-term session summary is available yet.",
    curriculumContextText: formatCurriculumContext(curriculumContext),
  };
}

export function formatCurriculumContext(curriculumContext = {}) {
  const mode = curriculumContext.mode || "summary";
  const focus = curriculumContext.focus || "none";
  const note = curriculumContext.note ? `Note: ${curriculumContext.note}` : "";
  const data = curriculumContext.data !== undefined ? curriculumContext.data : "No curriculum context available.";
  const dataString = typeof data === "string" ? data : JSON.stringify(data, null, 2);

  return [
    `Curriculum mode: ${mode}`,
    `Curriculum focus: ${focus}`,
    note,
    "Curriculum context:",
    dataString,
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildLangChainSystemPrompt({
  messages = [],
  sessionSummary = "",
  userFacts = {},
  curriculumContext = {},
}) {
  const memoryStack = buildMemoryStack({
    messages,
    sessionSummary,
    userFacts,
    curriculumContext,
  });

  const sections = [
    "You are a SOL Study Assistant for middle and high school students. Always answer clearly, directly, and as if you are teaching a learner. Use Markdown formatting for all responses and do not return plain HTML.",
    "Use KaTeX for all math expressions. Inline math must use single dollar delimiters like $x^2 + y^2 = r^2$, and display math must use double dollars like $$\\int_0^\\pi \\sin(x) \\, dx$$.",
    GRAPH_REQUEST_SCHEMA,
    OPENVERSE_REQUEST_SCHEMA,
    "If a visual or diagram is not required, answer in natural language with Markdown formatting for lists, bold/italic text, and tables.",
    "You can annotate important words or phrases in your text responses using these inline tags: [h]text[/h] for a yellow highlight, [c]text[/c] for a red circle, [u]text[/u] for a blue underline, and [b]text[/b] for a green box. Use these sparingly and only when they genuinely help emphasize a key term, definition, or critical value. Do not overuse them.",
    "Apply this memory stack: first apply long-term personalization facts, then use the medium-term session summary, then incorporate recent short-term conversation memory, then ground your answer in the current curriculum context, and finally ALWAYS Include a Navigation Token.",
    memoryStack.longTermFactsText ? `Student personalization facts:\n${memoryStack.longTermFactsText}` : "",
    `Medium-term session summary:\n${memoryStack.mediumTermSummary}`,
    `Short-term conversation memory:\n${memoryStack.shortTermMemory.length ? memoryStack.shortTermMemory.join("\n") : "No recent conversation memory available."}`,
    memoryStack.curriculumContextText,
    "CRITICAL: If a 'Focus topic' is provided in the student facts above, prioritize it as the primary subject of this session. Ground all notes, diagnostics, and questions specifically in that topic while adhering to the curriculum standards.",
    "Always ground your answer in the curriculum context when relevant, and do not invent standards or lesson objectives.",
    "--- MANDATORY: Interactive Learning Components ---",
    "You MUST use these structured segments to deliver practice material. Never provide plain-text lists for flashcards or multiple-choice questions.",
    "1. Flashcards (for memorization): %%FLASHCARDS%%[{\"front\": \"Question\", \"back\": \"Answer\"}]%%END_FLASHCARDS%%",
    "   Example: Here are your cards! %%FLASHCARDS%%[{\"front\": \"x+5=10\", \"back\": \"x=5\"}]%%END_FLASHCARDS%%",
    "2. Adaptive एमसीक्यू (for practice): %%MCQ%%{\"question\": \"...\", \"options\": [\"A\", \"B\", \"C\", \"D\"], \"answer\": 0, \"explanation\": \"...\"}%%END_MCQ%%",
    "   Example: Try this! %%MCQ%%{\"question\": \"Solve for x: x-2=5\", \"options\": [\"3\", \"5\", \"7\", \"10\"], \"answer\": 2, \"explanation\": \"x-2=5 => x=5+2=7\"}%%END_MCQ%%",
    "3. Full Quiz (for assessment): %%QUIZ%%{\"title\": \"...\", \"questions\": [{\"question\": \"...\", \"options\": [\"...\"], \"answer\": 0, \"explanation\": \"...\"}]}%%END_QUIZ%%",

    "--- Action Signaling Module ---",
    "At the end of EVERY message, you MUST include a hidden JSON token describing the next logical actions for the student.",
    "Rules for ACTIONS:",
    "1. Navigation Buttons: Suggest the next mode ID (e.g., 'flashcards', 'mastery'). ONLY suggest these when the current activity is finished or at a logical break point.",
    "2. Diagnostic Flow: During the initial greeting, use: {\"label\": \"Begin\", \"prompt\": \"Start diagnostic\", \"targetMode\": \"diagnostic\"} and {\"label\": \"Skip\", \"prompt\": \"Skip diagnostic and go to notes\", \"targetMode\": \"notes\"}.",
    "3. Keep it limited: Do NOT create custom conversational buttons (like 'Show Answer' or 'Got it') unless they are explicitly for a mode switch or requested by the flow.",
    "4. Format: %%ACTIONS%%[\"flashcards\", \"mastery\"]%%END_ACTIONS%%",

    `Pillar Structure (Navigation): ${JSON.stringify(MODE_MAP)}`,
    `Current Completion State: ${JSON.stringify(userFacts.completedMap || {})}`,
  ];

  return sections.filter(Boolean).join("\n\n");
}

export function buildMediumTermSummary(messages = [], retrievalMode = "summary", userFacts = {}) {
  const userMessages = (messages || [])
    .filter((message) => message.role === "user")
    .slice(-4)
    .map((message) => String(message.content || "").trim())
    .filter(Boolean);

  const assistantMessages = (messages || [])
    .filter((message) => message.role === "assistant")
    .slice(-3)
    .map((message) => String(message.content || "").trim())
    .filter(Boolean);

  const summaryParts = [];
  summaryParts.push(`Session retrieval mode: ${retrievalMode}`);

  const userFactsText = buildUserFactsText(userFacts);
  if (userFactsText) summaryParts.push(userFactsText);

  if (userMessages.length) {
    summaryParts.push(`Recent questions: ${userMessages.join(" | ")}`);
  }
  if (assistantMessages.length) {
    summaryParts.push(`Recent assistant focus: ${assistantMessages.join(" | ")}`);
  }

  const text = summaryParts.join(" \n");
  return text.length > 1200 ? `${text.slice(0, 1190)}...` : text;
}
