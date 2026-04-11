/**
 * /pages/diagram-dashboard.js
 *
 * Full test dashboard for the Matplotlib + Penrose stack.
 * Covers every diagram type category from GRAPH_TYPES_NEEDED.md.
 *
 * Engines:
 *   🟠 Matplotlib — all quantitative/plotted diagrams (via /api/matplotlib-generate)
 *   🔵 Penrose    — all structural/relational diagrams (client-side SVG layout)
 *
 * Visit: /diagram-dashboard
 */

import { useState, useCallback, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import Head from "next/head";
import {
  TRIO_VENN_2_INTERSECT,
  TRIO_VENN_2_DISJOINT,
  TRIO_VENN_3_ALL,
  TRIO_EULER_SUBSET,
  TRIO_EULER_NESTED,
  TRIO_VENN_LOGIC,
  TRIO_GRAPH_PENTAGON,
  TRIO_GRAPH_TREE,
  TRIO_DIGRAPH_DAG,
  TRIO_FOOD_WEB,
  TRIO_PROB_TREE,
  TRIO_SPANNING_TREE,
  // New — graph theory
  TRIO_COMPLETE_K4,
  TRIO_BIPARTITE,
  TRIO_CYCLE_C6,
  TRIO_EXPR_TREE,
  // New — geometry
  TRIO_TRIANGLE_LABELED,
  TRIO_RIGHT_TRIANGLE,
  TRIO_CONGRUENT_TRIANGLES,
  TRIO_SIMILAR_TRIANGLES,
  TRIO_QUADRILATERAL,
  TRIO_POLYGON_PENTAGON,
  TRIO_POLYGON_HEXAGON,
  TRIO_TRIANGLE_MEDIAN,
  // More geometry (25-27)
  TRIO_ISOSCELES_TRIANGLE,
  TRIO_ANGLE_ARC,
  TRIO_VECTOR_ADDITION,
} from "../lib/penroseTrios";

const PenroseRenderer = dynamic(() => import("../components/PenroseRenderer"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-52 text-xs text-slate-400 animate-pulse">
      Loading Penrose…
    </div>
  ),
});

// ─── Specimen catalogue ───────────────────────────────────────────────────────
// engine: "matplotlib" → spec sent to /api/matplotlib-generate
// engine: "penrose"    → trio rendered client-side by PenroseRenderer

const SPECIMENS = [
  // ── 1. FUNCTIONS & ALGEBRA ─────────────────────────────────────────────────
  {
    id: "alg-linear",
    label: "Linear y = 2x − 3",
    section: "Functions & Algebra",
    engine: "matplotlib",
    spec: {
      type: "function",
      equations: ["y = 2*x - 3"],
      label_points: [
        { x: 0, y: -3, label: "y-int (0,−3)" },
        { x: 1.5, y: 0, label: "x-int (1.5, 0)" },
      ],
      notes: "Show x and y axes crossing at origin. Label slope m=2 as rise/run annotation. Grid on.",
      course: "Algebra 1",
    },
  },
  {
    id: "alg-quad",
    label: "Quadratic — vertex & roots",
    section: "Functions & Algebra",
    engine: "matplotlib",
    spec: {
      type: "function",
      equations: ["y = x**2 - 5*x + 4"],
      label_points: [
        { x: 2.5, y: -2.25, label: "V(2.5, −2.25)" },
        { x: 1, y: 0, label: "x=1" },
        { x: 4, y: 0, label: "x=4" },
        { x: 0, y: 4, label: "(0,4)" },
      ],
      notes: "Show the parabola from x=-1 to x=6. Mark vertex and roots. Axis of symmetry x=2.5 as dashed line.",
      course: "Algebra 1",
    },
  },
  {
    id: "alg-exp",
    label: "Exponential growth & decay",
    section: "Functions & Algebra",
    engine: "matplotlib",
    spec: {
      type: "function",
      equations: ["y = 2**x", "y = (0.5)**x"],
      label_points: [
        { x: 0, y: 1, label: "(0,1)" },
      ],
      notes: "Plot both curves on [-3, 4]. Label y=2^x as 'growth' and y=(0.5)^x as 'decay'. Show horizontal asymptote y=0. Different colors.",
      course: "Algebra 1",
    },
  },
  {
    id: "alg-log",
    label: "Logarithmic function",
    section: "Functions & Algebra",
    engine: "matplotlib",
    spec: {
      type: "function",
      equations: ["y = np.log2(x)"],
      label_points: [
        { x: 1, y: 0, label: "(1, 0)" },
        { x: 2, y: 1, label: "(2, 1)" },
        { x: 4, y: 2, label: "(4, 2)" },
      ],
      notes: "Show vertical asymptote x=0 as dashed line. Domain x > 0 only. Range from x=0.1 to x=10.",
      course: "Algebra 2",
    },
  },
  {
    id: "alg-rational",
    label: "Rational function with asymptotes",
    section: "Functions & Algebra",
    engine: "matplotlib",
    spec: {
      type: "function",
      equations: ["y = (x+1) / (x-2)"],
      notes: "Show vertical asymptote x=2 (dashed red) and horizontal asymptote y=1 (dashed gray). Handle discontinuity at x=2 by plotting on (-5,1.9) and (2.1,8) separately.",
      course: "Algebra 2",
    },
  },
  {
    id: "alg-poly3",
    label: "Polynomial degree 3",
    section: "Functions & Algebra",
    engine: "matplotlib",
    spec: {
      type: "function",
      equations: ["y = x**3 - 3*x"],
      label_points: [
        { x: -1.73, y: 0, label: "x≈−1.73" },
        { x: 0, y: 0, label: "(0,0)" },
        { x: 1.73, y: 0, label: "x≈1.73" },
        { x: -1, y: 2, label: "local max" },
        { x: 1, y: -2, label: "local min" },
      ],
      notes: "Mark local max and min with dots. Show zeros. End behavior: → -∞ as x→-∞, → +∞ as x→+∞.",
      course: "Algebra 2",
    },
  },
  {
    id: "alg-system-linear",
    label: "System of linear equations",
    section: "Functions & Algebra",
    engine: "matplotlib",
    spec: {
      type: "function",
      equations: ["y = 2*x - 1", "y = -x + 5"],
      label_points: [
        { x: 2, y: 3, label: "Solution (2,3)" },
      ],
      notes: "Plot both lines. Mark intersection point with a filled circle. Show x=-1 to x=5.",
      course: "Algebra 1",
    },
  },
  {
    id: "alg-inequalities",
    label: "System of linear inequalities",
    section: "Functions & Algebra",
    engine: "matplotlib",
    spec: {
      type: "region",
      equations: [],
      description: "Draw a coordinate plane showing the feasible region for the system: y ≤ 2x + 4, y ≥ -x + 1, x ≥ 0. Shade the feasible region in light blue. Draw each boundary line with its equation labeled. Mark the corner vertices of the feasible region with dots and labels.",
      notes: "Use matplotlib fill_between and/or Polygon patch for the shaded region.",
      course: "Algebra 1 / AFDA",
    },
  },

  // ── 2. TRIGONOMETRY ────────────────────────────────────────────────────────
  {
    id: "trig-parent",
    label: "Parent trig functions sin/cos/tan",
    section: "Trigonometry",
    engine: "matplotlib",
    spec: {
      type: "function",
      equations: ["y = np.sin(x)", "y = np.cos(x)", "y = np.tan(x)"],
      notes: "Plot on [-2*pi, 2*pi]. Clip tan to (-4, 4). Label x-axis with multiples of pi (use LaTeX tick labels: -2π, -π, 0, π, 2π). Different colors for each curve. Add legend.",
      course: "Trigonometry",
    },
  },
  {
    id: "trig-transformed",
    label: "Transformed sin: 2sin(3x + π/4) − 1",
    section: "Trigonometry",
    engine: "matplotlib",
    spec: {
      type: "function",
      equations: ["y = 2*np.sin(3*x + np.pi/4) - 1"],
      notes: "Show two full periods. Label amplitude A=2, period T=2π/3, phase shift, vertical shift D=-1 as annotation text on the graph.",
      course: "Trigonometry",
    },
  },
  {
    id: "trig-unit-circle",
    label: "Unit circle with special angles",
    section: "Trigonometry",
    engine: "matplotlib",
    spec: {
      type: "diagram",
      equations: [],
      description: "Draw a unit circle (radius 1) centered at the origin. Mark and label all 16 special angles (0, π/6, π/4, π/3, π/2, 2π/3, 3π/4, 5π/6, π, 7π/6, 5π/4, 4π/3, 3π/2, 5π/3, 7π/4, 11π/6). At each angle, plot a dot on the circle and annotate the (cos θ, sin θ) coordinate in a small font. Show the reference angle lines. Use pastel background.",
      notes: "Use matplotlib patches.Circle and annotate(). Keep font size small (7pt) to avoid overlap.",
      course: "Trigonometry",
    },
  },
  {
    id: "trig-right-triangle",
    label: "Right triangle — trig ratios",
    section: "Trigonometry",
    engine: "matplotlib",
    spec: {
      type: "diagram",
      equations: [],
      description: "Draw a right triangle with legs 3 (horizontal) and 4 (vertical), hypotenuse 5. Place the right angle marker at the origin. Label all three sides with their lengths. Label angle θ at the bottom-left vertex. Show ratios: sin θ = 4/5, cos θ = 3/5, tan θ = 4/3 as a text box. Draw the right angle square marker.",
      course: "Geometry / Trigonometry",
    },
  },

  // ── 3. STATISTICS & DATA ───────────────────────────────────────────────────
  {
    id: "stat-bar",
    label: "Bar graph — categorical data",
    section: "Statistics & Data",
    engine: "matplotlib",
    spec: {
      type: "bar",
      equations: [],
      description: "Vertical bar graph comparing test scores by subject: Math (88), Science (76), English (92), History (81), Art (95). Title: 'Average Test Scores by Subject'. Label each bar with its value on top. Use distinct colors for each bar. Y-axis from 60 to 100.",
      course: "Grade 6",
    },
  },
  {
    id: "stat-histogram",
    label: "Histogram — right-skewed",
    section: "Statistics & Data",
    engine: "matplotlib",
    spec: {
      type: "histogram",
      equations: [],
      description: "Draw a histogram of a right-skewed dataset. Show 8 bins. Title: 'Distribution of Household Income (in $1000s)'. Make the left side tall and bars decreasing to the right. Label axes: X = 'Income ($1000s)', Y = 'Frequency'. Add annotation 'right-skewed' with an arrow pointing to the long right tail.",
      course: "Probability & Statistics",
    },
  },
  {
    id: "stat-boxplot",
    label: "Box plot with outlier",
    section: "Statistics & Data",
    engine: "matplotlib",
    spec: {
      type: "boxplot",
      equations: [],
      description: "Draw a single horizontal box plot for this dataset: min=12, Q1=20, median=27, Q3=35, max=42, outlier at 58. Label Q1, median, Q3, min, max, and outlier. Title: 'Test Scores — Period 3'. Use blue fill for the box.",
      course: "Grade 8 / Prob & Stats",
    },
  },
  {
    id: "stat-parallel-boxplot",
    label: "Parallel boxplots — 2 datasets",
    section: "Statistics & Data",
    engine: "matplotlib",
    spec: {
      type: "boxplot",
      equations: [],
      description: "Draw two horizontal side-by-side box plots, one for 'Pre-Test' (min=40, Q1=52, median=60, Q3=70, max=85) and one for 'Post-Test' (min=55, Q1=68, median=75, Q3=83, max=96). Title: 'Score Distribution Before and After Instruction'. Different colors for each.",
      course: "Probability & Statistics",
    },
  },
  {
    id: "stat-scatter-regression",
    label: "Scatter plot + regression line",
    section: "Statistics & Data",
    engine: "matplotlib",
    spec: {
      type: "scatter",
      equations: [],
      description: "Scatter plot of 20 data points showing positive linear correlation between hours studied (x, range 1-10) and exam score (y, range 50-98). Draw the least-squares regression line. Label the equation ŷ = 5.2x + 45.3 on the plot. Show R²=0.87 in a text box. Axes labeled.",
      course: "Algebra 1 / Prob & Stats",
    },
  },
  {
    id: "stat-normal",
    label: "Normal distribution — Empirical Rule",
    section: "Statistics & Data",
    engine: "matplotlib",
    spec: {
      type: "distribution",
      equations: [],
      description: "Draw a standard normal distribution bell curve (μ=0, σ=1). Shade the region between -1σ and +1σ in dark blue (68%), -2σ to +2σ in medium blue (95%), -3σ to +3σ in light blue (99.7%). Label each shaded region with its percentage. Label x-axis ticks at -3, -2, -1, 0, 1, 2, 3 with σ notation. Add horizontal annotation lines showing each band.",
      course: "Prob & Stats / AFDA",
    },
  },
  {
    id: "stat-pie",
    label: "Circle / pie chart",
    section: "Statistics & Data",
    engine: "matplotlib",
    spec: {
      type: "pie",
      equations: [],
      description: "Pie chart showing time allocation in a school day: Math 20%, Science 15%, English 20%, History 12%, Electives 18%, Lunch/Break 15%. Show percentage labels on each slice. Add a legend. Title: 'School Day Time Allocation'. Use distinct colors with slight explode on the largest slice.",
      course: "Grade 6",
    },
  },
  {
    id: "stat-stemleaf",
    label: "Stem-and-leaf plot",
    section: "Statistics & Data",
    engine: "matplotlib",
    spec: {
      type: "diagram",
      equations: [],
      description: "Create a stem-and-leaf plot as a text-based figure (use ax.text). Data: 23, 25, 31, 33, 33, 37, 41, 44, 45, 48, 52, 55, 57, 62, 68. Stems are the tens digits (2-6), leaves are the ones digits. Show stem | leaf format with a vertical separator line. Title: 'Stem-and-Leaf Plot'. Clean minimal style with no axes box.",
      course: "Grade 5 / Prob & Stats",
    },
  },

  // ── 4. BIOLOGY ─────────────────────────────────────────────────────────────
  {
    id: "bio-growth",
    label: "Population growth — J-curve & S-curve",
    section: "Biology",
    engine: "matplotlib",
    spec: {
      type: "function",
      equations: [],
      description: "Plot two population growth curves on the same axes. (1) J-curve (exponential): N(t) = 10 * e^(0.3t) for t in [0,15]. (2) S-curve (logistic): N(t) = 1000 / (1 + 99*e^(-0.5*t)) for t in [0,15]. Label the J-curve as 'Exponential growth' and the S-curve as 'Logistic growth'. Mark the carrying capacity K=1000 as a horizontal dashed line. X-axis: Time, Y-axis: Population size.",
      course: "Biology I",
    },
  },
  {
    id: "bio-survivorship",
    label: "Survivorship curves (Type I, II, III)",
    section: "Biology",
    engine: "matplotlib",
    spec: {
      type: "function",
      equations: [],
      description: "Plot three survivorship curves on a single graph with log scale on the y-axis. Type I (humans/large mammals): convex curve, high survival early, steep drop late. Type II (birds/rodents): straight diagonal line. Type III (fish/insects): concave curve, low survival early, flat late. Label each curve by type. X-axis: Relative age (0-100%), Y-axis: Number surviving (log scale, 1 to 1000). Title: 'Survivorship Curves'.",
      course: "Biology II Ecology",
    },
  },
  {
    id: "bio-food-web",
    label: "Food web (directed graph)",
    section: "Biology",
    engine: "penrose",
    trio: TRIO_FOOD_WEB,
  },
  {
    id: "bio-prob-tree",
    label: "Probability tree — 2 coin flips",
    section: "Biology",
    engine: "penrose",
    trio: TRIO_PROB_TREE,
  },

  // ── 5. CHEMISTRY ───────────────────────────────────────────────────────────
  {
    id: "chem-heating",
    label: "Heating curve — water",
    section: "Chemistry",
    engine: "matplotlib",
    spec: {
      type: "diagram",
      equations: [],
      description: "Draw a heating curve for water from -30°C to 130°C. Show 5 segments: (1) sloped line for ice heating (−30°C to 0°C), (2) flat plateau at 0°C (melting), (3) sloped line for liquid water heating (0°C to 100°C), (4) flat plateau at 100°C (boiling), (5) sloped line for steam (100°C to 130°C). Label each region: 'Ice', 'Melting', 'Liquid Water', 'Boiling', 'Steam'. Mark 0°C and 100°C with dashed lines. X-axis: Heat Added (J), Y-axis: Temperature (°C).",
      course: "Chemistry I",
    },
  },
  {
    id: "chem-phase-diagram",
    label: "Phase diagram (P-T)",
    section: "Chemistry",
    engine: "matplotlib",
    spec: {
      type: "diagram",
      equations: [],
      description: "Draw a qualitative pressure-temperature phase diagram. Show three regions: Solid (upper left), Liquid (upper middle), Gas (lower right). Draw three boundary curves: solid-liquid (steep positive slope), solid-gas (positive slope from origin area), liquid-gas (positive slope reaching critical point). Mark the triple point where all three meet, and the critical point at the top of the liquid-gas curve. Label each region and both special points. Title: 'Phase Diagram'.",
      course: "Chemistry I / II",
    },
  },
  {
    id: "chem-reaction-rate",
    label: "Reaction rate — concentration vs. time",
    section: "Chemistry",
    engine: "matplotlib",
    spec: {
      type: "function",
      equations: [],
      description: "Plot concentration vs. time for a chemical reaction. Show: [Reactant A] decreasing exponentially from 1.0 mol/L to near 0. [Product B] increasing from 0 to near 1.0 mol/L. Time range 0 to 30 seconds. Label both curves. Add dashed line at equilibrium [A]=[B]=0.5. Title: 'Concentration vs. Time'. Axes labeled with units.",
      course: "Chemistry I",
    },
  },
  {
    id: "chem-decay",
    label: "Radioactive decay curve",
    section: "Chemistry",
    engine: "matplotlib",
    spec: {
      type: "function",
      equations: ["y = 1000 * np.exp(-0.693 * x / 5730)"],
      label_points: [
        { x: 0, y: 1000, label: "N₀ = 1000" },
        { x: 5730, y: 500, label: "½N₀ (t½)" },
        { x: 11460, y: 250, label: "¼N₀" },
      ],
      notes: "Half-life of Carbon-14 = 5730 years. Mark each half-life with dashed vertical lines. X-axis: Time (years), Y-axis: Atoms remaining. Title: 'Radioactive Decay of C-14'.",
      course: "Chemistry I / Earth Science",
    },
  },

  // ── 6. EARTH SCIENCE ───────────────────────────────────────────────────────
  {
    id: "earth-hr-diagram",
    label: "Hertzsprung-Russell (HR) diagram",
    section: "Earth Science",
    engine: "matplotlib",
    spec: {
      type: "diagram",
      equations: [],
      description: "Draw a Hertzsprung-Russell diagram. X-axis: Temperature (K) from 30000 (left) to 3000 (right) — reversed. Y-axis: Luminosity (L/L_sun) on log scale from 0.001 to 1,000,000. Plot the following star groups as clusters of colored dots: Main sequence (diagonal band from upper-left to lower-right, blue to red), Giants (upper right, orange), Supergiants (top right, red), White dwarfs (bottom left, white/gray). Label each group. Mark the Sun's position. Title: 'Hertzsprung-Russell Diagram'.",
      course: "Earth Science II / Astronomy",
    },
  },
  {
    id: "earth-atm-layers",
    label: "Atmospheric layers",
    section: "Earth Science",
    engine: "matplotlib",
    spec: {
      type: "diagram",
      equations: [],
      description: "Draw a horizontal bar diagram of Earth's atmospheric layers on the y-axis (altitude in km, 0 to 600). Color each layer differently: Troposphere (0-12km, light blue), Stratosphere (12-50km, slightly darker blue), Mesosphere (50-85km, medium blue), Thermosphere (85-600km, dark blue). Label each layer with its name and altitude range. Add a temperature profile line showing how temperature varies (decreases in troposphere, increases in stratosphere, decreases in mesosphere) on a secondary x-axis. Draw horizontal dashed lines at boundaries. Title: 'Earth's Atmospheric Layers'.",
      course: "Earth Science I",
    },
  },
  {
    id: "earth-geologic-time",
    label: "Geologic time scale",
    section: "Earth Science",
    engine: "matplotlib",
    spec: {
      type: "diagram",
      equations: [],
      description: "Draw a horizontal geologic timeline bar from 0 to 540 million years ago (MYA). Show the following Eras as colored segments: Cenozoic (0-66 MYA, yellow), Mesozoic (66-252 MYA, green), Paleozoic (252-540 MYA, blue). Within Mesozoic, mark Triassic, Jurassic, Cretaceous Periods. Label each era with its name and age range. Mark major events: extinction at 66 MYA (K-Pg), 252 MYA (Permian), Cambrian Explosion at ~540 MYA. Title: 'Geologic Time Scale (Phanerozoic)'.",
      course: "Earth Science I",
    },
  },

  // ── 7. PHYSICS ─────────────────────────────────────────────────────────────
  {
    id: "phys-kinematics",
    label: "Kinematics — position, velocity, acceleration",
    section: "Physics",
    engine: "matplotlib",
    spec: {
      type: "diagram",
      equations: [],
      description: "Side-by-side 3-panel figure (1 row, 3 columns) for a ball thrown upward. Panel 1: Position vs. Time — parabola opening downward, x(t) = 20t - 5t^2, t from 0 to 4s. Panel 2: Velocity vs. Time — linear line starting at 20 m/s and decreasing to -20 m/s, v(t) = 20-10t. Panel 3: Acceleration vs. Time — constant horizontal line at -10 m/s². Label axes with units on each panel. Title above each: 'Position', 'Velocity', 'Acceleration'. Use fig.suptitle('Kinematics of Projectile').",
      course: "Physics I",
    },
  },
  {
    id: "phys-wave",
    label: "Transverse wave — labeled anatomy",
    section: "Physics",
    engine: "matplotlib",
    spec: {
      type: "diagram",
      equations: [],
      description: "Draw a transverse wave: y = 2*sin(2*pi*x/4) for x in [0, 12]. Label: amplitude (vertical double-headed arrow from crest to equilibrium, labeled '2 m'), wavelength (horizontal double-headed arrow from crest to crest, labeled 'λ = 4 m'), one crest labeled 'crest', one trough labeled 'trough', equilibrium line (y=0) dashed label 'equilibrium'. Title: 'Transverse Wave'. Clean style.",
      course: "Physics I",
    },
  },
  {
    id: "phys-blackbody",
    label: "Blackbody radiation curves",
    section: "Physics",
    engine: "matplotlib",
    spec: {
      type: "function",
      equations: [],
      description: "Plot Planck blackbody radiation curves (spectral radiance vs. wavelength) for three temperatures: T=3000K (red, peak near 1000nm), T=5000K (white/yellow, peak near 580nm), T=7000K (blue-white, peak near 400nm). X-axis: wavelength in nm from 100 to 3000. Y-axis: relative spectral intensity. Label each curve with its temperature. Mark the visible light range (380-700nm) with a shaded rainbow-colored vertical band. Title: 'Blackbody Radiation Spectra'.",
      course: "Physics II / Astronomy",
    },
  },
  {
    id: "phys-pv-diagram",
    label: "P-V diagram — thermodynamic cycle",
    section: "Physics",
    engine: "matplotlib",
    spec: {
      type: "diagram",
      equations: [],
      description: "Draw a pressure-volume (P-V) diagram showing a Carnot cycle. Show 4 processes forming a closed loop: isothermal expansion (top, curved), adiabatic expansion (right, steep curve), isothermal compression (bottom, curved), adiabatic compression (left, steep curve). Use arrows on each segment showing direction. Label T_H (hot temperature) on top isotherm and T_C (cold temperature) on bottom. Shade the enclosed area to represent work done. X-axis: Volume (V), Y-axis: Pressure (P).",
      course: "Physics II",
    },
  },

  // ── 8. GEOMETRY (Venn / Sets) ──────────────────────────────────────────────
  {
    id: "geom-venn2-intersect",
    label: "Venn — A ∩ B ≠ ∅",
    section: "Geometry / Sets",
    engine: "penrose",
    trio: TRIO_VENN_2_INTERSECT,
  },
  {
    id: "geom-venn2-disjoint",
    label: "Venn — A and B disjoint",
    section: "Geometry / Sets",
    engine: "penrose",
    trio: TRIO_VENN_2_DISJOINT,
  },
  {
    id: "geom-venn3",
    label: "Venn — 3-circle (A, B, C)",
    section: "Geometry / Sets",
    engine: "penrose",
    trio: TRIO_VENN_3_ALL,
  },
  {
    id: "geom-euler-subset",
    label: "Euler — B ⊂ U, C ⊂ U, B∩C = ∅",
    section: "Geometry / Sets",
    engine: "penrose",
    trio: TRIO_EULER_SUBSET,
  },
  {
    id: "geom-euler-nested",
    label: "Euler — nested C ⊂ B ⊂ A",
    section: "Geometry / Sets",
    engine: "penrose",
    trio: TRIO_EULER_NESTED,
  },
  {
    id: "geom-venn-logic",
    label: "Venn — logic P and Q",
    section: "Geometry / Sets",
    engine: "penrose",
    trio: TRIO_VENN_LOGIC,
  },

  // ── 9. GRAPH THEORY / DISCRETE MATH ───────────────────────────────────────
  {
    id: "disc-graph-pentagon",
    label: "Graph theory — pentagon + chord",
    section: "Discrete Math / CS",
    engine: "penrose",
    trio: TRIO_GRAPH_PENTAGON,
  },
  {
    id: "disc-graph-tree",
    label: "Graph theory — binary tree (7 nodes)",
    section: "Discrete Math / CS",
    engine: "penrose",
    trio: TRIO_GRAPH_TREE,
  },
  {
    id: "disc-digraph-dag",
    label: "Directed graph — DAG (6 nodes)",
    section: "Discrete Math / CS",
    engine: "penrose",
    trio: TRIO_DIGRAPH_DAG,
  },
  {
    id: "disc-spanning-tree",
    label: "Spanning tree (5 edges)",
    section: "Discrete Math / CS",
    engine: "penrose",
    trio: TRIO_SPANNING_TREE,
  },
  {
    id: "disc-pascal-tri",
    label: "Pascal's Triangle (rows 0–5)",
    section: "Discrete Math / CS",
    engine: "matplotlib",
    spec: {
      type: "diagram",
      equations: [],
      description: "Draw Pascal's Triangle for rows 0 through 5. Arrange the numbers in a triangular grid, each row centered. Each cell shows the binomial coefficient C(n,k). Draw colored cells with the value inside. Row 0: 1. Row 1: 1 1. Row 2: 1 2 1. Row 3: 1 3 3 1. Row 4: 1 4 6 4 1. Row 5: 1 5 10 10 5 1. Color cells by value (light to dark). No axes, no grid. Title: \"Pascal's Triangle\".",
      course: "Discrete Math",
    },
  },
  {
    id: "disc-truth-table",
    label: "Truth table — AND/OR/NOT",
    section: "Discrete Math / CS",
    engine: "matplotlib",
    spec: {
      type: "diagram",
      equations: [],
      description: "Draw a formatted truth table showing 4 rows for P, Q, P AND Q, P OR Q, NOT P. Use ax.table() in matplotlib. P values: T,T,F,F. Q values: T,F,T,F. Color True cells light green and False cells light red. Add a title: 'Truth Table: Logical Connectives'. Remove all plot axes and spines, just show the table centered.",
      course: "Discrete Math",
    },
  },

  // ── 10. ELEMENTARY & MIDDLE DATA ──────────────────────────────────────────
  {
    id: "elem-line-graph",
    label: "Line graph — temperature over time",
    section: "Elementary / Middle Data",
    engine: "matplotlib",
    spec: {
      type: "line",
      equations: [],
      description: "Line graph showing average monthly temperature for a city over 12 months (Jan-Dec). Values (°F): 32, 35, 48, 58, 68, 78, 84, 82, 72, 60, 47, 34. Plot points with markers and connecting lines. Label axes: Month and Temperature (°F). Add gridlines. Title: 'Average Monthly Temperature'. Rotate x-axis labels 45°.",
      course: "Grade 4",
    },
  },
  {
    id: "elem-dot-plot",
    label: "Dot plot / line plot",
    section: "Elementary / Middle Data",
    engine: "matplotlib",
    spec: {
      type: "diagram",
      equations: [],
      description: "Draw a dot plot (line plot) for student quiz scores: 7,7,8,8,8,9,9,9,9,10,10,10. Each dot is a circle marker stacked above the number line. X-axis shows values 7, 8, 9, 10. Stack dots vertically above each value. Title: 'Quiz Scores — Class Dot Plot'. Clean number line style with no y-axis ticks.",
      course: "Grade 5",
    },
  },
  {
    id: "elem-fraction-model",
    label: "Fraction area model (3/4)",
    section: "Elementary / Middle Data",
    engine: "matplotlib",
    spec: {
      type: "diagram",
      equations: [],
      description: "Draw a rectangle divided into 4 equal columns. Shade 3 of the 4 sections in blue. Label each section with its fraction (1/4). Add a label '3/4 shaded' below the rectangle. Also draw a number line from 0 to 1 below the rectangle, marking 1/4, 2/4, 3/4, 1 with tick marks and a dot at 3/4. Title: 'Fraction Models: 3/4'.",
      course: "Grade 3",
    },
  },

  // ── 11. GEOMETRY — PENROSE POLYGON & TRIANGLE DIAGRAMS ────────────────────
  {
    id: "geom-triangle-labeled",
    label: "Triangle △ABC (labeled vertices)",
    section: "Geometry — Shapes",
    engine: "penrose",
    trio: TRIO_TRIANGLE_LABELED,
  },
  {
    id: "geom-right-triangle",
    label: "Right triangle — 90° constraint at B",
    section: "Geometry — Shapes",
    engine: "penrose",
    trio: TRIO_RIGHT_TRIANGLE,
  },
  {
    id: "geom-congruent-triangles",
    label: "Congruent triangles △ABC ≅ △DEF",
    section: "Geometry — Shapes",
    engine: "penrose",
    trio: TRIO_CONGRUENT_TRIANGLES,
  },
  {
    id: "geom-similar-triangles",
    label: "Similar triangles △ABC ~ △DEF",
    section: "Geometry — Shapes",
    engine: "penrose",
    trio: TRIO_SIMILAR_TRIANGLES,
  },
  {
    id: "geom-quadrilateral",
    label: "Quadrilateral ABCD",
    section: "Geometry — Shapes",
    engine: "penrose",
    trio: TRIO_QUADRILATERAL,
  },
  {
    id: "geom-pentagon-poly",
    label: "Pentagon ABCDE",
    section: "Geometry — Shapes",
    engine: "penrose",
    trio: TRIO_POLYGON_PENTAGON,
  },
  {
    id: "geom-hexagon",
    label: "Hexagon ABCDEF",
    section: "Geometry — Shapes",
    engine: "penrose",
    trio: TRIO_POLYGON_HEXAGON,
  },
  {
    id: "geom-triangle-median",
    label: "Triangle with median (midpoint M)",
    section: "Geometry — Shapes",
    engine: "penrose",
    trio: TRIO_TRIANGLE_MEDIAN,
  },
  {
    id: "geom-isosceles",
    label: "Isosceles triangle (equal-side tick marks)",
    section: "Geometry — Shapes",
    engine: "penrose",
    trio: TRIO_ISOSCELES_TRIANGLE,
  },
  {
    id: "geom-angle-arc",
    label: "Triangle with angle arc at vertex B",
    section: "Geometry — Shapes",
    engine: "penrose",
    trio: TRIO_ANGLE_ARC,
  },
  {
    id: "geom-vector-addition",
    label: "Vector addition v₁ + v₂ = vsum (tip-to-tail)",
    section: "Geometry — Shapes",
    engine: "penrose",
    trio: TRIO_VECTOR_ADDITION,
  },
  {
    id: "geom-special-triangles",
    label: "Special right triangles 30-60-90 & 45-45-90",
    section: "Geometry — Shapes",
    engine: "matplotlib",
    spec: {
      type: "diagram",
      equations: [],
      description: "Draw two side-by-side right triangles. Left: 30-60-90 triangle with legs labeled 1, √3 and hypotenuse 2. Mark the 30°, 60°, 90° angles. Right: 45-45-90 triangle with legs labeled 1, 1 and hypotenuse √2. Mark the 45°, 45°, 90° angles. Use right-angle square marker at the 90° vertex. Color the triangles lightly (light blue fill left, light green fill right). Title: 'Special Right Triangles'.",
      course: "Geometry / Trigonometry",
    },
  },
  {
    id: "geom-parallel-transversal",
    label: "Parallel lines cut by transversal",
    section: "Geometry — Shapes",
    engine: "matplotlib",
    spec: {
      type: "diagram",
      equations: [],
      description: "Draw two horizontal parallel lines (labeled ℓ₁ and ℓ₂) and one transversal line cutting through both at an angle. Label all 8 angles formed at the two intersection points. Use colors or letters (1–4 at top intersection, 5–8 at bottom). Annotate: 'alternate interior angles: ∠3 = ∠6', 'corresponding angles: ∠1 = ∠5', 'co-interior angles: ∠3 + ∠5 = 180°'. Show arrowheads on the parallel lines indicating they are parallel. Title: 'Parallel Lines cut by a Transversal'.",
      course: "Geometry / Grade 8",
    },
  },
  {
    id: "geom-pythagorean-proof",
    label: "Pythagorean theorem — visual proof",
    section: "Geometry — Shapes",
    engine: "matplotlib",
    spec: {
      type: "diagram",
      equations: [],
      description: "Draw the classic Pythagorean theorem visual proof. Show a right triangle with legs a=3, b=4, hypotenuse c=5 in the center. Attach three squares to the sides: square of side a=3 (area 9, colored light red) on the left, square of side b=4 (area 16, colored light blue) on the bottom, square of side c=5 (area 25, colored light green) on the hypotenuse. Label each square with its area and side length. Show equation a² + b² = c² → 9 + 16 = 25 as text. Title: 'Pythagorean Theorem: a² + b² = c²'.",
      course: "Grade 8 / Geometry",
    },
  },
  {
    id: "geom-3d-solids",
    label: "3D solids — cube, cone, cylinder, sphere",
    section: "Geometry — Shapes",
    engine: "matplotlib",
    spec: {
      type: "diagram",
      equations: [],
      description: "Create a 2×2 subplot grid (using mpl_toolkits.mplot3d) showing 4 common 3D solids. Top-left: wireframe cube (side=1). Top-right: solid cone (radius=1, height=2). Bottom-left: solid cylinder (radius=1, height=2). Bottom-right: sphere (radius=1). Label each subplot with the solid name. Use plt.rcParams for a clean look. No axes labels needed.",
      course: "Geometry / Grade 7",
    },
  },
  {
    id: "geom-vectors-arrows",
    label: "Vectors — magnitude and direction",
    section: "Geometry — Shapes",
    engine: "matplotlib",
    spec: {
      type: "diagram",
      equations: [],
      description: "Draw a 2D vector diagram on coordinate axes. Show 3 vectors as arrows from the origin: v1=(3,2) in blue, v2=(-1,3) in red, v3=v1+v2=(2,5) in green. Label each vector with its notation and component form. Show vector addition v3=v1+v2 by drawing v1 then v2 tip-to-tail (dashed), ending at v3 tip. Annotate each vector magnitude as |v| = √(x²+y²). Title: 'Vector Addition'.",
      course: "Math Analysis / Physics",
    },
  },

  // ── 12. MORE FUNCTIONS (Algebra 2 / Math Analysis) ───────────────────────
  {
    id: "alg-sqrt-cuberoot",
    label: "Square root & cube root functions",
    section: "More Functions",
    engine: "matplotlib",
    spec: {
      type: "function",
      equations: ["y = np.sqrt(np.abs(x))", "y = np.cbrt(x)"],
      notes: "Plot y=√x (only x≥0) and y=∛x (full domain x in -8 to 8) on the same axes. Use different colors. Label key points: √4=2, √9=3 for sqrt; ∛-8=-2, ∛8=2 for cube root. Add legend and grid.",
      course: "Algebra 2",
    },
  },
  {
    id: "alg-abs-value",
    label: "Absolute value y = |x − 2| + 1",
    section: "More Functions",
    engine: "matplotlib",
    spec: {
      type: "function",
      equations: ["y = np.abs(x - 2) + 1"],
      label_points: [
        { x: 2, y: 1, label: "vertex (2,1)" },
      ],
      notes: "Show the V-shape on x in [-4, 8]. Mark the vertex. Show axis of symmetry x=2 as a dashed line. Shade the region below the graph lightly.",
      course: "Algebra 2",
    },
  },
  {
    id: "alg-piecewise",
    label: "Piecewise function",
    section: "More Functions",
    engine: "matplotlib",
    spec: {
      type: "function",
      equations: [],
      description: "Plot a piecewise function: f(x) = x² for x < 0, f(x) = 2 for x = 0, f(x) = 2x+1 for x > 0. Use matplotlib with separate plot segments. Mark the boundary x=0 with open dot (x<0 piece) and closed dot (x>0 piece), and a separate closed dot at (0,2). Label each piece with its formula as an annotation. Grid on, axes at origin. Title: 'Piecewise Function'.",
      course: "Math Analysis / Algebra 2",
    },
  },
  {
    id: "alg-inverse",
    label: "Inverse function — y=x³ and ∛x",
    section: "More Functions",
    engine: "matplotlib",
    spec: {
      type: "function",
      equations: ["y = x**3", "y = np.cbrt(x)", "y = x"],
      notes: "Plot y=x³ (blue), y=∛x (red), and the line y=x (dashed gray) for x in [-2, 2]. Show that f and f⁻¹ are reflections over y=x. Annotate 'y = x (axis of symmetry)'. Label the two curves. Equal aspect ratio so the reflection symmetry is visible.",
      course: "Algebra 2 / Math Analysis",
    },
  },
  {
    id: "alg-polar-rose",
    label: "Polar curve — rose r = cos(3θ)",
    section: "More Functions",
    engine: "matplotlib",
    spec: {
      type: "function",
      equations: [],
      description: "Draw a polar rose curve r = cos(3θ) for θ in [0, π]. Convert to Cartesian (x = r·cos θ, y = r·sin θ) and plot. Use a polar axes with plt.subplot(polar=True). Label the curve equation. Show the 3 petals in a nice color (teal or purple). No axis numbers needed. Title: 'Polar Rose: r = cos(3θ)'.",
      course: "Math Analysis",
    },
  },
  {
    id: "alg-conic-ellipse",
    label: "Conic — ellipse with foci",
    section: "More Functions",
    engine: "matplotlib",
    spec: {
      type: "diagram",
      equations: [],
      description: "Draw an ellipse with semi-major axis a=5 (horizontal), semi-minor axis b=3. Center at origin. Mark both foci at (±4, 0) with dots and label them F₁ and F₂ (using c = √(a²−b²) = 4). Draw dashed lines from one point on the curve to each focus showing PF₁ + PF₂ = 2a = 10. Label a, b, c on the diagram. Draw the major and minor axes as dashed lines. Title: 'Ellipse: x²/25 + y²/9 = 1'.",
      course: "Math Analysis / Conic Sections",
    },
  },

  // ── 13. MORE GRAPH THEORY (Penrose) ──────────────────────────────────────
  {
    id: "disc-complete-k4",
    label: "Complete graph K₄",
    section: "Discrete Math / CS",
    engine: "penrose",
    trio: TRIO_COMPLETE_K4,
  },
  {
    id: "disc-bipartite",
    label: "Bipartite graph K₂,₃",
    section: "Discrete Math / CS",
    engine: "penrose",
    trio: TRIO_BIPARTITE,
  },
  {
    id: "disc-cycle-c6",
    label: "Cycle graph C₆",
    section: "Discrete Math / CS",
    engine: "penrose",
    trio: TRIO_CYCLE_C6,
  },
  {
    id: "disc-expr-tree",
    label: "Expression tree — (a+b)*(c−d)",
    section: "Discrete Math / CS",
    engine: "penrose",
    trio: TRIO_EXPR_TREE,
  },

  // ── 14. MORE STATISTICS ───────────────────────────────────────────────────
  {
    id: "stat-residual-plot",
    label: "Residual plot",
    section: "Statistics & Data",
    engine: "matplotlib",
    spec: {
      type: "scatter",
      equations: [],
      description: "Draw a residual plot. X-axis: Fitted values (range 50–95). Y-axis: Residuals (range −10 to 10). Plot ~18 residual points that appear randomly scattered around y=0 (no pattern — indicating good fit). Draw a dashed horizontal line at y=0. Title: 'Residual Plot'. Label axes. Add light gridlines.",
      course: "AP Stats / Prob & Stats",
    },
  },
  {
    id: "stat-binomial-dist",
    label: "Binomial distribution B(10, 0.4)",
    section: "Statistics & Data",
    engine: "matplotlib",
    spec: {
      type: "distribution",
      equations: [],
      description: "Draw a binomial distribution bar chart for n=10, p=0.4. Calculate P(X=k) for k=0 to 10 using scipy.stats.binom or direct formula. Plot as vertical bars. Highlight the mean μ=np=4 bar in a different color. Label x-axis: 'Number of successes k', y-axis: 'P(X = k)'. Add a dashed vertical line at x=4 labeled μ=4. Title: 'Binomial Distribution B(10, 0.4)'.",
      course: "Prob & Stats",
    },
  },
  {
    id: "stat-confidence-interval",
    label: "Confidence interval diagram",
    section: "Statistics & Data",
    engine: "matplotlib",
    spec: {
      type: "diagram",
      equations: [],
      description: "Draw a normal distribution curve with a 95% confidence interval (±1.96σ) shaded in blue. Below the curve, draw a horizontal interval bar from −1.96 to +1.96 with vertical caps. Label μ at center, −1.96σ and +1.96σ at the tails. Add text '95% Confidence' in the shaded region. Also show a separate point estimate with error bar below the distribution. Title: '95% Confidence Interval'.",
      course: "AP Stats / Prob & Stats",
    },
  },
  {
    id: "stat-sampling-dist",
    label: "Sampling distribution of x̄",
    section: "Statistics & Data",
    engine: "matplotlib",
    spec: {
      type: "diagram",
      equations: [],
      description: "Show three normal distribution curves stacked vertically (small multiples). Top: Population distribution (μ=50, wide spread). Middle: Sampling distribution with n=10 (narrower). Bottom: Sampling distribution with n=40 (narrowest). Label each with mean and standard error. Title: 'Effect of Sample Size on Sampling Distribution'. Use consistent x-axis (30 to 70).",
      course: "Prob & Stats",
    },
  },

  // ── 15. MORE BIOLOGY ──────────────────────────────────────────────────────
  {
    id: "bio-punnett-square",
    label: "Punnett square — Tt × Tt",
    section: "Biology",
    engine: "matplotlib",
    spec: {
      type: "diagram",
      equations: [],
      description: "Draw a 2×2 Punnett square for the cross Tt × Tt. Label the top row T and t; left column T and t. Fill the 4 cells: TT (top-left, homozygous dominant, green), Tt (top-right, light green), Tt (bottom-left, light green), tt (bottom-right, white/gray for recessive). Label each cell with genotype. Show phenotype ratio: 3 Tall : 1 Short as a text below. Title: 'Monohybrid Cross: Tt × Tt'.",
      course: "Biology II Genetics",
    },
  },
  {
    id: "bio-hardy-weinberg",
    label: "Hardy-Weinberg — allele frequency bar graph",
    section: "Biology",
    engine: "matplotlib",
    spec: {
      type: "bar",
      equations: [],
      description: "Two side-by-side bar graphs. Left: allele frequencies p=0.7 (dominant A) and q=0.3 (recessive a) as two bars. Right: genotype frequencies p²=0.49 (AA), 2pq=0.42 (Aa), q²=0.09 (aa) as three bars. Color them distinctly. Label each bar with its value. Title: 'Hardy-Weinberg Equilibrium (p=0.7, q=0.3)'.",
      course: "Biology II Genetics",
    },
  },
  {
    id: "bio-enzyme-activity",
    label: "Enzyme activity vs. temperature",
    section: "Biology",
    engine: "matplotlib",
    spec: {
      type: "function",
      equations: [],
      description: "Draw an enzyme activity curve as a bell-shaped curve peaking at 37°C (optimum temperature). Show a second curve for the same enzyme at different pH (shifted peak). X-axis: Temperature (°C) from 10 to 70. Y-axis: Relative Activity (%). Mark the optimum temperature at 37°C with a dashed vertical line. Annotate: 'denaturation above 45°C'. Title: 'Enzyme Activity vs. Temperature'.",
      course: "Biology II",
    },
  },

  // ── 16. MORE CHEMISTRY ────────────────────────────────────────────────────
  {
    id: "chem-solubility",
    label: "Solubility curve — NaCl, KNO₃, KCl",
    section: "Chemistry",
    engine: "matplotlib",
    spec: {
      type: "function",
      equations: [],
      description: "Draw solubility vs. temperature curves for three salts from 0°C to 100°C. KNO₃: steep curve, rising from ~13 at 0°C to ~245 at 100°C. NaCl: nearly flat, ~35 at 0°C to ~39 at 100°C. KCl: moderate slope, ~28 at 0°C to ~57 at 100°C. Plot all three with different colors and labels. X-axis: Temperature (°C), Y-axis: Solubility (g/100mL). Title: 'Solubility Curves'.",
      course: "Chemistry I",
    },
  },
  {
    id: "chem-equilibrium",
    label: "Equilibrium concentration diagram",
    section: "Chemistry",
    engine: "matplotlib",
    spec: {
      type: "function",
      equations: [],
      description: "Draw concentration vs. time graph for a reversible reaction until equilibrium. Show [Reactant A] decreasing and leveling off (blue). Show [Product B] increasing and leveling off (red). Mark the equilibrium point where slopes become flat with a vertical dashed line labeled 'Equilibrium reached'. Annotate 'Kₑq = [B]/[A] at equilibrium'. Title: 'Approach to Chemical Equilibrium'.",
      course: "Chemistry II",
    },
  },

  // ── 17. MORE PHYSICS ─────────────────────────────────────────────────────
  {
    id: "phys-electric-field",
    label: "Electric field lines — two charges",
    section: "Physics",
    engine: "matplotlib",
    spec: {
      type: "diagram",
      equations: [],
      description: "Draw electric field lines around two point charges: +q at (-1,0) shown as a red '+' dot and -q at (1,0) shown as a blue '-' dot. Use matplotlib streamplot or quiver to show the E-field vector arrows. Field lines should originate at +q and terminate at -q. Draw about 8-12 field line arrows. Add '+' and '-' labels next to the charges. Title: 'Electric Field Lines: Dipole (+q, −q)'.",
      course: "Physics II",
    },
  },
  {
    id: "phys-projectile",
    label: "Projectile motion — trajectory",
    section: "Physics",
    engine: "matplotlib",
    spec: {
      type: "function",
      equations: [],
      description: "Draw a projectile motion trajectory. Throw at angle 45° with v₀=20 m/s. Compute x(t) = v₀·cos(45°)·t, y(t) = v₀·sin(45°)·t − 0.5·9.8·t². Plot the parabolic arc from launch to land. Mark: launch point (0,0), maximum height with a dashed horizontal line labeled 'max height = v₀²sin²θ/2g', range with a label 'Range R = v₀²sin(2θ)/g'. Draw velocity vector at t=0 and at peak. Title: 'Projectile Motion (45°, v₀=20 m/s)'.",
      course: "Physics I",
    },
  },
  {
    id: "phys-standing-wave",
    label: "Standing wave — harmonics 1st, 2nd, 3rd",
    section: "Physics",
    engine: "matplotlib",
    spec: {
      type: "diagram",
      equations: [],
      description: "Draw three harmonic standing wave patterns in 3 vertically stacked subplots. First harmonic: one half-wavelength (n=1, λ=2L). Second harmonic: one full wavelength (n=2, λ=L). Third harmonic: 1.5 wavelengths (n=3, λ=2L/3). Show nodes as dots and antinodes as peaks. Label each with 'n=1, fundamental', 'n=2, 1st overtone', 'n=3, 2nd overtone'. Fixed endpoints (y=0 at x=0 and x=L). Title: 'Standing Wave Harmonics'.",
      course: "Physics I",
    },
  },

  // ── 18. MORE ELEMENTARY (K-8) ────────────────────────────────────────────
  {
    id: "elem-array-model",
    label: "Array model — 3 × 4 multiplication",
    section: "Elementary / Middle Data",
    engine: "matplotlib",
    spec: {
      type: "diagram",
      equations: [],
      description: "Draw a 3×4 array of dots or squares to show 3×4=12. Arrange in a grid: 3 rows, 4 columns. Color alternating rows differently (e.g., first row blue, second row red, third row blue). Label '3 rows × 4 columns = 12'. Add an annotation showing '4+4+4 = 12' below. Title: 'Array Model: 3 × 4 = 12'.",
      course: "Grade 3",
    },
  },
  {
    id: "elem-number-line",
    label: "Number line — fractions & integers",
    section: "Elementary / Middle Data",
    engine: "matplotlib",
    spec: {
      type: "diagram",
      equations: [],
      description: "Draw a clean number line from -3 to 3 with integer tick marks. Above the number line, place colored dots and labels for these fractions: -2.5, -1.5, -0.5, 0.5, 1.5, 2.5 in blue. Below the line, place dots at -2, -1, 0, 1, 2 in red with integer labels. Show an arrow labeled 'distance = 5' spanning from -2 to 3. Title: 'Number Line: Integers and Fractions'. Clean style with no y-axis.",
      course: "Grade 4 / Grade 6",
    },
  },

];

// ─── Group specimens by section ───────────────────────────────────────────────
const SECTIONS = [...new Set(SPECIMENS.map((s) => s.section))];

// ─── Engine colors ─────────────────────────────────────────────────────────
const ENGINE_META = {
  matplotlib: {
    label: "Matplotlib",
    bg: "bg-orange-100",
    text: "text-orange-700",
    dot: "bg-orange-400",
  },
  penrose: {
    label: "Penrose",
    bg: "bg-blue-100",
    text: "text-blue-700",
    dot: "bg-blue-400",
  },
};

// ─── Individual diagram card ───────────────────────────────────────────────
function DiagramCard({ specimen, autoRender }) {
  const [status, setStatus] = useState("idle"); // idle | loading | done | error
  const [pngBase64, setPngBase64] = useState(null);
  const [errMsg, setErrMsg] = useState(null);
  const [penroseActive, setPenroseActive] = useState(false);
  const startedRef = useRef(false);

  const doRender = useCallback(async () => {
    if (startedRef.current) return;
    startedRef.current = true;

    if (specimen.engine === "penrose") {
      setPenroseActive(true);
      setStatus("done");
      return;
    }

    setStatus("loading");
    try {
      const res = await fetch("/api/matplotlib-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...specimen.spec,
          dpi: 130,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.pngBase64) {
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      setPngBase64(data.pngBase64);
      setStatus("done");
    } catch (err) {
      setErrMsg(err.message);
      setStatus("error");
    }
  }, [specimen]);

  // Respond to parent "Render All" button
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [, setAutoTriggered] = useState(false);
  useEffect(() => {
    if (autoRender) {
      setAutoTriggered((prev) => {
        if (!prev) doRender();
        return true;
      });
    }
  }, [autoRender, doRender]);

  const em = ENGINE_META[specimen.engine];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      {/* Card header */}
      <div className="px-3 py-2 border-b border-slate-100 flex items-start justify-between gap-2">
        <span className="text-[13px] font-semibold text-slate-800 leading-tight">
          {specimen.label}
        </span>
        <span
          className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${em.bg} ${em.text}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${em.dot}`} />
          {em.label}
        </span>
      </div>

      {/* Card body — min height to prevent layout shift */}
      <div className="flex-1 min-h-[260px] flex flex-col items-center justify-center">
        {status === "idle" && (
          <button
            onClick={doRender}
            className="px-5 py-2 text-sm font-medium bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
          >
            Render
          </button>
        )}

        {status === "loading" && (
          <div className="flex flex-col items-center gap-2 text-slate-400">
            <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
            <span className="text-xs">Generating…</span>
          </div>
        )}

        {status === "done" && pngBase64 && (
          <img
            src={`data:image/png;base64,${pngBase64}`}
            alt={specimen.label}
            className="w-full rounded-b-xl"
          />
        )}

        {status === "done" && penroseActive && (
          <div className="w-full p-2">
            <PenroseRenderer
              domain={specimen.trio.domain}
              substance={specimen.trio.substance}
              style={specimen.trio.style}
              variation={specimen.trio.variation ?? "default"}
            />
          </div>
        )}

        {status === "error" && (
          <div className="m-3 w-full p-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded overflow-auto max-h-24">
            <span className="font-semibold">Error: </span>
            {errMsg}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────
export default function DiagramDashboard() {
  const [renderAll, setRenderAll] = useState(false);
  const [activeSection, setActiveSection] = useState("All");

  const matplotlibCount = SPECIMENS.filter((s) => s.engine === "matplotlib").length;
  const penroseCount = SPECIMENS.filter((s) => s.engine === "penrose").length;

  const filteredSections =
    activeSection === "All" ? SECTIONS : [activeSection];

  return (
    <>
      <Head>
        <title>Diagram Dashboard — Matplotlib + Penrose</title>
      </Head>

      <div className="min-h-screen bg-slate-50">
        {/* ── Top bar ── */}
        <div className="sticky top-0 z-10 bg-white border-b border-slate-200 shadow-sm">
          <div className="max-w-screen-2xl mx-auto px-6 py-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-lg font-bold text-slate-900">
                Diagram Dashboard
              </h1>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Matplotlib + Penrose stack · {SPECIMENS.length} specimens ·{" "}
                <span className="text-orange-600 font-medium">
                  {matplotlibCount} Matplotlib
                </span>{" "}
                ·{" "}
                <span className="text-blue-600 font-medium">
                  {penroseCount} Penrose
                </span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              {!renderAll ? (
                <button
                  onClick={() => setRenderAll(true)}
                  className="px-4 py-1.5 text-sm font-medium bg-slate-900 hover:bg-slate-700 text-white rounded-lg transition-colors"
                >
                  Render All
                </button>
              ) : (
                <span className="text-xs text-green-700 font-medium bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg">
                  Rendering all…
                </span>
              )}
            </div>
          </div>

          {/* Section filter pills */}
          <div className="max-w-screen-2xl mx-auto px-6 pb-2 flex flex-wrap gap-1.5">
            {["All", ...SECTIONS].map((sec) => (
              <button
                key={sec}
                onClick={() => setActiveSection(sec)}
                className={`px-3 py-0.5 rounded-full text-[11px] font-medium transition-colors ${
                  activeSection === sec
                    ? "bg-slate-800 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {sec}
              </button>
            ))}
          </div>
        </div>

        {/* ── Content ── */}
        <div className="max-w-screen-2xl mx-auto px-6 py-6 space-y-10">
          {filteredSections.map((section) => {
            const sectionSpecimens = SPECIMENS.filter(
              (s) => s.section === section
            );
            return (
              <section key={section}>
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-base font-bold text-slate-800">
                    {section}
                  </h2>
                  <span className="text-[11px] text-slate-400">
                    {sectionSpecimens.length} diagrams
                  </span>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {sectionSpecimens.map((specimen) => (
                    <DiagramCard
                      key={specimen.id}
                      specimen={specimen}
                      autoRender={renderAll}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        {/* ── Footer ── */}
        <div className="border-t border-slate-200 bg-white mt-10 py-4">
          <p className="text-center text-[11px] text-slate-400">
            Diagram Dashboard · Matplotlib via <code>/api/matplotlib-generate</code> · Penrose via{" "}
            <code>@penrose/core</code> (client-side SVG layout)
          </p>
        </div>
      </div>
    </>
  );
}
