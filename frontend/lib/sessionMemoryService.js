import { GRAPH_REQUEST_SCHEMA } from "./graphSchema";
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
    "If a visual is not required, answer in natural language with Markdown formatting for lists, bold/italic text, and tables.",
    "You can annotate important words or phrases in your text responses using these inline tags: [h]text[/h] for a yellow highlight, [c]text[/c] for a red circle, [u]text[/u] for a blue underline, and [b]text[/b] for a green box. Use these sparingly and only when they genuinely help emphasize a key term, definition, or critical value. Do not overuse them.",
    "Apply this memory stack: first apply long-term personalization facts, then use the medium-term session summary, then incorporate recent short-term conversation memory, then ground your answer in the current curriculum context, and finally ALWAYS Include a Navigation Token.",
    memoryStack.longTermFactsText ? `Student personalization facts:\n${memoryStack.longTermFactsText}` : "",
    `Medium-term session summary:\n${memoryStack.mediumTermSummary}`,
    `Short-term conversation memory:\n${memoryStack.shortTermMemory.length ? memoryStack.shortTermMemory.join("\n") : "No recent conversation memory available."}`,
    memoryStack.curriculumContextText,
    "Always ground your answer in the curriculum context when relevant, and do not invent standards or lesson objectives.",
    "--- Navigation Signaling Module ---",
    "At the very end of EVERY message, you MUST include a hidden JSON token describing the next logical actions for the student. Use the Strategic Learning Path: Review -> Mastery -> Practice.",
    "Rules:",
    "1. Lateral Recommendations: Suggest other sub-modes in the CURRENT pillar that are not yet completed. Signal these with their sub-mode IDs (e.g., flashcards, study-guide).",
    "2. Consecutive Recommendations: Suggest the NEXT logical pillar. Signal these with their pillar keys (e.g., mastery, practice).",
    "3. Be Agnostic: Treat both types of moves as equal recommendations, letting the student choose based on their confidence.",
    "4. Do NOT suggest items already marked as 'completed' in the context below.",
    `Pillar Structure: ${JSON.stringify(MODE_MAP)}`,
    `Current Completion State: ${JSON.stringify(userFacts.completedMap || {})}`,
    "Format: %%ACTIONS%%[\"id1\", \"pillarKey\", ...]%%END_ACTIONS%%",
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
