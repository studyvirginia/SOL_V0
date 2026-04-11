/**
 * /pages/engine-test.js
 *
 * Developer tool: side-by-side comparison of Matplotlib, GeoGebra, and Desmos
 * for the same math problem spec. Accessible at /engine-test.
 */

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import Head from "next/head";

const GeoGebraRenderer = dynamic(() => import("../components/GeoGebraRenderer"), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-[320px] text-xs text-gray-400">Loading GeoGebra…</div>,
});

const DesmosRenderer = dynamic(() => import("../components/DesmosRenderer"), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-[320px] text-xs text-gray-400">Loading Desmos…</div>,
});

const DesmosGeometryRenderer = dynamic(() => import("../components/DesmosGeometryRenderer"), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-[320px] text-xs text-gray-400">Loading Desmos Geometry…</div>,
});

// ─── Preset test cases ───────────────────────────────────────────────────────

// ─── Preset categories ────────────────────────────────────────────────────────
// Each preset has: label (chip text), category, spec (sent to all 4 engines).
// Spec fields: type, equations, label_points, find, description, course, notes.
// Geometry specs: NO coordinate grid — pure labeled diagrams with vertices,
//   angle marks, tick marks, and side/angle labels.

const PRESETS = [

  // ── ALGEBRA 1 ────────────────────────────────────────────────────────────────

  {
    label: "Quadratic — vertex & roots",
    category: "Algebra 1",
    spec: {
      type: "function",
      equations: ["y = x^2 - 5x + 4"],
      label_points: [
        { x: 2.5,  y: -2.25, label: "V(2.5, −2.25)" },
        { x: 1,    y: 0,     label: "x=1" },
        { x: 4,    y: 0,     label: "x=4" },
        { x: 0,    y: 4,     label: "y-int (0,4)" },
      ],
      find: [{ x: 1, y: 0 }, { x: 4, y: 0 }],
      course: "algebra_1",
      notes: "Standard form quadratic y=x²−5x+4. Label vertex, both x-intercepts, and y-intercept. Axis of symmetry x=2.5 as a dashed vertical line. Open upward. Use question markers (open dots) on the roots for A.EI.3.",
    },
  },

  {
    label: "Linear system — intersection",
    category: "Algebra 1",
    spec: {
      type: "function",
      equations: ["y = 2x - 1", "y = -x + 5"],
      label_points: [
        { x: 2, y: 3,  label: "Solution (2, 3)" },
        { x: 0, y: -1, label: "(0,−1)" },
        { x: 0, y: 5,  label: "(0, 5)" },
      ],
      find: [{ x: 2, y: 3 }],
      course: "algebra_1",
      notes: "System of two linear equations. Draw both lines with distinct colors. Mark the intersection point (2,3) with a solid dot labeled 'Solution'. Label each y-intercept. For A.EI.2 — graphical solution of a system.",
    },
  },

  {
    label: "Exponential growth vs decay",
    category: "Algebra 1",
    spec: {
      type: "function",
      equations: ["y = 2^x", "y = (1/2)^x"],
      label_points: [
        { x: 0,  y: 1,  label: "(0,1) — shared y-int" },
        { x: 2,  y: 4,  label: "growth" },
        { x: -2, y: 4,  label: "decay" },
      ],
      course: "algebra_1",
      notes: "Compare exponential growth y=2^x (blue) and exponential decay y=(½)^x (red) on the same axes. Both pass through (0,1). Asymptote y=0 drawn as dashed line. Window x in [−4,4], y in [0,10]. For A.F.2.",
    },
  },

  {
    label: "Absolute value inequality",
    category: "Algebra 1",
    spec: {
      type: "function",
      equations: ["y = |2x - 3|", "y = 5"],
      label_points: [
        { x: 4,  y: 5,  label: "(4, 5)" },
        { x: -1, y: 5,  label: "(−1, 5)" },
        { x: 1.5, y: 0, label: "vertex (1.5, 0)" },
      ],
      find: [{ x: 4, y: 5 }, { x: -1, y: 5 }],
      course: "algebra_1",
      notes: "Graph y=|2x−3| and horizontal line y=5. Shade the region BELOW y=5 on the V-shape to illustrate |2x−3|≤5. Label intersection points (−1,5) and (4,5) with open/closed dots matching strict vs non-strict inequality. For A.EI.1.",
    },
  },

  // ── ALGEBRA 2 ────────────────────────────────────────────────────────────────

  {
    label: "Rational function — asymptotes",
    category: "Algebra 2",
    spec: {
      type: "function",
      equations: ["y = (2x - 3) / (x - 1)"],
      label_points: [
        { x: 0,    y: 3,    label: "(0, 3)" },
        { x: 1.5,  y: 0,    label: "x-int (1.5, 0)" },
      ],
      course: "algebra_2",
      notes: "Rational function y=(2x−3)/(x−1). Draw vertical asymptote x=1 (dashed red) and horizontal asymptote y=2 (dashed blue), each labeled. Show both branches. Mark hole if any. Window x in [−5,7], y in [−8,12]. This tests A.F.1 asymptote analysis.",
    },
  },

  {
    label: "Log vs exponential inverse",
    category: "Algebra 2",
    spec: {
      type: "function",
      equations: ["y = log2(x)", "y = 2^x", "y = x"],
      label_points: [
        { x: 1,  y: 0,  label: "(1, 0) log" },
        { x: 0,  y: 1,  label: "(0, 1) exp" },
        { x: 2,  y: 1,  label: "(2, 1)" },
        { x: 1,  y: 2,  label: "(1, 2)" },
      ],
      course: "algebra_2",
      notes: "Show y=log₂(x) and y=2^x as inverses, reflected over y=x (dashed). All three curves labeled. Mark the point (1,0) on log and (0,1) on exp. Window [−3,5]×[−3,5]. For A2.F.1 — log/exponential inverse relationship.",
    },
  },

  {
    label: "Polynomial — multiplicity",
    category: "Algebra 2",
    spec: {
      type: "function",
      equations: ["y = (x + 2)^2 * (x - 1)"],
      label_points: [
        { x: -2, y: 0, label: "touch (−2, 0) mult 2" },
        { x: 1,  y: 0, label: "cross (1, 0) mult 1" },
        { x: 0,  y: 4, label: "(0, 4)" },
      ],
      course: "algebra_2",
      notes: "Cubic y=(x+2)²(x−1). At x=−2 the graph TOUCHES and turns (even multiplicity, tangent to x-axis). At x=1 the graph CROSSES (odd multiplicity). Label both zeros with solid dots and describe multiplicity in margin annotations. For A2.EO.3.",
    },
  },

  // ── TRIGONOMETRY ─────────────────────────────────────────────────────────────

  {
    label: "Sinusoidal — phase & amplitude",
    category: "Trigonometry",
    spec: {
      type: "trig",
      equations: ["y = 3 * sin(2x - pi/3)"],
      label_points: [
        { x: 0.5236, y: 0,    label: "phase shift π/6" },
        { x: 1.0996, y: 3,    label: "max (3)" },
        { x: 2.618,  y: -3,   label: "min (−3)" },
        { x: 0,      y: -2.6, label: "y-int" },
      ],
      course: "trig",
      notes: "Graph y=3sin(2x−π/3). Amplitude=3 (label with bracket). Period=π (label one full cycle with arrows). Phase shift=π/6 right (label). Mark maximum (π/6+π/4, 3) and minimum. Midline y=0 as dashed. For T.GT.1.",
    },
  },

  {
    label: "Unit circle — key angles",
    category: "Trigonometry",
    spec: {
      type: "geometry",
      equations: ["x^2 + y^2 = 1"],
      label_points: [
        { x: 1,       y: 0,      label: "0° (1,0)" },
        { x: 0.866,   y: 0.5,    label: "30° (√3/2, 1/2)" },
        { x: 0.707,   y: 0.707,  label: "45° (√2/2, √2/2)" },
        { x: 0.5,     y: 0.866,  label: "60° (1/2, √3/2)" },
        { x: 0,       y: 1,      label: "90° (0,1)" },
        { x: -1,      y: 0,      label: "180° (−1,0)" },
        { x: 0,       y: -1,     label: "270° (0,−1)" },
      ],
      course: "trig",
      notes: "Unit circle with radius drawn to 30°, 45°, 60°, 90°, 180°, 270°. Label every key angle with its degree AND radian AND coordinate. Draw reference triangle for 30° (dashed). For T.CT.2.",
    },
  },

  {
    label: "Law of Cosines — triangle",
    category: "Trigonometry",
    spec: {
      type: "geometry",
      description: "Non-right triangle: side a=7, side b=10, included angle C=50°. Find side c.",
      label_points: [],
      course: "trig",
      notes: "Draw triangle ABC with NO coordinate grid. Label: side AB=c (unknown, marked with '?'), side BC=a=7, side AC=b=10, angle C=50° with an arc and degree label. Mark ALL three vertices A, B, C. No tick marks needed since sides are labeled numerically. This is the setup diagram for Law of Cosines (T.TT.2).",
    },
  },

  // ── GEOMETRY (pure labeled diagrams, no coordinate grid) ────────────────────

  {
    label: "Parallel lines — transversal angles",
    category: "Geometry",
    spec: {
      type: "geometry",
      description: "Two parallel lines m and n cut by transversal t. Angle 1 = 115°. Label all 8 angles formed.",
      label_points: [],
      course: "geometry",
      notes: "Draw two horizontal parallel lines labeled 'm' and 'n' with arrows on both ends. Draw transversal 't' crossing both at an angle. Label the 4 angles at each intersection (∠1–∠8). Show ∠1=115°. Use arrow marks ('>') on both parallel lines. Mark all 8 angle values: alternating interior (65°), co-interior (supplementary). No axes, no grid. For G.RLT.2.",
    },
  },

  {
    label: "Triangle — angle bisector & median",
    category: "Geometry",
    spec: {
      type: "geometry",
      description: "Scalene triangle ABC. Draw the angle bisector from A to side BC (label foot D). Draw the median from B to midpoint M of AC. Label all segments: AB, BC, CA, AD, BD, AM, MC.",
      label_points: [],
      course: "geometry",
      notes: "Scalene triangle ABC with NO grid. Label vertices A (top), B (bottom-left), C (bottom-right). Angle bisector from A meets BC at D — label AD and mark equal angles ∠BAD = ∠CAD with single arcs. Median from B meets midpoint M of AC — label BM and mark AM=MC with single tick marks. Distinct dashed lines for bisector vs median. For G.TR.1.",
    },
  },

  {
    label: "Triangle similarity — AA proof",
    category: "Geometry",
    spec: {
      type: "geometry",
      description: "Two similar triangles △ABC ~ △DEF. Show AA similarity: ∠A=∠D=40°, ∠B=∠E=75°, so ∠C=∠F=65°. Label all sides and angles.",
      label_points: [],
      course: "geometry",
      notes: "Draw two triangles side by side (not overlapping). LEFT triangle △ABC: label all three vertices, all three angles with arc marks (40°, 75°, 65°), label sides a=BC, b=CA, c=AB. RIGHT triangle △DEF: same structure but visibly larger or smaller. Mark matching angle pairs with single/double/triple arcs. Write the correspondence △ABC ~ △DEF below. No grid. For G.TR.3.",
    },
  },

  {
    label: "Isosceles triangle — base angles",
    category: "Geometry",
    spec: {
      type: "geometry",
      description: "Isosceles triangle PQR with PQ=PR (legs), base QR. The vertex angle at P = 48°. Find the base angles at Q and R.",
      label_points: [],
      course: "geometry",
      notes: "Isosceles triangle with vertex P at top, base QR at bottom. Mark PQ=PR with double tick marks. Label vertex angle ∠P=48° with arc. Mark base angles ∠Q=∠R=66° with arcs (base angle theorem result). Label all three sides: PQ, PR, QR. No coordinate grid. For G.TR.1.",
    },
  },

  {
    label: "Circle — inscribed angle theorem",
    category: "Geometry",
    spec: {
      type: "geometry",
      description: "Circle with center O. Chord AB is a diameter. Point C is on the circle (not on AB). Show that inscribed angle ∠ACB = 90°. Also label central angle ∠AOB = 180°.",
      label_points: [],
      course: "geometry",
      notes: "Draw a circle with center O labeled. Draw diameter AB (a chord through center) with endpoints labeled A and B. Draw point C on the circle in the upper arc. Draw CA and CB. Mark ∠ACB = 90° with a small square corner symbol. Mark ∠AOB = 180° (straight angle). Label the radius OA = OB = r with tick marks. No grid. For G.PC.3.",
    },
  },

  {
    label: "Quadrilateral — parallelogram properties",
    category: "Geometry",
    spec: {
      type: "geometry",
      description: "Parallelogram ABCD. Show: opposite sides equal (AB=CD, AD=BC), opposite angles equal (∠A=∠C=70°, ∠B=∠D=110°), and diagonals bisect each other at point E.",
      label_points: [],
      course: "geometry",
      notes: "Draw parallelogram ABCD (A bottom-left, B bottom-right, C top-right, D top-left) with NO grid. Mark AB=CD with single ticks, AD=BC with double ticks. Label angles ∠A=70°, ∠B=110°, ∠C=70°, ∠D=110° with arcs. Draw both diagonals intersecting at E. Mark AE=EC with single ticks and BE=ED with double ticks (diagonals bisect each other). For G.PC.1.",
    },
  },

  // ── STATISTICS ───────────────────────────────────────────────────────────────

  {
    label: "Normal dist — empirical rule",
    category: "Statistics",
    spec: {
      type: "function",
      equations: ["y = (1/sqrt(2*pi)) * exp(-x^2/2)"],
      label_points: [
        { x: 0,  y: 0.399, label: "μ=0" },
        { x: 1,  y: 0.242, label: "μ+σ" },
        { x: -1, y: 0.242, label: "μ−σ" },
        { x: 2,  y: 0.054, label: "μ+2σ" },
        { x: -2, y: 0.054, label: "μ−2σ" },
        { x: 3,  y: 0.004, label: "μ+3σ" },
        { x: -3, y: 0.004, label: "μ−3σ" },
      ],
      course: "prob_stats",
      notes: "Standard normal curve. Use DISTINCT colors to shade: 68% region between −1σ and +1σ (lightest), 95% between −2σ and +2σ (medium), 99.7% between −3σ and +3σ (darkest). Label each shaded band with its percentage. Label the x-axis with σ units, not raw values. For PS.P.3 empirical rule.",
    },
  },

  {
    label: "Scatter plot — line of best fit",
    category: "Statistics",
    spec: {
      type: "scatter",
      description: "Scatter plot of hours studied (x) vs test score (y). Points: (1,52),(2,58),(3,65),(4,70),(4,74),(5,78),(6,82),(7,85),(8,91),(9,88),(10,95). Draw line of best fit and label its equation.",
      label_points: [],
      course: "prob_stats",
      notes: "Plot all 11 data points as filled circles. Draw line of best fit (approximately y=4.5x+47). Label the equation on the line. Label axes 'Hours Studied' (x) and 'Test Score' (y). Include axis tick labels. Annotate r≈0.98 in the upper-left corner. Window: x [0,11], y [40,100]. For PS.DC.2 and A.ST.1.",
    },
  },

  // ── GRADE 7 ──────────────────────────────────────────────────────────────────

  {
    label: "Integer number line — operations",
    category: "Grade 7",
    spec: {
      type: "number_line",
      description: "Number line showing the sum (−4) + 7 = 3. Start at 0, draw first arrow 4 units left to −4 (red), then second arrow 7 units right from −4 to 3 (blue). Label start, end, and result.",
      label_points: [],
      course: "grade_7",
      notes: "Horizontal number line from −7 to 7 with integer tick marks labeled every unit. Show movement: curved arrow from 0 to −4 (red, labeled '−4'), then curved arrow from −4 to +3 (blue, labeled '+7'). Mark endpoint 3 with a solid dot labeled '3'. Above the line write '(−4) + 7 = 3'. For 7.CE.1.",
    },
  },

  {
    label: "Proportional — graphical ratio",
    category: "Grade 7",
    spec: {
      type: "function",
      equations: ["y = 2.5 * x"],
      label_points: [
        { x: 0,  y: 0,   label: "(0, 0)" },
        { x: 2,  y: 5,   label: "(2, 5)" },
        { x: 4,  y: 10,  label: "(4, 10)" },
        { x: 6,  y: 15,  label: "(6, 15)" },
      ],
      course: "grade_7",
      notes: "Proportional relationship y=2.5x (unit rate = $2.50 per mile). Draw straight line through origin. Plot and label those four points with solid dots. Label the slope/unit rate with a rise-over-run triangle between (2,5) and (4,10) showing Δy=5, Δx=2, rate=2.5. Axes labeled 'Miles' and 'Cost ($)'. For 7.PFA.1.",
    },
  },

  // ── ADVANCED BOUNDARY STRESS TESTS ──────────────────────────────────────────

  {
    label: "Polar — limacon with inner loop",
    category: "Trig / Advanced",
    spec: {
      type: "polar",
      equations: ["r = 1 + 2*cos(theta)"],
      label_points: [
        { label: "outer max r=3 at θ=0" },
        { label: "inner loop start at θ=2π/3" },
        { label: "passes through origin at θ=2π/3, 4π/3" },
      ],
      course: "trig",
      notes: "Limaçon r=1+2cos(θ) — has an INNER LOOP. Full curve θ from 0 to 2π. Label the outermost point (3,0) in Cartesian as (3,0). Label where inner loop crosses origin. Mark the cusp of the inner loop. Draw on polar axes (or convert and show on standard axes). This exercises the most complex polar shape. For T.IE.3.",
    },
  },

  {
    label: "3-D — cone surface area setup",
    category: "Geometry / 3-D",
    spec: {
      type: "geometry",
      description: "Right circular cone with radius r=5 cm and slant height l=13 cm. Label all measurements and show the net (unrolled lateral surface = sector).",
      label_points: [],
      course: "geometry",
      notes: "Draw a 3-D cone in perspective (dashed lines for hidden edges). Label: radius r=5cm at the base with a double-headed arrow, height h=12cm as a dashed vertical line from apex to center of base, slant height l=13cm along the side. Mark the right angle between h and r at the base center. Below the cone draw the net: a circle (base, labeled r=5) plus a sector (lateral face, labeled arc length=2πr=10π, radius=l=13). For G.DF.1.",
    },
  },
];

// ─── Single engine column ─────────────────────────────────────────────────────

const ENGINE_LABELS = {
  matplotlib:  "Matplotlib",
  geogebra:    "GeoGebra",
  "desmos-2d": "Desmos 2D",
  "desmos-geo": "Desmos Geometry",
};

function EngineColumn({ label, result, loading, elapsed, onCopyCode }) {
  const labelColors = {
    matplotlib:   "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
    geogebra:     "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
    "desmos-2d":  "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
    "desmos-geo": "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${labelColors[label]}`}>
          {ENGINE_LABELS[label] || label}
        </span>
        {elapsed !== null && (
          <span className="text-[10px] text-gray-400 font-mono">{elapsed}ms</span>
        )}
      </div>

      {/* Render area */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden min-h-[320px] flex flex-col">
        {loading && (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 h-[320px]">
            <div className="h-6 w-6 rounded-full border-2 border-gray-300 border-t-blue-500 animate-spin" />
            <span className="text-xs text-gray-400">Generating…</span>
          </div>
        )}

        {!loading && result?.error && (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 p-4 h-[320px]">
            <span className="text-xs font-bold text-red-500 uppercase tracking-wide">Error</span>
            <p className="text-xs text-red-400 text-center max-w-[260px] font-mono leading-relaxed">
              {result.error}
            </p>
          </div>
        )}

        {!loading && result?.pngBase64 && (
          <img
            src={`data:image/png;base64,${result.pngBase64}`}
            alt={`${label} render`}
            className="w-full object-contain"
          />
        )}

        {!loading && result?.ggbState && (
          <div className="h-[320px]">
            <GeoGebraRenderer state={result.ggbState} />
          </div>
        )}

        {!loading && result?.desmosState && (
          <div className="h-[320px]">
            <DesmosRenderer state={result.desmosState} />
          </div>
        )}

        {!loading && result?.geometryState && (
          result.geometryState.notApplicable
            ? <div className="flex-1 flex items-center justify-center h-[320px] text-xs text-gray-400 italic px-4 text-center">N/A — this spec is not a geometric construction</div>
            : <div className="h-[320px]"><DesmosGeometryRenderer state={result.geometryState} /></div>
        )}

        {!loading && !result && (
          <div className="flex-1 flex items-center justify-center h-[320px]">
            <span className="text-xs text-gray-300 dark:text-gray-600">Not yet rendered</span>
          </div>
        )}
      </div>

      {/* Code peek for matplotlib */}
      {result?.pythonCode && (
        <button
          onClick={() => onCopyCode(result.pythonCode)}
          className="text-[11px] text-left text-gray-400 hover:text-orange-500 transition-colors font-mono truncate px-1"
          title={result.pythonCode}
        >
          {result.pythonCode.split("\n")[0].slice(0, 60)}…  <span className="text-orange-400">[copy]</span>
        </button>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function EngineTest() {
  const [activePreset, setActivePreset] = useState(null);
  const [customSpec, setCustomSpec] = useState(
    JSON.stringify({ type: "function", equations: ["y = x^2 - 4"], label_points: [], course: "algebra_1", notes: "" }, null, 2)
  );
  const [specError, setSpecError] = useState(null);

  const [results, setResults] = useState({ matplotlib: null, geogebra: null, "desmos-2d": null, "desmos-geo": null });
  const [loading, setLoading] = useState({ matplotlib: false, geogebra: false, "desmos-2d": false, "desmos-geo": false });
  const [elapsed, setElapsed] = useState({ matplotlib: null, geogebra: null, "desmos-2d": null, "desmos-geo": null });
  const [copied, setCopied] = useState(false);

  const runEngine = useCallback(async (engineKey, spec, startTime) => {
    const endpoint =
      engineKey === "matplotlib"  ? "/api/matplotlib-generate" :
      engineKey === "geogebra"    ? "/api/geogebra-generate" :
      engineKey === "desmos-2d"   ? "/api/desmos-generate" :
                                    "/api/desmos-geometry-generate";

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(spec),
      });
      const data = await res.json();
      const ms = Date.now() - startTime;
      setElapsed(prev => ({ ...prev, [engineKey]: ms }));
      setResults(prev => ({ ...prev, [engineKey]: data }));
    } catch (err) {
      const ms = Date.now() - startTime;
      setElapsed(prev => ({ ...prev, [engineKey]: ms }));
      setResults(prev => ({ ...prev, [engineKey]: { error: err.message } }));
    } finally {
      setLoading(prev => ({ ...prev, [engineKey]: false }));
    }
  }, []);

  const runAll = useCallback((spec) => {
    setResults({ matplotlib: null, geogebra: null, "desmos-2d": null, "desmos-geo": null });
    setElapsed({ matplotlib: null, geogebra: null, "desmos-2d": null, "desmos-geo": null });
    setLoading({ matplotlib: true, geogebra: true, "desmos-2d": true, "desmos-geo": true });

    const t = Date.now();
    runEngine("matplotlib",  spec, t);
    runEngine("geogebra",    spec, t);
    runEngine("desmos-2d",   spec, t);
    runEngine("desmos-geo",  spec, t);
  }, [runEngine]);

  const handlePreset = (preset, idx) => {
    setActivePreset(idx);
    setCustomSpec(JSON.stringify(preset.spec, null, 2));
    runAll(preset.spec);
  };

  const handleCustomRun = () => {
    try {
      const spec = JSON.parse(customSpec);
      setSpecError(null);
      setActivePreset(null);
      runAll(spec);
    } catch (e) {
      setSpecError("Invalid JSON: " + e.message);
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const anyLoading = Object.values(loading).some(Boolean);

  return (
    <>
      <Head>
        <title>Engine Test — SOL</title>
      </Head>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans">
        {/* Header */}
        <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold tracking-tight">SOL Engine Test</h1>
            <p className="text-xs text-gray-400 mt-0.5">Matplotlib · GeoGebra · Desmos 2D · Desmos Geometry — side by side</p>
          </div>
          <a href="/" className="text-xs text-blue-500 hover:underline">← Back to app</a>
        </header>

        <main className="max-w-[1400px] mx-auto p-6 space-y-6">
          {/* Preset strip — grouped by category */}
          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Preset test cases</h2>
            {(() => {
              const groups = {};
              PRESETS.forEach((p, i) => {
                const cat = p.category || "Other";
                if (!groups[cat]) groups[cat] = [];
                groups[cat].push({ ...p, _idx: i });
              });
              return Object.entries(groups).map(([cat, items]) => (
                <div key={cat} className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 w-28 shrink-0">{cat}</span>
                  {items.map(p => (
                    <button
                      key={p._idx}
                      onClick={() => handlePreset(p, p._idx)}
                      disabled={anyLoading}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all disabled:opacity-50 ${
                        activePreset === p._idx
                          ? "bg-blue-600 border-blue-600 text-white"
                          : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-blue-400"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              ));
            })()}
          </section>

          {/* Custom spec editor */}
          <section className="flex gap-4 items-start">
            <div className="flex-1">
              <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Custom spec (JSON)</h2>
              <textarea
                value={customSpec}
                onChange={e => { setCustomSpec(e.target.value); setSpecError(null); }}
                className="w-full h-[140px] font-mono text-xs bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none"
                spellCheck={false}
              />
              {specError && <p className="text-xs text-red-500 mt-1">{specError}</p>}
            </div>
            <div className="flex flex-col gap-2 mt-6">
              <button
                onClick={handleCustomRun}
                disabled={anyLoading}
                className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 whitespace-nowrap"
              >
                {anyLoading ? "Running…" : "Run All Engines"}
              </button>
              {copied && <span className="text-xs text-green-500 text-center">Copied!</span>}
            </div>
          </section>

          {/* 4-column results */}
          <section>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
              <EngineColumn
                label="matplotlib"
                result={results.matplotlib}
                loading={loading.matplotlib}
                elapsed={elapsed.matplotlib}
                onCopyCode={handleCopyCode}
              />
              <EngineColumn
                label="geogebra"
                result={results.geogebra}
                loading={loading.geogebra}
                elapsed={elapsed.geogebra}
                onCopyCode={handleCopyCode}
              />
              <EngineColumn
                label="desmos-2d"
                result={results["desmos-2d"]}
                loading={loading["desmos-2d"]}
                elapsed={elapsed["desmos-2d"]}
                onCopyCode={handleCopyCode}
              />
              <EngineColumn
                label="desmos-geo"
                result={results["desmos-geo"]}
                loading={loading["desmos-geo"]}
                elapsed={elapsed["desmos-geo"]}
                onCopyCode={handleCopyCode}
              />
            </div>
          </section>

          {/* Response details (collapsed) */}
          {(results.matplotlib || results.geogebra || results["desmos-2d"] || results["desmos-geo"]) && (
            <section>
              <details className="group">
                <summary className="cursor-pointer text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 select-none">
                  Raw API responses
                </summary>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-3">
                  {["matplotlib", "geogebra", "desmos-2d", "desmos-geo"].map(key => (
                    <div key={key} className="bg-gray-900 rounded-xl p-3 overflow-auto max-h-[300px]">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">{key}</p>
                      <pre className="text-[10px] text-gray-300 whitespace-pre-wrap break-all leading-relaxed">
                        {results[key]
                          ? JSON.stringify(
                              // Strip pngBase64 from display to keep it readable
                              key === "matplotlib"
                                ? { ...results[key], pngBase64: results[key].pngBase64 ? `[${Math.round((results[key].pngBase64.length * 3) / 4 / 1024)}KB PNG]` : undefined }
                                : results[key],
                              null, 2
                            )
                          : "—"
                        }
                      </pre>
                    </div>
                  ))}
                </div>
              </details>
            </section>
          )}
        </main>
      </div>
    </>
  );
}
