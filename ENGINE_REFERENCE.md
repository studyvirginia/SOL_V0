# SOL Graph Engine Reference

Four rendering engines are available. Each receives the same spec JSON but interprets it differently.
This document covers what each engine **can do**, what **reliably fails** (LLM or runtime), and how to **debug** when something doesn't appear.

---

## Quick Comparison Table

| Feature | Matplotlib | GeoGebra | Desmos 2D | Desmos Geometry |
|---|---|---|---|---|
| **Output** | Static PNG | Interactive canvas | Interactive canvas | Interactive canvas |
| **Input method** | LLM → Python code → `exec` | LLM → `evalCommand` strings | LLM → JSON expressions | LLM → Geometry state JSON |
| **Functions y=f(x)** | ✅ | ✅ | ✅ | ❌ not applicable |
| **Implicit curves** | ⚠️ needs contour | ✅ native | ✅ native | ❌ |
| **Polar curves** | ✅ via parametric | ✅ via `Curve()` | ✅ `polarMode:true` | ❌ |
| **Piecewise** | ✅ `np.where` | ✅ `If(cond, a, b)` | ✅ `\left\{...\right\}` | ❌ |
| **Inequalities** | ✅ `fill_between` | ✅ `y < f(x)` syntax | ✅ automatic shading | ❌ |
| **Scatter + regression** | ✅ full control | ✅ `FitLine/FitPoly` | ✅ table + `y~mx+b` | ❌ |
| **Geometric constructions** | ⚠️ manual patches | ✅ rich (best) | ⚠️ polygon only | ✅ native (best) |
| **Angle marks** | ⚠️ manual `Arc` patch | ✅ `Angle()` auto-arcs | ⚠️ manual parametric | ✅ native |
| **Tick marks (equal sides)** | ⚠️ manual | ⚠️ manual via segment | ⚠️ parametric stub | ⚠️ limited |
| **3D / perspective** | ✅ `Axes3D` | ✅ 3D app mode | ❌ | ❌ |
| **Number lines** | ✅ manual vectors | ✅ `Ray()` | ✅ parametric ray | ❌ |
| **Unit circle** | ✅ | ✅ | ✅ best for labels | ❌ |
| **Custom text/annotations** | ✅ `ax.annotate` full | ✅ `SetCaption` + label mode | ✅ `label` field | ✅ `showLabel` on points |
| **Shading / fill** | ✅ `fill_between`, hatching | ✅ `SetAlphaValue` on polygon | ✅ `fill:true, fillOpacity` | ✅ `fillOpacity` on polygon |
| **Multiple curves** | ✅ | ✅ | ✅ | ✅ (segments/shapes only) |
| **Axis labels** | ✅ `ax.set_xlabel` | ✅ `xAxis` label via settings | ✅ settings via API | ❌ |
| **LaTeX rendering** | ✅ `usetex` or mathtext | ✅ native | ✅ native | ✅ native |
| **Interactive / draggable** | ❌ static PNG | ✅ | ✅ | ✅ |
| **No coordinate grid** | ✅ turn off with `ax.grid(False)` | ✅ `showGrid:false` | ✅ `showGrid:false` | ✅ default |

---

## 1. Matplotlib

**What it is:** Python + matplotlib, executed server-side as a subprocess. The LLM generates Python code; `matplotlib_gen.py` runs it via `exec()` in a restricted namespace and returns a base64 PNG.

### Available namespace
Pre-injected into every exec:
```python
plt        # matplotlib.pyplot
np         # numpy
math       # standard library math
mpatches   # matplotlib.patches (Circle, FancyArrowPatch, Arc, FancyBboxPatch, …)
mlines     # matplotlib.lines (Line2D)
```
All `import` / `from` lines are stripped before exec — the LLM may generate them but they are silently removed.

### What it can do well (no caveats)
- **Anything a Python textbook illustration would show** — full creative freedom
- Shadings: `fill_between`, hatch patterns, `Polygon` patches
- Error bars, confidence bands
- Arrows with `ax.annotate(arrowprops=...)`
- Custom figure layout: side-by-side axes, insets
- Normal distribution with distinct shading bands (empirical rule)
- Scatter plots with multiple series, point styles, regression lines
- 3D surfaces via `from mpl_toolkits.mplot3d import Axes3D` — **must be in the exec code** (not stripped because it's not a top-level import line)
- Number line with colored directional arrows
- Slope triangles (rise/run visual)
- Publication-quality labels at precise coordinates

### Known limitations / common failures
| Problem | Cause | Fix |
|---|---|---|
| **`__import__` not found** | LLM wrote `import numpy` — stripped, but then tries `np.` anyway before assignment | Shouldn't happen (pre-injected), but if it does: check that import stripping didn't remove an alias |
| **Blank image** | `plt.show()` called — exec'd but does nothing on Agg | Ensure the LLM doesn't call `plt.close()` either (executor does it) |
| **Vertical asymptote renders as tall spike** | `linspace` hits the singularity | Tell LLM explicitly: "split x array at discontinuity, mask values with `np.nan`" |
| **Angle arc not visible** | `mpatches.Arc` theta1/theta2 in wrong order or wrong unit (must be degrees) | Check: `Arc((cx,cy), width, height, angle=0, theta1=0, theta2=90)` — all degree angles |
| **Text overlap** | Auto-placement of `annotate` | Use `xytext` offset + `arrowprops` or specify `ha`,`va` |
| **Unicode math (π, θ) garbled** | Missing mathtext syntax | Wrap in `$…$`: `r"$\pi$"`, `r"$\theta$"` |
| **3D not available** | `Axes3D` import was stripped | Must write `from mpl_toolkits.mplot3d import Axes3D` inside exec code (not a bare `import`) — the stripper only removes lines starting with `import ` or `from ` at col 0 |
| **`mpl_toolkits` missing** | Rarely — if Python env doesn't have it | `pip3 install matplotlib` re-installs it |
| **Geometry looks bad** | Matplotlib is not a geometry tool | Use GeoGebra or Desmos Geometry for labeled diagrams |
| **Exec timeout** | Code runs more than 20s | Reduce resolution, avoid slow iteration |

### Debug checklist (Matplotlib)
1. Check `pythonCode` in the raw response panel — does it look correct?  
2. The `error` field on the result object contains the Python traceback if exec failed.  
3. Rerun with a simpler `notes` string to reduce LLM complexity.  
4. If the wrong function was plotted, check `equations` in the spec — the LLM reads that directly.

---

## 2. GeoGebra (Classic 6)

**What it is:** GeoGebra Classic 6 embedded in an iframe/div via the GeoGebra Apps API. The LLM generates an array of `evalCommand` strings which are executed one by one. State includes a `view` (xmin/ymin/xmax/ymax) and `showGrid`.

### evalCommand cheatsheet (verified working)

```
DEFINE
  f(x) = 2*x^2 - 3     → named function
  A = (2, 3)            → point
  seg = Segment(A, B)   → segment between two named points
  Line(A, B)            → infinite line
  Ray(A, (1,0))         → ray from A in direction (1,0)

ANALYSIS (auto-creates labeled objects)
  Root(f)                → all x-intercepts, auto-labeled
  Root(f, a, b)          → roots in interval
  Extremum(f)            → local max/min, auto-labeled
  InflectionPoint(f)     → inflection points
  Derivative(f)          → f'(x) as new function
  Integral(f, a, b)      → shaded area + value

GEOMETRY
  Polygon(A, B, C)       → triangle
  Polygon(A, B, C, D)    → quadrilateral
  Circle(A, 3)           → circle center A radius 3
  Angle(tri)             → all interior angle arcs on poly
  Angle(A, B, C)         → arc at vertex B
  MidPoint(A, B)
  PerpendicularLine(A, l)
  Circumcircle(A, B, C)

CONICS
  Ellipse(F1, F2, a)     → a = semi-major axis (number)
  Parabola(F, d)         → F=focus point, d=directrix line
  Hyperbola(F1, F2, a)

TRANSFORMATIONS
  Reflect(obj, xAxis)    → reflect over x-axis
  Reflect(obj, yAxis)    → reflect over y-axis
  Dilate(obj, 2, O)      → scale ×2 from point O
  Rotate(obj, 45°, A)    → rotate 45° around A
  Translate(obj, v)      → translate by vector v

POLAR / PARAMETRIC
  Curve(cos(t), sin(t), t, 0, 2*pi)    → parametric
  (convert polar r=f(θ) manually:
   Curve(f(t)*cos(t), f(t)*sin(t), t, 0, 2*pi) )

PIECEWISE
  f(x) = If(x < 0, -x, x)
  f(x) = If(x<-1, x+2, If(x<2, x^2, 1))   → nested

REGRESSION / SCATTER
  pts = {(1,2),(2,4),(3,3.5)}     → creates visible points
  FitLine(pts)                    → linear regression
  FitPoly(pts, 2)                 → quadratic fit

STYLING
  SetColor(f, 0, 122, 255)        → R,G,B integers 0–255 only
  SetLineThickness(f, 3)          → 1–13
  SetLineStyle(f, 1)              → 0=solid 1=dashed 2=dotted
  SetLabelVisible(A, true)
  SetLabelMode(A, 3)              → 3 = show caption text
  SetCaption(A, "custom text")    → use with LabelMode 3
  SetPointStyle(A, 0)             → 0=filled 2=open/hollow
  SetPointSize(A, 5)              → 1–9
  SetAlphaValue(poly, 0.15)       → fill opacity
```

### What it can do well
- **Geometry diagrams with auto angle arcs** — `Angle(tri)` is the single best command for labeled interior angles
- `Root()` and `Extremum()` auto-create labeled key points — far better than hardcoding coordinates
- Transformations: reflect, rotate, dilate, translate — all with original and image objects
- Conics: ellipse, parabola, hyperbola in standard form
- Inequality shading: write `y < x^2 + 1` directly as an expression — it shades automatically
- Regression on a list of literal points: `{(1,2),(2,4)}` then `FitLine()`

### Known limitations / common failures
| Problem | Cause | Fix |
|---|---|---|
| **Nothing renders** | evalCommand order matters — object referenced before defined | Commands must be ordered: define points → define shapes → styling |
| **`SetColor` with hex string** | GeoGebra only accepts R,G,B integers | `SetColor(f, 0, 122, 255)` — never `SetColor(f, "#007AFF")` |
| **LLM writes `r = cos(theta)`** | Polar syntax doesn't work in evalCommand | Always convert: `Curve(cos(t)*cos(t), cos(t)*sin(t), t, 0, 2*pi)` |
| **`InequalityRegion()` error** | That function doesn't exist | Use `y < f(x)` directly as the command |
| **Implicit multiplication fails** | `2x` vs `2*x` | Always use `*` for multiplication |
| **`^{2}` braces fail** | GeoGebra is not LaTeX — uses `^(1/2)` not `^{1/2}` | Remove curly braces: `x^2` not `x^{2}` |
| **Angle arcs missing** | LLM hardcoded angle positions instead of using `Angle()` | Use `Angle(polygon)` or `Angle(A,B,C)` — never try to draw arcs manually |
| **Custom label not showing** | Missing `SetLabelMode(obj, 3)` | Always: define → `SetLabelVisible(true)` → `SetCaption("text")` → `SetLabelMode(3)` |
| **Grid showing on geometry** | `showGrid` defaults to true | Explicitly pass `showGrid: false` in the state |
| **Tick marks (equal sides)** | No native tick mark command | Use a short perpendicular `Segment` near the midpoint — manual workaround |

### Debug checklist (GeoGebra)
1. Check `ggbState.cmds` in the raw response panel — read each command top to bottom.
2. Look for any command that references a label not yet defined above it.
3. Check for `SetColor` with hex strings instead of R,G,B.
4. Check for `^{` braces — replace with `^(` or just `^`.
5. If geometry points are invisible: each point needs its own `SetLabelVisible(A, true)` call.

---

## 3. Desmos 2D (GraphingCalculator)

**What it is:** Desmos Graphing Calculator v1.9 embedded in a div, controlled via `setExpressions()`. The LLM generates a JSON array of expression objects. Each expression has a `latex` string which is the Desmos input field content.

### Expression object fields
```json
{
  "id": "e1",
  "latex": "y=x^{2}-4",
  "color": "#007AFF",
  "hidden": false,
  "lineStyle": "SOLID",            // SOLID | DASHED | DOTTED
  "lineWidth": 2,
  "pointStyle": "POINT",           // POINT | OPEN | CROSS | SQUARE | PLUS | TRIANGLE | DIAMOND | STAR
  "pointSize": 9,
  "dragMode": "NONE",              // REQUIRED for any non-POINT pointStyle
  "points": true,
  "lines": true,
  "fill": false,
  "fillOpacity": 0.2,
  "label": "plain text (NO LaTeX)",
  "showLabel": true,
  "labelOrientation": "ABOVE",     // ABOVE | BELOW | LEFT | RIGHT | DEFAULT
  "type": "expression",            // or "table"
  "parametricDomain": { "min": "0", "max": "2\\pi" },
  "polarDomain":      { "min": "0", "max": "2\\pi" }
}
```

### LaTeX rules (critical — most failures come from these)
```
BACKSLASH REQUIRED in JSON strings (each \ must be written \\):
  \\sin  \\cos  \\tan  \\ln  \\log  \\sqrt{x}  \\frac{a}{b}
  \\pi  \\theta  \\alpha  \\beta  \\phi  \\infty

EXPONENTS with curly braces for multi-char:
  x^{2}  x^{2n+1}  e^{-x^{2}}   ← correct
  x^2n   ← WRONG (means x² · n)

DESMOS BUILT-INS need \\operatorname{} wrapper:
  \\operatorname{floor}(x)
  \\operatorname{ceil}(x)
  \\operatorname{abs}(x)
  \\operatorname{polygon}((0,0),(3,0),(2,4))
  \\operatorname{distance}(...)
  \\operatorname{midpoint}(...)
  WRONG: floor(x)  abs(x)  polygon(...)

PIECEWISE:
  y=\\left\\{x<0:-x,x\\geq0:x\\right\\}

PARAMETRIC: single expression  (\\cos(t), \\sin(t))  — NOT split into x= and y=
LABEL field: plain text only — never put LaTeX in label. Use Unicode: π θ ² ≤ ≥ ≈
```

### What it can do well
- **All graph types**: functions, parametric, polar, implicit, piecewise, inequalities, scatter
- **Polar**: `polarMode:true` + expression `r=1+\\cos(\\theta)` with `polarDomain`
- **Inequalities**: just write `y < x^{2}+1` — Desmos shades automatically. DASHED line if strict.
- **Scatter + regression**: use a `table` type expression then `y_1 \\sim mx_1 + b`
- **Labeled points**: any expression that evaluates to a point `(3, 4)` can have `label` + `showLabel:true`
- **Open/closed endpoints** for piecewise: `pointStyle:"OPEN"` with `dragMode:"NONE"` = hollow dot; `"POINT"` = solid
- **Unit circle**: place labeled points at exact coordinates, draw the circle, draw angle lines — all very clean
- **Fill under curve**: add `fill:true` to a function expression

### Known limitations / common failures
| Problem | Cause | Fix |
|---|---|---|
| **Expression shows red** | LaTeX parse error | Check for missing `\\` before `sin`, `cos`, `frac`, `sqrt`, etc. |
| **Label not visible** | Missing `showLabel:true` | Add `"showLabel": true` to the expression |
| **Open dot not showing** | `pointStyle:"OPEN"` without `dragMode:"NONE"` | Always pair non-POINT styles with `"dragMode":"NONE"` |
| **Parametric not rendering** | Written as two separate `x=` and `y=` expressions | Must be ONE expression: `(\\cos(t), \\sin(t))` |
| **Polar not showing** | `polarMode:false` or wrong domain | Set `polarMode:true` top-level and add `polarDomain:{min:"0",max:"2\\\\pi"}` |
| **`polygon` not recognized** | Bare `polygon(...)` instead of `\\operatorname{polygon}(...)` | Always use `\\operatorname{polygon}(...)` |
| **`floor`/`ceil`/`abs` errors** | Same — needs `\\operatorname{}` | Wrap: `\\operatorname{floor}(x)` |
| **Geometry labels missing** | Points defined but `showLabel:false` (default) | Explicitly `"showLabel": true` on each labeled point |
| **Multiple curves same color** | LLM reused the same hex | The `color` field supports any 6-digit hex — check JSON |
| **Regression line doesn't appear** | Table columns not named `x_1, y_1` | First col must be `x_1` (never plotted), second `y_1` (plotted); regression: `y_1 ~ mx_1+b` |
| **Tick marks on sides** | Not natively supported | Approximate with a short parametric stub perpendicular to the midpoint of each side |
| **Angle arcs** | No native arc shortcut | Draw: parametric arc `(r\\cos(t), r\\sin(t))` with `parametricDomain` from angle A to angle B; separate expression for degree label |

### Debug checklist (Desmos 2D)
1. Check raw `desmosState.expressions` array in response panel.
2. For each `latex` field: look for `sin`, `cos`, `frac`, `sqrt` — all must have a leading `\\`.
3. Check for `polygon(` without `\\operatorname{}`.
4. Check `dragMode` is `"NONE"` on points that have a non-POINT pointStyle.
5. If viewport looks wrong, check `left/right/top/bottom` values.

---

## 4. Desmos Geometry

**What it is:** Desmos Geometry calculator embedded via `Desmos.Geometry(elt)`, controlled via `setState()`. The LLM generates a state object (`version:2`) with an `elements` array. **Completely different API from Desmos 2D.**

### State format
```json
{
  "version": 2,
  "graph": {
    "viewport": { "xmin": -6, "ymin": -6, "xmax": 6, "ymax": 6 }
  },
  "elements": [
    { "id": "e1", "type": "point",   "x": 0,   "y": 0,   "label": "A", "showLabel": true,  "color": "#6042a6" },
    { "id": "e2", "type": "point",   "x": 3,   "y": 0,   "label": "B", "showLabel": true,  "color": "#6042a6" },
    { "id": "e3", "type": "segment", "startId": "e1",     "endId": "e2",   "color": "#2d70b3" },
    { "id": "e4", "type": "polygon", "vertexIds": ["e1","e2","e3"],        "color": "#388c46", "fillOpacity": 0.15 },
    { "id": "e5", "type": "circle",  "centerId": "e1",    "radiusPointId": "e2", "color": "#388c46" },
    { "id": "e6", "type": "angle",   "vertexId": "e2",    "startId": "e1", "endId": "e3",    "color": "#000000" }
  ]
}
```

### Element types and required fields
| type | Required fields | Optional |
|---|---|---|
| `point` | `x`, `y` | `label`, `showLabel`, `color` |
| `segment` | `startId`, `endId` | `color` |
| `ray` | `startId`, `throughId` | `color` |
| `line` | `startId`, `throughId` | `color` |
| `polygon` | `vertexIds` (array) | `color`, `fillOpacity` |
| `circle` | `centerId`, `radiusPointId` | `color` |
| `angle` | `vertexId`, `startId`, `endId` | `color` |

### Default color palette
| Object | Color |
|---|---|
| Points | `#6042a6` (purple) |
| Lines/Segments | `#2d70b3` (blue) |
| Polygons | `#388c46` (green) |
| Angle marks | `#000000` (black) |

### What it can do well
- **Pure geometric constructions** — points, segments, lines, rays, polygons, circles, angles, all with a toolbar-style UI
- Angle arc marks: the `angle` element type automatically draws the arc
- Triangle with all three angle marks: 3 `point` elements + 3 `segment` elements + 1 `polygon` + 3 `angle` elements
- Circles defined by center + radius point — exact and interactive
- Labels on every vertex via `showLabel:true` on points

### Known limitations / common failures
| Problem | Cause | Fix |
|---|---|---|
| **Blank canvas** | `Desmos.Geometry` not available on API key | Check browser console for `Desmos.Geometry is not a function` — API key may need the Geometry product enabled |
| **Elements not appearing** | A segment/polygon references a `startId` that doesn't exist | Elements array must be in order: **points first**, then segments/polygons that reference those points |
| **No algebraic curves** | Geometry is construction-only | Equations like `y=x²` return `notApplicable:true` and render as "N/A" |
| **Angle mark at wrong vertex** | `vertexId`, `startId`, `endId` mixed up | `vertexId` = the corner; `startId` and `endId` = the two points on the rays from that corner |
| **Circle wrong size** | `radiusPointId` references wrong point | Place an explicit point on the circumference at the desired distance |
| **Labels invisible** | `showLabel` not set | Explicitly `"showLabel": true` on each point |
| **Tick marks (equal sides)** | Not natively supported | No workaround in this engine — use GeoGebra if tick marks are needed |
| **Angle measure text (numeric °)** | Not directly supported by `angle` element type | The angle arc renders but may not show the degree value — use GeoGebra or Desmos 2D for labeled degree values |
| **Coordinate grid visible** | Some viewport modes show grid | Not an issue for diagrams where the construction is clearly labeled |
| **No axis labels** | Geometry is grid-free by nature | Correct. Use Desmos 2D if axis labels needed. |

### Debug checklist (Desmos Geometry)
1. Open browser console. If you see `Desmos.Geometry is not a function`, the API key doesn't have Geometry enabled.
2. Check raw `geometryState` in response panel — look at the `elements` array.
3. Confirm all point IDs referenced by other elements actually exist earlier in the array.
4. If `notApplicable:true` in the response, the spec was for a function/equation not a construction — expected.
5. For missing angle arcs: confirm `angle` element has `vertexId` (corner), `startId` (one side), `endId` (other side) — all referencing valid point IDs.

---

## Cross-Engine Troubleshooting

### "I described X but it didn't appear"

| What's missing | Most likely cause | Best engine for it |
|---|---|---|
| Angle arc marks | Geometry-only feature | GeoGebra `Angle()` or Desmos Geometry `angle` type |
| Equal-side tick marks | Not native in any automated engine | GeoGebra manual workaround; or Matplotlib manual `tick_mark` |
| Axis of symmetry (dashed) | LLM didn't add it | Explicit in `notes`: "draw dashed vertical line x=2.5 labeled 'axis of symmetry'" |
| Shaded inequality region | LLM omitted fill | GeoGebra: write `y < f(x)` directly. Desmos: `fill:true`. Matplotlib: `fill_between` |
| Regression line on scatter | LLM skipped it | GeoGebra: `FitLine(pts)`. Desmos: `y_1 ~ mx_1 + b`. Matplotlib: `np.polyfit` |
| Open/hollow endpoint | Default is filled | GeoGebra: `SetPointStyle(A,2)`. Desmos: `pointStyle:"OPEN"` + `dragMode:"NONE"` |
| Label on a point | LLM used default empty label | GeoGebra: `SetCaption(A,"text")` + `SetLabelMode(A,3)`. Desmos: `label:"text"` + `showLabel:true` |
| Polar curve | LLM wrote `r=` for GeoGebra | GeoGebra: always `Curve(f(t)*cos(t), f(t)*sin(t), t, 0, 2*pi)`. Desmos: `polarMode:true` + `r=` latex |
| 3D diagram | Desmos/GeoGebra 2D don't support it | Use Matplotlib `Axes3D` |
| Asymptote line | LLM didn't draw it | Add explicit instruction in `notes`: "draw dashed gray vertical asymptote at x=1 labeled 'x=1'" |

### "The spec type is wrong"

GeoGebra has an `autoCorrectType` rule server-side:
- If `type:"function"` but equations contain `sin/cos/tan` → auto-corrected to `"trig"`
- If equations contain `r=` or `theta` → auto-corrected to `"polar"`
- If equations contain `<` or `>` → auto-corrected to `"inequality"`

This does NOT happen for Matplotlib or Desmos — they receive the raw type. If you see a geometry diagram for a function spec in Desmos Geometry, it's because the LLM incorrectly didn't flag `notApplicable:true`.

### Per-engine notes field strategy

The `notes` field is passed verbatim into every LLM prompt. Use it for **explicit construction instructions**:

```
Good notes for geometry (GeoGebra / Desmos):
  "No coordinate grid. Label all vertices A, B, C. Mark right angle at A with a small square.
   Draw altitude from C, dashed. Label all sides with their lengths."

Good notes for functions (Matplotlib):
  "Show dashed axis of symmetry x=2.5. Shade under curve between x=0 and x=3 in light blue.
   Mark both roots as open hollow circles. Title: 'y = x²–5x+4'."

Good notes for trig (Desmos 2D):
  "Show midline y=1 as a dashed gray line. Label amplitude bracket on the left margin.
   Mark one full period with arrows and label 'T=2π/3'. Window: x [–7, 7]."
```

---

## Engine Selection Guide

| Spec type | Best default | Second choice |
|---|---|---|
| Function graph (y=f(x)) | Desmos 2D | GeoGebra |
| Two-function comparison | Desmos 2D | GeoGebra |
| Piecewise with endpoints | Desmos 2D | GeoGebra |
| Inequality shading | GeoGebra | Desmos 2D |
| Polar curve | Desmos 2D | GeoGebra |
| Parametric curve | GeoGebra | Desmos 2D |
| Geometric construction (labeled) | Desmos Geometry | GeoGebra |
| Triangle with angle arcs + tick marks | GeoGebra | Desmos Geometry |
| Scatter + regression | Desmos 2D | GeoGebra |
| Normal distribution (shaded bands) | Matplotlib | Desmos 2D |
| Number line with arrows | Matplotlib | Desmos 2D |
| 3D diagram / cone / solid | Matplotlib | — |
| Custom annotation / textbook layout | Matplotlib | — |
| Unit circle with all 16 angles | Desmos 2D | GeoGebra |
