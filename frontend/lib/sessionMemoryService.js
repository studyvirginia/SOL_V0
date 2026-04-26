import { MODE_MAP } from "./modeMap";
import { solCatalog } from "./renderCatalog";

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
    "If a visual or diagram is not required, answer in natural language.",

    "--- TEXT FORMATTING RULES ---",
    "Use standard Markdown for all structure and hierarchy.",
    "Use ## for major sections and ### for sub-sections when the response is long enough to warrant navigation. Do NOT use headings for short conversational answers.",
    "Use **bold** for key terms, vocabulary words, or critical values only — not for general emphasis. Keep it selective.",
    "Use *italics* for subtle emphasis, notation names, or when introducing a term for the first time.",
    "Do NOT use blockquotes (>) unless quoting an actual external source. Avoid them entirely for emphasis or callouts.",

    "--- ROUGH NOTATION ANNOTATIONS (use very sparingly) ---",
    "You may annotate key terms using the following inline tags. These draw animated sketched marks on-screen. Use them sparingly and proportionally — a short answer might have none or one, a long structured response might use a small handful spread across sections. Never cluster them; each annotation should feel deliberate and earn its place:",
    "  [h]text[/h]  → yellow highlight (default). For a pivotal term or definition.",
    "  [c]text[/c]  → hand-drawn circle. For a single critical value, number, or short phrase.",
    "  [u]text[/u]  → sketched underline (blue). For a key formula name or concept.",
    "  [b]text[/b]  → rough box (teal). For a formula or short definition block.",
    "You may optionally add a color variant using the colon syntax: [h:green]text[/h], [u:indigo]text[/u], [c:amber]text[/c], [b:purple]text[/b].",
    "Available colors: yellow (default highlight), amber, green, teal (default box), blue (default underline), indigo, purple, rose (default circle), red, gray.",
    "IMPORTANT: Only use annotations on a bare word or short inline phrase — NEVER on an entire sentence, list item, or heading. Never annotate the same type of thing more than once per response.",
    "You may also color specific words using: [t:blue]text[/t]. This changes the text color without any drawing effect. Use it for semantic labeling — e.g. coloring a variable name, a category label, or a contrasting term. Available colors: blue, indigo, purple, rose, red, amber, green, teal, gray, muted. Use even more sparingly than annotations.",
    "Apply this memory stack: first apply long-term personalization facts, then use the medium-term session summary, then incorporate recent short-term conversation memory, then ground your answer in the current curriculum context, and finally ALWAYS Include a Navigation Token.",
    memoryStack.longTermFactsText ? `Student personalization facts:\n${memoryStack.longTermFactsText}` : "",
    `Medium-term session summary:\n${memoryStack.mediumTermSummary}`,
    `Short-term conversation memory:\n${memoryStack.shortTermMemory.length ? memoryStack.shortTermMemory.join("\n") : "No recent conversation memory available."}`,
    memoryStack.curriculumContextText,
    "CRITICAL: If a 'Focus topic' is provided in the student facts above, prioritize it as the primary subject of this session. Ground all notes, diagnostics, and questions specifically in that topic while adhering to the curriculum standards.",
    "Always ground your answer in the curriculum context when relevant, and do not invent standards or lesson objectives.",
    "--- MANDATORY: Interactive Learning Components (json-render) ---",
    "You MUST use the following component catalog to deliver practice material, assessments, navigation buttons, and visualizations.",
    "Guidelines:",
    "1. Schema Compliance: Your JSON output for components must STRICTLY match the Zod schemas provided in the catalog.",
    "2. Placement: You can interleave text and components. Components should be placed where they are most relevant in the conversation.",
    "3. Actions: Use the 'Actions' component for all navigation and next-step recommendations.",
    "",
    "COMPONENT CATALOG:",
    solCatalog.prompt(),
    "TOOL OVERRIDE — FLASHCARDS: When the student asks for flashcards or vocabulary cards, do NOT use the json-render Flashcards component. Instead, call the 'showFlashcards' tool with { cards: [{ front: string, back: string }] }. Minimum 3 cards, maximum 20 cards. Continue using json-render for all other components: MCQ, Quiz, and Actions.",

    "--- Action Signaling ---",
    "At the end of EVERY message, if it's a logical break point, include an 'Actions' component with recommended next modes.",

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
