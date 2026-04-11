/**
 * desmosService.js
 * Phase 2 prompt builder for the "desmos" engine.
 *
 * When Phase 1 emits engine:"desmos", Phase 2 calls this instead of
 * buildTikzPrompt. The AI outputs a JSON block describing Desmos expressions
 * and viewport. DesmosRenderer.js turns that into an interactive embed.
 *
 * Desmos is used for ALL graph types:
 *  - Single and multi-function graphs (y=f(x), implicit curves)
 *  - Conic sections, parametric curves, polar graphs
 *  - Piecewise functions, inequalities, shaded regions
 *  - Scatter plots with regression lines
 *  - Geometry sketches using polygons, points, and labeled coordinates
 *  - Number lines, area models, and any coordinate-based diagram
 */

// ── Desmos color palette matching SOL brand colors ───────────────────────────
export const DESMOS_COLORS = {
  solBlue:   "#007AFF",
  solRed:    "#FF3B30",
  solGreen:  "#34C759",
  solOrange: "#FF9500",
  solGray:   "#8E8E93",
  solPurple: "#5856D6",
};

// ── Universal reference injected on every Phase 2 call ───────────────────────
const UNIVERSAL_REFERENCE = `Output a single JSON code block (no other text):
\`\`\`json
{
  "expressions": [
    { "id": "e1", "latex": "y=x^2-4", "color": "#007AFF" },
    { "id": "p1", "latex": "(0,-4)", "color": "#FF3B30", "label": "Vertex", "showLabel": true, "dragMode": "NONE" }
  ],
  "viewport": { "left": -5, "bottom": -6, "right": 5, "top": 4 },
  "showGrid": true, "showAxes": true, "degreeMode": false, "polarMode": false,
  "title": "Short descriptive title"
}
\`\`\`

EXPRESSION PROPERTIES
id (string) · latex (string) · color (hex) · hidden (bool) · type ("expression"|"table")
lineStyle ("SOLID"|"DASHED"|"DOTTED") · lineWidth (px) · pointStyle ("POINT"|"OPEN"|"CROSS"|"SQUARE"|"PLUS"|"TRIANGLE"|"DIAMOND"|"STAR") · pointSize (px)
dragMode ("NONE"|"X"|"Y"|"XY") — MUST be "NONE" for OPEN/CROSS/SQUARE/PLUS/TRIANGLE/DIAMOND/STAR to render
points (bool) · lines (bool) · fill (bool) · fillOpacity (0–1)
label (PLAIN TEXT only — no LaTeX; Unicode: π θ α β φ ² ³ ≤ ≥ ≈ ∞ °)
showLabel (bool) · labelOrientation ("ABOVE"|"BELOW"|"LEFT"|"RIGHT"|"DEFAULT")
parametricDomain ({min,max}) · polarDomain ({min,max})

CORE LaTeX — multi-char math symbols need backslash (doubled in JSON strings):
  \\sin \\cos \\tan \\arcsin \\ln \\log \\log_2 \\sqrt{x} \\frac{a}{b} \\pi \\theta \\alpha \\beta \\phi \\infty \\tau
Desmos built-ins need \\operatorname{}: \\operatorname{abs}(x) \\operatorname{floor}(x) \\operatorname{ceil}(x) \\operatorname{round}(x) \\operatorname{sign}(x) \\operatorname{polygon}(...)
min/max use \\min(...) \\max(...). NEVER bare floor(x) or |x|.
Implicit: x^2+y^2=25 · Point: (2,3) · Inequality: y<x^2 (Desmos shades auto)
Piecewise: y=\\{x<0:-x,x>=0:x\\} · Variable def: a=3 with hidden:true

COLOR PALETTE
#007AFF main · #FF3B30 2nd/key pts · #34C759 fills/shading · #FF9500 4th · #5856D6 transforms · #8E8E93 asymptotes`.trim();

// ── Per-type reference (inject only matching type) ───────────────────────────
const TYPE_REFERENCE = {
  trig: `degreeMode:false. Viewport ±2π: {"left":-6.28,"bottom":-2.5,"right":6.28,"top":2.5}
xAxisStep:1.5708 for π/2 tick marks. DO NOT use ±10 — curves misalign.
π≈3.14159  2π≈6.28318  π/2≈1.5708`,

  polar: `Set "polarMode":true top-level. Viewport: {"left":-3,"bottom":-3,"right":3,"top":3} (expand if larger).
Polar curve: {"id":"r1","latex":"r=1+cos(\\\\theta)","color":"#007AFF","polarDomain":{"min":"0","max":"2\\\\pi"}}`,

  geometry: `Equal aspect ratio: right−left = top−bottom (e.g. ±6 each axis). showGrid:false. degreeMode:true if showing degree angles.
Each vertex needs its own labeled point alongside the polygon.
\operatorname{polygon} (round parens only): \operatorname{polygon}((0,0),(4,0),(2,3)) — square brackets FAIL.
fill:true,fillOpacity:0.15 for filled polygons.
Right-angle marker: \operatorname{polygon}((s,0),(s,s),(0,s)) where s≈5% of diagram width.
Tick mark at midpoint (mx,my): {"latex":"(mx+t*nx,my+t*ny)","parametricDomain":{"min":"-0.15","max":"0.15"}}
Angle arc: {"latex":"(r*\\cos(t),r*\\sin(t))","parametricDomain":{"min":"<ray1_angle>","max":"<ray2_angle>"}} r≈0.4`,

  piecewise: `Syntax: "latex":"y=\\\\{x<0:-x,x>=0:x\\\\}"
Excluded endpoint: {"id":"oc1","latex":"(3,0)","pointStyle":"OPEN","dragMode":"NONE","color":"#FF3B30"}
Included endpoint: same but "pointStyle":"POINT"`,

  number_line: `showGrid:false. Viewport: {"left":<min-1>,"bottom":-1,"right":<max+1>,"top":1}. yAxisNumbers:false.
Point: {"id":"p1","latex":"(3,0)","pointStyle":"POINT","dragMode":"NONE","label":"3","showLabel":true,"labelOrientation":"ABOVE","color":"#007AFF"}
Ray from a to b: {"id":"ray1","latex":"(a+t,0)","parametricDomain":{"min":"0","max":"<b-a>"},"lineWidth":3,"color":"#007AFF"}`,

  scatter: `Table: {"type":"table","id":"t1","columns":[{"latex":"x_1","values":["1","2","3"]},{"latex":"y_1","values":["2","4","6"],"color":"#007AFF","points":true,"lines":false}]}
First column is never plotted. Regression: {"id":"reg1","latex":"y_1~mx_1+b","color":"#FF3B30"}
Quadratic regression: y_1~ax_1^2+bx_1+c`,

  inequality: `Color shaded region #34C759. DASHED boundary if strict (< >), SOLID if inclusive (≤ ≥). Desmos shades automatically.`,

  function: `Fit viewport to interesting features with ~15% padding. Label vertex/intercepts/roots if requested. Asymptotes as DASHED gray (#8E8E93).
Parametric curves: write as a single expression (\\cos(t),\\sin(t)) — do NOT split into x=\\cos(t) and y=\\sin(t). Include parametricDomain {min,max} as strings e.g. {"min":"0","max":"2\\\\pi"}.`,
};

// ── Critical rules always injected ───────────────────────────────────────────
const CRITICAL_RULES = `CRITICAL — TWO CLASSES OF FUNCTIONS:

LaTeX commands (multi-char math symbols) NEED backslash. In JSON, double every backslash:
  Correct: "latex": "y=\\\\sin(x)", "r=1+\\\\cos(\\\\theta)", "y=\\\\frac{1}{x}", "y=\\\\sqrt{x}", "\\\\log_2(x)"
  These are: \\sin \\cos \\tan \\arcsin \\arccos \\arctan \\sec \\csc \\cot \\ln \\log \\log_N \\sqrt \\frac \\pi \\theta \\alpha \\beta \\phi \\infty

Desmos built-in functions need \\operatorname{} when set via the API (LaTeX parser won't find bare names):
  Correct: \\operatorname{floor}(x)  \\operatorname{ceil}(x)  \\operatorname{round}(x)  \\operatorname{sign}(x)
  Correct: \\operatorname{abs}(x)  \\operatorname{polygon}(...)  \\operatorname{distance}(...)  \\operatorname{midpoint}(...)
  Correct: \\operatorname{mean}(...)  \\operatorname{total}(...)  \\operatorname{nCr}(n,r)  \\operatorname{nPr}(n,r)
  min/max use standard LaTeX: \\min(...)  \\max(...)
  WRONG: floor(x)  polygon(...)  abs(x)  \\floor(x) — bare/backslashed names parse as variable products

Other rules:
  • "label" = PLAIN TEXT only (no LaTeX). Unicode ok: π θ α β φ ² ³ ≤ ≥ ≈ ∞ °
  • OPEN/CROSS/SQUARE/PLUS/TRIANGLE/DIAMOND/STAR pointStyle requires "dragMode":"NONE"
  • \\operatorname{polygon}() round parens only — square brackets fail
  • NEVER |x| or \\left|x\\right| — use \\operatorname{abs}(x)`.trim();

// ── Main prompt builder ───────────────────────────────────────────────────────
export function buildDesmosPrompt(graphRequest) {
  const {
    type = "function",
    equations = [],
    label_points = [],
    course = "",
    notes = "",
    // legacy free-text fallback
    description = "",
    extra_rules = "",
  } = graphRequest;

  const parts = [
    "You are a Desmos graph JSON generator for a K-12 math tutoring app.",
    "Output ONLY the JSON code block. No explanation, no other text.",
    "",
    "=== REFERENCE ===",
    UNIVERSAL_REFERENCE,
  ];

  // Graph spec
  parts.push("", "=== GRAPH SPEC ===");
  parts.push(`Type: ${type}`);
  if (equations.length > 0) {
    parts.push(`Equations: ${equations.join("  |  ")}`);
  } else if (description) {
    parts.push(`Description: ${description}`);
  }
  if (label_points.length > 0) {
    const pts = label_points
      .map(p => `(${p.x},${p.y})${p.label ? ` → "${p.label}"` : ""}`)
      .join(", ");
    parts.push(`Label points: ${pts}`);
  }
  if (course) parts.push(`Course: ${course}`);
  if (notes) parts.push(`Notes: ${notes}`);

  // Type-specific reference
  const typeRef = TYPE_REFERENCE[type];
  if (typeRef) {
    parts.push("", `=== ${type.toUpperCase()} REFERENCE ===`);
    parts.push(typeRef);
  }

  parts.push("", CRITICAL_RULES);

  if (extra_rules) {
    parts.push("", "=== EXTRA ===", extra_rules);
  }

  return parts.join("\n");
}

// ── Sanitise a latex string from AI output ───────────────────────────────────
// The core rule (from Desmos docs): any multi-char symbol needs a backslash,
// OR it is read as separate single-letter variables. BUT Desmos-specific
// built-in functions are NOT LaTeX commands and must NOT have a backslash.
// LLMs frequently cross this line by analogy (they know \sin needs backslash
// and wrongly generalise to \abs, \polygon, etc.).

// Desmos built-in functions that need \operatorname{name}( when setting latex
// programmatically via setState / setExpressions. Desmos's LaTeX parser treats
// bare multi-char identifiers (floor, polygon, abs …) as products of single
// letters. \operatorname{} is the correct LaTeX wrapper that the parser picks
// up as a named function call.
// NOTE: min/max/sin/cos/etc have proper LaTeX commands (\min, \sin …) and
// are handled separately below.
const OPERATORNAME_BUILTINS = [
  'floor', 'ceil', 'round', 'sign',
  'polygon', 'distance', 'midpoint',
  'mean', 'median', 'stdev', 'mad',
  'total', 'length', 'sort', 'shuffle', 'join', 'unique',
  'nCr', 'nPr', 'random',
];

// Precompile: match the bare name (with or without \) followed by (,
// and replace with \operatorname{name}(
const OPERATORNAME_REGEXES = OPERATORNAME_BUILTINS.map(fn => ({
  // matches: floor(  OR  \floor(   (LLM may or may not add backslash)
  re: new RegExp(`\\\\?\\b${fn}\\(`, 'g'),
  replacement: `\\operatorname{${fn}}(`,
}));

function sanitizeLatex(s) {
  if (!s || typeof s !== 'string') return s;

  // 0. Strip parametric prefix (x,y)=(...) → (...)
  //    AI sometimes outputs "(x,y)=(cos(t),sin(t))" instead of "(cos(t),sin(t))"
  s = s.replace(/^\(?\s*x\s*,\s*y\s*\)?\s*=\s*/, '');

  // 1. Fix LaTeX absolute value notation → \operatorname{abs}()
  //    \left|expr\right| → \operatorname{abs}(expr)
  s = s.replace(/\\left\s*\|\s*([\s\S]+?)\s*\\right\s*\|/g, '\\operatorname{abs}($1)');
  //    bare |expr| (single line) → \operatorname{abs}(expr)
  s = s.replace(/\|([^|\n]+?)\|/g, '\\operatorname{abs}($1)');
  //    abs(  or  \abs(  → \operatorname{abs}(
  s = s.replace(/\\?\babs\(/g, '\\operatorname{abs}(');

  // 2. Fix LaTeX bracket functions → operatorname equivalents
  s = s.replace(/\\lfloor\s*([^\\]+?)\s*\\rfloor/g, '\\operatorname{floor}($1)');
  s = s.replace(/\\lceil\s*([^\\]+?)\s*\\rceil/g, '\\operatorname{ceil}($1)');

  // 3. Wrap all Desmos built-in function names in \operatorname{}
  //    This converts both the bare form (floor() from AI output) and the
  //    incorrectly-backslashed form (\floor() from over-cautious AI)
  for (const { re, replacement } of OPERATORNAME_REGEXES) {
    s = s.replace(re, replacement);
  }

  // 4. min/max: use \min / \max (standard LaTeX, Desmos recognises both)
  s = s.replace(/\\?\bmin\(/g, '\\min(');
  s = s.replace(/\\?\bmax\(/g, '\\max(');

  // 5. Add backslash to log_N when missing
  s = s.replace(/(?<!\\)\blog_(?=[a-zA-Z0-9{])/g, '\\log_');

  return s;
}

// ── Parser: extract Desmos state from AI response ────────────────────────────
// Attempt to parse a JSON string, first raw then with lone-backslash repair.
function tryParseJson(str) {
  try { return JSON.parse(str); } catch { /* fall through */ }
  try { return JSON.parse(str.replace(/\\(?!["\\])/g, "\\\\")); } catch { /* fall through */ }
  return null;
}

// Extract the first balanced {...} block from a string (handles nested objects).
function extractFirstJsonObject(str) {
  const start = str.indexOf('{');
  if (start === -1) return null;
  let depth = 0;
  for (let i = start; i < str.length; i++) {
    if (str[i] === '{') depth++;
    else if (str[i] === '}') {
      depth--;
      if (depth === 0) return str.slice(start, i + 1);
    }
  }
  return null;
}

export function parseDesmosResponse(raw) {
  if (!raw) return null;

  // 1. Try a ```json ... ``` or ``` ... ``` code fence (case-insensitive)
  const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);

  let parsed = null;

  if (fenceMatch) {
    parsed = tryParseJson(fenceMatch[1].trim());
  }

  // 2. Fallback: parse entire raw string (model returned bare JSON)
  if (!parsed) {
    parsed = tryParseJson(raw.trim());
  }

  // 3. Last resort: find first balanced {...} block anywhere in the string
  //    (handles models that emit explanatory text before/after the JSON object)
  if (!parsed) {
    const extracted = extractFirstJsonObject(raw);
    if (extracted) parsed = tryParseJson(extracted);
  }

  if (!parsed) return null;

  // Validate minimum structure
  if (!Array.isArray(parsed.expressions)) return null;

  // Deduplicate expression IDs — Desmos silently breaks if two expressions share an id
  const seenIds = new Set();
  const deduped = parsed.expressions.map((e, i) => {
    let id = e.id || `e${i + 1}`;
    if (seenIds.has(id)) id = `${id}_${i}`;
    seenIds.add(id);
    return { ...e, id };
  });

  // Merge split parametric pairs: x=f(t) immediately followed by y=g(t)
  // → single expression (f(t),g(t)) with the parametricDomain of either
  const merged = [];
  for (let i = 0; i < deduped.length; i++) {
    const cur  = deduped[i];
    const next = deduped[i + 1];
    const xMatch = cur.latex  && cur.latex.match(/^x\s*=\s*(.+)$/);
    const yMatch = next?.latex && next.latex.match(/^y\s*=\s*(.+)$/);
    if (xMatch && yMatch) {
      merged.push({
        ...cur,
        latex: `(${xMatch[1]},${yMatch[1]})`,
        parametricDomain: cur.parametricDomain || next.parametricDomain,
      });
      i++; // skip the y= expression
    } else {
      merged.push(cur);
    }
  }

  // Normalise — fill in defaults
  return {
    expressions: merged.map((e, i) => {
      // Tables use `columns` not `latex` — don't inject expression-only fields
      if (e.type === "table") {
        return {
          type: "table",
          id: e.id || `t${i + 1}`,
          columns: e.columns || [],
        };
      }
      return {
        ...e,
        id: e.id || `e${i + 1}`,
        latex: sanitizeLatex(e.latex || ""),
        color: e.color || DESMOS_COLORS.solBlue,
        label: e.label || "",
        showLabel: e.showLabel ?? (!!e.label),
        hidden: e.hidden ?? false,
      };
    }),
    viewport: parsed.viewport || { left: -10, bottom: -10, right: 10, top: 10 },
    showGrid:     parsed.showGrid     ?? true,
    showAxes:     parsed.showAxes     ?? true,
    degreeMode:   parsed.degreeMode   ?? false,
    polarMode:    parsed.polarMode    ?? false,
    xAxisStep:    parsed.xAxisStep    ?? null,
    yAxisStep:    parsed.yAxisStep    ?? null,
    xAxisNumbers: parsed.xAxisNumbers ?? null,
    yAxisNumbers: parsed.yAxisNumbers ?? null,
    xAxisLabel:   parsed.xAxisLabel   ?? null,
    yAxisLabel:   parsed.yAxisLabel   ?? null,
    title: parsed.title || "",
  };
}
