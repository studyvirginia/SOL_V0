/**
 * geogebraService.js
 * Phase 2 prompt builder and response parser for the "geogebra" engine.
 *
 * Verified against GeoGebra Apps API docs (geogebra.github.io/docs) April 2026.
 * All commands are valid for evalCommand() in GeoGebra Classic 6.
 */

// ─── SOL color palette as evalCommand-compatible SetColor calls ───────────────
// SetColor(<Label>, <R:0-255>, <G:0-255>, <B:0-255>)  — integers only
// Usage: after defining object "f", call SetColor(f, 0, 122, 255)
export const COLORS = {
  blue:   [0, 122, 255],    // primary function / main curve
  red:    [255, 59, 48],    // key points, second curve
  green:  [52, 199, 89],    // fills, third curve
  orange: [255, 149, 0],    // fourth curve
  purple: [175, 82, 222],   // trig, transforms
  gray:   [142, 142, 147],  // asymptotes, helpers (use SetLineStyle too)
};

// ─── Verified GeoGebra evalCommand cheatsheet ────────────────────────────────
// Only commands that actually work via api.evalCommand() in Classic 6.
// Syntax rules:
//   * for multiplication — NOT implicit (2x fails, 2*x works)
//   pi, e — lowercase, no backslash
//   Degree symbol ° is supported for angle arguments
//   ^(1/2) for roots — NOT ^{1/2} (no LaTeX braces in CAS mode)
const CMD_CHEATSHEET = `
DEFINE
  f(x) = 2*x^2 - 3*x + 1      function (name it, use it later)
  A = (2, 3)                   point
  v = (1, -2)                  vector (use for Translate)
  seg = Segment(A, B)          segment
  l = Line(A, B)               infinite line through two points

ANALYSIS (automatic labeling)
  Root(f)                      all x-intercepts of f → auto-labeled
  Root(f, a, b)                roots in interval [a,b]
  Extremum(f)                  all local max/min → auto-labeled
  InflectionPoint(f)           inflection points
  Derivative(f)                f'(x) as a new function
  Integral(f, a, b)            shaded area + numeric value

GEOMETRY
  tri = Polygon(A, B, C)       triangle; tri is the polygon object
  quad = Polygon(A, B, C, D)   quadrilateral
  c = Circle(A, 3)             circle center A radius 3
  c = Circle((0,0), r)         circle with inline center
  Angle(tri)                   all interior angles of polygon tri
  Angle(A, B, C)               angle at vertex B (from ray BA to ray BC)
  ang = Angle(A, B, C)         assign angle so you can color/style it
  MidPoint(A, B)               midpoint
  PerpendicularLine(A, l)      perpendicular to line l through A
  Circumcircle(A, B, C)        circumscribed circle of triangle

CONICS
  Ellipse(F1, F2, a)           a = semi-major axis length (number)
  Parabola(F, d)               F = focus point, d = directrix line
  Hyperbola(F1, F2, a)         a = semi-transverse axis length

TRANSFORMATIONS
  Reflect(obj, xAxis)          reflect over x-axis (xAxis is built-in)
  Reflect(obj, yAxis)          reflect over y-axis (yAxis is built-in)
  Reflect(obj, l)              reflect over line l
  Dilate(obj, 2, O)            scale factor 2 from point O
  Rotate(obj, 45°, O)          rotate 45 degrees around O
  Translate(obj, v)            translate by vector v (define v first)

INTERSECT / ANALYTIC
  Intersect(f, g)              intersection points of two functions
  Tangent(A, c)                tangent line to conic c at point A
  Distance(A, B)               numeric distance (shows in algebra view)

REGRESSION / SCATTER
  pts = {(1,2),(2,4),(3,3.5)} list of points (also creates visible dots)
  FitLine(pts)                 linear regression line through pts
  FitPoly(pts, 2)              quadratic fit

POLAR / PARAMETRIC
  Curve(cos(t), sin(t), t, 0, 2*pi)          unit circle parametric
  Curve((1+cos(t))*cos(t),(1+cos(t))*sin(t), t, 0, 2*pi)  cardioid

PIECEWISE
  f(x) = If(x < 0, -x, x)                   abs value
  f(x) = If(x < -1, x+2, If(x < 2, x^2, 1)) nested piecewise

STYLING (call after defining the object)
  SetColor(f, 0, 122, 255)     R,G,B integers 0-255 — NO hex strings
  SetLineThickness(f, 3)       1–13
  SetLineStyle(f, 1)           0=solid 1=dashed 2=dotted 3=dash-dot
  SetLabelVisible(A, true)     show/hide label
  SetLabelMode(A, 1)           0=name 1=name+value 2=value 3=caption
  SetCaption(A, "text")        set custom text (use with SetLabelMode(A, 3))
  SetPointStyle(A, 0)          0=filled 1=cross 2=circle/open 3=plus
  SetPointSize(A, 5)           1–9

LABELED POINT PATTERN (custom text on a point):
  A = (3, 4)
  SetLabelVisible(A, true)
  SetCaption(A, "P(3,4)")
  SetLabelMode(A, 3)
`.trim();

// ─── Worked example for each type ─────────────────────────────────────────────
const TYPE_EXAMPLES = {
  function: {
    scenario: "y = x^2 - 4 (quadratic, show vertex and roots)",
    cmds: [
      "f(x) = x^2 - 4",
      "SetColor(f, 0, 122, 255)",
      "V = (0, -4)",
      "SetColor(V, 255, 59, 48)",
      "SetLabelVisible(V, true)",
      "SetLabelMode(V, 0)",
      "Root(f)",
      "Extremum(f)",
    ],
    view: [-5, 5, -6, 4],
    note: "Root() and Extremum() auto-create labeled points. Use them instead of hardcoding coordinates.",
  },
  trig: {
    scenario: "y = 2*sin(3*x) (amplitude 2, period 2π/3)",
    cmds: [
      "f(x) = 2*sin(3*x)",
      "SetColor(f, 175, 82, 222)",
      "g(x) = sin(x)",
      "SetColor(g, 142, 142, 147)",
      "SetLineStyle(g, 1)",
    ],
    view: [-6.3, 6.3, -2.5, 2.5],
    note: "Always use radians. View [-6.28, 6.28] covers two full periods of sin/cos.",
  },
  geometry: {
    scenario: "3-4-5 right triangle with labeled vertices, labeled angles, dashed altitude",
    cmds: [
      "A = (0, 0)",
      "SetLabelVisible(A, true)",
      "SetCaption(A, \"A\")",
      "SetLabelMode(A, 3)",
      "B = (4, 0)",
      "SetLabelVisible(B, true)",
      "SetCaption(B, \"B\")",
      "SetLabelMode(B, 3)",
      "C = (0, 3)",
      "SetLabelVisible(C, true)",
      "SetCaption(C, \"C\")",
      "SetLabelMode(C, 3)",
      "tri = Polygon(A, B, C)",
      "SetColor(tri, 0, 122, 255)",
      "Angle(tri)",
      "alt = Segment(C, (0, 0))",
      "SetLineStyle(alt, 1)",
      "SetColor(alt, 142, 142, 147)",
    ],
    view: [-0.5, 5, -0.5, 4],
    note: "Angle(polygon) auto-marks all interior angles with arcs. Use SetCaption+SetLabelMode(obj,3) for custom text on any point. SetLineStyle(obj,1) = dashed — use for altitudes, helpers, asymptotes.",
  },
  polar: {
    scenario: "Rose curve r = cos(2θ)",
    cmds: [
      "Curve(cos(2*t)*cos(t), cos(2*t)*sin(t), t, 0, 2*pi)",
      "SetColor(Curve1, 175, 82, 222)",
    ],
    view: [-1.5, 1.5, -1.5, 1.5],
    note: "Always use Curve(x-expr, y-expr, t, start, end). The auto-name is Curve1, Curve2 etc. Do NOT write r= polar equations — convert manually.",
  },
  scatter: {
    scenario: "Scatter plot with linear regression",
    cmds: [
      "pts = {(1,2),(2,3.5),(3,3),(4,5),(5,4.5)}",
      "SetColor(pts, 0, 122, 255)",
      "FitLine(pts)",
      "SetColor(FitLine1, 255, 59, 48)",
    ],
    view: [0, 6, 0, 7],
    note: "pts creates visible dots automatically. FitLine auto-names as FitLine1. Use FitPoly(pts, 2) for quadratic regression.",
  },
  number_line: {
    scenario: "Number line showing x ≥ -2",
    cmds: [
      "A = (-2, 0)",
      "SetColor(A, 0, 122, 255)",
      "SetPointStyle(A, 0)",
      "ray = Ray(A, (1, 0))",
      "SetColor(ray, 0, 122, 255)",
      "SetLineThickness(ray, 4)",
    ],
    view: [-5, 5, -1, 1],
    note: "Use Ray(start, direction) for half-lines. Use SetPointStyle(A, 2) for open circle (excluded endpoint).",
  },
  inequality: {
    scenario: "y < x^2 + 1 (region below parabola)",
    cmds: [
      "f(x) = x^2 + 1",
      "SetColor(f, 0, 122, 255)",
      "ineq: y < x^2 + 1",
      "SetColor(ineq, 52, 199, 89)",
    ],
    view: [-4, 4, -1, 8],
    note: "GeoGebra shades inequality regions automatically when you write y < f(x) directly. Assign to variable 'ineq' so you can SetColor it. Do NOT use InequalityRegion() — it does not exist.",
  },
  piecewise: {
    scenario: "f(x) = { -x if x<0, x² if 0≤x<2, 2 if x≥2 }",
    cmds: [
      "f(x) = If(x < 0, -x, If(x < 2, x^2, 2))",
      "SetColor(f, 0, 122, 255)",
      "A = (0, 0)",
      "SetPointStyle(A, 0)",
      "B = (2, 4)",
      "SetPointStyle(B, 2)",
      "C = (2, 2)",
      "SetPointStyle(C, 0)",
    ],
    view: [-3, 4, -0.5, 5],
    note: "Use If(condition, thenExpr, elseExpr) — nested for more pieces. Filled circle = SetPointStyle(P,0), open circle = SetPointStyle(P,2).",
  },
};

// ─── Core rules ───────────────────────────────────────────────────────────────
const CORE_RULES = `CRITICAL RULES:
1. Output ONLY the JSON code block below. No explanation.
2. "cmds" = array of strings, each a valid GeoGebra evalCommand() call.
3. Multiplication: always use * (2*x, NOT 2x).
4. Constants: pi, e — lowercase, no backslash, no LaTeX.
5. Exponents: use ^ with parens for clarity: x^(1/2), NOT x^{1/2}.
6. SetColor(obj, R, G, B) — R/G/B are integers 0-255. NO hex strings.
7. Objects auto-named: FitLine → FitLine1, Curve → Curve1, etc.
8. Do NOT use: RightAngle(), InequalityRegion(), ZoomIn(x,y,x,y), ShowLabel().
9. "view" = [xmin, xmax, ymin, ymax] — fit tightly with ~15% padding.
10. Geometry: keep view width ≈ view height (equal aspect). Set showGrid:false and showAxes:false.
11. Trig: always use radians, view = [-6.28, 6.28, -2.5, 2.5] unless different amplitude.
12. "showAxes" field: true for functions/trig/polar/scatter/number_line. FALSE for geometry.`;

// ─── Main prompt builder ───────────────────────────────────────────────────────
/**
 * @param {object} graphRequest  — the parsed GRAPH token fields
 * @param {Array}  boardCmds     — optional: cmds from the last completed GeoGebra graph
 *   Used to inject "visual working memory" so the LLM avoids redefining the
 *   same objects or contradicting what's already been constructed.
 */
export function buildGeoGebraPrompt(graphRequest, boardCmds = []) {
  const {
    type = "function",
    equations = [],
    label_points = [],
    find = [],
    course = "",
    notes = "",
    description = "",
  } = graphRequest;

  const example = TYPE_EXAMPLES[type] || TYPE_EXAMPLES.function;

  const parts = [
    "You are a GeoGebra Classic command generator for a K-12 math tutoring app.",
    "Output ONLY this JSON structure, nothing else:",
    "",
    "```json",
    "{",
    '  "cmds": ["...GeoGebra commands..."],',
    '  "view": [xmin, xmax, ymin, ymax],',
    '  "showGrid": true,',
    '  "showAxes": true,',
    '  "title": "Short descriptive title"',
    "}",
    "```",
    "",
    `=== EXAMPLE (type: ${type}) ===`,
    `Scenario: ${example.scenario}`,
    "Output:",
    "```json",
    JSON.stringify({ cmds: example.cmds, view: example.view, showGrid: (type === 'geometry' ? false : true), showAxes: (type === 'geometry' ? false : true), title: example.scenario }, null, 2),
    "```",
    `Note: ${example.note}`,
    type === 'geometry' ? "\nGEOMETRY RULE: Always emit \"showGrid\": false and \"showAxes\": false. Draw a clean labeled diagram with NO coordinate grid and NO x/y axes." : "",
    "",
    "=== COMMAND CHEATSHEET ===",
    CMD_CHEATSHEET,
  ];

  // ── Board state injection ───────────────────────────────────────────────────
  if (boardCmds.length > 0) {
    const lines = boardCmds.filter(Boolean).map(c => `  ${c}`);
    parts.push(
      "",
      "=== CURRENT BOARD STATE (from the previous graph in this session) ===",
      ...lines,
      "→ DO NOT redefine objects that already exist above (same name/label).",
      "→ Use NEW distinct object names for any new constructions.",
    );
  }

  parts.push("", "=== YOUR TASK ===", `Type: ${type}`);

  if (equations.length > 0) {
    parts.push(`Equations: ${equations.join("  |  ")}`);
  } else if (description) {
    parts.push(`Description: ${description}`);
  }

  if (label_points.length > 0) {
    const pts = label_points
      .map(p => `(${p.x}, ${p.y})${p.label ? ` → label "${p.label}"` : ""}`)
      .join(", ");
    parts.push(`Key points to mark: ${pts}`);
  }

  if (find.length > 0) {
    const pts = find.map(p => `(${p.x}, ${p.y})`).join(", ");
    parts.push(`Question points (render as open/unfilled dot, NO label): ${pts}`);
    parts.push(`→ These are answer targets — mark them visually as hollow dots but do NOT add a text label.`);
  }

  if (course) parts.push(`Course: ${course}`);
  if (notes)  parts.push(`Notes / emphasis: ${notes}`);

  parts.push("", CORE_RULES);

  return parts.join("\n");
}

// ─── Response parser ───────────────────────────────────────────────────────────
/**
 * Extract and validate the GeoGebra state JSON from an LLM response.
 * Returns { cmds, view, showGrid, title } or null on failure.
 */
export function parseGeoGebraResponse(text) {
  if (!text) return null;

  // Try ```json ... ``` fence first, then bare { ... }
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const rawJson = fenceMatch ? fenceMatch[1] : text.match(/(\{[\s\S]*\})/)?.[1];
  if (!rawJson) return null;

  let parsed;
  try {
    parsed = JSON.parse(rawJson);
  } catch {
    // Attempt light repair: trailing commas, single quotes, unquoted keys
    try {
      const repaired = rawJson
        .replace(/,\s*([}\]])/g, "$1")          // trailing commas
        .replace(/([{,]\s*)(\w+)\s*:/g, '$1"$2":') // unquoted keys
        .replace(/'/g, '"');                    // single → double quotes
      parsed = JSON.parse(repaired);
    } catch {
      return null;
    }
  }

  if (!parsed || !Array.isArray(parsed.cmds)) return null;

  const cmds = parsed.cmds
    .map(c => String(c).trim())
    .filter(Boolean);

  return {
    cmds,
    view:     Array.isArray(parsed.view) && parsed.view.length === 4 ? parsed.view : [-10, 10, -10, 10],
    showGrid: parsed.showGrid ?? true,
    showAxes: parsed.showAxes ?? true,
    title:    typeof parsed.title === "string" ? parsed.title : "",
  };
}
