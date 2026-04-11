# Engine Capabilities Reference

Diagrams in this project are rendered by two engines: **Penrose** (client-side, constraint-based SVG) and **Matplotlib** (server-side, Python-generated PNG). This document summarises what each engine can do and when to use each one.

---

## Penrose

### What Penrose Is

Penrose is a constraint-satisfaction diagramming engine. You write three programs:
- **`.domain`** — define the mathematical types, predicates, and constructors
- **`.substance`** — declare which objects exist and their relationships
- **`.style`** — describe how to visually render each type/predicate

Penrose uses symbolic differentiation and gradient descent to optimise diagram layout. It renders to SVG, runs entirely in the browser (no server needed), and is deterministic given a `variation` seed.

### Shapes

| Shape | Key Attributes | Notes |
|-------|---------------|-------|
| `Circle` | `center`, `r`, `fillColor`, `strokeColor`, `strokeWidth` | Also used for points/nodes |
| `Ellipse` | `center`, `rx`, `ry`, `fillColor`, `strokeColor` | |
| `Line` | `start`, `end`, `strokeColor`, `strokeWidth`, `startArrowhead`, `endArrowhead`, `startArrowheadSize`, `endArrowheadSize`, `strokeDasharray` | Arrowhead styles: `"none"`, `"straight"`, `"curved"`, and several others |
| `Path` | `d` (PathCmd), `fillColor`, `strokeColor`, `strokeWidth` | d = output from path computation functions |
| `Polygon` | `points` (list of vec2), `fillColor`, `strokeColor` | Always closed |
| `Polyline` | `points` (list of vec2), `strokeColor`, `strokeWidth` | Never closed |
| `Rectangle` | `center`, `width`, `height`, `fillColor`, `strokeColor`, `cornerRadius`, `rotation` | |
| `Text` | `string`, `center`, `fontSize`, `fontFamily`, `fontWeight`, `fontStyle`, `fillColor` | Content is plain text (no LaTeX) unless using `Equation` |
| `Equation` | `string` (LaTeX), `center`, `fontSize`, `fillColor` | Renders LaTeX math via MathJax (browser only) |
| `Image` | `center`, `width`, `height`, `href` | External image by URL |
| `Group` | `shapes` (list of shapes), `center` | Groups shapes for layering/clip |

### Constraint Functions (used with `ensure`)

| Function | Description |
|----------|-------------|
| `equal(x, y)` | Force x == y |
| `lessThan(x, y, padding?)` | Require x < y |
| `greaterThan(x, y, padding?)` | Require x > y |
| `inRange(x, x0, x1)` | Require x0 ≤ x ≤ x1 |
| `perpendicular(q, p, r)` | Vector (q,p) ⊥ vector (r,p) |
| `collinear(c1, c2, c3)` | Three points collinear (any order) |
| `collinearOrdered(c1, c2, c3)` | Three points collinear in given order |
| `overlapping(s1, s2, overlap?)` | Shapes overlap |
| `disjoint(s1, s2, padding?)` | Shapes don't overlap |
| `contains(s1, s2, padding?)` | Shape s1 contains s2 |
| `touching(s1, s2, padding?)` | Shapes touch |
| `isConvex(points, closed)` | Polygon is convex |
| `isEquilateral(points, closed)` | All edges equal length |
| `isEquiangular(points, closed)` | All angles equal |
| `onCanvas(shape, w, h)` | Shape stays within canvas bounds |
| `distributeHorizontally(shapes, padding?)` | Even horizontal spacing |
| `distributeVertically(shapes, padding?)` | Even vertical spacing |

### Objective Functions (used with `encourage`)

| Function | Description |
|----------|-------------|
| `near(s1, s2, offset?)` | Place s1 near s2 |
| `nearPt(s1, x, y)` | Place s1 near point (x,y) |
| `above(top, bottom, offset?)` | Encourage top to be above bottom |
| `below(bottom, top, offset?)` | Encourage bottom below top |
| `leftwards(left, right, offset?)` | Encourage left is left of right |
| `rightwards(right, left, offset?)` | Encourage right is right of left |
| `sameCenter(s1, s2)` | Placed at same center |
| `notTooClose(s1, s2, weight?)` | Repel shapes |
| `repelPt(weight, a, b)` | Repel point a from b |
| `inDirection(p, pRef, dir, offset?)` | Encourage p in direction from pRef |
| `centerLabel(s1, s2, w, padding?)` | Center label s2 on shape s1 |
| `nonDegenerateAngle(s0, s1, s2, strength?, range?)` | Keep angle non-degenerate |
| `isEquilateral(points, closed)` | Try to make equilateral |
| `isRegular(points, closed)` | Try to make regular polygon |

### Computation Functions (used in shape attribute expressions)

**Geometry:**
| Function | Returns | Description |
|----------|---------|-------------|
| `normalize(v)` | ℝ² | Unit vector |
| `rot90(v)` | ℝ² | Rotate 2D vector 90° CCW |
| `rotateBy(v, theta)` | ℝ² | Rotate 2D vector by theta degrees CCW |
| `midpoint(p1, p2)` | ℝ² | Midpoint of two points |
| `midpointOffset(line, padding)` | ℝ² | Midpoint of line, offset by padding in normal direction |
| `norm(v)` | ℝ | Euclidean length |
| `dot(v, w)` | ℝ | Dot product |
| `cross2D(u, v)` | ℝ | 2D cross product (determinant) |
| `vdist(v, w)` | ℝ | Euclidean distance between points |
| `angleBetween(u, v)` | ℝ | Unsigned angle between vectors (radians, [0,π]) |
| `angleOf(v)` | ℝ | Angle of vector from positive x-axis (radians) |
| `lineLineIntersection(a0, a1, b0, b1)` | ℝ² | Intersection of two infinite lines |
| `ptOnLine(p1, p2, r)` | ℝ² | Point at distance r along p1→p2 |
| `barycenter(a, b, c)` | ℝ² | Centroid of triangle |
| `circumcenter(p, q, r)` | ℝ² | Circumcenter of triangle |
| `incenter(p, q, r)` | ℝ² | Incenter of triangle |
| `innerPointOffset(pt1, pt2, pt3, padding)` | ℝ² | Point for right-angle marker |

**Paths:**
| Function | Returns | Description |
|----------|---------|-------------|
| `circularArc(pathType, center, r, theta0, theta1)` | PathCmd | Arc of circle |
| `arc(pathType, start, end, [rx,ry], rotation, largeArc, arcSweep)` | PathCmd | Elliptical arc |
| `wedge(center, start, end, radius, rotation, largeArc, arcSweep)` | PathCmd | Filled wedge/pie slice |
| `repeatedArcs(...)` | PathCmd | Multiple concentric arcs (for equal-angle marks) |
| `pathFromPoints(pathType, pts)` | PathCmd | Polygon/polyline from point list |
| `orientedSquare(s1, s2, intersection, len)` | PathCmd | Right-angle square marker for two orthogonal lines |
| `ticksOnLine(pt1, pt2, spacing, numTicks, tickLength)` | PathCmd | Tick marks along a line |
| `chevron(s1, padding)` | points | Chevron at midpoint of line |
| `interpolatingSpline(pathType, points, tension?)` | PathCmd | Smooth curve through points |
| `makePath(start, end, curveHeight, padding)` | PathCmd | Curved arc between two points |

**Trig / Math:**
| Function | Returns | Description |
|----------|---------|-------------|
| `sin(x)`, `cos(x)`, `tan(x)` | ℝ | Trigonometric functions |
| `asin(x)`, `acos(x)`, `atan(x)`, `atan2(x,y)` | ℝ | Inverse trig |
| `sqrt(x)`, `sqr(x)`, `pow(x,y)`, `abs(x)` | ℝ | Basic math |
| `toRadians(theta)`, `toDegrees(theta)` | ℝ | Angle conversion |
| `MathPI`, `MathE` | ℝ | Constants π and e |
| `max(x,y)`, `min(x,y)`, `floor(x)`, `ceil(x)`, `round(x)` | ℝ | Numeric utilities |
| `random(min, max)`, `unitRandom()` | ℝ | Random sampling |

**Colors:**
| Function | Returns | Description |
|----------|---------|-------------|
| `rgba(r, g, b, a)` | Color | RGB color (values 0–1 each) |
| `hsva(h, s, v, a)` | Color | HSV color |
| `none()` | Color | Transparent (no paint) |
| `setOpacity(color, frac)` | Color | Adjust opacity |
| `selectColor(c1, c2, level)` | Color | Interpolate colors |

**Linear Algebra:**
| Function | Returns | Description |
|----------|---------|-------------|
| `rotate2d(theta)` | 2×2 matrix | 2D rotation matrix |
| `rotate(theta, x?, y?)` | 3×3 matrix | 2D rotation in homogeneous coords |
| `scale(sx, sy)` | 3×3 matrix | 2D scale (homogeneous) |
| `translate(x, y)` | 3×3 matrix | 2D translation (homogeneous) |
| `determinant(A)` | ℝ | Determinant of 2×2, 3×3, or 4×4 matrix |
| `inverse(A)` | matrix | Matrix inverse |
| `mul(m, v)` | ℝⁿ | Matrix-vector product |
| `project(p, model, proj, view)` | ℝ² | 3D → 2D projection |

### Domain Language

```domain
type Point             // define a type
type Segment extends Point  // type hierarchy (optional)
predicate Disjoint(Set s1, Set s2)  // binary predicate
predicate OnCircle(Point p, Circle c)
constructor MkSeg(Point a, Point b) -> Segment  // constructor
function midpoint(Point a, Point b) -> Point    // domain function
```

### Style Language Key Patterns

```style
canvas { width = 500; height = 400 }   // required at top

// Basic selector
forall Point p {
  shape p.dot = Circle { r: 5 }
  ensure onCanvas(p.dot, 500, 400)
  layer p.lbl above p.dot
}

// Pattern matching on constructor
forall Segment s; Point a; Point b
where s := MkSeg(a, b) {
  shape s.line = Line {
    start: a.dot.center
    end: b.dot.center
  }
}

// Conditional predicate
forall Set x; Set y
where Subset(x, y) {
  ensure contains(y.icon, x.icon, 5)
}

// Override in more-specific rule
forall Vec v; Point t; Point h
where v := MkVec(t, h); Resultant(v) {
  override v.arr.strokeColor = rgba(220, 50, 30, 1.0)
}
```

### What Penrose Is Good At

- **Structural / relational diagrams**: graphs, trees, networks, Venn/Euler diagrams, Hasse diagrams
- **Constraint-based geometry**: triangles, polygons, congruence/similarity marks, right-angle markers, median lines
- **Vector diagrams**: arrows, direction, vector addition (tip-to-tail automatically by shared points)
- **Topology / set diagrams**: overlapping regions, containment, disjoint sets
- **Aesthetics**: automatic layout that satisfies constraints — no manual positioning
- **Generativity**: the same `.style` applied to many different `.substance` files

### What Penrose Is NOT Good At

- **Quantitative plots**: line charts, histograms, scatter plots, bar charts — no axes, scales, data ticks
- **3D geometry**: no 3D surface/solid rendering (2D projection matrices exist but no renderer)
- **Animations**: static SVG only
- **Custom images**: can embed images by URL but not generate pixel art
- **Precise numeric labels**: labels are text strings, not automatically computed from numeric data
- **LaTeX-heavy content** (slow): `Equation` shapes use MathJax and add rendering time

### Current Trio Inventory (penroseTrios.js)

| # | Export | Category | Notes |
|---|--------|----------|-------|
| 1 | `TRIO_VENN_2_INTERSECT` | Set theory | A ∩ B ≠ ∅ |
| 2 | `TRIO_VENN_2_DISJOINT` | Set theory | Disjoint circles |
| 3 | `TRIO_VENN_3_ALL` | Set theory | Classic 3-circle Venn |
| 4 | `TRIO_EULER_SUBSET` | Set theory | A,B ⊂ U, A∩B=∅ |
| 5 | `TRIO_EULER_NESTED` | Set theory | C⊂B⊂A nested |
| 6 | `TRIO_VENN_LOGIC` | Set theory | P∩Q (logic) |
| 7 | `TRIO_GRAPH_PENTAGON` | Graph | Pentagon + chord |
| 8 | `TRIO_GRAPH_TREE` | Graph | Binary tree 7 nodes |
| 9 | `TRIO_DIGRAPH_DAG` | Graph | DAG 6 nodes |
| 10 | `TRIO_FOOD_WEB` | Graph | Directed food web |
| 11 | `TRIO_PROB_TREE` | Graph | Probability tree |
| 12 | `TRIO_SPANNING_TREE` | Graph | Spanning tree |
| 13 | `TRIO_COMPLETE_K4` | Graph | K₄ complete |
| 14 | `TRIO_BIPARTITE` | Graph | K₂,₃ bipartite |
| 15 | `TRIO_CYCLE_C6` | Graph | 6-cycle |
| 16 | `TRIO_EXPR_TREE` | Graph | AST expression tree |
| 17 | `TRIO_TRIANGLE_LABELED` | Geometry | △ABC labeled |
| 18 | `TRIO_RIGHT_TRIANGLE` | Geometry | Right angle at B |
| 19 | `TRIO_CONGRUENT_TRIANGLES` | Geometry | △ABC ≅ △DEF (tick marks) |
| 20 | `TRIO_SIMILAR_TRIANGLES` | Geometry | △ABC ~ △DEF |
| 21 | `TRIO_QUADRILATERAL` | Geometry | Quadrilateral ABCD |
| 22 | `TRIO_POLYGON_PENTAGON` | Geometry | Pentagon ABCDE |
| 23 | `TRIO_POLYGON_HEXAGON` | Geometry | Hexagon ABCDEF |
| 24 | `TRIO_TRIANGLE_MEDIAN` | Geometry | Triangle + median |
| 25 | `TRIO_ISOSCELES_TRIANGLE` | Geometry | Isosceles (tick marks) |
| 26 | `TRIO_ANGLE_ARC` | Geometry | Triangle + arc at vertex |
| 27 | `TRIO_VECTOR_ADDITION` | Geometry/Vector | v₁+v₂=vsum arrows |

---

## Matplotlib

### What Matplotlib Is

Matplotlib is a Python plotting library that runs server-side via `POST /api/matplotlib-generate`. The API endpoint:
1. Receives a JSON spec with a description/prompt
2. Uses an LLM (via OpenAI) to generate Python code
3. Executes the code in a sandboxed Python environment
4. Returns a base64-encoded PNG

### Available Libraries (loaded in the execution environment)

```python
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import numpy as np
import scipy  # if installed
from mpl_toolkits.mplot3d import Axes3D  # 3D plots
```

### Chart Types (everything Penrose can't do)

**Functions & Algebra:**
- Line plots (function curves): `plt.plot(x, y)`
- Multiple curves on same axes
- Filled regions: `plt.fill_between(x, y1, y2)`
- Asymptotes (dashed lines)
- Piecewise functions
- Parametric curves

**Statistics & Data:**
- Histograms: `plt.hist()`
- Bar charts: `plt.bar()`
- Scatter plots: `plt.scatter()`
- Box plots: `plt.boxplot()`
- Normal distribution curves
- Pie charts: `plt.pie()`
- Residual plots

**Trigonometry:**
- Unit circle with labels
- Sinusoidal waves (multiple periods)
- Polar plots: `plt.polar()` or `plt.subplot(projection='polar')`
- Phase shift diagrams

**Physics / Applied:**
- Vector field arrows: `plt.quiver()`
- Wave diagrams
- Force diagrams (FBD)
- Electric field lines
- Projectile motion

**Geometry (complex constructions):**
- 3D solids: `mpl_toolkits.mplot3d` — cone, cylinder, sphere, cube wireframes
- Pythagorean theorem visual proof (squares on sides)
- Special right triangles with labels
- Parallel lines + transversal with angle labels
- Coordinate geometry

**Biology / Chemistry / Earth Science:**
- DNA helix schematics
- Cell diagrams (with `mpatches.FancyArrowPatch`)
- Molecular bond structures (graph-like with positions)
- Water cycle diagrams
- Climate zone maps (approximate)
- Periodic table subsets

### Key Capabilities

| Capability | API |
|-----------|-----|
| Mathematical text | `plt.text(x, y, r'$a^2 + b^2 = c^2$')` — LaTeX inline |
| Annotations with arrows | `plt.annotate('text', xy=..., xytext=..., arrowprops={...})` |
| Shapes | `mpatches.Circle`, `mpatches.Rectangle`, `mpatches.FancyArrow`, `mpatches.Arc` |
| Subplots | `plt.subplots(rows, cols)` |
| Equal aspect ratio | `ax.set_aspect('equal')` |
| No axes | `ax.axis('off')` |
| Custom colors | `color='#hex'` or named colors |
| Dashed lines | `linestyle='--'` or `ls=':'` |
| LaTeX titles | `plt.title(r'$\sqrt{x}$')` |
| 3D axes | `fig.add_subplot(projection='3d')` |
| Vector arrows | `plt.quiver(X, Y, U, V)` |
| Polar axes | `plt.subplot(projection='polar')` |

### What Matplotlib Is Good At

- **Any quantitative plot** with numeric axes, scales, tick marks, data
- **Scientific/engineering diagrams** with equations, numeric labels
- **3D visualization**: surfaces, solids, parametric curves in 3D
- **Statistical displays**: all standard chart types
- **Complex annotations**: multi-arrow diagrams, color-coded regions
- **Flexible layout**: subplots, insets, colorbars
- **LaTeX rendering**: full math typesetting in any text element

### What Matplotlib Is NOT Good At

- **Constraint-based layout**: no automatic optimization — you position everything manually
- **Interactive diagrams**: static PNG only
- **Structural/relational diagrams**: graphs with auto-layout need NetworkX + spring layout, which is imprecise
- **Rapid generation**: requires server call + LLM + Python execution (~2–5 seconds)
- **SVG output**: returns PNG only (via the current API)

---

## Decision Guide: Penrose vs Matplotlib

| Diagram Type | Use |
|-------------|-----|
| Set / Venn / Euler diagram | **Penrose** |
| Graph / tree / network | **Penrose** |
| Geometric shapes with constraints | **Penrose** |
| Vectors with arrows | **Penrose** |
| Congruence / similarity marks | **Penrose** |
| Line/sine/parabola/function plot | **Matplotlib** |
| Statistics (histogram, box, scatter) | **Matplotlib** |
| 3D solids | **Matplotlib** |
| Unit circle / polar diagram | **Matplotlib** |
| Force/physics diagram with numbers | **Matplotlib** |
| Complex multi-label geometry (transversal) | **Matplotlib** |
| Pythagorean proof with areas | **Matplotlib** |
| Chemical/biological schematic | **Matplotlib** |

---

## Implementation Notes

### Penrose (browser-side)
- Runs via `@penrose/core` v3.3.0
- **API flow**: `compile({domain, substance, style, variation})` → `resample(compiled.value)` → `stepTimes(state, 1000, 10000)` loop → `toSVG(state, ...)`
- MathJax is required for `Equation` shapes — won't render in Node.js/SSR
- Must import dynamically: `const penrose = await import("@penrose/core")`
- All rendering is inside a `useEffect` with `dynamic(import(...), { ssr: false })`

### Matplotlib (server-side)
- Runs at `POST /api/matplotlib-generate`
- Returns `{ pngBase64: "...", error?: "..." }`
- LLM generates the Python code from a spec description
- Images render as `<img src={"data:image/png;base64,..."} />`

---

*Last updated: based on penrose.cs.cmu.edu/docs/ref and v3.3.0 source inspection.*
