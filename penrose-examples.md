# Penrose Examples Catalog

Source: [github.com/penrose/penrose — packages/examples/src](https://github.com/penrose/penrose/tree/main/packages/examples/src)  
Registry: [registry.json](https://raw.githubusercontent.com/penrose/penrose/main/packages/examples/src/registry.json)  
Online editor: <https://penrose.cs.cmu.edu/try>  
Gallery: <https://penrose.cs.cmu.edu/examples>

Every Penrose program is a **trio** — three files working together:

| File | Extension | Purpose |
|------|-----------|---------|
| Domain | `.domain` | Declare types, predicates, constructors, functions |
| Substance | `.substance` | Instantiate objects and relationships for one diagram |
| Style | `.style` | Specify shapes, constraints, and layout rules |

Each trio is registered in `registry.json` under a string key like `set-theory-domain/tree-euler`. Trios marked `"gallery": true` appear in the online gallery.

Raw file URL pattern:
```
https://raw.githubusercontent.com/penrose/penrose/main/packages/examples/src/<path>
```

---

## Table of Contents

1. [Complete Example Index](#1-complete-example-index)
2. [Tutorials](#2-tutorials)
   - [Tutorial 1 — Two Sets](#tutorial-1--two-sets)
   - [Tutorial 2 — Subsets and Constraints](#tutorial-2--subsets-and-constraints)
   - [Tutorial 3 — Linear Algebra Vectors](#tutorial-3--linear-algebra-vectors)
   - [Tutorial Challenge Solutions](#tutorial-challenge-solutions)
3. [Set Theory Domain](#3-set-theory-domain)
4. [Geometry Domain](#4-geometry-domain)
5. [Graph Domain](#5-graph-domain)
6. [Linear Algebra Domain](#6-linear-algebra-domain)
7. [Logic Circuit Domain](#7-logic-circuit-domain)
8. [Structural Formula Domain](#8-structural-formula-domain)
9. [Impossible Polygons — Penrose Logo](#9-impossible-polygons--penrose-logo)
10. [More Examples by Category](#10-more-examples-by-category)
11. [Repository Structure](#11-repository-structure)

---

## 1. Complete Example Index

All entries from `registry.json`. ★ = `"gallery": true` (appears in the online gallery).

### Set Theory

| Registry Key | Display Name | Gallery |
|---|---|:---:|
| `set-theory-domain/tree-euler` | Sets as Euler Diagram | ★ |
| `set-theory-domain/tree-euler-3d` | Sets as Euler Diagram in 2.5D | ★ |
| `set-theory-domain/tree-tree` | Sets as Tree Diagram | |
| `set-theory-domain/continuousmap` | Continuous Map | ★ |
| `set-potatoes/non-surjection-not-epimorphism` | A non-surjection is not an epimorphism | ★ |
| `set-potatoes/relation-not-a-function` | Relation that isn't a function | |
| `set-potatoes/injections-post-inverses` | Injections and Post-Inverses | |
| `set-potatoes/non-injection-not-monomorphism` | A non-injection is not a monomorphism | |
| `set-potatoes/surjections-pre-inverses` | Surjections and Pre-Inverses | |

### Geometry

| Registry Key | Display Name | Gallery |
|---|---|:---:|
| `geometry-domain/siggraph-teaser` | SIGGRAPH teaser — Euclidean Geometry | ★ |
| `geometry-domain/textbook_problems/c11p12` | Circle Example | ★ |
| `geometry-domain/textbook_problems/c05p13` | Triangle Incenter | |
| `geometry-domain/textbook_problems/c05p01` | Midsegment Triangles | |
| `geometry-domain/textbook_problems/c03p01` | Parallel Lines | |
| `geometry-domain/textbook_problems/c01p01` | Collinear Points | |
| `geometry-domain/textbook_problems/ex` | Congruent Triangles | |
| `geometry-domain/complementary-angles` | Complementary angles | |

### Graph Theory

| Registry Key | Display Name | Gallery |
|---|---|:---:|
| `graph-domain/other-examples/hamiltonian-cycle` | Hamiltonian Cycle | ★ |
| `graph-domain/other-examples/arpanet` | Curved graph example with dots | ★ |
| `graph-domain/textbook/sec1/fig5` | Computer Network with Multiple One-Way Links | ★ |
| `graph-domain/other-examples/nyc-subway` | Curved graph example with boxes | |
| `graph-domain/textbook/sec1/fig1` | Computer Network | |
| `graph-domain/textbook/sec1/fig2` | Computer Network with Multiple Links between Data Centers | |
| `graph-domain/textbook/sec1/fig3` | Computer Network with Diagnostic Links | |
| `graph-domain/textbook/sec1/fig4` | Communications Network with One-Way Links | |
| `graph-domain/textbook/sec1/fig6` | Acquaintanceship Graph | |
| `graph-domain/textbook/sec1/fig7` | Influence Graph | |
| `graph-domain/textbook/sec1/fig8a` | Call Graph | |
| `graph-domain/textbook/sec1/fig8b` | Call Graph | |
| `graph-domain/textbook/sec1/fig9` | Module Dependency Graph | |
| `graph-domain/textbook/sec1/fig10` | Precedence Graph | |
| `graph-domain/textbook/sec1/fig11` | Niche Overlap Graph | |
| `graph-domain/textbook/sec1/fig12` | Module of a Protein Interaction Graph | |
| `graph-domain/textbook/sec1/fig13` | Graph Model of a Round-Robin Tournament | |
| `graph-domain/textbook/sec2/fig3` | Complete Graphs | |
| `graph-domain/textbook/sec2/fig4` | Cycle Graphs | |
| `graph-domain/textbook/sec2/fig5` | Wheel Graphs | |
| `graph-domain/textbook/sec2/fig6` | Cube Graphs | |
| `graph-domain/textbook/sec2/fig9` | Complete Bipartite Graphs | |
| `graph-domain/textbook/sec2/fig10a` | Modeling Jobs vs. Trained Employees | |
| `graph-domain/textbook/sec2/fig10b` | Modeling Jobs vs. Trained Employees | |
| `graph-domain/textbook/sec2/fig11a` | Star Topology for LAN | |
| `graph-domain/textbook/sec2/fig11b` | Ring Topology for LAN | |
| `graph-domain/textbook/sec2/fig11c` | Hybrid Topology for LAN | |
| `graph-domain/textbook/sec2/fig12` | Linear Array for Six Processors | |
| `graph-domain/textbook/sec2/fig13` | Mesh Network for 16 Processors | |
| `graph-domain/textbook/sec2/fig14` | Hypercube Network for Eight Processors | |
| `graph-domain/textbook/sec5/ex32` | Curved graph example | |
| `hypergraph/hypergraph` | Hypergraph | ★ |
| `spectral-graphs/examples/hypercube` | Hypercube | ★ |
| `spectral-graphs/examples/hexagonal-lattice` | Hexagonal Lattice Graph | ★ |
| `spectral-graphs/examples/dodecahedral-graph` | Dodecahedral Graph | ★ |
| `spectral-graphs/examples/mobius` | Mobius Strip | ★ |
| `spectral-graphs/examples/star-graph` | Star graph | |
| `spectral-graphs/examples/box` | 4x4x4 Box | |
| `spectral-graphs/examples/4x4-sudoku-graph` | 4 x 4 Sudoku Graph | |
| `spectral-graphs/examples/truncated-cube-graph` | Truncated Cube Graph | |
| `spectral-graphs/examples/torus` | Periodic 2D Grid | |
| `spectral-graphs/examples/periodic-hexagonal-lattice` | Periodic Hexagonal Grid | |

### Linear Algebra & Matrices

| Registry Key | Display Name | Gallery |
|---|---|:---:|
| `linear-algebra-domain/two-vectors-perp` | Two Perpendicular Vectors | |
| `exterior-algebra/vector-wedge` | Wedge Product | ★ |
| `matrix-ops/tests/matrix-matrix-multiplication` | Matrix-matrix multiplication | ★ |
| `matrix-ops/tests/matrix-matrix-addition` | Matrix-matrix addition | |
| `matrix-ops/tests/matrix-matrix-division-elementwise` | Matrix-matrix division (elementwise) | |
| `matrix-ops/tests/matrix-matrix-multiplication-elementwise` | Matrix-matrix multiplication (elementwise) | |
| `matrix-ops/tests/matrix-matrix-subtraction` | Matrix-matrix subtraction | |
| `matrix-ops/tests/matrix-transpose` | Matrix transpose | |
| `matrix-ops/tests/matrix-vector-left-multiplication` | Matrix-vector left multiplication | |
| `matrix-ops/tests/matrix-vector-right-multiplication` | Matrix-vector right multiplication | |
| `matrix-ops/tests/scalar-vector-division` | Scalar-vector division | |
| `matrix-ops/tests/scalar-vector-left-multiplication` | Scalar-vector left multiplication | |
| `matrix-ops/tests/scalar-vector-right-multiplication` | Scalar-vector right multiplication | |
| `matrix-ops/tests/vector-vector-addition` | Vector-vector addition | |
| `matrix-ops/tests/vector-vector-division-elementwise` | Vector-vector division elementwise | |
| `matrix-ops/tests/vector-vector-multiplication-elementwise` | Vector-vector multiplication elementwise | |
| `matrix-ops/tests/vector-vector-outerproduct` | Vector-vector outerproduct | |
| `matrix-ops/tests/vector-vector-subtraction` | Vector-vector subtraction | |
| `matrix-library/crossProductMatrix` | (unnamed) | |
| `matrix-library/diagonal2d` | (unnamed) | |
| `matrix-library/diagonal3d` | (unnamed) | |
| `matrix-library/identity2d` | (unnamed) | |
| `matrix-library/identity3d` | (unnamed) | |
| `matrix-library/inverse2d` | (unnamed) | |
| `matrix-library/inverse3d` | (unnamed) | |
| `matrix-library/matrix2d` | (unnamed) | |
| `matrix-library/matrix3d` | (unnamed) | |
| `matrix-library/outerProduct2d` | (unnamed) | |
| `matrix-library/outerProduct3d` | (unnamed) | |
| `matrix-library/rotate` | (unnamed) | |
| `matrix-library/rotate2d` | (unnamed) | |
| `matrix-library/rotate3d` | (unnamed) | |
| `matrix-library/rotate3dh` | (unnamed) | |
| `matrix-library/scale2d` | (unnamed) | |
| `matrix-library/scale3d` | (unnamed) | |
| `matrix-library/shear2d` | (unnamed) | |
| `matrix-library/shear3d` | (unnamed) | |
| `matrix-library/skew2d` | (unnamed) | |
| `matrix-library/translate2d` | (unnamed) | |
| `matrix-library/translate3dh` | (unnamed) | |
| `fake-3d-linear-algebra/projection` | (unnamed) | |

### Chemistry / Molecules

| Registry Key | Display Name | Gallery |
|---|---|:---:|
| `structural-formula/molecules/caffeine` | A Caffeine Molecule | ★ |
| `structural-formula/reactions/methane-combustion` | Methane Combustion Reaction | ★ |
| `atoms-and-bonds/one-water-molecule` | A Water Molecule | |
| `atoms-and-bonds/wet-floor` | Wet Floor | |
| `molecules/nitricacid-lewis` | Lewis Structure of Nitric Acid | |
| `molecules/sulfuric-acid` | Edgeworth Chemistry Example | |
| `molecules/glutamine` | (unnamed) | |

### Logic / Circuits

| Registry Key | Display Name | Gallery |
|---|---|:---:|
| `logic-circuit-domain/half-adder` | Half Adder | ★ |

### Group Theory / Algebra

| Registry Key | Display Name | Gallery |
|---|---|:---:|
| `group-theory/quaternion-multiplication-table` | Quaternions as table | ★ |
| `group-theory/quaternion-cayley-graph` | Quaternions as Cayley graph | ★ |

### Curve / Geometry Constructions

| Registry Key | Display Name | Gallery |
|---|---|:---:|
| `envelopes/nephroid` | Nephroid as Envelope of Circles | ★ |
| `lagrange-bases/lagrange-bases` | Lagrange Bases | ★ |
| `curve-examples/catmull-rom/catmull-rom` | Catmull-Rom Interpolation Test | ★ |
| `curve-examples/blobs` | Blobs | ★ |
| `mobius/mobius` | Mobius Transformation of Circles | ★ |
| `curve-examples/open-elastic-curve` | Open elastic curve example | |
| `curve-examples/closed-elastic-curve` | Closed elastic curve example | |
| `curve-examples/offset` | Offset Curve | |
| `curve-examples/frenet-frame` | Frenet Frame | |
| `curve-examples/osculating-circle` | Osculating Circle | |
| `curve-examples/evolute-of-cardioid` | Evolute of Cardioid | |
| `curve-examples/space-curves` | Space Curves | |
| `curve-examples/cubic-bezier` | (unnamed) | |

### Triangle Meshes

| Registry Key | Display Name | Gallery |
|---|---|:---:|
| `triangle-mesh-2d/diagrams/cotan-formula` | Cotan Formula | ★ |
| `triangle-mesh-2d/diagrams/concyclic-pair` | Concyclic Euclidean Edge Flip | ★ |
| `triangle-mesh-3d/two-triangles` | Two 3D Triangles | ★ |
| `triangle-mesh-2d/diagrams/halfedge-mesh` | Half Edge Mesh | |
| `triangle-mesh-2d/diagrams/relative-orientation` | Relative Orientation | |
| `triangle-mesh-2d/diagrams/triangle-centers` | Triangle Centers | |
| `triangle-mesh-2d/diagrams/angle-equivalence` | Rigid Conformal Mapping of a 2D Mesh | |
| `arc-mesh` | Arc mesh example | |

### Geometric Queries / Tracing

| Registry Key | Display Name | Gallery |
|---|---|:---:|
| `geometric-queries/test` | Geometric Queries | ★ |
| `geometric-queries/ray-intersect/test-group` | Ray Casting | ★ |
| `geometric-queries/closest-point/test-group` | Closest Point Queries | ★ |
| `ray-tracing/next-event-estimation` | Next Event Estimation | ★ |
| `ray-tracing/path-trace` | Path Tracing | |
| `ray-tracing/bidirectional` | Bidirectional Path Tracing | |
| `geometric-queries/closest-point/test` | More Closest Point Queries | |
| `geometric-queries/closest-silhouette-point/test` | Silhouette Point Queries | |
| `geometric-queries/ray-intersect/test` | Ray Intersection Tests | |

### Topology / Advanced Math

| Registry Key | Display Name | Gallery |
|---|---|:---:|
| `persistent-homology/persistent-homology` | Persistent Homology | ★ |
| `walk-on-spheres/walk-on-stars` | Walk on Stars — Laplace Estimator | ★ |
| `walk-on-spheres/laplace-estimator` | Walk on Spheres — Laplace Estimator | ★ |
| `walk-on-spheres/SignedAngleOutside` | Walk on Stars — Signed Angle Outside | ★ |
| `walk-on-spheres/poisson-estimator` | Walk on Spheres — Poisson Estimator | |
| `walk-on-spheres/nested-estimator` | Walk on Spheres — Nested Estimator | |
| `walk-on-spheres/offcenter-estimator` | Walk on Spheres — Off-Center Estimator | |

### Data Visualization / Statistics

| Registry Key | Display Name | Gallery |
|---|---|:---:|
| `dataviz/linearreg` | Linear Regression | ★ |
| `tsne/tsne` | T-SNE Test | |
| `dataviz/residual` | Linear Regression Residuals | |
| `word-cloud/example` | Word Cloud | ★ |
| `random-sampling/test` | Random Sampling | ★ |
| `array-models/insertionSort` | Insertion Sort | ★ |

### Fractals / Dynamics

| Registry Key | Display Name | Gallery |
|---|---|:---:|
| `Dynamics/Lyapunov` | Lyapunov Exponent | ★ |
| `fractals/chaos-game/sierpinski-triangle` | Chaos Game: Sierpinski Triangle | ★ |
| `fractals/ifs/ifs` | Iterated Functions System | ★ |
| `fractals/chaos-game/vicsek-fractal` | Chaos Game: Vicsek Fractal | |
| `fractals/l-systems/tree` | L-System | |
| `stochastic-process/stochastic-process` | Brownian Motion in a Ball | ★ |
| `stochastic-process/epsilon-shell/AbsorbingBoundary` | Brownian Motion Absorbed at Boundary | ★ |

### Penrose Logo

| Registry Key | Display Name | Gallery |
|---|---|:---:|
| `impossible-ngon/ngon` | Impossible Polygons | ★ |
| `impossible-ngon/parameters` | Parameters for Penrose Logo | |
| `impossible-ngon/nsides-chirality` | nSides and Chirality for Penrose Logo | |

### Interactive

| Registry Key | Display Name | Gallery |
|---|---|:---:|
| `interactive/ellipse-rays` | Ellipse Rays | ★ |
| `interactive/viewport` | Viewport | ★ |
| `interactive/planets` | Planets | ★ |
| `animation/center-shrink-circle` | (unnamed) | |

### 3D / Rendering

| Registry Key | Display Name | Gallery |
|---|---|:---:|
| `dinoshade/dinoshade` | 3D Reflections and Shadows | ★ |
| `solid/eigenspace` | (non-trio SolidJS component) | |
| `solid/triangles` | (non-trio SolidJS component) | |
| `solid/vectors` | (non-trio SolidJS component) | |

### Miscellaneous / Domain-Specific

| Registry Key | Display Name | Gallery |
|---|---|:---:|
| `box-arrow-diagram/computer-architecture` | Computer Architecture Box-Arrow Diagram | ★ |
| `fancy-text/fancy-text` | Fancy Text + Equations | ★ |
| `alloy-models/dining-philosophers` | Alloy: Dining Philosophers Problem | |
| `alloy-models/message-passing` | Alloy: Conversation between Four Parties | |
| `alloy-models/ring-leader-election` | Alloy: Leader Election in Ring | |
| `alloy-models/river-crossing` | Alloy: River Crossing | |
| `alloy-models/workstations` | Alloy: Workstations | |
| `alloy-models/generic` | Alloy: Generic Style | |
| `alloy-models/icicle-plot-file-system` | File System Icicle Plot | |
| `timeline/penrose` | Penrose project timeline | |
| `shape-distance/points-around-star` | (unnamed) | |
| `shape-distance/points-around-polyline` | (unnamed) | |
| `shape-distance/points-around-line` | (unnamed) | |
| `shape-distance/lines-around-rect` | (unnamed) | |
| `shape-spec/all-shapes` | (unnamed) | |
| `shape-spec/arrowheads` | (unnamed) | |
| `minkowski-tests/maze/non-convex` | (unnamed) | |

### Tutorials

| Registry Key | Display Name | Gallery |
|---|---|:---:|
| `tutorials/tutorial1` | Tutorial 1 — Two Sets | |
| `tutorials/tutorial2` | Tutorial 2 — Subset | |
| `tutorials/tutorial3` | Tutorial 3 — Vector | |

---

## 2. Tutorials

The tutorial series teaches Penrose from scratch. Starter code lives in `tutorials/code/tutorialN/` and solutions are in `tutorials/solutions/tutorialN.md`.  
Full tutorial write-up: <https://penrose.cs.cmu.edu/docs/tutorial/welcome>

### Tutorial 1 — Two Sets

**Teaches:** Basic Domain/Substance/Style structure, `forall`, shapes, canvas.  
**Registry key:** `tutorials/tutorial1`  
**Files:** `tutorials/code/tutorial1/{setTheory.domain, twoSets.substance, twoSets.style}`

#### `setTheory.domain`
```
type Set
```

#### `twoSets.substance`
```
Set A
Set B
AutoLabel All
```

#### `twoSets.style`
```
canvas {
  width = 800
  height = 700
}

forall Set x {
  x.icon = Circle {
    strokeWidth : 0.0
  }
}
```

---

### Tutorial 2 — Subsets and Constraints

**Teaches:** Predicates in domain, `where` clause in style, `ensure` constraints.  
**Registry key:** `tutorials/tutorial2`  
**Files:** `tutorials/code/tutorial2/{setTheory.domain, subset.substance, subset.style}`

#### `setTheory.domain`
```
type Set
predicate Subset(Set s1, Set s2)
```

#### `subset.substance`
```
Set A
Set B
Subset(B, A)
AutoLabel All
```

#### `subset.style`
```
canvas {
  width = 800
  height = 700
}

forall Set x {
  x.icon = Circle {
    strokeWidth : 0.0
  }
  ensure x.icon.r > 25
  ensure x.icon.r < 150
}

forall Set x; Set y
where Subset(x, y) {
  ensure disjoint(y.text, x.icon, 10)
  ensure contains(y.icon, x.icon, 5)
  layer x.icon above y.icon
}
```

**Extended domain** (full challenge, adding more predicates):
```
type Set
predicate Subset(Set s1, Set s2)
predicate Intersecting(Set s1, Set s2)
predicate Disjoint(Set s1, Set s2)
```

**Extended substance:**
```
Set A
Set B
Intersecting(A, B)
```

**Extended style (adding Intersecting/Disjoint blocks):**
```
canvas {
  width = 800
  height = 700
}

forall Set x {
  x.icon = Circle { strokeWidth : 0.0 }
  ensure x.icon.r > 25
  ensure x.icon.r < 200
}

forall Set x; Set y
where Intersecting(x, y) {
  ensure overlapping(x.icon, y.icon, -15)
}

forall Set x; Set y
where Disjoint(x, y) {
  ensure disjoint(x.icon, y.icon, 15)
}
```

---

### Tutorial 3 — Linear Algebra Vectors

**Teaches:** Type hierarchies, functions in domain, `override`, `encourage`, computed vector expressions.  
**Registry key:** `tutorials/tutorial3`  
**Files:** `tutorials/code/tutorial3/{linearAlgebra.domain, vector.substance, vector.style}`

#### `linearAlgebra.domain` (Tutorial Part 1)
```
type VectorSpace
type Vector
```

**Extended domain (Part 2 — adding addV):**
```
type VectorSpace
type Vector
type Scalar
predicate In(Vector, VectorSpace V)
function addV(Vector, Vector) -> Vector
```

#### `vector.substance` (Part 2)
```
VectorSpace U
Vector v
Vector w
In(v, U)
In(w, U)
Vector u := addV(v, w)
In(u, U)
AutoLabel All
```

#### `vector.style` (complete solution)

```
canvas {
  width = 800
  height = 700
}

-- Constants block
const {
  scalar vectorSpaceSize = 350.0
  scalar arrowheadSize = 0.7
  scalar lineThickness = 1.
  scalar arrowThickness = 1.5
  color gray = rgba(0.6, 0.6, 0.6, 1.)
  color lightBlue = rgba(0.2, 0.4, 0.8, 1.0)
  color lightGray = rgba(252, 252, 252, 0.015)
  color green = rgba(0., 0.8, 0., 1.)
  color none = rgba(0., 0., 0., 0.)
}

-- Draw the vector space axes
forall VectorSpace U {
  scalar axisSize = const.vectorSpaceSize / 2.0
  vec2 U.origin = (0., 0.)
  vec2 o = U.origin

  U.axisColor = const.gray

  U.background = Rectangle {
    center : U.origin
    width : const.vectorSpaceSize
    height : const.vectorSpaceSize
    fillColor : const.lightGray
    strokeColor : const.none
  }

  U.xAxis = Line {
    start : (o[0] - axisSize, o[1])
    end : (o[0] + axisSize, o[1])
    strokeWidth : const.lineThickness
    style : "solid"
    strokeColor : U.axisColor
    startArrowhead: "straight"
    endArrowhead: "straight"
    endArrowheadSize : const.arrowheadSize * 2.
  }

  U.yAxis = Line {
    start : (o[0], o[1] - axisSize)
    end : (o[0], o[1] + axisSize)
    strokeWidth : const.lineThickness
    style : "solid"
    strokeColor : U.axisColor
    startArrowhead: "straight"
    endArrowhead: "straight"
    endArrowheadSize : const.arrowheadSize * 2.
  }

  U.text = Equation {
    string : U.label
    center : (U.origin[0] - axisSize, U.origin[1] + axisSize)
    fillColor : U.axisColor
  }
}

-- Draw each vector as a line from the origin
forall Vector u; VectorSpace U
where In(u, U) {
  u.vector = (?, ?)

  u.shape = Line {
    start : U.origin
    end : U.origin + u.vector
    strokeWidth : 3.0
    strokeColor : const.lightBlue
    endArrowhead : "straight"
    endArrowheadSize : const.arrowheadSize
  }

  u.text = Equation {
    string : u.label
    fillColor : u.shape.strokeColor
  }

  ensure contains(U.background, u.shape)
  ensure contains(U.background, u.text)
  ensure vdist(u.shape.end, u.text.center) == 15.0

  layer u.text above U.xAxis
  layer u.text above U.yAxis
}

-- Override the end position for vector sums (addV)
forall Vector u; Vector v; Vector w; VectorSpace U
where u := addV(v, w); In(u, U); In(v, U); In(w, U) {
  override u.shape.end = v.shape.end + w.shape.end - U.origin
}
```

**Exercise 3 addition (parallelogram construction):**
```
forall Vector u; Vector v; Vector w; VectorSpace U
where u := addV(v,w); In(u, U); In(v, U); In(w, U) {
  override u.shape.end = v.shape.end + w.shape.end - U.origin
  override u.shape.strokeColor = const.green
  override u.text.string = "sum"

  u.dashed_v = Line {
    start : (w.shape.end[0], w.shape.end[1])
    end : (u.shape.end[0], u.shape.end[1])
    endArrowhead : "straight"
    strokeWidth : const.arrowThickness
    strokeStyle : "dashed"
    endArrowheadSize : const.arrowheadSize
  }

  u.dashed_w = Line {
    start : (v.shape.end[0], v.shape.end[1])
    end : (u.shape.end[0], u.shape.end[1])
    endArrowhead : "straight"
    strokeWidth : const.arrowThickness
    strokeStyle : "dashed"
    endArrowheadSize : const.arrowheadSize
  }

  u.dashed_w below u.shape
  u.dashed_v below u.shape
}
```

---

### Tutorial Challenge Solutions

#### Challenge: Represent `Set` as a Square
```domain
type Set
```
```substance
Set A
Set B
Set C
```
```style
canvas { width = 800; height = 700 }

forall Set x {
  x.icon = Rectangle {
    width : 50.0
    height : 50.0
  }
}
```

#### Challenge: Add strokeWidth
```style
forall Set x {
  x.icon = Rectangle {
    strokeColor : sampleColor(0.5, "rgb")
    strokeWidth : 15.0
  }
}
```

#### Challenge: Each Set as both Circle and Square
```style
forall Set x {
  x.side = ?
  x.circle = Circle { }
  x.square = Rectangle {
    width : x.side
    height : x.side
  }
}
```

#### Vector subtraction (Exercise 1 from Tutorial 3)
```domain
type VectorSpace
type Vector
type Scalar
predicate In(Vector, VectorSpace V)
function subV(Vector, Vector) -> Vector
```
```substance
VectorSpace U
Vector v
Vector w
In(v, U)
In(w, U)
Vector u := subV(v, w)
In(u, U)
AutoLabel All
```
```style
-- ... same base forall In(u,U) block as Tutorial Part 1 ...

forall Vector u; Vector v; Vector w; VectorSpace U
where u := subV(v,w); In(u, U); In(v, U); In(w, U) {
  override u.shape.end = v.shape.end - w.shape.end + U.origin
  override u.shape.strokeColor = const.green
  override u.text.string = "difference"
}
```

#### Scalar multiplication (Exercise 2)
```domain
type VectorSpace
type Vector
type Scalar
predicate In(Vector, VectorSpace V)
function scalarMult(Scalar, Vector) -> Vector
```
```substance
VectorSpace U
Vector v
In(v, U)
Scalar a
Vector u := scalarMult(a, v)
In(u, U)
AutoLabel All
```
```style
forall Scalar a {
  a.scalar = ?
  ensure inRange(a.scalar, 2., 5.)
}

forall Scalar a; Vector u; Vector v; VectorSpace U
where u := scalarMult(a, v); In(u, U); In(v, U) {
  override u.shape.end = a.scalar * (v.shape.end - U.origin) + U.origin
  override u.shape.strokeColor = const.green
  override u.text.string = "scaled_v"
}
```

---

## 3. Set Theory Domain

**Source directory:** `set-theory-domain/`  
**Domain file:** `set-theory-domain/setTheory.domain`

### Domain

```
type Set

predicate Disjoint(Set s1, Set s2)
predicate Intersecting(Set s1, Set s2)
predicate Subset(Set s1, Set s2)
```

There is also a richer `functions.domain` that extends `setTheory.domain` for the continuous-map example.

### Example: Sets as Euler Diagram — `tree-euler` ★

**Files:** `setTheory.domain`, `tree.substance`, `euler.style`  
**Trio JSON:** `set-theory-domain/tree-euler.trio.json`

#### `tree.substance`
```
Set A, B, C, D, E, F, G

Subset(B, A)
Subset(C, A)
Subset(D, B)
Subset(E, B)
Subset(F, C)
Subset(G, C)

Disjoint(E, D)
Disjoint(F, G)
Disjoint(B, C)

AutoLabel All
```

#### `euler.style`
```
canvas {
  width = 800
  height = 700
}

forall Set x {
  shape x.icon = Circle { }
  shape x.text = Equation {
    string : x.label
    fontSize : "32px"
  }
  ensure contains(x.icon, x.text)
  encourage norm(x.text.center - x.icon.center) == 0
  layer x.text above x.icon
}

forall Set x; Set y
where Subset(x, y) {
  ensure disjoint(y.text, x.icon, 10)
  ensure contains(y.icon, x.icon, 5)
  layer x.icon above y.icon
}

forall Set x; Set y
where Disjoint(x, y) {
  ensure disjoint(x.icon, y.icon)
}

forall Set x; Set y
where Intersecting(x, y) {
  ensure overlapping(x.icon, y.icon)
  ensure disjoint(y.text, x.icon)
  ensure disjoint(x.text, y.icon)
}
```

### Example: Simple Two Sets — `twosets-simple.substance`

```
Set A, B
Subset(B, A)
AutoLabel All
```
(Use with `euler.style` and `setTheory.domain`.)

### Available Style Variants

| File | Description |
|---|---|
| `euler.style` | Circles representing sets; Euler/Venn diagram layout |
| `euler-3d.style` | Same layout but rendered with 3D depth effect |
| `tree.style` | Tree-based containment diagram |
| `venn-polygon.style` | Sets drawn as polygons (Venn variant) |
| `venn-comp-test.style` | Comparison/test style |
| `venn-small.style` | Compact version |
| `continuousmap.style` | Separate circles connected by function arrows |

---

## 4. Geometry Domain

**Source directory:** `geometry-domain/`  
**Domain file:** `geometry-domain/geometry.domain`

### Domain (abridged — key types, constructors, predicates)

```
-- ===== TYPES =====
type Shape
type Point <: Shape
type Linelike <: Shape
type Ray <: Linelike
type Line <: Linelike
type Segment <: Linelike
type Angle <: Shape
type Triangle <: Shape
type Quadrilateral <: Shape
type Rectangle <: Quadrilateral
type Circle <: Shape
type Plane <: Shape

-- ===== CONSTRUCTORS =====
constructor Segment(Point p, Point q)
constructor Ray(Point base, Point direction)
constructor Line(Point p, Point q)
constructor Midpoint(Linelike l) -> Point
constructor InteriorAngle(Point p, Point q, Point r) -> Angle
constructor Triangle(Point p, Point q, Point r)
constructor Rectangle(Point p, Point q, Point r, Point s)
constructor Quadrilateral(Point p, Point q, Point r, Point s)
constructor CircleR(Point center, Point radius) -> Circle

-- ===== FUNCTIONS =====
function Bisector(Angle) -> Ray
function PerpendicularBisector(Segment, Point) -> Segment
function MidSegment(Triangle, Point, Point) -> Segment
function Radius(Circle c, Point p) -> Segment
function Chord(Circle c, Point p, Point q) -> Segment
function Diameter(Circle c, Point p, Point q) -> Segment

-- ===== PREDICATES =====
predicate On(Point, Linelike)
predicate In(Point, Plane)
predicate Midpoint(Linelike, Point)
predicate Collinear(Point, Point, Point)
predicate Parallel(Linelike, Linelike)
predicate ParallelMarker1(Linelike, Linelike)
predicate EqualLength(Linelike, Linelike)
predicate EqualLengthMarker(Linelike, Linelike)
predicate EqualAngle(Angle, Angle)
predicate EqualAngleMarker(Angle, Angle)
predicate Acute(Angle)
predicate Obtuse(Angle)
predicate RightMarked(Angle)
predicate RightUnmarked(Angle)
predicate AngleBisector(Angle, Linelike)
predicate Parallelogram(Quadrilateral)
predicate OnCircle(Circle, Point)
predicate Incenter(Point, Triangle)
predicate Orthocenter(Point, Triangle)
predicate Centroid(Point, Triangle)
predicate Circumcenter(Point, Triangle)
```

### Example: General Triangle

**Files:** `geometry.domain`, `general-triangle.substance`, `euclidean.style`

#### `general-triangle.substance`
```
-- right triangle
Point A, B, C
Let ABC := Triangle(A, B, C) 

Angle CAB
CAB := InteriorAngle(C, A, B)

AutoLabel All
```

### Example: Pythagorean Theorem

**File:** `pythagorean-theorem-sugared.substance`
```
-- (sugared syntax)
Point A, B, C
Triangle T := Triangle(A, B, C)
Angle angleA := InteriorAngle(B, A, C)
Angle angleB := InteriorAngle(A, B, C)
Angle angleC := InteriorAngle(A, C, B)
RightMarked(angleB)
EqualLengthMarker(Segment(A, B), Segment(A, C))
AutoLabel All
```

### Available Style Variants

| File | Description |
|---|---|
| `euclidean.style` | Main style used in the SIGGRAPH paper |
| `euclidean.min.style` | Minimal version for the Edgeworth task generator |
| `euclidean-teaser.style` | Teaser image for the Penrose homepage |

---

## 5. Graph Domain

**Source directory:** `graph-domain/`

### Simple Undirected Graph Domain

#### `simple-graph.domain`
```
type Vertex
symmetric predicate Edge(Vertex, Vertex)
```

#### `simple-graph.style`
```
canvas {
  width = 400
  height = 400
}

layout = [dots, text]

color {
  black = #000000
  white = #ffffff
}

num {
  radius = 5
  labelDist = 5
  edgeDist = 100
  repelDist = 1.5 * edgeDist
  loopRadius = 15
}

forall Vertex v {
  v.dot = Circle {
    center : (? in dots, ? in dots)
    r : num.radius
    fillColor : color.black
  }

  v.text = Text {
    string : v.label
    fillColor : color.black
    fontFamily : "serif"
    fontSize : "18px"
    strokeColor : color.white
    strokeWidth : 4
    paintOrder : "stroke"
  }

  v.text above v.dot
  encourage shapeDistance(v.dot, v.text) == num.labelDist in text
}

forall Vertex u; Vertex v {
  d = vdist(u.dot.center, v.dot.center)
  dHat = num.repelDist
  encourage minimal(max(0, -sqr(d - dHat) * log(d / dHat))) in dots
  ensure disjoint(u.text, v.text, num.labelDist) in text
}

forall Vertex u; Vertex v
where Edge(u, v) as e {
  e.arrow = Line {
    start : u.dot.center
    end : v.dot.center
    strokeColor : color.black
  }
  e.arrow below u.dot
  e.arrow below v.dot
  encourage vdist(u.dot.center, v.dot.center) < num.edgeDist in dots
}
```

### Example: Computer Network (fig1) — textbook sec. 1

**Files:** `simple-graph.domain`, textbook fig1 substance, `simple-graph.style`

#### `textbook/sec1/fig1.substance`
```
Vertex Chicago, Denver, Detroit, LA, NYC, SF, Washington

Edge(Chicago, Denver)
Edge(Chicago, Detroit)
Edge(Chicago, NYC)
Edge(Chicago, Washington)
Edge(Denver, LA)
Edge(Denver, SF)
Edge(Detroit, NYC)
Edge(LA, SF)
Edge(NYC, Washington)

AutoLabel Chicago, Denver, Detroit, Washington
Label LA "Los Angeles"
Label NYC "New York"
Label SF "San Francisco"
```

### Example: Hamiltonian Cycle ★

**Registry key:** `graph-domain/other-examples/hamiltonian-cycle`  
**Files:** `simple-directed-graph.domain`, `hamiltonian-cycle.substance`, `hamiltonian-cycle.style`

#### `other-examples/hamiltonian-cycle.substance`
```
-- The seven vertices are a, b, c, d, e, f, g
Vertex a, b, c, d, e, f, g

-- The Hamiltonian cycle is a -> b -> c -> d -> e -> f -> g -> a
Arc(a, b)
Arc(b, c)
Arc(c, d)
Arc(d, e)
Arc(e, f)
Arc(f, g)
Arc(g, a)

-- Highlight the start/end vertex and arcs in the cycle
HighlightVertex(a)

HighlightArc(a, b)
HighlightArc(b, c)
HighlightArc(c, d)
HighlightArc(d, e)
HighlightArc(e, f)
HighlightArc(f, g)
HighlightArc(g, a)

-- Additional edges that are not in the Hamiltonian cycle
Arc(a, c)
Arc(a, d)
Arc(b, e)
Arc(b, f)
Arc(c, g)
Arc(d, f)

AutoLabel All
```

The domain for this example uses `Arc` and `HighlightVertex`/`HighlightArc` predicates defined in `simple-directed-graph.domain`.

### Available Domain Variants

| File | Description |
|---|---|
| `simple-graph.domain` | Undirected: `Vertex`, symmetric `Edge` |
| `simple-directed-graph.domain` | Directed: `Vertex`, `Arc`, `HighlightVertex`, `HighlightArc` |
| `directed-multigraph.domain` | Multigraph with multiple edge types |
| `pseudograph.domain` | Allows self-loops and multi-edges |

### Available Style Variants

| File | Description |
|---|---|
| `simple-graph.style` | Dots + labels, IPC-based repulsion |
| `simple-directed-graph.style` | Directed arrows from Arc |
| `simple-curved-graph.style` | Bezier-curve edges |
| `simple-curved-graph-dots.style` | Curved edges, dot labels |
| `simple-curved-graph-boxes.style` | Curved edges, box labels |
| `arpanet-color.style` | Colored dot-style (ARPANET map) |
| `hamiltonian-cycle.style` | Highlights selected arcs/vertices |

---

## 6. Linear Algebra Domain

**Source directory:** `linear-algebra-domain/`  
**Domain file:** `linear-algebra-domain/linear-algebra.domain`

### Domain

```
-- Types
type Scalar
type VectorSpace
type Vector
type LinearMap

-- Operators (functions)
function neg(Vector v) -> Vector
function scale(Scalar c, Vector v) -> Vector
function addV(Vector, Vector) -> Vector
function addS(Scalar s1, Scalar s2) -> Scalar
function norm(Vector v) -> Scalar
function innerProduct(Vector, Vector) -> Scalar
function determinant(Vector, Vector) -> Scalar
function apply(LinearMap f, Vector) -> Vector

-- Predicates
predicate In(Vector, VectorSpace V)
predicate From(LinearMap V, VectorSpace domain, VectorSpace codomain)
predicate Orthogonal(Vector v1, Vector v2)
predicate Independent(Vector v1, Vector v2)
predicate Dependent(Vector v1, Vector v2)
predicate Unit(Vector v)
```

### Example: Two Perpendicular Vectors

**Registry key:** `linear-algebra-domain/two-vectors-perp`  
**Files:** `linear-algebra.domain`, `twoVectorsPerp.substance`, `linear-algebra-paper-simple.style`

#### `twoVectorsPerp.substance`
```
VectorSpace X
Vector x1 ∈ X
Vector x2 ∈ X
Unit(x1)
Orthogonal(x1, x2)
AutoLabel All
```

> Note: `Vector x1 ∈ X` is syntactic sugar for `Vector x1; In(x1, X)`.

### Example: Independent Vectors

#### `independent.substance`
```
VectorSpace X
Vector x1
Vector x2
In(x1, X)
In(x2, X)
Independent(x1, x2)
AutoLabel All
```

### Example: Dependent Vectors

#### `dependent.substance`
```
VectorSpace X
Vector x1
Vector x2
In(x1, X)
In(x2, X)
Dependent(x1, x2)
AutoLabel All
```

---

## 7. Logic Circuit Domain

**Source directory:** `logic-circuit-domain/`  
**Domain file:** `logic-circuit-domain/logic-gates.domain`

### Domain

```
-- Nodes
type Node
type InputNode <: Node
type OutputNode <: Node

-- Components
type Component
type SplitComponent <: Component
type Gate <: Component
type OneInputGate <: Gate
type TwoInputGate <: Gate

constructor MakeSplitComponent(Node IN, Node OUT1, Node OUT2) -> SplitComponent

type Buffer <: OneInputGate
type NOTGate <: OneInputGate
constructor MakeBuffer(Node IN, Node OUT) -> Buffer
constructor MakeNOTGate(Node IN, Node OUT) -> NOTGate

type ORGate  <: TwoInputGate
type NORGate <: TwoInputGate
type ANDGate <: TwoInputGate
type NANDGate <: TwoInputGate
type XORGate <: TwoInputGate
type XNORGate <: TwoInputGate

constructor MakeORGate(Node IN1, Node IN2, Node OUT)   -> ORGate
constructor MakeNORGate(Node IN1, Node IN2, Node OUT)  -> NORGate
constructor MakeANDGate(Node IN1, Node IN2, Node OUT)  -> ANDGate
constructor MakeNANDGate(Node IN1, Node IN2, Node OUT) -> NANDGate
constructor MakeXORGate(Node IN1, Node IN2, Node OUT)  -> XORGate
constructor MakeXNORGate(Node IN1, Node IN2, Node OUT) -> XNORGate

-- Connections
type Connection
constructor MakeConnection(Node A, Node B) -> Connection
```

### Example: Half Adder ★

**Registry key:** `logic-circuit-domain/half-adder`  
**Files:** `logic-gates.domain`, `half-adder.substance`, `half-adder-color.style`

#### `half-adder.substance`
```
AutoLabel All

InputNode IN1, IN2
OutputNode SUM, CAR

Node XORIN1, XORIN2, XOROUT
XORGate XOR := MakeXORGate(XORIN1, XORIN2, XOROUT)

Node ANDIN1, ANDIN2, ANDOUT 
ANDGate AND := MakeANDGate(ANDIN1, ANDIN2, ANDOUT)

Node S1IN, S1OUT1, S1OUT2
SplitComponent S1 := MakeSplitComponent(S1IN, S1OUT1, S1OUT2)

Node S2IN, S2OUT1, S2OUT2
SplitComponent S2 := MakeSplitComponent(S2IN, S2OUT1, S2OUT2)

Connection C1 := MakeConnection(IN1, S1IN)
Connection C2 := MakeConnection(IN2, S2IN)
Connection C3 := MakeConnection(S1OUT1, XORIN1)
Connection C4 := MakeConnection(S2OUT1, XORIN2)
Connection C5 := MakeConnection(S1OUT2, ANDIN1)
Connection C6 := MakeConnection(S2OUT2, ANDIN2)
Connection C7 := MakeConnection(XOROUT, SUM)
Connection C8 := MakeConnection(ANDOUT, CAR)
```

Style files: `distinctive-shape.style` (standard) and `half-adder-color.style` (gallery version).

### Example: Full Adder

**File:** `full-adder.substance` — a more complex circuit; uses the same domain and style.

---

## 8. Structural Formula Domain

**Source directory:** `structural-formula/`  
**Domain file:** `structural-formula/structural-formula.domain`

### Domain

```
-- Node types
type Node
type FunctionalGroup <: Node
type Atom <: Node
type Hydrogen  <: Atom
type Carbon    <: Atom
type Nitrogen  <: Atom
type Oxygen    <: Atom
type Sodium    <: Atom
type Chlorine  <: Atom

-- Bond predicates
predicate SingleBond(Node n1, Node n2)
predicate DoubleBond(Node n1, Node n2)
predicate IonicBond(Node n1, Node n2)

-- Molecule grouping
type Molecule
predicate Contains(Molecule m, Node n)
predicate IsReactant(Molecule m)
predicate IsProduct(Molecule m)

-- Reaction
type Reaction
predicate IsNetForward(Reaction r)
predicate IsStoichiometric(Reaction r)
predicate IsEquilibrium(Reaction r)
predicate IsBidirectional(Reaction r)

-- Labeling
type Title
```

### Example: Caffeine Molecule ★

**Registry key:** `structural-formula/molecules/caffeine`  
**Files:** `structural-formula.domain`, `molecules/caffeine.substance`, `<style file>`

#### `molecules/caffeine.substance`
```
-- caffeine molecule, expressed via structural-formula DSL
Carbon C1, C2, C3, C4, C5, C6, C7, C8
Nitrogen N1, N2, N3, N4
Oxygen O1, O2
Hydrogen H1, H2, H3, H4, H5, H6, H7, H8, H9, H10

SingleBond(N2, C4)
SingleBond(C4, C5)
DoubleBond(C5, C6)
SingleBond(C6, N1)
SingleBond(N1, C2)
SingleBond(N2, C2)
DoubleBond(C2, O2)
SingleBond(N2, C1)
SingleBond(C1, H7)
SingleBond(C1, H6)
SingleBond(C1, H5)
DoubleBond(C4, O1)
SingleBond(C7, H4)
SingleBond(C7, H3)
SingleBond(H2, C7)
SingleBond(N3, C7)
SingleBond(N3, C5)
SingleBond(C8, N3)
DoubleBond(C8, N4)
SingleBond(N4, C6)
SingleBond(C8, H1)
SingleBond(C3, H10)
SingleBond(C3, H8)
SingleBond(C3, H9)
SingleBond(N1, C3)

AutoLabel All

Title title
Label title "caffeine"
```

### Example: Methane Combustion Reaction ★

**Registry key:** `structural-formula/reactions/methane-combustion`  
File: `structural-formula/reactions/methane-combustion.substance`

### Other Available Substances

| File | Contents |
|---|---|
| `molecules/caffeine.substance` | Caffeine (C₈H₁₀N₄O₂) |
| `molecules/nitricacid-lewis.substance` | Lewis structure of HNO₃ |
| `molecules/sulfuric-acid.substance` | H₂SO₄ |
| `molecules/glutamine.substance` | Glutamine amino acid |
| `reactions/methane-combustion.substance` | CH₄ + 2O₂ → CO₂ + 2H₂O |
| `atoms-and-bonds/one-water-molecule.substance` | H₂O |
| `atoms-and-bonds/wet-floor.substance` | Wet floor warning icon DSL |

---

## 9. Impossible Polygons — Penrose Logo

**Source directory:** `impossible-ngon/`  
**Description:** Demonstrates the built-in `Penrose()` function, which generates an "impossible" n-sided polygon path inspired by Roger Penrose. The style creates the official Penrose project logo.

### Domain

#### `ngon.domain`
```
type NGon
```

### Substance

#### `ngon.substance`
```
NGon P_i for i in [1, 12]
```
This uses Penrose's indexed statement syntax to create 12 `NGon` instances at once.

### Style (ngon.style — abridged)

```
canvas {
  width = 1920
  height = 1080

  shape background = Image {
    href : "radial-gradient.svg"
    center : (0, 0)
    width : canvas.width
    height : canvas.width
    preserveAspectRatio : "none"
  }
}

logo {
  -- Parameters for the Penrose logo
  vec2 center   = (0, 60)      -- location on canvas
  scalar R      = 350          -- outer radius
  scalar s      = .35          -- inner radius as fraction of outer
  scalar theta  = 0            -- angle of rotation
  scalar nSides = 5            -- number of sides
  string chirality = "ccw"     -- clockwise or counter-clockwise

  -- The Penrose() built-in returns a compound SVG path string
  shape pentagon = Path {
    d : Penrose(center, R, s, theta, nSides, chirality)
    fillColor : #3fb4f7bb
    strokeColor : #555
    strokeWidth : 6
  }

  shape labelText = Text {
    center : center + (0, -(R + 25))
    string : "Penrose"
    fontSize : "172px"
    fontFamily : "HelveticaNeue-CondensedBold,Helvetica,Arial,Geneva,Tahoma,sans-serif"
    fontWeight : "600"
    fontStretch : "condensed"
    fillColor : #fff
    strokeColor : #555
    strokeWidth : 12
    paintOrder : "stroke"
  }

  -- Group with drop shadow
  shape icon = Group {
    shapes : [ pentagon, labelText ]
    style : "filter: drop-shadow(0px 50px 20px #0008);"
  }
}

-- Draw each NGon using match_id for position and number of sides
forall NGon P {
  scalar n = match_id - 1
  scalar i = mod(n, 4) - 1.5   -- column index
  scalar j = floor(n / 4) - 1  -- row index

  vec2 P.center = (400 * i, 350 * j)

  shape P.icon = Path {
    d : Penrose(P.center, 150, .5, 0, match_id)
    fillColor : none()
    strokeColor : #888
    strokeWidth : 5
    strokeLinejoin : "round"
    ensureOnCanvas : false
  }

  shape P.glow = Path {
    d : Penrose(P.center, 150, .5, 0, match_id)
    fillColor : none()
    strokeColor : #fffb
    strokeWidth : 5
    ensureOnCanvas : false
    style : "filter:blur(10px);"
  }

  layer P.icon below logo.icon
  layer P.glow above logo.icon
}

-- Clip the glow to the logo pentagon using collect
collect NGon P into Ps {
  list glows = listof glow from Ps

  vec2 c = logo.center
  scalar R = logo.R
  -- ... construct pentagon polygon for clip mask ...
  shape mask = Polygon { points : [ p0, p1, p2, p3, p4 ] }

  shape clipGroup = Group {
    shapes : glows
    clipPath : clip(mask)
  }
}
```

**Key Penrose() signature:**
```
Penrose()                                   -- defaults: 5-gon, defaults
Penrose(center, R, holeSize, angle, nSides) -- positional
Penrose(center, R, holeSize, angle, nSides, chirality) -- full
```
Parameters: `center` (vec2), `R` (outer radius), `holeSize` (inner/outer fraction, (0,1]), `angle` (rotation), `nSides` (integer ≥ 3), `chirality` (`"cw"` or `"ccw"`).

Minimal standalone logo:
```style
canvas {
  width = 150
  height = 150

  shape logo = Path {
    d : Penrose()
  }
}
```

---

## 10. More Examples by Category

### Alloy Models (`alloy-models/`)

Visualizations of [Alloy](https://alloytools.org/) model-checking specifications.

| Registry Key | Name |
|---|---|
| `alloy-models/dining-philosophers` | Alloy: Dining Philosophers Problem |
| `alloy-models/message-passing` | Alloy: Conversation between Four Parties |
| `alloy-models/ring-leader-election` | Alloy: Leader Election in Ring |
| `alloy-models/river-crossing` | Alloy: River Crossing |
| `alloy-models/workstations` | Alloy: Workstations |
| `alloy-models/generic` | Alloy: Generic Style |
| `alloy-models/icicle-plot-file-system` | File System Icicle Plot |

Files: `alloy-models/` directory — uses `distribute-horizontal.style` and `distribute-vertical.style`.

---

### Spectral Graphs (`spectral-graphs/`)

Graphs laid out via spectral embedding (eigenvectors of the Laplacian).

Gallery examples: Hypercube, Hexagonal Lattice, Dodecahedral Graph, Mobius Strip.

Raw directory: `spectral-graphs/examples/` — each subdirectory has a `.substance` file listing vertices and edges, and links to shared style files.

---

### Fractals (`fractals/`)

| Registry Key | Name | Gallery |
|---|---|:---:|
| `fractals/chaos-game/sierpinski-triangle` | Chaos Game: Sierpinski Triangle | ★ |
| `fractals/ifs/ifs` | Iterated Functions System | ★ |
| `fractals/chaos-game/vicsek-fractal` | Chaos Game: Vicsek Fractal | |
| `fractals/l-systems/tree` | L-System | |

---

### Walk on Spheres (`walk-on-spheres/`)

Visualizations of Monte Carlo PDE solvers (harmonic functions, walk-on-spheres).

| Registry Key | Name | Gallery |
|---|---|:---:|
| `walk-on-spheres/walk-on-stars` | Walk on Stars — Laplace Estimator | ★ |
| `walk-on-spheres/laplace-estimator` | Walk on Spheres — Laplace Estimator | ★ |
| `walk-on-spheres/SignedAngleOutside` | Walk on Stars — Signed Angle Outside | ★ |
| `walk-on-spheres/poisson-estimator` | Walk on Spheres — Poisson Estimator | |
| `walk-on-spheres/nested-estimator` | Walk on Spheres — Nested Estimator | |
| `walk-on-spheres/offcenter-estimator` | Walk on Spheres — Off-Center Estimator | |

---

### Interactive Examples (`interactive/`)

Diagrams with draggable widgets and dynamic constraints. All three gallery examples use Penrose's [input widget](https://penrose.cs.cmu.edu/docs/ref/style/comptime#input) syntax.

| Registry Key | Name | Gallery |
|---|---|:---:|
| `interactive/ellipse-rays` | Ellipse Rays | ★ |
| `interactive/viewport` | Viewport | ★ |
| `interactive/planets` | Planets | ★ |

---

### Triangle Meshes (`triangle-mesh-2d/`, `triangle-mesh-3d/`)

Computational-geometry diagrams: half-edge mesh, cotangent weights, conformal mapping.

Gallery examples: Cotan Formula, Concyclic Euclidean Edge Flip, Two 3D Triangles.

---

### Curve Examples (`curve-examples/`)

Gallery examples: Catmull-Rom Interpolation, Blobs, Nephroid Envelope.  
Other examples: Offset Curve, Frenet Frame, Osculating Circle, Evolute of Cardioid, Open/Closed Elastic Curves, Space Curves, Cubic Bezier.

---

### Ray Tracing (`ray-tracing/`)

Diagrams illustrating path tracing algorithms. The Next Event Estimation diagram is in the gallery.

Files: `ray-tracing/{path-trace, bidirectional, next-event-estimation}.substance` + shared styles.

---

### Geometric Queries (`geometric-queries/`)

Illustrations of computational-geometry algorithms: ray intersection, closest-point queries, silhouette detection.

Gallery examples: Geometric Queries, Ray Casting, Closest Point Queries.

---

### Stochastic Processes (`stochastic-process/`)

| Registry Key | Name | Gallery |
|---|---|:---:|
| `stochastic-process/stochastic-process` | Brownian Motion in a Ball | ★ |
| `stochastic-process/epsilon-shell/AbsorbingBoundary` | Brownian Motion Absorbed at Boundary | ★ |

---

### Data Visualization (`dataviz/`, `random-sampling/`, `tsne/`, `word-cloud/`)

| Registry Key | Name | Gallery |
|---|---|:---:|
| `dataviz/linearreg` | Linear Regression | ★ |
| `word-cloud/example` | Word Cloud | ★ |
| `random-sampling/test` | Random Sampling | ★ |
| `dataviz/residual` | Linear Regression Residuals | |
| `tsne/tsne` | T-SNE | |

---

### Mobius Transformation (`mobius/`)

| Registry Key | Name | Gallery |
|---|---|:---:|
| `mobius/mobius` | Mobius Transformation of Circles | ★ |

---

### Lagrange Bases (`lagrange-bases/`)

| Registry Key | Name | Gallery |
|---|---|:---:|
| `lagrange-bases/lagrange-bases` | Lagrange Bases | ★ |

---

### Persistent Homology (`persistent-homology/`)

| Registry Key | Name | Gallery |
|---|---|:---:|
| `persistent-homology/persistent-homology` | Persistent Homology | ★ |

---

### Hypergraph (`hypergraph/`)

| Registry Key | Name | Gallery |
|---|---|:---:|
| `hypergraph/hypergraph` | Hypergraph | ★ |

---

### Dynamics (`Dynamics/`)

| Registry Key | Name | Gallery |
|---|---|:---:|
| `Dynamics/Lyapunov` | Lyapunov Exponent | ★ |

---

### Box-Arrow Diagrams (`box-arrow-diagram/`)

| Registry Key | Name | Gallery |
|---|---|:---:|
| `box-arrow-diagram/computer-architecture` | Computer Architecture Box-Arrow Diagram | ★ |

---

### Fancy Text (`fancy-text/`)

| Registry Key | Name | Gallery |
|---|---|:---:|
| `fancy-text/fancy-text` | Fancy Text + Equations | ★ |

Demonstrates rendering LaTeX-style math equations as part of diagram labels.

---

### Dinoshade (`dinoshade/`)

| Registry Key | Name | Gallery |
|---|---|:---:|
| `dinoshade/dinoshade` | 3D Reflections and Shadows | ★ |

---

### Exterior Algebra (`exterior-algebra/`)

| Registry Key | Name | Gallery |
|---|---|:---:|
| `exterior-algebra/vector-wedge` | Wedge Product | ★ |

---

### Array Models (`array-models/`)

| Registry Key | Name | Gallery |
|---|---|:---:|
| `array-models/insertionSort` | Insertion Sort | ★ |

---

### Group Theory (`group-theory/`)

| Registry Key | Name | Gallery |
|---|---|:---:|
| `group-theory/quaternion-multiplication-table` | Quaternions as table | ★ |
| `group-theory/quaternion-cayley-graph` | Quaternions as Cayley graph | ★ |

---

### Set Potatoes (`set-potatoes/`)

Categorical diagrams about set functions: injections, surjections, monomorphisms, epimorphisms.

| Registry Key | Name | Gallery |
|---|---|:---:|
| `set-potatoes/non-surjection-not-epimorphism` | A non-surjection is not an epimorphism | ★ |
| `set-potatoes/relation-not-a-function` | Relation that isn't a function | |
| `set-potatoes/injections-post-inverses` | Injections and Post-Inverses | |
| `set-potatoes/non-injection-not-monomorphism` | A non-injection is not a monomorphism | |
| `set-potatoes/surjections-pre-inverses` | Surjections and Pre-Inverses | |

---

### Shape Spec (`shape-spec/`)

Internal test trios that demonstrate all available shapes and arrowhead styles. Not named examples; used for visual regression testing.

---

### SolidJS Examples (`solid/`)

Three examples (`eigenspace`, `triangles`, `vectors`) that use the SolidJS reactive rendering integration rather than the standard trio pipeline. These have `"trio": false` in registry.json.

---

## 11. Repository Structure

```
packages/examples/src/
├── registry.json               ← Master index: all trio keys, names, gallery flags
├── index.ts                    ← TypeScript exports
├── registry.test.ts            ← Test that all trios compile
│
├── tutorials/
│   ├── tutorial1.trio.json     ← { substance, style, domain, variation }
│   ├── tutorial2.trio.json
│   ├── tutorial3.trio.json
│   ├── code/
│   │   ├── tutorial1/          ← Starter code (mostly empty)
│   │   ├── tutorial2/
│   │   └── tutorial3/
│   ├── solutions/
│   │   ├── tutorial1.md        ← Full worked solutions (markdown + code blocks)
│   │   ├── tutorial2.md
│   │   └── tutorial3.md
│   └── supplementary/tutorial3/
│
├── set-theory-domain/          ← .domain, multiple .substance, multiple .style files
├── geometry-domain/
│   ├── textbook_problems/      ← Individual textbook problems
│   └── edgeworth-tasks/        ← AI-generated geometry tasks
├── graph-domain/
│   ├── textbook/sec1/          ← Book figures (fig1–fig13)
│   ├── textbook/sec2/          ← Book figures
│   ├── textbook/sec5/
│   └── other-examples/         ← arpanet, hamiltonian-cycle, nyc-subway, etc.
├── linear-algebra-domain/
├── logic-circuit-domain/
├── structural-formula/
│   ├── molecules/              ← Per-molecule .substance files
│   └── reactions/              ← Reaction .substance files
├── impossible-ngon/
├── spectral-graphs/examples/
├── triangle-mesh-2d/diagrams/
├── triangle-mesh-3d/
├── walk-on-spheres/
├── geometric-queries/
│   ├── closest-point/
│   ├── closest-silhouette-point/
│   └── ray-intersect/
├── curve-examples/
│   ├── catmull-rom/
│   └── (flat .substance/.style files)
├── fractals/
│   ├── chaos-game/
│   ├── ifs/
│   └── l-systems/
├── stochastic-process/
│   └── epsilon-shell/
├── alloy-models/
├── dataviz/
├── atoms-and-bonds/
├── molecules/
├── group-theory/
├── matrix-ops/tests/
├── matrix-library/
├── exterior-algebra/
├── set-potatoes/
├── interactive/
├── ray-tracing/
├── solid/                      ← SolidJS integration (trio: false)
└── ... (many more)
```

### Trio JSON Format

Each trio is a `.trio.json` file (one per example):

```json
{
  "substance": "./path/to/file.substance",
  "style": ["./path/to/file.style"],
  "domain": "./path/to/file.domain",
  "variation": ""
}
```

- `style` is an array (multiple style files can be stacked)
- `variation` is an optional seed string for the optimizer
- The registry.json key for this trio is the path relative to `src/`, without the `.trio.json` extension

### Running an Example Locally

```bash
# Clone the repo
git clone https://github.com/penrose/penrose.git
cd penrose
yarn install

# Watch a specific trio (hot-reload in browser)
npx roger watch \
  packages/examples/src/set-theory-domain/tree.substance \
  packages/examples/src/set-theory-domain/euler.style \
  packages/examples/src/set-theory-domain/setTheory.domain

# Or use the online editor: https://penrose.cs.cmu.edu/try
```

### Direct Raw File URLs

```
https://raw.githubusercontent.com/penrose/penrose/main/packages/examples/src/<path>
```

Examples:
```
# Set theory domain
https://raw.githubusercontent.com/penrose/penrose/main/packages/examples/src/set-theory-domain/setTheory.domain
https://raw.githubusercontent.com/penrose/penrose/main/packages/examples/src/set-theory-domain/tree.substance
https://raw.githubusercontent.com/penrose/penrose/main/packages/examples/src/set-theory-domain/euler.style

# Graph domain
https://raw.githubusercontent.com/penrose/penrose/main/packages/examples/src/graph-domain/simple-graph.domain
https://raw.githubusercontent.com/penrose/penrose/main/packages/examples/src/graph-domain/simple-graph.style

# Tutorials
https://raw.githubusercontent.com/penrose/penrose/main/packages/examples/src/tutorials/solutions/tutorial1.md
https://raw.githubusercontent.com/penrose/penrose/main/packages/examples/src/tutorials/solutions/tutorial2.md
https://raw.githubusercontent.com/penrose/penrose/main/packages/examples/src/tutorials/solutions/tutorial3.md
```

---

## 12. Style Language Quick Reference

### Canvas Preamble (required in every style file)

```style
canvas {
  width = 800
  height = 700
}
```

---

### Selector Syntax

```style
-- Match all instances of a type
forall TypeName x { }

-- Match two types together with a predicate
forall TypeName x; TypeName2 y
where SomePredicate(x, y) { }

-- Match a function result
forall TypeName x; TypeName y; TypeName z
where z := someFunction(x, y) { }

-- Match with an alias
forall TypeName x; TypeName y
where SomePredicate(x, y) as r { }

-- Match with a label filter
forall TypeName x
where x has label { }

-- Match a specific named substance variable (backtick)
forall TypeName `A` { }

-- Allow same substance variable to match multiple style variables
forall repeatable TypeName a; TypeName b
where Edge(a, b) { }
```

**Reserved variables available inside any selector:**
- `match_id` — 1-based index of this particular match (useful for grid layouts, e.g. `match_id - 1`)
- `match_total` — total number of matches for this selector

---

### Selector Body

```style
forall Set x {
  -- Assign a field (bound to this substance instance forever)
  x.myField = someExpression

  -- Assign a free variable (local to this block — starts with '?' or scalar)
  scalar s = ?

  -- Declare a shape
  x.icon = Circle {
    r : 50
    fillColor : rgba(1, 0, 0, 1)
  }

  -- Constrain (hard requirement — optimizer must satisfy)
  ensure contains(x.icon, x.text)
  ensure x.icon.r > 25

  -- Objective (soft goal — optimizer tries to minimize "badness")
  encourage norm(x.text.center - x.icon.center) == 0

  -- Operator sugar for constraints/objectives
  ensure a == b      -- equal(a, b)
  ensure a > b       -- greaterThan(a, b)
  ensure a < b       -- lessThan(a, b)

  -- Layering
  layer x.text above x.icon

  -- Override a previously-set field (e.g. in another forall block)
  override x.icon.r = 200

  -- Delete a previously-declared field
  delete x.icon
}
```

---

### Collector Syntax

Collectors aggregate multiple matches into a list:

```style
collect Element e into es
where In(e, s)
foreach Set s {
  -- 'es' is a collection; 'listof' extracts a field from each element
  list centers = listof center from es  -- list of Circle centers, etc.
  scalar n = numberof es                -- count of elements in es
}
```

`listof field from collection` output type depends on input field type:

| Field type | Output type |
|---|---|
| scalar (FloatV) | vector |
| vector (VectorV) | matrix |
| list (ListV) | list of lists |
| 2-tuple (TupV) | list of 2D points |
| shape | `ShapeListV` (usable in Group.shapes) |

---

### Namespace (global constants)

```style
colors {
  red   = rgba(0.8, 0.1, 0.1, 1)
  blue  = rgba(0.1, 0.3, 0.9, 1)
  none  = rgba(0, 0, 0, 0)
}

-- Access anywhere in the file:
-- colors.red
-- colors.none
```

---

### Layout Stages

Style programs can declare multiple layout stages. This runs the optimizer in successive passes:

```style
layout = [stage1, stage2]

forall Vertex v {
  v.dot = Circle {
    center : (? in stage1, ? in stage1)
    r : 5
  }
  encourage shapeDistance(v.dot, v.label) == 5 in stage2
}
```

`?` and `encourage`/`ensure` without a stage tag apply in all stages.

---

### Key Syntax Gotchas

1. **Always put spaces around `+` and `-`**: Due to a tokenizer quirk, `2+1` is parsed as two numbers, not an addition. Write `2 + 1`.
2. **`ensure` vs `encourage`**: `ensure` is a hard constraint (penalty if violated), `encourage` is a soft objective (minimize badness).
3. **`override` is required to reassign fields**: Penrose is purely functional — once a field is set in a `forall` block, setting it again in another block for the same object requires `override`.
4. **`?` vs constants**: `?` is an optimizable variable. `random(0, 100)` is a fixed constant (depends only on the variation seed) — you cannot optimize it away.
5. **`shape` keyword is optional**: `x.icon = Circle {}` and `shape x.icon = Circle {}` are equivalent.
6. **`AutoLabel All`** in substance automatically sets `label` for every object to its variable name.

---

## 13. Shape Properties Quick Reference

All shapes support `ensureOnCanvas : true` (default). Set `false` to allow the shape to leave the canvas.

### Circle

```style
x.c = Circle {
  center : (0, 0)        -- vec2, sampled by default
  r : 50                 -- radius, sampled by default
  fillColor : rgba(...)  -- ColorV, sampled by default
  strokeColor : none()   -- ColorV, default none()
  strokeWidth : 0        -- FloatV
  strokeStyle : "solid"  -- "solid" | "dashed"
  strokeDasharray : ""   -- SVG stroke-dasharray string
}
```

Read-only computed: `x.c.center`, `x.c.r`.

---

### Ellipse

```style
x.e = Ellipse {
  center : (0, 0)
  rx : 60                -- x radius
  ry : 40                -- y radius
  fillColor : rgba(...)
  strokeColor : none()
  strokeWidth : 0
}
```

---

### Rectangle

```style
x.r = Rectangle {
  center : (0, 0)
  width : 100
  height : 60
  fillColor : rgba(...)
  strokeColor : none()
  strokeWidth : 0
  cornerRadius : 0       -- rounded corners
  rotation : 0           -- degrees
}
```

---

### Line

```style
x.l = Line {
  start : (0, 0)         -- vec2
  end : (100, 0)         -- vec2
  strokeColor : rgba(0, 0, 0, 1)
  strokeWidth : 1
  strokeStyle : "solid"
  strokeDasharray : ""
  strokeLinecap : ""
  startArrowhead : "none"  -- "none" | "straight" | "curved" | etc.
  endArrowhead : "straight"
  startArrowheadSize : 1
  endArrowheadSize : 1
  flipStartArrowhead : false
  fillColor : none()
}
```

---

### Path

```style
x.p = Path {
  d : pathFromPoints("open", [[x1,y1],[x2,y2],[x3,y3]])
  -- or: d : arc("open", start, end, [rx,ry], rotation, largeArc, arcSweep)
  -- or: d : interpolatingSpline("open", pointList)
  -- or: d : Penrose()
  strokeColor : rgba(0, 0, 0, 1)
  strokeWidth : 1
  fillColor : none()
  endArrowhead : "straight"
  endArrowheadSize : 1
  strokeLinecap : "butt"   -- "butt" | "round" | "square"
}
```

`pathFromPoints(type, points)` — `type` is `"open"` or `"closed"`.

---

### Polygon / Polyline

```style
x.poly = Polygon {
  points : [[0,0],[50,100],[100,0]]
  fillColor : rgba(...)
  strokeColor : none()
  strokeWidth : 0
}

x.pl = Polyline {
  points : [[0,0],[50,100],[100,0]]
  strokeColor : rgba(0,0,0,1)
  strokeWidth : 2
  fillColor : none()
}
```

---

### Text

```style
x.t = Text {
  string : x.label          -- or any string expression
  center : (0, 0)           -- sampled by default
  fillColor : rgba(0,0,0,1)
  fontFamily : "sans-serif"
  fontSize : "16px"
  fontWeight : ""            -- "bold", "600", etc.
  fontStyle : ""             -- "italic"
  rotation : 0
  -- width and height are AUTO-SET by Penrose (bounding box of text)
  -- DO NOT set manually, but DO read them:
  --   x.t.width, x.t.height, x.t.ascent, x.t.descent
}
```

---

### Equation (LaTeX math)

```style
x.eq = Equation {
  string : "x^2 + y^2"      -- LaTeX math-mode string (no $...$)
  center : (0, 0)
  fillColor : rgba(0,0,0,1)
  fontSize : "16px"
  rotation : 0
  -- width, height, ascent, descent are auto-set
}
```

---

### Image

```style
x.img = Image {
  href : "my-image.svg"      -- relative or absolute URL
  center : (0, 0)
  width : 100
  height : 100
  rotation : 0
  preserveAspectRatio : ""
}
```

---

### Group

```style
x.g = Group {
  shapes : [x.outline, x.label]   -- list of previously-declared shapes
  clipPath : clip(x.mask)         -- or noClip()
}
```

- A shape can only be in one group.
- Layering on a group applies to all members; layering on a member applies to the whole group.

---

## 14. Color Reference

```style
-- RGBA: components in [0, 1]
rgba(1, 0, 0, 1)        -- opaque red
rgba(0, 0.5, 1, 0.5)    -- semi-transparent blue

-- Hex: #rrggbb or #rrggbbaa
#ff0000                  -- opaque red
#ff000080                -- 50% transparent red
#3fb4f7bb                -- Penrose logo blue

-- HSVA: hue [0, 360], saturation/value [0, 100], alpha [0, 1]
hsva(200, 80, 90, 1)

-- None (no paint — different from fully transparent)
none()

-- Modify opacity
setOpacity(rgba(1, 0, 0, 1), 0.5)

-- Sample a random color
sampleColor(0.5, "rgb")    -- random RGB with alpha 0.5
sampleColor(0.8, "hsv")    -- random HSV with alpha 0.8
```

---

## 15. Function Library

Source: <https://penrose.cs.cmu.edu/docs/ref/style/functions>

### Constraint Functions (`ensure`)

Output ≤ 0 = satisfied. Output > 0 = violated.

#### Equality / Ordering

| Function | Description |
|---|---|
| `equal(x, y)` | x == y |
| `lessThan(x, y, padding?)` | x < y (with optional safety margin) |
| `greaterThan(x, y, padding?)` | x > y (with optional safety margin) |
| `lessThanSq(x, y)` | x < y (steeper penalty) |
| `greaterThanSq(x, y)` | x > y (steeper penalty) |
| `inRange(x, lo, hi)` | lo ≤ x ≤ hi |
| `disjointScalar(c, left, right)` | c not in interval [left, right] |

#### Spatial / Shape

| Function | Description |
|---|---|
| `contains(s1, s2, padding?)` | Shape s1 contains s2 |
| `disjoint(s1, s2, padding?)` | Shapes s1 and s2 don't overlap |
| `overlapping(s1, s2, overlap?)` | Shapes s1 and s2 overlap by ≥ overlap |
| `touching(s1, s2, padding?)` | Shapes just touch |
| `onCanvas(shape, w, h)` | Shape is within canvas |
| `collinear(c1, c2, c3)` | Three points are collinear |
| `collinearOrdered(c1, c2, c3)` | Collinear in given order |
| `perpendicular(q, p, r)` | Vector (q-p) ⊥ (r-p) |

#### Containment variants

| Function | Description |
|---|---|
| `containsCircles(c1, r1, c2, r2, padding?)` | Circle 1 contains circle 2 |
| `containsRects(rect1, rect2, padding?)` | Rect1 contains rect2 |
| `containsPolyCircle(pts, c, r, padding?)` | Polygon contains circle |
| `containsPolyPoint(pts, pt, padding?)` | Polygon contains point |
| `containsCirclePoint(c, r, pt, padding?)` | Circle contains point |
| `containsRectCircle(rect, c, r, padding?)` | Rectangle contains circle |

#### Distribution

| Function | Description |
|---|---|
| `distributeHorizontally(shapes, padding?, leftToRight?)` | Even horizontal spacing |
| `distributeVertically(shapes, padding?, topToBottom?)` | Even vertical spacing |
| `disjointIntervals(s1, s2)` | Two line-like shapes don't overlap along their axes |

#### Shape quality

| Function | Description |
|---|---|
| `isConvex(points, closed)` | Shape should be convex |
| `isEquilateral(points, closed)` | All edge lengths equal |
| `isEquiangular(points, closed)` | All angles equal |

---

### Objective Functions (`encourage`)

Output = "badness". Optimizer minimizes it.

#### Positioning

| Function | Description |
|---|---|
| `near(s1, s2, offset?)` | Place s1 near s2 (same center) |
| `nearPt(s1, x, y)` | Place s1 near location (x,y) |
| `nearVec(v1, v2, offset?)` | Encourage two vectors to be close |
| `sameCenter(s1, s2)` | Encourage same center |
| `above(top, bottom, offset?)` | top.center above bottom.center |
| `below(bottom, top, offset?)` | bottom.center below top.center  |
| `leftwards(left, right, offset?)` | left.center to the left of right.center |
| `rightwards(right, left, offset?)` | right.center to the right of left.center |
| `inDirection(p, pRef, dir, offset?)` | p in direction `dir` from pRef |

#### Repulsion

| Function | Description |
|---|---|
| `notTooClose(s1, s2, weight?)` | Repel s1 and s2 |
| `repelPt(weight, a, b)` | Repel point a from point b |
| `repelScalar(c, d)` | Repel scalar c from d |

#### Labeling

| Function | Description |
|---|---|
| `centerLabel(s1, s2, w, padding?)` | Center label s2 w.r.t. s1 |
| `centerLabelAbove(s1, s2, w)` | Center label s2 above line s1 |
| `pointLineDist(point, s1, padding)` | Distance from point to line == padding |

#### Extremal

| Function | Description |
|---|---|
| `minimal(x)` | Minimize x (push toward −∞) |
| `maximal(x)` | Maximize x (push toward +∞) |
| `equal(x, y)` | Encourage x == y → (x-y)² |
| `greaterThan(x, y)` | Encourage x ≥ y |
| `lessThan(x, y)` | Encourage x ≤ y |
| `nonDegenerateAngle(s0, s1, s2, ...)` | Push angle away from 0/π |

#### Shape quality

| Function | Description |
|---|---|
| `isRegular(points, closed)` | Make shape regular |
| `isEquilateral(points, closed)` | Make shape equilateral |
| `isEquiangular(points, closed)` | Make shape equiangular |

---

### Computation Functions — Colors

| Function | Returns | Description |
|---|---|---|
| `rgba(r, g, b, a)` | Color | r,g,b,a ∈ [0,1] |
| `hsva(h, s, v, a)` | Color | h∈[0,360], s/v∈[0,100], a∈[0,1] |
| `none()` | Color | No paint |
| `setOpacity(color, frac)` | Color | Set opacity |
| `sampleColor(alpha, type)` | Color | Random color (`"rgb"` or `"hsv"`) |
| `selectColor(c1, c2, level)` | Color | Blend between c1 and c2 |

---

### Computation Functions — Scalars

| Function | Returns | Description |
|---|---|---|
| `abs(x)` | ℝ | \|x\| |
| `sqr(x)` | ℝ | x² |
| `sqrt(x)` | ℝ | √x |
| `pow(x, y)` | ℝ | xʸ |
| `max(x, y)` / `min(x, y)` | ℝ | max/min |
| `maxList(v)` / `minList(v)` | ℝ | Max/min of a vector |
| `mod(a, n)` | ℝ | a mod n |
| `sign(x)` | ℝ | ±1 or 0 |
| `floor(x)` / `ceil(x)` / `round(x)` / `trunc(x)` | ℝ | Rounding |
| `sin(x)` / `cos(x)` / `tan(x)` | ℝ | Trig (radians) |
| `asin(x)` / `acos(x)` / `atan(x)` / `atan2(y, x)` | ℝ | Inverse trig |
| `exp(x)` / `log(x)` / `log2(x)` / `log10(x)` | ℝ | Exp/log |
| `toRadians(θ)` / `toDegrees(θ)` | ℝ | Angle conversion |
| `MathPI()` | ℝ | π ≈ 3.14159… |
| `MathE()` | ℝ | e ≈ 2.71828… |
| `random(lo, hi)` | ℝ | Uniform sample (fixed — not optimizable) |
| `normalRandom()` | ℝ | Normal distribution sample (fixed) |
| `unitRandom()` | ℝ | Uniform sample from [0, 1) (fixed) |

---

### Computation Functions — Vectors

| Function | Returns | Description |
|---|---|---|
| `norm(v)` | ℝ | \|v\| (Euclidean norm) |
| `normsq(v)` | ℝ | \|v\|² |
| `normalize(v)` / `unit(v)` | ℝⁿ | Unit vector v/\|v\| |
| `unitVector(theta)` | ℝ² | (cos θ, sin θ) |
| `vdist(u, v)` | ℝ | Euclidean distance |
| `vdistsq(u, v)` | ℝ | Squared distance |
| `dot(u, v)` | ℝ | Dot product |
| `cross(u, v)` | ℝ³ | 3D cross product |
| `cross2D(u, v)` | ℝ | det([u v]) = u₀v₁ − u₁v₀ |
| `rot90(v)` | ℝ² | Rotate 90° CCW |
| `rotateBy(v, theta)` | ℝ² | Rotate v by theta degrees CCW |
| `angleOf(v)` | ℝ | Angle with positive x-axis (radians) |
| `angleBetween(u, v)` | ℝ | Unsigned angle ∈ [0, π] |
| `angleFrom(u, v)` | ℝ | Signed angle from u to v ∈ [−π, π] |
| `average(xs)` | ℝ | Mean of a vector |
| `average2(x, y)` | ℝ | Mean of two scalars |
| `sum(xs)` | ℝ | Sum of elements |
| `sumVectors(vecs)` | ℝⁿ | Sum of a list of vectors |
| `count(xs)` | ℝ | Number of elements |
| `get(xs, i)` | ℝ | i-th element (0-indexed) |
| `repeat(n, k)` | ℝⁿ | Vector of n copies of k |
| `midpoint(a, b)` | ℝⁿ | Midpoint |
| `midpointOffset(s1, padding)` | ℝ² | Midpoint of line, offset perpendicularly |
| `ptOnLine(p1, p2, r)` | ℝⁿ | Point at distance r along p1→p2 |
| `diskRandom()` | ℝ² | Uniform random point in unit disk (fixed) |
| `sphereRandom()` | ℝ³ | Uniform random point on unit sphere (fixed) |

---

### Computation Functions — Geometry / Shape Queries

| Function | Returns | Description |
|---|---|---|
| `signedDistance(s, p)` | ℝ | Signed distance from shape boundary to point p (negative inside) |
| `shapeDistance(s1, s2)` | ℝ | Distance between two shapes |
| `closestPoint(s, p)` | ℝ² | Closest point on s to p |
| `rayIntersect(s, p, v)` | ℝ² | First intersection of ray p+tv with shape s |
| `bboxPts(s)` | list of ℝ² | Bounding box corners [TL, TR, BR, BL] |
| `rectPts(s)` | list of ℝ² | Corners of a Rectangle (accounts for rotation) |
| `lineLineIntersection(a0,a1,b0,b1)` | ℝ² | Intersection of two lines |
| `circumcenter(p,q,r)` | ℝ² | Triangle circumcenter |
| `incenter(p,q,r)` | ℝ² | Triangle incenter |
| `barycenter(a,b,c)` | ℝ² | Triangle barycenter (centroid) |
| `length(l)` | ℝ | Length of a Line shape |
| `TeXify(str)` | String | `"x_1"` → `"{x}_{1}"` (useful for auto-labels) |

---

### Computation Functions — Path Construction

| Function | Returns | Description |
|---|---|---|
| `pathFromPoints(type, pts)` | PathCmd | Polyline or closed polygon. type = `"open"` or `"closed"` |
| `interpolatingSpline(type, pts, tension?)` | PathCmd | Catmull-Rom spline through points |
| `cubicCurveFromPoints(type, pts)` | PathCmd | Cubic Bézier spline |
| `arc(type, start, end, [rx,ry], rotation, largeArc, sweep)` | PathCmd | SVG arc segment |
| `circularArc(type, center, r, theta0, theta1)` | PathCmd | Circular arc from angle theta0 to theta1 |
| `wedge(center, start, end, r, rotation, largeArc, sweep)` | PathCmd | Filled arc wedge |
| `makePath(start, end, h, padding)` | PathCmd | Bezier-curved path between two shapes |
| `Penrose(center?, R?, holeSize?, angle?, nSides?, chirality?)` | PathCmd | Impossible polygon |
| `concatenatePaths(list)` | PathCmd | Join multiple path data into one path |

---

### Computation Functions — 2D Transforms

| Function | Returns | Description |
|---|---|---|
| `rotate(theta, x?, y?)` | 3×3 matrix | 2D CCW rotation (affine) |
| `scale(sx, sy)` | 3×3 matrix | 2D scale (affine) |
| `translate(x, y?)` | 3×3 matrix | 2D translation |
| `skew(ax, ay?)` | 3×3 matrix | 2D skew (affine) |
| `rotate2d(theta)` | 2×2 matrix | 2D rotation (linear) |
| `scale2d(sx, sy)` | 2×2 matrix | 2D scale (linear) |
| `mul(m, v)` | ℝⁿ | Matrix × vector |

---

### Computation Functions — 3D / Camera

| Function | Returns | Description |
|---|---|---|
| `rotate3d(theta, v)` | 3×3 | 3D rotation around axis v by theta |
| `scale3d(sx, sy, sz)` | 3×3 | 3D scale |
| `translate3dh(x, y, z)` | 4×4 | 3D translation (homogeneous) |
| `lookAt(eye, center, up)` | 4×4 | View matrix |
| `perspective(fovy, aspect, zNear?, zFar?)` | 4×4 | Perspective projection |
| `ortho(l, r, b, t, zNear?, zFar?)` | 4×4 | Orthographic projection |
| `project(p, model, proj, view)` | ℝ² | 3D point → 2D window |
| `toHomogeneous(p)` / `fromHomogeneous(q)` | ℝⁿ⁺¹ / ℝⁿ | Coordinate conversion |

---

### Random Sampling (values fixed per variation seed)

```style
scalar x = random(0, 100)          -- uniform [0, 100)
scalar u = unitRandom()             -- uniform [0, 1)
scalar n = normalRandom()           -- normal(0, 1)
vec2  p = diskRandom()              -- uniform on unit disk
vec3  s = sphereRandom()            -- uniform on unit sphere
vec2  t = triangleRandom(a, b, c)   -- uniform inside triangle abc
```

> Random values are **constants** — they depend only on the variation seed. You cannot optimize them directly, but you can base optimizable expressions on them:
> ```style
> scalar L = random(1, 2)  -- fixed random length
> scalar θ = ?             -- optimizable angle
> vec2 v = L * (cos(θ), sin(θ))
> ```

---

## 16. Design Principles & Mental Model

From the official Penrose tutorial: <https://penrose.cs.cmu.edu/docs/tutorial/welcome>

### The Three Files and What Goes In Each

| File | Contains | Changes per diagram? |
|---|---|---|
| `.domain` | Types, predicates, functions, constructors | Rarely — one domain, many diagrams |
| `.substance` | Specific instances and relationships | Yes — one per diagram |
| `.style` | Visual representation rules | Sometimes — one per visual style |

### Core Design Philosophy

- **Substance is abstract. No numbers.** The visual meaning of everything — sizes, colors, positions — goes in the style file. Substance files should contain no coordinates, no colors, no specific values of any kind.
- **Define your world in domain.** Penrose has no built-in notion of "vector" or "graph" or "set". You define all types and relationships from scratch.
- **Styles are like CSS for math.** The `forall` block is a selector matching every substance instance of a type. Styles cascade: a later `forall` block can override fields set by an earlier one using `override`.
- **Penrose decides; you constrain.** Fields marked `?` are decided by the optimizer. You guide the optimizer with `ensure` (hard) and `encourage` (soft) constraints. The fewer hard constraints, the more variation is possible with resampling.

### When to Use `ensure` vs `encourage`

| | `ensure` | `encourage` |
|---|---|---|
| Semantics | Hard requirement — must be satisfied | Soft goal — try to achieve |
| Violated? | Optimizer penalizes heavily | Optimizer penalizes proportionally |
| Use when | Structural rules (containment, disjointness, ordering) | Aesthetic preferences (centering, spacing, proximity) |
| Example | `ensure contains(A.circle, B.circle)` | `encourage norm(label.center - circle.center) == 0` |

### Common Style Patterns

**Containment with labels:**
```style
forall Set x {
  x.circle = Circle { }
  x.label  = Equation { string : x.label }
  ensure contains(x.circle, x.label)
  encourage norm(x.label.center - x.circle.center) == 0
  layer x.label above x.circle
}
```

**Edge between two nodes:**
```style
forall Node u; Node v
where Edge(u, v) {
  edge.line = Line {
    start : u.dot.center
    end   : v.dot.center
    endArrowhead : "straight"
  }
  layer edge.line below u.dot
  layer edge.line below v.dot
}
```

**IPC-style repulsion between vertices:**
```style
forall Node u; Node v {
  d    = vdist(u.dot.center, v.dot.center)
  dHat = 150
  -- Equation 6 from IPC (Incremental Potential Contact)
  encourage minimal(max(0, -sqr(d - dHat) * log(d / dHat)))
}
```

**Grid layout using `match_id`:**
```style
forall NGon P {
  scalar n = match_id - 1
  scalar col = mod(n, 4) - 1.5
  scalar row = floor(n / 4) - 1
  vec2 P.center = (400 * col, 350 * row)
}
```

**Collect shapes into a group:**
```style
collect Element e into es
where In(e, s)
foreach Set s {
  list shapes = listof icon from es
  s.group = Group { shapes : shapes }
}
```

**Multiple stacked style files:**  
A `.trio.json` can list multiple style files; they are composed in order:
```json
{
  "substance": "foo.substance",
  "style": ["base.style", "theme-dark.style"],
  "domain": "foo.domain"
}
```

**Passthrough SVG attributes:**
```style
x.circle = Circle {
  colorInterpolation : "linearRGB"  -- CSS: color-interpolation
  filter : "url(#blur)"             -- raw SVG filter
}
```

---

## 17. Constraints & Objectives — Technical Background

### Why Penrose Uses Optimization

Penrose encodes diagramming as an **energy minimization problem**:

- Every `ensure` constraint contributes a penalty energy term: $E_\text{constraint} = \max(0, f(x))$ — zero when satisfied, positive when violated.
- Every `encourage` objective contributes a "badness" term: the optimizer minimizes it toward a local minimum.
- Total energy $\Phi = \sum_i E_i$. Penrose uses automatic differentiation (autodiff) with gradient descent to find a local minimum.

### Writing Custom Constraints (TypeScript)

Custom constraints are energy functions written in TypeScript using Penrose's autodiff library:

```typescript
import { ops } from "@penrose/core";
import type { Circle, Num } from "@penrose/core";

// Constraint: two circles don't overlap (d >= r1 + r2)
// Returns <= 0 when satisfied, > 0 when violated
const disjointCircles = (s1: Circle<Num>, s2: Circle<Num>, padding: Num = 0) => {
  const d = ops.vdist(s1.center.contents, s2.center.contents);
  const minDist = add(add(s1.r.contents, s2.r.contents), padding);
  return sub(minDist, d);  // positive = circles overlap
};

// Objective: repel two circles
// Returns 1/(d² + ε) * weight — minimized when circles are far apart
const repelCircles = (s1: Circle<Num>, s2: Circle<Num>, weight: Num = 1e6) => {
  const eps = 1e-6;
  const dsq = ops.vdistsq(s1.center.contents, s2.center.contents);
  return mul(inverse(add(dsq, eps)), weight);
};
```

**Autodiff rules:**
- Use `add(a, b)`, `sub(a, b)`, `mul(a, b)`, `inverse(v)` instead of native operators.
- All values must be `Num` type (native `number` is auto-promoted).
- Access shape fields via `.contents`: `circle.r.contents`, `circle.center.contents`.
- Use `ops.vdist`, `ops.vdistsq`, `ops.vadd`, `ops.vsub`, `ops.vmul`, etc. for vector operations.
- Constraints return ≤ 0 when satisfied. Objectives return a "badness" value.

See the [Optimization API](https://penrose.cs.cmu.edu/docs/ref/optimization-api) for using Penrose's optimizer directly from JavaScript.
