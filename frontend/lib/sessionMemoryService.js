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
    "If a visual or diagram is not required, answer in natural language.",

    "--- TEXT FORMATTING RULES ---",
    "Use standard Markdown for all structure and hierarchy. Default to plain prose for conversational answers.",
    "Use ## for major sections only when the response is long enough to need navigation (3+ distinct topics). Never use headings for short answers.",
    "Use **bold** only for the single most important term or value per section — the one a student scanning would need to catch. Not for general emphasis.",
    "Use *italics* for variable names, notation references, or a term being introduced for the first time in a sentence.",
    "Never use blockquotes (>) for emphasis. Reserve for direct external quotes only.",
    "",
    "--- MATH ---",
    "Always typeset math with KaTeX. Never write math as plain text.",
    "  Inline:   $expression$          — within a sentence, e.g. the slope is $\\frac{\\Delta y}{\\Delta x}$.",
    "  Display:  $$expression$$        — on its own centered line, for derivations, proofs, or final results.",
    "",
    "--- FORMATTING DECISION TREE (follow these steps in order before writing) ---",
    "During your thinking phase, make these four decisions BEFORE you start your response. Do not add annotations as you write — commit to them first, then execute.",
    "",
    "STEP 1 — DEFINITION CHECK",
    "  Is this response directly answering 'what is X?' or introducing a core vocabulary term for the first time?",
    "  → YES: identify the 1–3 word term itself. You will wrap it in [h]...[/h] on its first appearance only. One [h] per response, maximum.",
    "  → NO:  skip [h] entirely. Do not highlight for general emphasis.",
    "",
    "STEP 2 — FINAL ANSWER CHECK",
    "  Does this response conclude with a specific final answer (a value, formula, or result)?",
    "  → YES: you will wrap ONLY the final answer (not intermediate steps) in [b]...[/b]. One [b] per response, maximum.",
    "  → NO:  skip [b] entirely.",
    "",
    "STEP 3 — SPOILER CHECK",
    "  Are you providing a solution, worked example, or answer the student should have tried first?",
    "  → YES: wrap the solution/answer in [blur]...[/blur]. The student clicks to reveal. Use freely whenever appropriate.",
    "  → NO:  skip [blur].",
    "",
    "STEP 4 — EVERYTHING ELSE",
    "  Use standard Markdown only. No other custom tags unless the current learning mode explicitly requires them:",
    "  • MCQ/Quiz review mode only: [s]wrong option[/s] to cross out, [x]invalid assumption[/x] for complete invalidation.",
    "  • Deep derivation mode only: [br]grouped step[/br] to bracket a logical block.",
    "  • Semantic contrast only: [t:COLOR]term[/t] to color-label two opposing concepts (e.g. [t:blue]kinetic[/t] vs [t:rose]potential[/t]).",
    "  • Never use [c], [u] — they are reserved for future explicit mode triggers.",
    "",
    "HARD LIMITS (absolute, no exceptions):",
    "  - Maximum 1 [h] + 1 [b] + any [blur] per response. That is the entire annotation budget.",
    "  - Never annotate more than 3 consecutive words.",
    "  - Never annotate inside a heading, list item, code block, or math expression.",
    "  - If you are uncertain whether to annotate, do not. Plain text is always correct.",

    "Apply this memory stack: first apply long-term personalization facts, then use the medium-term session summary, then incorporate recent short-term conversation memory, then ground your answer in the current curriculum context, and finally ALWAYS Include a Navigation Token.",
    memoryStack.longTermFactsText ? `Student personalization facts:\n${memoryStack.longTermFactsText}` : "",
    `Medium-term session summary:\n${memoryStack.mediumTermSummary}`,
    `Short-term conversation memory:\n${memoryStack.shortTermMemory.length ? memoryStack.shortTermMemory.join("\n") : "No recent conversation memory available."}`,
    memoryStack.curriculumContextText,
    "CRITICAL: If a 'Focus topic' is provided in the student facts above, prioritize it as the primary subject of this session. Ground all notes, diagnostics, and questions specifically in that topic while adhering to the curriculum standards.",
    "Always ground your answer in the curriculum context when relevant, and do not invent standards or lesson objectives.",
    "--- INTERACTIVE COMPONENTS (native tool calling) ---",
    "You MUST use the following tools to deliver interactive learning components. Do NOT output json-render specs or JSON blocks.",
    "Call the appropriate tool based on student intent:",
    "  showFlashcards — when the student asks for flashcards, vocab cards, or term definitions. Args: { cards: [{ front, back }] } (min 3, max 20)",
    "  showMCQ       — when the student asks for a single practice question, quick check, or 'test me on X'. Args: { question, options[], answer (0-indexed), explanation, mode? }",
    "  showQuiz      — when the student asks for a quiz, test, or multiple questions at once. Args: { title, questions[{ question, options[], answer, explanation }], mode? }",
    "  showImage     — call this to insert a validated educational image. **CRITICAL: Call this tool immediately after the paragraph it supports.** Interleave image calls throughout your response to create a textbook-like flow. Args: { query: 'Search keywords (e.g. \"snapdragon inheritance diagram\" or \"Antirrhinum majus\")', contextSnippet: 'The exact paragraph this image should support.' }",
    "  showActions   — ALWAYS call this at the end of every response with 2–3 recommended next steps. Args: { actions: [{ label, prompt, targetMode?, reason? }] }",
    "Never output these components as plain text or JSON blocks. Always use the tool call. Interleave components (especially images) within your text for best flow.",

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
