# Desmos Graphing Calculator — Complete API & Prompt Reference
> Source: Desmos API v1.10 official docs + SOL-specific notes
> Purpose: Understand full capabilities; refine AI prompt instructions in desmosService.js

---

## Table of Contents
1. [How the Embed Works](#1-how-the-embed-works)
2. [The Expression Object — Full Schema](#2-the-expression-object--full-schema)
3. [LaTeX Syntax Rules](#3-latex-syntax-rules)
4. [Styles Reference](#4-styles-reference)
5. [Colors Reference](#5-colors-reference)
6. [Graph Settings (Viewport & Display)](#6-graph-settings-viewport--display)
7. [Expression Types Catalog](#7-expression-types-catalog)
8. [Tables](#8-tables)
9. [Sliders](#9-sliders)
10. [Geometry Patterns in the Graphing Calculator](#10-geometry-patterns-in-the-graphing-calculator)
11. [Known AI Failure Modes & Fixes](#11-known-ai-failure-modes--fixes)
12. [Per-Course Prompt Rules](#12-per-course-prompt-rules)
13. [What Desmos Cannot Do](#13-what-desmos-cannot-do)
14. [Refined Prompt Snippet Library](#14-refined-prompt-snippet-library)

---

## 1. How the Embed Works

The DesmosRenderer embeds a `Desmos.GraphingCalculator` in a div, then calls `calculator.setExpression()` for each expression in the AI-generated JSON. Our current flow:

1. AI generates a JSON blob with `expressions[]`, `viewport`, `showGrid`, `showAxes`, `title`
2. `parseDesmosResponse()` validates and normalizes it
3. `DesmosRenderer.js` loads the Desmos script, constructs the calculator, applies the state

The Desmos API ships a single JS file: `calculator.js`. The same file contains the Graphing Calculator, Geometry tool, Four-Function, and Scientific calculators. Feature access is controlled per API key.

**Our embed constructor options** (set once at init — do NOT appear in serialized state):
```js
Desmos.GraphingCalculator(elt, {
  expressions: false,      // hide the expression list panel (cleaner embed)
  settingsMenu: false,     // hide the wrench
  zoomButtons: true,       // keep zoom controls
  lockViewport: false,     // allow student pan/zoom
  border: false,           // cleaner look in our UI
  keypad: false,           // no on-screen keypad needed
  expressionsCollapsed: true,
})
```

---

## 2. The Expression Object — Full Schema

Every item in the `expressions` array is an **expression object**. Here is the complete set of valid properties:

### Core properties (always relevant)
| Property | Type | Default | Notes |
|---|---|---|---|
| `id` | String | auto | Must be letters/numbers/underscore only. Use `"e1"`, `"p1"`, etc. |
| `latex` | String | `""` | The mathematical expression. See LaTeX rules below. |
| `color` | String (hex) | cycles 6 defaults | e.g. `"#007AFF"`. Controls curve/point/fill color. |
| `hidden` | Boolean | false | Set true to define a variable secretly without plotting it. |
| `type` | String | `"expression"` | Can also be `"table"` or `"text"`. Omit for expressions. |

### Curve display
| Property | Type | Default | Notes |
|---|---|---|---|
| `lineStyle` | Enum string | `"SOLID"` | `"SOLID"`, `"DASHED"`, `"DOTTED"` |
| `lineWidth` | Number or LaTeX string | `2.5` | Pixels. Increase for emphasis, e.g. `4`. |
| `lineOpacity` | Number 0–1 | `0.9` | |

### Point display
| Property | Type | Default | Notes |
|---|---|---|---|
| `pointStyle` | Enum string | `"POINT"` | `"POINT"` (filled), `"OPEN"` (hollow), `"CROSS"` (×) |
| `pointSize` | Number or LaTeX string | `9` | Diameter in pixels. |
| `pointOpacity` | Number 0–1 | `0.9` | |
| `dragMode` | Enum string | `"AUTO"` | `"NONE"`, `"X"`, `"Y"`, `"XY"`. Must be `"NONE"` to use `OPEN`/`CROSS` style on named points. |
| `points` | Boolean | true | Whether to plot points (for point lists). |
| `lines` | Boolean | false | Whether to connect points with line segments. |

### Fill / polygon / inequality
| Property | Type | Default | Notes |
|---|---|---|---|
| `fill` | Boolean | false | Fill the interior of a polygon or closed parametric curve. |
| `fillOpacity` | Number 0–1 | `0.4` | |

### Labels (points only)
| Property | Type | Default | Notes |
|---|---|---|---|
| `label` | String | `""` | **Plain text only — no LaTeX backslashes.** Use Unicode for math symbols. |
| `showLabel` | Boolean | false | Set true to display the label. |
| `labelSize` | LaTeX string | `"1"` | Multiplies default font size. `"1.5"` = 50% bigger. |
| `labelOrientation` | Enum string | `"DEFAULT"` | `"ABOVE"`, `"BELOW"`, `"LEFT"`, `"RIGHT"`, `"DEFAULT"` |

### Parametric / polar domains
| Property | Type | Notes |
|---|---|---|
| `parametricDomain` | `{ min: string, max: string }` | LaTeX strings. e.g. `{ min: "0", max: "2\\pi" }` |
| `polarDomain` | `{ min: string, max: string }` | Same format. |

### Sliders
| Property | Type | Notes |
|---|---|---|
| `sliderBounds` | `{ min: string, max: string, step?: string }` | All LaTeX strings. Omit step for continuous. |
| `playing` | Boolean | Whether to auto-animate. |

---

## 3. LaTeX Syntax Rules

Desmos uses a subset of LaTeX for expressions. **Critical rules for AI output:**

### Constants
- `\pi` — pi (3.14159...)
- `e` — Euler's number (2.71828...)
- `\tau` — tau (= 2π)

### Arithmetic
```
+  -  *  /  ^
x^{2x}     (curly braces required when exponent is multi-character)
\frac{a}{b}  (fraction)
\sqrt{x}   (square root)
\sqrt[n]{x} (nth root)
```

### Functions — MUST use parentheses in AI-generated code
```
sin(x)   cos(x)   tan(x)   cot(x)   sec(x)   csc(x)
arcsin(x)  arccos(x)  arctan(x)
ln(x)    log(x)   \log_a(b)
abs(x)   floor(x)   ceil(x)   round(x)   sign(x)
nCr(n,r)   nPr(n,r)
```
> **AI failure point**: AI often writes `\lfloor x \rfloor` for floor. Desmos DOES NOT parse this. Always use `floor(x)`.

### Points and Lists
```
(2, 3)                   — single point
(1, 1), (2, 4), (3, 9)  — point list
[1, 2, 3]                — number list
```

### Implicit curves
```
x^2 + y^2 = 25          — circle of radius 5
x^2/9 + y^2/4 = 1       — ellipse
```

### Piecewise
```
y = \left\{ x < 0: -x, x \geq 0: x \right\}
```
Or the modern form using `{...}` conditions:
```
y = \{x < 0: -x, x \geq 0: x\}
```

### Parametric curves
Expressed as a point expression with a parameter `t`:
```
(t^2, t^3)
(\cos(t), \sin(t))
(2\cos(t), 3\sin(t))
```
Restrict domain with `parametricDomain: { min: "0", max: "2\\pi" }`.

### Polar curves
```
r = 1 + \cos(\theta)    — cardioid
r = 2                   — circle of radius 2
r = \theta              — Archimedean spiral
```
Enable polar grid in settings: `polarMode: true`.
Restrict domain with `polarDomain: { min: "0", max: "2\\pi" }`.

### Polygons
```
polygon((0,0), (4,0), (2,3))        — triangle
polygon((0,0), (3,0), (3,2), (0,2)) — rectangle
```
Add `fill: true` and `fillOpacity: 0.2` to shade interior.

### Inequalities (shading)
```
y < x^2          — below parabola
y > 2x + 1       — above line
x^2 + y^2 < 9   — interior of circle
y >= \sin(x)
```

### Variable definitions (no graph, just defines a value)
```
m = 2
a = \sqrt{3}
```
Variables defined this way can be referenced by other expressions.

### Function definitions
```
f(x) = x^2 + 2x + 1
g(t) = \sin(t) + t
```

### Regressions
Requires a table of data. In the expression linked to a table:
```
y_1 ~ mx_1 + b     — linear regression
y_1 ~ ax_1^2 + bx_1 + c
```

### Distributions (statistical)
```
normaldist(\mu, \sigma)
binomialdist(n, p)
```
Requires `distributions: true` constructor option (default).

---

## 4. Styles Reference

### Point styles (use as string `"POINT"`, `"OPEN"`, `"CROSS"`)
| Style | Appearance | Use case |
|---|---|---|
| `"POINT"` | Filled circle | Standard closed point |
| `"OPEN"` | Hollow circle | Open circle on number lines / piecewise domain endpoints |
| `"CROSS"` | × symbol | Excluded points, or decorative |

**Critical rule**: `OPEN` and `CROSS` only work when `dragMode` is `"NONE"` or resolves to static. For unassigned numeric points like `(2,3)` the default dragMode is already `NONE` so it works. For named points like `A=(2,3)` you must explicitly add `dragMode: "NONE"`.

### Curve styles (use as string `"SOLID"`, `"DASHED"`, `"DOTTED"`)
| Style | Appearance | Use case |
|---|---|---|
| `"SOLID"` | Solid line | Default, most functions |
| `"DASHED"` | Dashed line | Asymptotes, reference lines, non-included boundaries |
| `"DOTTED"` | Dotted line | Softer reference, de-emphasized curves |

---

## 5. Colors Reference

### Desmos default palette (built-in names)
| Name | Hex |
|---|---|
| `#c74440` | Red |
| `#2d70b3` | Blue |
| `#388c46` | Green |
| `#6042a6` | Purple |
| `#fa7e19` | Orange |
| `#000000` | Black |

### SOL brand colors (what our prompts use)
| Name | Hex | Use |
|---|---|---|
| `solBlue` | `#007AFF` | Primary / first function |
| `solRed` | `#FF3B30` | Second function or key points |
| `solGreen` | `#34C759` | Third curve, filled regions, solution sets |
| `solOrange` | `#FF9500` | Fourth curve, step functions |
| `solPurple` | `#5856D6` | Fifth curve, transformations |
| `solGray` | `#8E8E93` | Asymptotes, axes of symmetry, reference lines |

### Color assignment conventions for AI:
- 1st/main curve → `#007AFF`
- 2nd curve or key point → `#FF3B30`
- 3rd curve, shaded fill, solution → `#34C759`
- Reference lines, asymptotes, dashes → `#8E8E93`
- Polygon fill → use curve color at reduced `fillOpacity: 0.15–0.3`

---

## 6. Graph Settings (Viewport & Display)

These are **graph state settings** (serialized in state, overwritten by `setState`). They go in the top-level JSON alongside `expressions`.

| Setting | Type | Default | Use |
|---|---|---|---|
| `degreeMode` | Boolean | false | Set `true` for trig in degrees (useful for Geometry/Trig courses) |
| `showGrid` | Boolean | true | Set `false` for clean geometry diagrams |
| `polarMode` | Boolean | false | Set `true` for polar coordinate graphs |
| `showXAxis` | Boolean | true | |
| `showYAxis` | Boolean | true | |
| `xAxisNumbers` | Boolean | true | Set `false` for number line diagrams where tick values clutter |
| `yAxisNumbers` | Boolean | true | |
| `xAxisStep` | Number | 0 (auto) | Force a tick spacing, e.g. `\pi/2 ≈ 1.5708` for trig graphs |
| `yAxisStep` | Number | 0 (auto) | |
| `xAxisMinorSubdivisions` | Number | 0 (auto) | 0–5; subdivisions between major ticks |
| `yAxisMinorSubdivisions` | Number | 0 (auto) | |
| `xAxisArrowMode` | Enum | `"NONE"` | `"NONE"`, `"POSITIVE"`, `"BOTH"` |
| `yAxisArrowMode` | Enum | `"NONE"` | Add `"BOTH"` for number line style axes |
| `xAxisLabel` | String | `""` | Axis label text, e.g. `"x"`, `"t (seconds)"` |
| `yAxisLabel` | String | `""` | Axis label text |

### Viewport
Our schema uses Desmos's native keys: `viewport: { left, bottom, right, top }` — matching `setMathBounds()` exactly. No translation needed.

**Viewport sizing guidelines:**
| Graph type | Typical bounds |
|---|---|
| K–5 simple numbers | `-1 to 10`, `-1 to 10` |
| Basic linear | `-5 to 5`, `-10 to 10` |
| Quadratic | `-5 to 5`, `-3 to 20` (fit vertex + intercepts) |
| Trig (sin/cos) | `-7 to 7` (≈ `±2π`), `-2 to 2` |
| Trig (tan) | `-7 to 7`, `-5 to 5` |
| Polar | `-3 to 3`, `-3 to 3` |
| Geometry (e.g. triangle) | fit tightly, equal x/y scale |
| Number line | `-5 to 10`, `-1 to 1` |

**Equal aspect ratio for geometry**: right−left should equal top−bottom for undistorted shapes. e.g. `left:-6, right:6, bottom:-6, top:6`.

---

## 7. Expression Types Catalog

### 7.1 Explicit function  y = f(x)
```json
{ "id": "f1", "latex": "y=x^2-4", "color": "#007AFF" }
```

### 7.2 Implicit curve  F(x,y) = 0
```json
{ "id": "c1", "latex": "x^2+y^2=25", "color": "#007AFF" }
{ "id": "e1", "latex": "\\frac{x^2}{9}+\\frac{y^2}{4}=1", "color": "#007AFF" }
```

### 7.3 Parametric curve
```json
{
  "id": "p1",
  "latex": "(\\cos(t), \\sin(t))",
  "color": "#007AFF",
  "parametricDomain": { "min": "0", "max": "2\\pi" }
}
```

### 7.4 Polar curve
```json
{
  "id": "r1",
  "latex": "r=1+\\cos(\\theta)",
  "color": "#007AFF",
  "polarDomain": { "min": "0", "max": "2\\pi" }
}
```
Add `"polarMode": true` to graph settings.

### 7.5 Inequality (shaded region)
```json
{ "id": "i1", "latex": "y<x^2", "color": "#34C759" }
{ "id": "i2", "latex": "x^2+y^2<9", "color": "#007AFF" }
```

### 7.6 Point (static, labeled)
```json
{
  "id": "pt1",
  "latex": "(2, 5)",
  "color": "#FF3B30",
  "label": "Vertex",
  "showLabel": true,
  "pointStyle": "POINT",
  "dragMode": "NONE"
}
```

### 7.7 Open circle (excluded endpoint)
```json
{
  "id": "oc1",
  "latex": "(3, 0)",
  "color": "#FF3B30",
  "pointStyle": "OPEN",
  "dragMode": "NONE"
}
```
> **Key rule**: dragMode MUST be "NONE" for OPEN/CROSS to render correctly.

### 7.8 Polygon
```json
{
  "id": "tri",
  "latex": "polygon((0,0),(4,0),(2,3))",
  "color": "#007AFF",
  "fill": true,
  "fillOpacity": 0.15
}
```

### 7.9 Piecewise function
```json
{
  "id": "pw1",
  "latex": "y=\\{x<0:-x,x\\ge0:x\\}",
  "color": "#007AFF"
}
```

### 7.10 Variable definition (invisible, reusable)
```json
{ "id": "v1", "latex": "a=3", "hidden": true }
{ "id": "f1", "latex": "y=ax^2", "color": "#007AFF" }
```

### 7.11 Number line point
```json
{
  "id": "nl1",
  "latex": "(3, 0)",
  "color": "#007AFF",
  "pointStyle": "POINT",
  "dragMode": "NONE",
  "label": "3",
  "showLabel": true,
  "labelOrientation": "ABOVE"
}
```
Number line viewport: `{ "left": -2, "bottom": -1, "right": 10, "top": 1 }`, `showGrid: false`, `showYAxis: false`.

### 7.12 Vertical line  x = c
```json
{ "id": "vl1", "latex": "x=3", "color": "#8E8E93", "lineStyle": "DASHED" }
```

### 7.13 Horizontal line  y = c
```json
{ "id": "hl1", "latex": "y=0", "color": "#8E8E93" }
```

### 7.14 Line through two points
```json
{ "id": "l1", "latex": "y=2x+1", "color": "#007AFF" }
```
Or using parametric if you need endpoint control:
```json
{
  "id": "seg1",
  "latex": "(1+3t, 2+t)",
  "parametricDomain": { "min": "0", "max": "1" },
  "color": "#007AFF"
}
```

### 7.15 Angle arc (approximation)
Draw a small circle arc at the vertex to indicate angle measure:
```json
{
  "id": "arc1",
  "latex": "(0.5\\cos(t), 0.5\\sin(t))",
  "parametricDomain": { "min": "0", "max": "\\frac{\\pi}{4}" },
  "color": "#FF3B30"
}
```
Scale the `0.5` radius to fit the diagram. The domain min/max defines the arc from one ray angle to another.

### 7.16 Regression
Requires a table (see section 8) and a regression expression referencing table variables:
```json
{ "id": "reg1", "latex": "y_1~mx_1+b", "color": "#FF3B30" }
```

---

## 8. Tables

Tables create a data table in the expression list and plot the specified points.

```json
{
  "type": "table",
  "id": "t1",
  "columns": [
    {
      "latex": "x",
      "values": ["1", "2", "3", "4", "5"]
    },
    {
      "latex": "y",
      "values": ["2", "4", "6", "8", "10"],
      "color": "#007AFF",
      "points": true,
      "lines": true,
      "lineStyle": "SOLID",
      "pointStyle": "POINT"
    }
  ]
}
```

Table column properties:
| Property | Notes |
|---|---|
| `latex` | Required. Column header variable name or computed expression. |
| `values` | Array of LaTeX strings. Required for input columns; omit for computed columns. |
| `color` | Hex string. |
| `hidden` | Boolean. Hide from graph. |
| `points` | Boolean. Plot points. |
| `lines` | Boolean. Connect with line segments. |
| `lineStyle` | `"SOLID"`, `"DASHED"`, `"DOTTED"`. |
| `pointStyle` | `"POINT"`, `"OPEN"`, `"CROSS"`. |
| `dragMode` | `"NONE"`, `"X"`, `"Y"`, `"XY"`. For interactive drag. |

**Note**: The first column is never plotted as a dependent variable. Color and hidden are ignored for it.

---

## 9. Sliders

A slider is created by assigning a variable to a numeric value. Desmos auto-detects it:
```json
{ "id": "s1", "latex": "a=2", "sliderBounds": { "min": "-5", "max": "5" } }
```

Then reference `a` in another expression:
```json
{ "id": "f1", "latex": "y=ax^2", "color": "#007AFF" }
```

Slider options:
- `sliderBounds.min` / `.max` / `.step` — all LaTeX strings, e.g. `"\\pi"`. No variables allowed in bounds, only numbers and constants.
- `playing: true` — auto-animate the slider on load.

**Useful for**: transformations, exploring parameters, visual proofs of continuity.

---

## 10. Geometry Patterns in the Graphing Calculator

`Desmos.Geometry` states are opaque blobs written by internal drag/constraint tools — there is no JS construction API (`addPoint()`, `addSegment()`, etc.). You cannot synthetically generate a valid Geometry tool state. However, two workarounds exist:

**Option A — Template library (for interactive construction)**  
Pre-build a catalog of Geometry tool states (right triangle, parallel lines, circle with inscribed angle, etc.) saved as JSON. AI's role: pick a template ID and supply key coordinates. A small patcher substitutes coordinates into the blob. Good when you specifically need the Geometry tool's drag-constrain interactivity.

**Option B — Geometry spec → Graphing Calculator (recommended for AI generation)**  
Have AI generate a declarative geometry description (structured JSON of shapes and coordinates), then a `geometryToExpressions()` converter turns it into Graphing Calculator LaTeX expressions. AI never touches state format directly — it just describes *what to draw*. This is already how our pipeline works for most geometry requests and covers ~95% of K-12 geometry needs.

The Graphing Calculator supports everything below through `polygon()`, implicit equations, parametric segments, and labeled points. The only thing it cannot replicate is the Geometry tool's drag-constrained interactive construction — which isn't needed for AI-generated explanations.

### Right angle marker
A small polygon at the vertex corner:
```json
{
  "id": "ra1",
  "latex": "polygon((0.3,0),(0.3,0.3),(0,0.3))",
  "color": "#8E8E93",
  "fill": false
}
```
Scale the `0.3` to match the diagram's scale.

### Tick marks (congruent sides)
Short perpendicular segment at the midpoint of a segment:
- Segment from `(0,0)` to `(4,0)` → midpoint `(2,0)`, perpendicular is vertical
```json
{
  "id": "tick1",
  "latex": "(2, t)",
  "parametricDomain": { "min": "-0.15", "max": "0.15" },
  "color": "#8E8E93"
}
```

### Labeled triangle with vertices
```json
[
  { "id": "tri", "latex": "polygon((0,0),(4,0),(2,3))", "color": "#007AFF", "fill": true, "fillOpacity": 0.1 },
  { "id": "A", "latex": "(0,0)", "label": "A", "showLabel": true, "labelOrientation": "LEFT", "color": "#007AFF", "dragMode": "NONE" },
  { "id": "B", "latex": "(4,0)", "label": "B", "showLabel": true, "labelOrientation": "RIGHT", "color": "#007AFF", "dragMode": "NONE" },
  { "id": "C", "latex": "(2,3)", "label": "C", "showLabel": true, "labelOrientation": "ABOVE", "color": "#007AFF", "dragMode": "NONE" }
]
```

### Parallel lines with transversal
```json
[
  { "id": "l1", "latex": "y=2", "color": "#007AFF" },
  { "id": "l2", "latex": "y=-1", "color": "#007AFF" },
  { "id": "t1", "latex": "y=x", "color": "#FF3B30" }
]
```
Add angle arc expressions at each intersection to label angle pairs.

### Circle with center and radius labeled
```json
[
  { "id": "circ", "latex": "x^2+y^2=16", "color": "#007AFF" },
  { "id": "ctr", "latex": "(0,0)", "label": "O", "showLabel": true, "labelOrientation": "BELOW", "color": "#007AFF", "dragMode": "NONE" },
  { "id": "rad", "latex": "(0,t)", "parametricDomain": { "min": "0", "max": "4" }, "color": "#FF3B30", "lineStyle": "DASHED" },
  { "id": "rlabel", "latex": "(0.2, 2)", "label": "r=4", "showLabel": true, "color": "#FF3B30", "dragMode": "NONE" }
]
```

### Number line with open/closed circles
```json
[
  { "id": "line", "latex": "y=0", "color": "#8E8E93" },
  { "id": "closed", "latex": "(2,0)", "pointStyle": "POINT", "dragMode": "NONE", "color": "#007AFF", "label": "2", "showLabel": true, "labelOrientation": "ABOVE" },
  { "id": "open", "latex": "(5,0)", "pointStyle": "OPEN", "dragMode": "NONE", "color": "#007AFF", "label": "5", "showLabel": true, "labelOrientation": "ABOVE" },
  { "id": "ray", "latex": "(2+t, 0)", "parametricDomain": { "min": "0", "max": "3" }, "color": "#007AFF", "lineWidth": 3 }
]
```
Set showGrid: false, showYAxis: false for number line graphs.

### Transformation: reflected triangle
```json
[
  { "id": "orig", "latex": "polygon((1,1),(3,1),(2,3))", "color": "#007AFF", "fill": true, "fillOpacity": 0.15 },
  { "id": "refl", "latex": "polygon((-1,1),(-3,1),(-2,3))", "color": "#FF3B30", "fill": true, "fillOpacity": 0.15 },
  { "id": "axis", "latex": "x=0", "color": "#8E8E93", "lineStyle": "DASHED" }
]
```

---

## 11. Known AI Failure Modes & Fixes

These are patterns where AI consistently generates incorrect Desmos output. Each fix should be added to the system prompt.

### Failure 1: `\lfloor x \rfloor` for floor function
- **Wrong**: `"latex": "y=\\lfloor x \\rfloor"`
- **Right**: `"latex": "y=floor(x)"`
- **Also affected**: `ceil(x)`, `round(x)`, `abs(x)` — always use function notation

### Failure 2: LaTeX in label strings
- **Wrong**: `"label": "\\pi/2"` or `"label": "$\\theta$"`
- **Right**: `"label": "π/2"` or `"label": "θ"`
- **Rule**: Labels are **plain text**, never LaTeX. Use Unicode: π θ α β σ μ ² ³ ≈ ≠ ≤ ≥ √ ∞ °

### Failure 3: Wrong trig viewport for π multiples
- **Wrong**: `viewport: { left: -10, right: 10 }` for trig graphs
- **Right**: `viewport: { xmin: -6.28, xmax: 6.28 }` for ±2π, or `-9.42 to 9.42` for ±3π
- π ≈ 3.14159, 2π ≈ 6.28318, 3π ≈ 9.42478

### Failure 4: Open circle without dragMode: NONE
- **Wrong**: `{ "latex": "(3,0)", "pointStyle": "OPEN" }`
- **Right**: `{ "latex": "(3,0)", "pointStyle": "OPEN", "dragMode": "NONE" }`

### Failure 5: Using `\left(` / `\right)` delimiters
- Desmos does NOT require `\left(` and `\right)` for sizing — just use regular `(` `)`.
- AI trained on general LaTeX often adds these unnecessarily; they usually work but add noise.

### Failure 6: Polygon with wrong bracket style
- **Wrong**: `"latex": "polygon[(0,0),(1,0),(0,1)]"`
- **Right**: `"latex": "polygon((0,0),(1,0),(0,1))"`
- Desmos polygon uses parentheses, not square brackets.

### Failure 7: Degrees vs. radians for trig
- Desmos defaults to **radians**. `sin(90)` = `sin(90 radians)` ≈ 0.894, not 1.
- For degree mode: include `"degreeMode": true` in the graph settings. Then `sin(90)` = 1.
- **Always set degreeMode when the course is Geometry or Trig and the context involves degree angles.**

### Failure 8: Viewport not accounting for aspect ratio in geometry
- A square on screen looks like a rectangle if xrange ≠ yrange
- For geometry diagrams: **always set equal x and y ranges** unless explicitly showing a non-square space

### Failure 9: Parametric domain bounds with variables
- **Wrong**: `"parametricDomain": { "min": "0", "max": "a" }` where a is a variable
- **Right**: Only numbers and constants (`\pi`, `e`, `\tau`) allowed. No slider variables.

### Failure 10: Missing fill on polygons
- AI often generates polygons without `"fill": true` — they render as outlines only.
- For any geometry polygon that should appear as a shape (not just edges), add `"fill": true, "fillOpacity": 0.15`.

---

## 12. Per-Course Prompt Rules

### K–5 Math
- Integer-friendly viewport: e.g. `xmin: -1, xmax: 12, ymin: -1, ymax: 12`
- Large pointSize (12–14) for visibility
- showGrid: true, simple integer ticks
- No trig, no implicit curves
- Number bonds → use table or point list
- Area models → polygon() with fill

### Algebra 1
- Main function families: linear, quadratic, absolute value, piecewise
- Viewport: `-10 to 10` for general use, zoom for vertex visibility
- Include x-intercepts and vertex as labeled points
- Regression: use table + `y_1 ~ mx_1 + b`

### Algebra 2
- Polynomial, rational, exponential, logarithmic, radical
- Vertical asymptotes: dashed vertical line (x = c, lineStyle: DASHED, color: #8E8E93)
- Horizontal asymptotes: dashed horizontal line (y = c)
- Domain restrictions: `{x > 0: ...}` piecewise or just let the natural domain avoid errors
- Complex zeros are NOT visible — don't try to label them on real-number graphs

### Geometry
- **Always use `degreeMode: true`** when showing angle measures
- **Use equal aspect ratio** (square viewport) for undistorted shapes
- **showGrid: false** for clean polygon diagrams
- Use `polygon()` for all polygons — never approximate with line segments
- Label vertices with A, B, C etc. using `showLabel: true, labelOrientation: "ABOVE"/"BELOW"/"LEFT"/"RIGHT"`
- Use Unicode ° in labels: `"label": "60°"` not `"label": "60\\circ"`

### Trigonometry
- **degreeMode: false** (radians are standard in trig)
- Viewport: `xmin: -6.28, xmax: 6.28` for basic period; expand for multiple periods
- For tick step on x-axis matching π/2: `xAxisStep: 1.5708` (= π/2)
- Include amplitude, period, and phase shift as labeled annotations or notes
- `sin`, `cos`, `tan` — always use parentheses: `sin(x)` not `\sin x`

### Precalculus / Mathematical Analysis
- All conic sections available as implicit curves
- Parametric and polar both work natively
- Logarithmic scales: `xAxisScale: "logarithmic"` for exponential growth graphs
- Limit visualization: use a point with `pointStyle: "OPEN"` at the excluded value

### Statistics / Data Science
- Tables are primary data entry method
- Regression lines: `y_1 ~ mx_1 + b` in expression linked to table
- Histograms/distributions: `normaldist(μ, σ)`, `binomialdist(n, p)`
- Scatter plot: table with x and y columns, `points: true, lines: false`

---

## 13. What Desmos Cannot Do

Understanding limits prevents bad AI output.

| Capability | Status | Alternative |
|---|---|---|
| 3D graphs | ❌ Not possible | Static image or separate 3D tool |
| Surface area / volume of 3D solids | ❌ | Formula labels as text |
| True geometric construction (compass, drag-constrain) | ❌ in Graphing Calc | Template library approach (pre-built Geometry tool states, AI selects by ID) |
| Right angle marker symbol (square box) | ⚠️ Workaround only | Small polygon `polygon((0.3,0),(0.3,0.3),(0,0.3))` |
| Congruence tick marks | ⚠️ Workaround only | Short parametric segments at midpoints |
| LaTeX math in labels | ❌ | Unicode characters only |
| Arrow symbols on specific line segments | ⚠️ Not built-in | Approximate with a triangle polygon at endpoint |
| Displaying axis in π multiples (e.g. π/2 at tick) | ❌ programmatically | Set xAxisStep manually; users can see it but labels show decimals |
| Complex number plane | ⚠️ Requires complex mode | Uses x+yi notation; not in default mode |
| 3-variable equations | ❌ | Only x, y (and parameter t, θ, r) |
| True table of values display | ✅ | Use `type: "table"` |
| Animations (automatic) | ✅ | `playing: true` on slider |
| Matrices | ❌ | Not supported |

---

## 14. Refined Prompt Snippet Library

These are ready-to-paste blocks for `desmosService.js` prompt rules.

### Rule: Labels are plain text only
```
CRITICAL: The "label" field is PLAIN TEXT, never LaTeX. 
Do NOT write: "label": "\\pi/2" or "label": "$x^2$"
DO write:    "label": "π/2" or "label": "x²"
Use these Unicode characters in labels: π θ α β φ σ μ ² ³ ⁴ ≈ ≠ ≤ ≥ √ ∞ ° · 
```

### Rule: floor/ceil/abs function names
```
CRITICAL: Use function-call notation for all special functions.
WRONG: y=\\lfloor x \\rfloor  (LaTeX floor notation — Desmos does NOT parse this)
RIGHT: y=floor(x)
WRONG: y=|x|  (may work but unpredictable)
RIGHT: y=abs(x)
Other function names: ceil(x), round(x), sign(x), floor(x)
```

### Rule: Open circles require dragMode NONE
```
To draw an open (hollow) circle point — e.g. excluded endpoint on piecewise or number line:
{ "id": "p1", "latex": "(3,0)", "pointStyle": "OPEN", "dragMode": "NONE", "color": "#FF3B30" }
dragMode: "NONE" is REQUIRED for OPEN and CROSS point styles to render.
```

### Rule: Geometry aspect ratio
```
For geometry diagrams (polygons, triangles, coordinate geometry):
- Set showGrid: false
- Make xrange = yrange for undistorted shapes (e.g. xmin:-6,xmax:6,ymin:-6,ymax:6)
- Set degreeMode: true when angle measures in degrees are shown
- All polygon vertices should be labeled with individual point expressions
```

### Rule: Trig graph viewports
```
For trigonometric function graphs:
- Default to radians (degreeMode: false)
- Viewport for one full period of sin/cos: xmin:-6.28, xmax:6.28 (= ±2π)
- Viewport for two periods: xmin:-12.57, xmax:12.57 (= ±4π)
- Do NOT use xmin:-10, xmax:10 for trig — the curves become misaligned with expected features
- π ≈ 3.14159  2π ≈ 6.28318  π/2 ≈ 1.5708
```

### Rule: Polygon syntax
```
Polygons use polygon() with coordinates as arguments:
RIGHT: "latex": "polygon((0,0),(3,0),(1.5,2.6))"
WRONG: "latex": "polygon[(0,0),(3,0),(1.5,2.6)]"  (square brackets don't work)
Add fill: true, fillOpacity: 0.15 to shade the interior.
```

### Rule: Viewport padding
```
Set viewport so the main mathematical content has approximately 15% padding on each side.
If the key feature (vertex, intercept, intersection) is at x=3, y=5, don't set xmax:3 — 
set xmax:5 or xmax:6 to show context.
```
