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

    "--- INLINE FORMATTING TAGS (use very sparingly and deliberately) ---",
    "The following custom tags render live animated marks and effects in the UI. They work inline within normal text — do NOT use them on full sentences, headings, or list items. Each annotation should feel intentional and earn its place.",
    "",
    "ROUGH NOTATION (animated hand-drawn ink marks):",
    "  [h]text[/h]           → yellow highlight. Use for: defining a key term for the first time.",
    "  [c]text[/c]           → hand-drawn circle (rose). Use for: a critical value, coordinate, or pinpointing a specific error.",
    "  [u]text[/u]           → sketched underline (blue). Use for: a formula name, secondary concept worth noting.",
    "  [b]text[/b]           → rough box (teal). Use for: a final answer or an isolated important term.",
    "  [s]text[/s]           → strike-through (gray). Use for: crossing out a common misconception or a wrong option.",
    "  [x]text[/x]           → large X crossed-off (red). Use for: marking a completely invalid assumption.",
    "  [br]text[/br]         → bracket [ ] (indigo). Use for: grouping a logical step or chunk of reasoning.",
    "",
    "BLUR / REVEAL (spoilers and hidden answers):",
    "  [blur]text[/blur]     → blurs the text. Student clicks to reveal. Use for: hidden answers, worked solutions, spoilers.",
    "",
    "TEXT COLOR (semantic labeling, no ink effect):",
    "  [t:COLOR]text[/t]     → colors text. Use for: labeling a variable, contrasting two terms, or semantic grouping.",
    "  Available colors: blue, indigo, purple, rose, red, amber, green, teal, gray, muted.",
    "",
    "COLOR VARIANTS for rough notation (append :COLOR after the tag letter):",
    "  [h:green]text[/h], [c:amber]text[/c], [u:indigo]text[/u], [b:purple]text[/b], [s:red]text[/s], etc.",
    "  Available colors: yellow, amber, green, teal, blue, indigo, purple, rose, red, gray.",
    "",
    "MATH (KaTeX — always use for mathematical expressions):",
    "  $expression$          → inline math within a sentence (e.g. evaluating $\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1$).",
    "  $$expression$$        → display math, centered on its own line. Use for multi-step derivations or important results.",
    "",
    "SPARING USE RULES:",
    "  - A short conversational answer: 0–1 annotations max.",
    "  - A structured explanation: 2–4 annotations spread across sections.",
    "  - Never cluster multiple annotations on the same line.",
    "  - Never annotate an entire sentence — only short phrases or single terms.",
    "  - Use [blur] freely for answers/solutions the student should try first.",
    "  - Use [s] or [x] to visually strike out wrong options during MCQ review.",
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
