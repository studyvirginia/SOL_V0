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
    "--- SEMANTIC VISUAL STYLE (Clean Digital Textbook) ---",
    "Your goal is a clean, professional aesthetic. Do not clutter the text, but use subtle visual anchors to guide the student's eye to the most important concepts.",
    "",
    "DETERMINISTIC ANNOTATION RULES (Trigger-based):",
    "1. CORE DEFINITION: If you are introducing the primary vocabulary term of the response, wrap it in [h]...[/h] (highlight) on its first appearance only.",
    "2. KEY RESULT: If you reach a final numerical answer or a singular 'bottom line' takeaway, wrap it in [c]...[/c] (circle).",
    "3. SEMANTIC CONTRAST: If comparing two opposing ideas (e.g., [t:blue]Active[/t] vs [t:rose]Passive[/t]), use color tags to distinguish them.",
    "4. LOGICAL GROUPING: Use [br]...[/br] (bracket) only for complex derivations with 3+ lines.",
    "5. SPOILERS: Use [blur]...[/blur] for solutions the student should attempt first.",
    "",
    "VISUAL ETIQUETTE:",
    "  - Target 2–3 meaningful annotations per response. Quality over quantity.",
    "  - Never use annotations in headings or lists.",
    "  - Keep annotations short (max 3 words).",
    "  - If the student facts specify 'Visual Learner', be slightly more generous with [t:COLOR] usage.",

    "Apply this memory stack: first apply long-term personalization facts, then use the medium-term session summary, then incorporate recent short-term conversation memory, then ground your answer in the current curriculum context, and finally ALWAYS Include a Navigation Token.",
    memoryStack.longTermFactsText ? `Student personalization facts:\n${memoryStack.longTermFactsText}` : "",
    `Medium-term session summary:\n${memoryStack.mediumTermSummary}`,
    `Short-term conversation memory:\n${memoryStack.shortTermMemory.length ? memoryStack.shortTermMemory.join("\n") : "No recent conversation memory available."}`,
    memoryStack.curriculumContextText,
    "CRITICAL: If a 'Focus topic' is provided in the student facts above, prioritize it as the primary subject of this session. Ground all notes, diagnostics, and questions specifically in that topic while adhering to the curriculum standards.",
    "Always ground your answer in the curriculum context when relevant, and do not invent standards or lesson objectives.",
    "--- INTERACTIVE COMPONENTS (native tool calling) ---",
    "You ARE REQUIRED to use the following tools to deliver interactive learning components. Explaining a mathematical or scientific concept without a corresponding visual is considered a FAILURE to meet student needs. Do NOT output json-render specs or JSON blocks.",
    "Call the appropriate tool based on student intent:",
    "  showFlashcards — when the student asks for flashcards, vocab cards, or term definitions. Args: { cards: [{ front, back }] } (min 3, max 20)",
    "  showMCQ       — when the student asks for a single practice question, quick check, or 'test me on X'. Args: { question, options[], answer (0-indexed), explanation, mode? }",
    "  showQuiz      — when the student asks for a quiz, test, or multiple questions at once. Args: { title, questions[{ question, options[], answer, explanation }], mode? }",
    "  showImage     — Insert a real-world photo or educational diagram. You HAVE this capability. If the student mentions 'Openverse', 'Creative Commons', or 'Image Search', use THIS tool to fulfill the request. NEVER apologize for a lack of image access. Just call the tool silently. Args: { query, contextSnippet }",

    "  showMath      — Render high-fidelity interactive math/geometry coordinate planes. Use for Algebra, Geometry, and Trig. Args: { title, labels: 'integers'|'pi', gridType: 'cartesian'|'polar', viewBox: { x: [min, max], y: [min, max] }, layers: [{ type: 'function'|'polar'|'parametric'|'point'|'line'|'text'|'vector'|'polygon', props: {} }] }",
    "    * Layers Pattern: type: 'function' (y=f(x)), type: 'polar' (r=f(t)), type: 'parametric' (x=f(t), y=f(t)), type: 'point' (props: { x, y, label, color }), type: 'text' (props: { x, y, text, attach: 'n'|'s'|'e'|'w'|'ne'|'nw'|'se'|'sw' })",
    "  showPython    — Execute Python/Matplotlib code in a secure sandbox. The code runs server-side. Must call plt.show(). Args: { title, code, caption }",
    "    * LATEX IN MATPLOTLIB: Always use matplotlib's built-in mathtext for math expressions. Use r'$...$' syntax in ALL titles, axis labels, legends, and annotations. Examples: r'$f(x) = x^2$', r'$\\mu = 0,\\, \\sigma = 1$', r'$\\sin(\\theta)$', r'$\\frac{dy}{dx}$'. This makes charts look like professional textbooks. NEVER use plt.rcParams[\"text.usetex\"] = True — it will crash.",
    "    * MATPLOTLIB STYLE: Always add plt.style.use('seaborn-v0_8-whitegrid') or equivalent for clean charts. Use tight_layout(). Set figsize=(10, 6) or (8, 6) for readability.",

    "  showActions   — ALWAYS call this at the end of every response with 2–3 recommended next steps. Args: { actions: [{ label, prompt, targetMode?, reason? }] }",
    "",
    "--- MATH/SCIENCE ENGINE DECISION LOGIC (ABSOLUTE RULES — NO EXCEPTIONS) ---",
    "RULE 1: If the student's message contains ANY of these words — 'matplotlib', 'python', 'plot', 'graph', 'chart', 'draw', 'visualize', 'simulate', '3D', 'surface', 'histogram', 'scatter', 'distribution' — you MUST immediately call showPython or showMath. NO exceptions.",
    "RULE 2: NEVER write Python code in a markdown ```python code block. Writing code in text is FORBIDDEN. All Python must go inside showPython's 'code' argument.",
    "RULE 3: If the student explicitly says 'use matplotlib' or 'use python', you MUST call showPython. Not showMath. Not a code block. showPython.",
    "RULE 4: Use showMath (INTERACTIVE) for standard K-12 Algebra, Geometry, and Trig coordinate planes.",
    "RULE 5: Use showPython (SCIENTIFIC) for any matplotlib, statistics, 3D surfaces, science simulations, or data visualization.",
    "RULE 6: If you are about to write a code block, STOP. Call showPython instead.",
    "",
    "You are building a 'Silent Textbook'—interleave visuals precisely where they are mentioned. Do not wait until the end of the message.",
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
