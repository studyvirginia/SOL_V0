# Desmos API — Condensed Property & Syntax Reference

---

# PART 1 — UNIVERSAL (inject every Phase 2 call)

## Expression object properties

| Property | Type | Notes |
|---|---|---|
| `id` | string | Letters/numbers/underscore only. e.g. `"e1"`, `"p1"` |
| `latex` | string | The math expression. |
| `color` | hex string | See color palette below. |
| `hidden` | bool | true = define variable without plotting |
| `type` | string | `"expression"` (default) `"table"` |
| `lineStyle` | string | `"SOLID"` `"DASHED"` `"DOTTED"` |
| `lineWidth` | number | pixels, default 2.5 |
| `pointStyle` | string | `"POINT"` `"OPEN"` `"CROSS"` |
| `pointSize` | number | diameter px, default 9 |
| `dragMode` | string | `"NONE"` `"X"` `"Y"` `"XY"` — **MUST be `"NONE"` for OPEN/CROSS to render** |
| `points` | bool | plot points for point lists |
| `lines` | bool | connect points with segments |
| `fill` | bool | fill polygon/closed curve interior |
| `fillOpacity` | 0–1 | default 0.4; use 0.15 for subtle fill |
| `label` | string | **plain text only — no LaTeX**. Unicode: π θ α β φ ² ³ ≤ ≥ ≈ ∞ ° |
| `showLabel` | bool | must be true to display the label |
| `labelOrientation` | string | `"ABOVE"` `"BELOW"` `"LEFT"` `"RIGHT"` `"DEFAULT"` |

## Top-level graph state properties

| Property | Type | Notes |
|---|---|---|
| `expressions` | array | array of expression objects |
| `viewport` | `{left,bottom,right,top}` | native Desmos keys |
| `showGrid` | bool | default true |
| `showAxes` | bool | sets both axes |
| `degreeMode` | bool | default false (radians) |
| `polarMode` | bool | default false |
| `title` | string | 3–6 words |

## Core LaTeX syntax

**Arithmetic:** `+  -  *  /  ^`  multichar exponent needs braces: `x^{2n}`
**Fractions/roots:** `\frac{a}{b}` `\sqrt{x}` `\sqrt[n]{x}`
**Constants:** `\pi`  `e`  `\tau`

**Functions — always use parens:**
`sin(x)` `cos(x)` `tan(x)` `arcsin(x)` `arccos(x)` `arctan(x)`
`ln(x)` `log(x)` `abs(x)` `floor(x)` `ceil(x)` `round(x)` `sign(x)`
> WRONG: `\lfloor x \rfloor` — NOT parsed. Use `floor(x)`.
> WRONG: `|x|` — unpredictable. Use `abs(x)`.

**Common expressions:**
- Explicit: `y=x^2-4`
- Implicit: `x^2+y^2=25`
- Point: `(2,3)` — Point list: `(1,1),(2,4),(3,9)`
- Vertical line: `x=3` — Horizontal line: `y=2`
- Variable def: `a=3` with `hidden:true`
- Inequality: `y<x^2` — Desmos shades automatically. DASHED boundary if strict.

## Color palette

| Hex | Use |
|---|---|
| `#007AFF` | 1st/main curve |
| `#FF3B30` | 2nd curve, key points |
| `#34C759` | 3rd curve, fills, shading |
| `#FF9500` | 4th curve |
| `#5856D6` | 5th curve, transformations |
| `#8E8E93` | asymptotes, reference lines, dashed guides |

---

# PART 2 — TYPE-SPECIFIC (inject only for matching graph type)

## type: trig

`degreeMode:false` (radians default).
Viewport ±2π: `{left:-6.28,bottom:-2.5,right:6.28,top:2.5}`
Viewport ±1 period tan: `{left:-6.28,bottom:-5,right:6.28,top:5}`
`xAxisStep:1.5708` for π/2 tick marks.
π≈3.14159  2π≈6.28318  3π≈9.42478  π/2≈1.5708
Do NOT use ±10 for trig — curves misalign with expected features.

## type: polar

Set `"polarMode":true` in output JSON top-level.
Polar expression: `{"id":"r1","latex":"r=1+cos(\\theta)","color":"#007AFF","polarDomain":{"min":"0","max":"2\\pi"}}`
Default viewport: `{"left":-3,"bottom":-3,"right":3,"top":3}` — expand if curve is larger.

## type: geometry

Equal aspect ratio required: `right−left = top−bottom` (e.g. ±6 each axis).
`showGrid:false`. `degreeMode:true` if showing degree angles.
Each vertex needs its own labeled point expression alongside the polygon.
Polygon syntax (round parens only): `polygon((0,0),(4,0),(2,3))` — square brackets fail.
Always add `fill:true,fillOpacity:0.15` to filled polygons.
Right-angle marker: `polygon((s,0),(s,s),(0,s))` where s ≈ 5% of diagram width.
Tick mark at midpoint (mx,my): `{"latex":"(mx+t*nx,my+t*ny)","parametricDomain":{"min":"-0.15","max":"0.15"}}` where (nx,ny) is perpendicular unit vector.
Angle arc at origin between rays: `{"latex":"(r*cos(t),r*sin(t))","parametricDomain":{"min":"<ray1_angle>","max":"<ray2_angle>"}}` r≈0.4.

## type: piecewise

Syntax: `"latex":"y=\\{x<0:-x,x>=0:x\\}"`
Excluded endpoint: `{"id":"oc1","latex":"(3,0)","pointStyle":"OPEN","dragMode":"NONE","color":"#FF3B30"}`
Included endpoint: same but `"pointStyle":"POINT"`.

## type: number_line

`showGrid:false`. Viewport: `{left:<min-1>,bottom:-1,right:<max+1>,top:1}`.
Suppress y-axis numbers: `yAxisNumbers:false`.
Point: `{"id":"p1","latex":"(3,0)","pointStyle":"POINT","dragMode":"NONE","label":"3","showLabel":true,"labelOrientation":"ABOVE","color":"#007AFF"}`
Ray from a to b: `{"id":"ray1","latex":"(a+t,0)","parametricDomain":{"min":"0","max":"<b-a>"},"lineWidth":3,"color":"#007AFF"}`

## type: scatter

Table: `{"type":"table","id":"t1","columns":[{"latex":"x_1","values":["1","2","3"]},{"latex":"y_1","values":["2","4","6"],"color":"#007AFF","points":true,"lines":false}]}`
First column is never plotted. Regression: `{"id":"reg1","latex":"y_1~mx_1+b","color":"#FF3B30"}`
Quadratic regression: `y_1~ax_1^2+bx_1+c`

## type: parametric

Curve: `{"id":"p1","latex":"(cos(t),sin(t))","color":"#007AFF","parametricDomain":{"min":"0","max":"2\\pi"}}`
Domain values: numbers and constants only — no slider variables.
Segment from (x1,y1) to (x2,y2): `{"latex":"(x1+(x2-x1)*t,y1+(y2-y1)*t)","parametricDomain":{"min":"0","max":"1"}}`
