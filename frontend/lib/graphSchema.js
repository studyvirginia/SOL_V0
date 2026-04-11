/**
 * graphSchema.js — client-safe constants only (no Node.js imports)
 *
 * Shared by:
 *  - sessionMemoryService.js  (injected into Phase 1 system prompt)
 *  - geogebra-generate.js     (server-only, for reference)
 */

/**
 * Instruction block injected into the Phase 1 system prompt.
 * Tells the AI how to embed a graph request in its response.
 * All graphs use the GeoGebra interactive engine.
 */
export const GRAPH_REQUEST_SCHEMA = `
When a visual diagram or graph would help the student, embed EXACTLY ONE token in your response.
The app will intercept it, strip it from the displayed text, and generate the graph automatically.

Format (must be on its own line, valid JSON, no surrounding markdown):
%%GRAPH%%{"engine":"geogebra","type":"<type>","equations":["<eq1>","<eq2>"],"label_points":[{"x":0,"y":-4,"label":"vertex"}],"find":[],"course":"<course>","mode":"illustration","question":"","notes":"<required — see below>"}%%END_GRAPH%%

FIELDS:
- type: one of — function | geometry | number_line | inequality | polar | scatter | piecewise | trig
- equations: array of math expressions describing what to graph.
    Write natural math — e.g. "y=x^2-4", "x^2+y^2=25", "y=sin(x)", "polygon((0,0),(4,0),(2,3))"
    Use * for multiplication. Use sqrt(x), abs(x), ln(x), sin(x) — no backslashes needed.
- label_points: key coordinates to mark that ARE revealed to the student. x and y are numbers,
    label is plain text ("" = unlabeled dot).
- find: array of coordinates the student must identify — rendered as "?" markers on the graph.
    Format: [{"x":2,"y":0},{"x":-2,"y":0}]. Use this for roots, intersections, or any point
    the student's task is to find. NEVER pre-label these — the "?" is intentional.
- mode: "illustration" (default, passive notes/explanation graph) or "question" (graph is part of
    a practice problem — the student must answer something about it).
- question: when mode is "question", write the exact question the student must answer based on
    the graph (e.g. "What are the x-intercepts of this parabola?", "Find the slope of this line.",
    "At what x-value does f(x) reach its maximum?"). Leave "" for illustration mode.
- course: e.g. "algebra_1" | "algebra_2" | "geometry" | "trig" | "pre_calc" | "k_5" | "stats"
- notes: REQUIRED. Write a plain-English label describing this specific graph so it can be identified
    in future turns (e.g. "parabola y=x²−4 with roots at x=±2 and vertex labeled",
    "unit circle with 30-60-90 angles marked", "triangle ABC with altitude from C").
    Never leave this blank — it is your memory anchor for this graph.

RULES:
- Emit ONE token per response. Place it where the diagram should appear.
- Do NOT wrap it in a code fence or markdown block.
- Write the actual equations and coordinates — do not refer to "the function from above."
- For question mode: populate "find" with the answer coordinates, populate "question" with the
  problem statement, and do NOT reveal the answer in your text — the graph shows "?" markers and
  the student must identify them. After the student answers, validate in your next reply.

GRAPH CONTINUITY — when modifying a previously shown graph:
- Your previous %%GRAPH%%...%%END_GRAPH%% tokens remain in the conversation history.
- To modify a graph, locate the prior token, copy its equations and label_points, apply the
  requested change (add/remove/recolor an object), and emit a fresh token with the full updated spec.
- Always carry forward any equations or points the student has not asked to remove.
- Update the notes field to describe the new state of the graph.
`;
