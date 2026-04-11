# GeoGebra vs Desmos Suite — Engine Capability Reference
> Sources: GeoGebra Apps API (geogebra.github.io/docs) · Desmos API v1.9 (desmos.com/api/v1.9/docs) · Desmos Geometry API (desmos.com/api/v1.9/docs/geometry.html) · Desmos 3D API (desmos.com/api/3d)  
> This document describes what each engine natively supports per official documentation.  
> It does not describe our current implementation — implementation gaps are a separate concern.

**Notation:**
- ✅ **Native** — fundamental engine support
- ✅ **cmd** — GeoGebra: via `api.evalCommand("...")`
- ✅ **jsAPI** — GeoGebra: via direct JS API method (e.g. `api.setColor(...)`)
- ✅ **LaTeX** — Desmos 2D / 3D: via LaTeX string in `setExpression`
- ✅ **UI** — Desmos Geometry: interactive toolbar tool
- ❌ — not available in this engine
- ⚠️ — workaround only or partial support

---

## Architectural Fundamentals

**GeoGebra Classic 6** — dynamic geometry + CAS construction engine.  
Objects are *created*, *named*, and *persist*. `evalCommand(str)` runs GeoGebra scripts; `api.setColor(name, ...)` and similar direct JS methods modify existing named objects. `evalCommandCAS(str)` exposes a full symbolic algebra layer.

**Desmos GraphingCalculator (2D)** — reactive LaTeX expression renderer.  
Every expression is a self-contained LaTeX string that is evaluated and plotted. `setExpression`, `updateSettings`, and `setMathBounds` form the full API. No named object model — expressions have `id` strings for update purposes only. Purely numeric/graphical; no CAS.

**Desmos Geometry** (`Desmos.Geometry`) — drag-based constructive geometry tool.  
Interactive toolbar-driven construction: points, segments, rays, lines, vectors, polygons, circles, arcs, angles, compass. No LaTeX expression list. API consists of `getState()`/`setState()`, `setBlank()`, `setDefaultState()`, `screenshot()`, and a customizable toolbar (via `authorFeatures`). Shares constructor options with GraphingCalculator. Requires separate API key enablement (`Desmos.enabledFeatures.GeometryCalculator`). Docs: [desmos.com/api/v1.9/docs/geometry.html](https://www.desmos.com/api/v1.9/docs/geometry.html).

**Desmos Calculator3D** (`Desmos.Calculator3D`) — 3D graphing calculator.  
Reactive LaTeX expression renderer for 3D: surfaces `z=f(x,y)`, 3D parametric curves `(x(t),y(t),z(t))`, 3D points, 3D implicit surfaces. Built on the GraphingCalculator's underlying API — same `setExpression`/`getState`/`setState`/`updateSettings` interface. Bundled with `calculator.js` since API v1.10. Requires separate API key. Docs: [desmos.com/api/3d](https://www.desmos.com/api/3d).

> **API key note:** All four tools are loaded from the same `calculator.js` script. Each requires separate enablement per API key. Inspect `Desmos.enabledFeatures` at runtime to confirm which constructors are available.

---

## 1. Core Graph Types

| Capability | GeoGebra | Desmos 2D | Desmos Geometry | Desmos 3D |
|---|---|---|---|---|
| y = f(x) explicit function | ✅ cmd | ✅ LaTeX | ❌ | ⚠️ (renders as cylindrical surface; native form is `z=f(x,y)`) |
| z = f(x, y) surface | ✅ (3D app) | ❌ | ❌ | ✅ LaTeX |
| 3D parametric curve `(x(t),y(t),z(t))` | ✅ (3D app) | ❌ | ❌ | ✅ LaTeX |
| 2D implicit curve `f(x,y)=c` | ✅ Native | ✅ LaTeX | ❌ | ✅ (as 3D implicit surface at z=0) |
| 2D parametric curve | ✅ cmd `Curve(f(t),g(t),t,a,b)` | ✅ LaTeX `(f(t),g(t))` | ❌ | ⚠️ (3D parametric with `z=0` component) |
| Polar curve `r = f(θ)` | ✅ Native | ✅ LaTeX | ❌ | ❌ |
| Piecewise function | ✅ cmd `If(cond, a, b)` | ✅ LaTeX `\left\{cond:val\right\}` | ❌ | ✅ LaTeX |
| Inequality / shaded region | ✅ Native | ✅ LaTeX | ❌ | ❌ |
| Domain restriction on curve | ✅ cmd inline | ✅ LaTeX `\{a \le x \le b\}` | ❌ | ✅ LaTeX |
| Scatter plot | ✅ cmd `(list)` | ✅ LaTeX lists `(x_1,y_1)` | ❌ | ✅ LaTeX lists |
| Regression | ✅ cmd `FitLine`, `FitPoly` | ✅ LaTeX `y_1 \sim f(x_1)` | ❌ | ✅ LaTeX |
| Table of values (columns) | ❌ | ✅ `type:'table'` | ❌ | ✅ (shared API) |
| Sequence / list of points | ✅ cmd `Sequence(...)` | ✅ LaTeX list comprehension | ❌ | ✅ LaTeX |

---

## 2. Geometry & Construction

| Capability | GeoGebra | Desmos 2D | Desmos Geometry | Desmos 3D |
|---|---|---|---|---|
| Point | ✅ cmd `A = (x, y)` | ✅ LaTeX `(a,b)` static | ✅ UI (draggable) | ✅ LaTeX `(a,b,c)` |
| Segment, Ray, Line | ✅ cmd `Segment(A,B)`, `Ray(A,B)`, `Line(A,B)` | ⚠️ LaTeX (equation only) | ✅ UI | ❌ |
| Vector | ✅ cmd `Vector(A, B)` | ⚠️ parametric approach | ✅ UI | ✅ LaTeX |
| Polygon | ✅ cmd `Polygon(A,B,C)` | ✅ LaTeX `\operatorname{polygon}(...)` static | ✅ UI (draggable vertices) | ❌ |
| Circle | ✅ cmd `Circle(center, r)` | ✅ LaTeX `(x-h)^2+(y-k)^2=r^2` | ✅ UI (compass) | ❌ |
| Arc | ✅ cmd `Arc(...)`, `CircumcircularArc(...)` | ⚠️ parametric workaround | ✅ UI | ❌ |
| Angle (arc + measure) | ✅ cmd `Angle(A,B,C)` → arc + degrees | ⚠️ LaTeX (2-expresion workaround) | ✅ UI | ❌ |
| Ellipse, Parabola, Hyperbola | ✅ cmd from foci/directrix | ✅ LaTeX (algebraic eq) | ❌ | ❌ |
| Circumcircle / Incircle | ✅ cmd `Circumcircle(A,B,C)` | ❌ | ⚠️ (unknown toolbar coverage) | ❌ |
| Midpoint | ✅ cmd `MidPoint(A,B)` → named point | ❌ | ✅ UI | ❌ |
| Perpendicular / Parallel line | ✅ cmd `PerpendicularLine(A,l)` | ❌ | ✅ UI | ❌ |
| Angle bisector | ✅ cmd `AngleBisector(A,B,C)` | ❌ | ⚠️ (unknown toolbar coverage) | ❌ |
| Tangent line to curve | ✅ cmd `Tangent(A, f)` → line object | ⚠️ LaTeX (manual) | ❌ | ❌ |
| Transformations (reflect, rotate, dilate, translate) | ✅ cmd `Reflect`, `Rotate`, `Dilate`, `Translate` | ❌ | ⚠️ (unknown toolbar coverage) | ❌ |
| Locus | ✅ cmd `Locus(B, A)` | ❌ | ❌ | ❌ |
| Boolean / constraint checks | ✅ cmd `AreCollinear(...)`, `ArePerpendicular(...)` | ❌ | ❌ | ❌ |

> **Desmos Geometry note:** The Geometry API docs confirm toolbar support for points, lines, rays, segments, vectors, polygons, circles, arcs, and angles. Additional construction tools (transforms, bisectors, circumcircle) depend on toolbar availability which is customizable and not exhaustively listed in the API docs. Unlike `Desmos.GraphingCalculator`, there is no `setExpression` equivalent — the construction is entirely state-driven (`getState`/`setState`).

---

## 3. Styling & Annotation

### 3a. Object Appearance

Desmos 2D, Geometry, and Calculator3D all share the same underlying styling API. GeoGebra exposes styling as direct JS methods operating on named objects.

| Capability | GeoGebra JS API | Desmos 2D / Geometry / 3D |
|---|---|---|
| Color | `setColor(name, r, g, b)` (0–255) | `"color": "#rrggbb"` (hex) |
| Background color | `setBackgroundColor(name, r, g, b)` | n/a |
| Line style | `setLineStyle(name, n)` — 0=solid, 1=dash, 2=dot, 3=dash-dot, 4=long dash | `"lineStyle": "SOLID"/"DASHED"/"DOTTED"` |
| Line thickness | `setLineThickness(name, n)` — 1–13 | `"lineWidth": number` (pixels, any positive) |
| Line opacity | n/a (alpha via color only) | `"lineOpacity": 0–1` |
| Fill / interior shading | `setFilling(name, 0.0–1.0)` on any closed region | `"fill": true`, `"fillOpacity": 0–1` on polygon or parametric |
| Point style | `setPointStyle(name, n)` — 0=filled, 1=cross(×), 2=open, 3=plus(+), 4=filled diamond, 5=open diamond, 6–9=triangle variants | `"pointStyle": "POINT"/"OPEN"/"CROSS"` |
| Point size | `setPointSize(name, n)` — 1–9 | `"pointSize": number` (pixels) |
| Point opacity | n/a | `"pointOpacity": 0–1` |
| Visibility | `setVisible(name, bool)` | `"hidden": true` |
| Label text | `setCaption(name, text)` | `"label": "text"` |
| Label visibility | `setLabelVisible(name, bool)` | `"showLabel": bool` |
| Label style | `setLabelStyle(name, n)` — 0=NAME, 1=NAME+VALUE, 2=VALUE, 3=CAPTION | `"labelSize"` (LaTeX multiplier), `"labelOrientation"` (enum) |
| Custom color palette | n/a | `colors` constructor option — any valid CSS hex values |

> **Geometry default colors:** Points=purple `#6042a6`, lines/polygons=blue `#2d70b3`, circles/arcs=green `#388c46`, angles=black `#000000`. Same custom `colors` option as GraphingCalculator.

### 3b. Axis & Viewport

| Capability | GeoGebra | Desmos 2D | Desmos Geometry | Desmos 3D |
|---|---|---|---|---|
| Axis labels | ✅ `setAxisLabels(viewNum, x, y, z)` | ✅ `updateSettings({xAxisLabel:'...'})` | ✅ (shared option) | ✅ (x/y/z axis labels) |
| Show/hide axes | ✅ `setAxesVisible(viewNum, x, y)` | ✅ `updateSettings({showXAxis:false})` | ✅ | ✅ |
| Show/hide grid | ✅ `setGridVisible(bool)` | ✅ `updateSettings({showGrid:false})` | ✅ | ✅ |
| Set viewport / math bounds | ✅ `setCoordSystem(xMin, xMax, yMin, yMax)` | ✅ `setMathBounds({left,right,bottom,top})` | ✅ | ✅ |
| Polar grid | ❌ | ✅ `updateSettings({polarMode:true})` | ❌ | ❌ |
| Log scale axes | ❌ | ✅ `updateSettings({xAxisScale:'logarithmic'})` | ❌ | ❌ |
| Axis tick step | ❌ (auto only) | ✅ `updateSettings({xAxisStep:1})` | ❌ | ❌ |
| Axis arrow modes | ❌ | ✅ `updateSettings({xAxisArrowMode: Desmos.AxisArrowModes.BOTH})` | ❌ | ❌ |
| Degree mode | ✅ app param | ✅ `updateSettings({degreeMode:true})` | ✅ (shared option) | ✅ |

---

## 4. Analysis & Calculus

| Capability | GeoGebra | Desmos 2D | Desmos Geometry | Desmos 3D |
|---|---|---|---|---|
| Roots / x-intercepts (auto-labeled) | ✅ cmd `Root(f)` or `Root(f,a,b)` | ⚠️ numeric only, manual coords | ❌ | ❌ |
| Local extrema (auto-labeled) | ✅ cmd `Extremum(f)` | ❌ | ❌ | ❌ |
| Inflection points | ✅ cmd `InflectionPoint(f)` | ❌ | ❌ | ❌ |
| Derivative as plottable function | ✅ cmd `Derivative(f)` → named object | ✅ LaTeX `y=f'(x)` or `y=\frac{d}{dx}[expr]` | ❌ | ✅ LaTeX (partial derivatives possible) |
| Higher-order derivatives | ✅ cmd `Derivative(f, n)` | ✅ LaTeX `f''(x)`, `f'''(x)` | ❌ | ✅ LaTeX |
| Definite integral (numeric value) | ✅ cmd `Integral(f, a, b)` → value + shading | ✅ LaTeX `\int_a^b f(x)\,dx` → number only | ❌ | ❌ |
| Integral shading (visual) | ✅ automatic with `Integral(f,a,b)` | ⚠️ inequality/fill workaround | ❌ | ❌ |
| Intersection of two curves | ✅ cmd `Intersect(f, g)` → named points | ❌ | ❌ | ❌ |
| Tangent / normal line | ✅ cmd `Tangent(A,f)`, `Normal(A,f)` | ⚠️ manual slope + equation | ❌ | ❌ |
| Taylor polynomial | ✅ cmd `TaylorPolynomial(f, x0, n)` | ❌ | ❌ | ❌ |
| Limits | ✅ `evalCommandCAS("Limit(f, val)")` | ❌ | ❌ | ❌ |
| Symbolic CAS (simplify, factor, solve) | ✅ `evalCommandCAS("Simplify(...)")` etc. | ❌ | ❌ | ❌ |
| Numerical solve | ✅ cmd `NSolve(f = g)` | ❌ | ❌ | ❌ |
| Statistical functions | ✅ cmd `Mean`, `SD`, `Median`, `Variance` | ✅ LaTeX `\operatorname{mean}(L)` | ❌ | ✅ LaTeX |
| Distribution functions | ✅ cmd `Normal(μ,σ,x)`, `BinomialDist(...)` | ✅ LaTeX `\operatorname{normaldist}(μ,σ)` | ❌ | ✅ LaTeX |

---

## 5. Interactivity & Dynamics

| Capability | GeoGebra | Desmos 2D | Desmos Geometry | Desmos 3D |
|---|---|---|---|---|
| Sliders | ✅ auto-created for any free numeric variable | ✅ `sliderBounds:{min,max,step}` — explicit | ❌ (no expression list) | ✅ (same as Desmos 2D) |
| Draggable points | ✅ free points auto-draggable | ✅ `dragMode: Desmos.DragModes.XY/X/Y/NONE/AUTO` | ✅ all construction points | ✅ `dragMode` (same as 2D) |
| Animation | ✅ jsAPI `setAnimating(name, bool)` + `startAnimation()` | ✅ `playing: true` on slider expression | ❌ | ✅ `playing: true` |
| Trace (path of moving object) | ✅ jsAPI `setTrace(name, true)` | ❌ | ❌ | ❌ |
| Locus | ✅ cmd `Locus(B, A)` | ❌ | ❌ | ❌ |
| Actions (click / ticker events) | ✅ full GGB scripting | ✅ `actions:'auto'` option | ❌ | ✅ |
| Point labels with live values | ✅ `setLabelStyle(name, 1)` (NAME+VALUE) | ✅ via `HelperExpression` observable | ❌ | ✅ via `HelperExpression` |
| State save / restore | ✅ `getXML()` / `setXML(xml)` | ✅ `getState()` / `setState(obj)` JSON | ✅ `getState()` / `setState(obj)` JSON | ✅ `getState()` / `setState(obj)` JSON |
| Read numeric value of expression | ✅ jsAPI `getValue(name)`, `getXcoord(name)` | ✅ `HelperExpression({latex:'...'})` → `.numericValue` | ❌ | ✅ `HelperExpression` |
| Customizable toolbar | ❌ | ❌ | ✅ `authorFeatures:true` → per-tool enable/disable | ❌ |
| Screenshot (PNG) | ✅ `getBase64` jsAPI | ✅ `screenshot([opts])` / `asyncScreenshot` | ✅ `screenshot([opts])` | ✅ `screenshot([opts])` |

---

## 6. Data & Tables

| Capability | GeoGebra | Desmos 2D | Desmos Geometry | Desmos 3D |
|---|---|---|---|---|
| First-class typed table (columns) | ❌ | ✅ `type:'table'` with `dragMode`, computed columns | ❌ | ✅ (shared API) |
| List-based data | ✅ cmd — define lists, use `Sequence` for point objects | ✅ LaTeX — `x_1=[...]`, `y_1=[...]`, plot `(x_1,y_1)` | ❌ | ✅ LaTeX |
| Spreadsheet view | ✅ Native (full spreadsheet view) | ❌ | ❌ | ❌ |
| Column regression | ✅ cmd `FitLine(list)`, `FitPoly(list,n)`, `FitExp`, `FitLog` | ✅ LaTeX `y_1 \sim f(x_1)` tilde syntax | ❌ | ✅ LaTeX |
| Histogram / bar chart | ✅ cmd `BarChart(list, width)`, `Histogram(list)` | ✅ `\operatorname{histogram}(L)` | ❌ | ❌ |

---

## 7. LaTeX Expression Support

| Capability | GeoGebra | Desmos 2D | Desmos Geometry | Desmos 3D |
|---|---|---|---|---|
| LaTeX as primary input | ❌ (GGScript primary; `evalLaTeX(latex)` v5+ supplemental) | ✅ all expressions are LaTeX | ❌ (toolbar-based; no expression list) | ✅ all expressions are LaTeX |
| Standard operators `+`,`-`,`/`,`^` | ✅ GGScript | ✅ | ❌ | ✅ |
| Trig / log functions | ✅ | ✅ `\sin`, `\cos`, `\ln`, `\log` | ❌ | ✅ |
| Calculus `d/dx`, `∫_a^b` | ✅ | ✅ | ❌ | ⚠️ (`\frac{d}{dx}` works; 3D surface derivatives possible) |
| Lists and list comprehensions | ✅ | ✅ `[a,b,c]`, `[f(t) for t=[1...n]]` | ❌ | ✅ |
| Piecewise `\left\{cond:val\right\}` | ✅ via `If()` | ✅ | ❌ | ✅ |
| Subscript variables `x_1` | ✅ | ✅ | ❌ | ✅ |
| `evalLaTeX(latex, degreeMode)` API | ✅ v5.0+ (supplemental, not all LaTeX recognized) | n/a | n/a | n/a |

---

## 8. What Each Engine Cannot Do

### GeoGebra Cannot:
- Render a first-class data table in the expression list (no `type:'table'`)
- Set logarithmic axis scales
- Use polar grid mode
- Control axis tick spacing or axis arrow modes
- Perform regression with tilde notation (`y_1 \sim f(x_1)`)

### Desmos 2D (GraphingCalculator) Cannot:
- Construct derived geometric objects from other objects — no `MidPoint`, `Circumcircle`, `Intersect`, `Root` that produce new named objects
- Auto-label special points (roots, extrema, intersections) — all coordinates must be pre-computed
- Symbolic CAS (Desmos is purely numeric/graphical)
- Issue transformations as commands (Reflect, Rotate, Dilate) — must pre-compute new coordinates
- Trace or Locus constructions
- Plot 3D surfaces or 3D parametric curves — use `Desmos.Calculator3D`
- Interactive drag-construction toolbar — use `Desmos.Geometry`

### Desmos Geometry Cannot:
- Plot equations, functions, or LaTeX expressions (no expression list)
- Use sliders or programmatic animation
- Perform regression or statistical functions
- Export individual object numeric values (no `HelperExpression`)
- Any calculus (no expression evaluation)
- Symbolic CAS
- 3D construction
- Be driven expression-by-expression via `setExpression` — state is controlled as a whole via `getState`/`setState`

### Desmos 3D (Calculator3D) Cannot:
- 2D-specific features: polar mode grid, inequalities shading, 2D-only geometry
- Symbolic CAS
- Construct derived geometric objects (no `Root`, `Intersect`, `Extremum` producing named objects)
- Integral shading (automatic) — same workaround limitation as Desmos 2D
- Locus or Trace constructions
- Spreadsheet view
- Interactive drag-construction toolbar — use `Desmos.Geometry`

---

## 9. Summary: When to Use Each Engine

| Use Case | Best Engine(s) | Key Reason |
|---|---|---|
| Dynamic 2D construction (triangles, circles, derivations) | **GeoGebra** | `Polygon`, `Angle`, `Circumcircle`, `Reflect`, `Dilate` — derived named objects |
| Interactive student geometry (drag-based) | **Desmos Geometry** | Clean toolbar UI; state serializable; API-embeddable; no equation complexity |
| Calculus visualization (roots, extrema, integrals, intersections) | **GeoGebra** | `Root`, `Extremum`, `Inflection`, `Intersect`, `Integral` — auto-label and auto-shade |
| CAS / symbolic algebra | **GeoGebra** | `evalCommandCAS` with `Simplify`, `Factor`, `Solve`, `Limit`, `TaylorPolynomial` |
| Pure 2D function graphing (algebra, trig, polar) | **Desmos 2D** | Cleanest LaTeX input; polar grid; native derivative syntax |
| 3D surfaces and parametric curves | **Desmos 3D** or **GeoGebra 3D app** | `Desmos.Calculator3D` for easy LaTeX-driven 3D; GeoGebra 3D for construction + CAS in 3D |
| Data tables and regression | **Desmos 2D** or **Desmos 3D** | First-class `type:'table'`; tilde regression; draggable table points |
| Integral shading | **GeoGebra** | One command (`Integral(f,a,b)`); Desmos requires an inequality workaround |
| Annotations and advanced styling | **Tie** | GGB: 9 point styles, 5 line styles via jsAPI. Desmos: 3 point/line styles, but cleaner hex colors and opacity control. |
| Interactive sliders | **GeoGebra** or **Desmos 2D/3D** | GGB auto-detects free variables; Desmos requires explicit `sliderBounds` declaration |
| Log-scale axes, polar grid | **Desmos 2D** | GeoGebra lacks both |
| Spreadsheet / statistics view | **GeoGebra** | Full spreadsheet view built into app alongside algebra and geometry views |
