/**
 * graphSchema.js — Matplotlib graph token schema
 *
 * Injected into every system prompt via sessionMemoryService.js.
 * The AI outputs a %%GRAPH%% token with structured JSON params.
 * The app intercepts it, calls /api/matplotlib-generate, and renders the PNG.
 *
 * Architecture: Template-based, NOT code generation.
 * The AI provides parameters only. The server runs pre-built Matplotlib
 * templates against those params — no raw Python code generation.
 */

export const GRAPH_REQUEST_SCHEMA = `
When a visual diagram, graph, or mathematical figure would help the student, embed EXACTLY ONE token.
The app intercepts it, generates a high-quality academic diagram, and displays it inline.

FORMAT (one line, valid JSON, no markdown fences):
%%GRAPH%%{"type":"<type>","equations":["<eq1>"],"label_points":[{"x":0,"y":0,"label":"vertex"}],"find":[{"x":2,"y":0}],"description":"<plain English if not equation-based>","course":"<course>","notes":"<required>","question":""}%%END_GRAPH%%

FIELDS:
- type: one of — function | geometry | number_line | inequality | polar | scatter | trig | bar | geometry_shape
- equations: array of math expressions.
    Write standard notation — e.g. "y=x**2 - 4", "x**2 + y**2 = 25", "y=sin(x)", "y=2*x+1"
    Use ** for exponents, * for multiplication, sqrt(x), abs(x), sin(x), cos(x), tan(x), log(x).
    For geometry_shape type: use description instead of equations.
- label_points: key coordinates to mark and label on the graph. Each: {"x": num, "y": num, "label": "text"}
    Use "" label for an unlabeled dot. Only include points that SHOULD be visible to the student.
- find: coordinates the student must identify — rendered as hollow "?" markers. Use for roots, 
    intersections, max/min points. Format: [{"x": 2, "y": 0}]. Never label these — the "?" is intentional.
- description: plain English description for geometry_shape or non-equation graphs.
    Example: "isosceles triangle with base 4 and height 3, vertices labeled A B C"
    Example: "number line from -5 to 5 with point at -2 highlighted"
- course: e.g. "algebra_1" | "algebra_2" | "geometry" | "trig" | "pre_calc" | "statistics" | "science"
- notes: REQUIRED. Plain-English label describing this graph — your visual memory anchor.
    Example: "parabola y=x²−4 with roots at x=±2 and vertex at (0,−4)"
    Example: "isosceles triangle ABC with altitude from C drawn"
    Never leave blank. Used to maintain continuity across turns.
- question: If this graph is part of a practice problem, write the exact question here.
    Example: "What are the x-intercepts?" or "Find the slope of this line."
    Leave "" for illustration/explanation graphs.

RULES:
- One token per response. Place it where the diagram should appear in your explanation.
- Do NOT wrap it in a code fence or backticks.
- Write actual values — do not reference "the function above."
- For question mode: populate "find" with answer coordinates, populate "question" with the problem.
  Do NOT reveal the answer in your text — the graph shows "?" markers. Validate after student answers.

GRAPH CONTINUITY — modifying a previous graph:
- To rotate, scale, or add to a previous graph, copy its equations/label_points from the prior token.
- Apply the requested change and emit a fresh token with the full updated spec.
- Update the "notes" field to describe the new state.
- The app maintains a "visual state" record of the last graph's notes field — use it to stay consistent.
`;
