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
  
  if (userFacts.studentName) facts.push(`Student Name: ${userFacts.studentName}`);
  if (userFacts.gradeLevel) facts.push(`Grade level: ${userFacts.gradeLevel}`);
  if (userFacts.areaOfFocus) facts.push(`Session focus: ${userFacts.areaOfFocus}`);
  if (userFacts.focusTopic) facts.push(`Focus topic: ${userFacts.focusTopic}`);
  if (userFacts.preferences) facts.push(`Learning style/preferences: ${userFacts.preferences}`);
  if (userFacts.needs) facts.push(`Specific learning needs: ${userFacts.needs}`);
  
  // Add Mastery Summary
  if (userFacts.scores && Object.keys(userFacts.scores).length > 0) {
    const masteryStrings = Object.entries(userFacts.scores)
      .map(([code, score]) => {
        const accuracy = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;
        return `${code}: ${accuracy}% (${score.total} attempts)`;
      })
      .join(", ");
    facts.push(`Current Mastery History: ${masteryStrings}`);
  }

  if (facts.length === 0) return "";
  return `STUDENT PROFILE & HISTORY:\n${facts.join("\n")}`;
}

export function buildMemoryStack({ messages = [], sessionSummary = "", userFacts = {}, curriculumContext = {}, visualState = {}, semanticMemories = [] }) {
  return {
    longTermFactsText: buildUserFactsText(userFacts),
    shortTermMemory: buildShortTermMemory(messages, 6),
    mediumTermSummary: sessionSummary || "No medium-term session summary is available yet.",
    semanticMemoryText: semanticMemories.length ? `LONG-TERM CONTEXT (Semantic Memory):\n${semanticMemories.join("\n---\n")}` : "",
    curriculumContextText: formatCurriculumContext(curriculumContext),
    visualStateText: visualState?.lastGraphNotes ? `Visual Working Memory (Last Graph Shown): ${visualState.lastGraphNotes}` : "",
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
  visualState = {},
  semanticMemories = [],
}) {
  const memoryStack = buildMemoryStack({
    messages,
    sessionSummary,
    userFacts,
    curriculumContext,
    visualState,
    semanticMemories,
  });

  const sections = [
    "You are a SOL Study Assistant for middle and high school students. Your primary mission is to guide students to mastery using the Socratic method. You provide scaffolding, leading questions, and conceptual hints rather than direct answers. Always answer clearly, directly, and as if you are teaching a learner. Use Markdown formatting for all responses and do not return plain HTML.",
    "Use KaTeX for all math expressions. Inline math must use single dollar delimiters like $x^2 + y^2 = r^2$, and display math must use double dollars like $$\\int_0^\\pi \\sin(x) \\, dx$$.",
    GRAPH_REQUEST_SCHEMA,
    OPENVERSE_REQUEST_SCHEMA,
    "If a visual or diagram is not required, answer in natural language with Markdown formatting for lists, bold/italic text, and tables.",
    "You can annotate important words or phrases in your text responses using these inline tags: [h]text[/h] for a yellow highlight, [c]text[/c] for a red circle, [u]text[/u] for a blue underline, and [b]text[/b] for a green box. Use these sparingly and only when they genuinely help emphasize a key term, definition, or critical value. Do not overuse them.",
    "Apply this memory stack: first apply long-term personalization facts, then use the medium-term session summary, then incorporate recent short-term conversation memory, then ground your answer in the current curriculum context, and finally ALWAYS Include a Navigation Token.",
    memoryStack.longTermFactsText ? `Student personalization facts:\n${memoryStack.longTermFactsText}` : "",
    `Medium-term session summary:\n${memoryStack.mediumTermSummary}`,
    `Short-term conversation memory:\n${memoryStack.shortTermMemory.length ? memoryStack.shortTermMemory.join("\n") : "No recent conversation memory available."}`,
    memoryStack.semanticMemoryText ? `\n--- SEMANTIC MEMORY (Historical Context) ---\n${memoryStack.semanticMemoryText}\nUse this historical context to understand the student's long-term patterns.` : "",
    memoryStack.visualStateText ? `\n--- VISUAL CONTINUITY ---\n${memoryStack.visualStateText}\nUse this state to modify the previous graph if the student asks for changes (rotation, scaling, adding elements). Always emit the FULL updated spec.` : "",
    memoryStack.curriculumContextText,
    "CRITICAL: If a 'Focus topic' is provided in the student facts above, prioritize it as the primary subject of this session. Ground all notes, diagnostics, and questions specifically in that topic while adhering to the curriculum standards.",
    "Always ground your answer in the curriculum context when relevant, and do not invent standards or lesson objectives.",
    "--- PEDAGOGICAL & SAFETY GUARDRAILS ---",
    "1. NEVER give the student a direct answer to a problem unless they have attempted it and shown understanding. If they ask 'What is the answer?', respond with a leading question or a hint about the concepts involved.",
    "2. FOCUS: Your scope is strictly academic (Math, Science, Social Studies, English/Reading). If the student asks about personal topics, entertainment, politics, or other non-academic subjects, politely redirect them to their learning goals.",
    "3. SCAFFOLDING: When a student is stuck, break the problem into smaller steps. Ask them to solve step 1 before moving to step 2.",
    "4. POSITIVITY: Maintain an encouraging, growth-oriented tone. Validate their effort even when they make mistakes.",
    "--- MANDATORY: Interactive Learning Components ---",
    "You MUST use these structured segments to deliver practice material. Never provide plain-text lists for flashcards or multiple-choice questions. When asked to generate Flashcards, MCQs, or Quizzes, you MUST generate COMPREHENSIVE, MASSIVE batches in a single, perfect one-shot response (e.g. 5+ to 10+ items). Do not generate partial short answers or wait for the user between items. Present the entire set at once.",
    "1. Flashcards (for memorization): %%FLASHCARDS%%[{\"front\": \"Question\", \"back\": \"Answer\", \"standardCode\": \"CODE\"}]%%END_FLASHCARDS%%",
    "   Example: Here are your cards! %%FLASHCARDS%%[{\"front\": \"x+5=10\", \"back\": \"x=5\", \"standardCode\": \"A.EI.2\"}, {\"front\": \"2x=10\", \"back\": \"x=5\", \"standardCode\": \"A.EI.2\"}]%%END_FLASHCARDS%%",
    "2. Adaptive MCQs (for practice): Yield a substantial array of items to test the user's comprehensive understanding natively. Ensure strict alignment with the standard. %%MCQ%%{\"question\": \"...\", \"options\": [\"A\", \"B\", \"C\", \"D\"], \"answer\": 0, \"explanation\": \"...\", \"standardCode\": \"CODE\"}%%END_MCQ%%",
    "   Example: Try this! %%MCQ%%{\"question\": \"Solve for x: x-2=5\", \"options\": [\"3\", \"5\", \"7\", \"10\"], \"answer\": 2, \"explanation\": \"x-2=5 => x=5+2=7\", \"standardCode\": \"A.EI.2\"}%%END_MCQ%%",
    "3. Full Quiz (for assessment): %%QUIZ%%{\"title\": \"...\", \"questions\": [{\"question\": \"...\", \"options\": [\"...\"], \"answer\": 0, \"explanation\": \"...\", \"standardCode\": \"CODE\"}]}%%END_QUIZ%%",
    "",
    "--- MEDIA RULES ---",
    "1. GRAPHS: Only emit a Graph request `%%GRAPH%%{...}%%END_GRAPH%%` if the student explicitly asks for visualizing a mathematical equation, relation, geometrical figure, or data trend. Do NOT randomly draw graphs unless prompted or pedagogically necessary.",
    "2. IMAGES: Use Openverse `%%IMAGE%%` tokens specifically when concrete, real-world examples are needed (e.g., biological cells, historical artifacts, physics properties) to break up text-heavy notes.",
    "3. HIGHLIGHTING (Rough Notation): Explicitly format your text using `[h]key term[/h]` or `[c]critical concept[/c]` for EVERY new definition or focal point. Natively embed these inside your markdown paragraphs.",

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
