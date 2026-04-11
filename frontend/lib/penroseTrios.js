/**
 * penroseTrios.js
 *
 * Pre-authored Penrose domain / style / substance programs for the
 * diagram-dashboard test page.
 *
 * Each exported TRIO_* object has: { domain, style, substance, variation }
 *
 * Domains reused across multiple trios:
 *   SET_DOMAIN   — type Set + Disjoint / Intersecting / Subset predicates
 *   UNDIRECTED_GRAPH_DOMAIN — type Node, UEdge constructor
 *   DIRECTED_GRAPH_DOMAIN   — type Node, DEdge constructor
 */

// ─── Set Theory (Venn / Euler diagrams) ────────────────────────────────────

const SET_DOMAIN = `
type Set

predicate Disjoint(Set s1, Set s2)
predicate Intersecting(Set s1, Set s2)
predicate Subset(Set s1, Set s2)
`;

const EULER_STYLE = `
canvas {
  width = 500
  height = 400
}

forall Set x {
  shape x.icon = Circle {
    fillColor : rgba(100, 150, 230, 0.25)
    strokeColor : rgba(40, 90, 200, 0.8)
    strokeWidth : 2.5
  }
  shape x.lbl = Text {
    string : x.label
    fontSize : "24px"
    fillColor : rgba(15, 20, 100, 1.0)
    fontStyle : "italic"
  }
  ensure contains(x.icon, x.lbl)
  encourage norm(x.lbl.center - x.icon.center) == 0
  layer x.lbl above x.icon
}

forall Set x; Set y
where Disjoint(x, y) {
  ensure disjoint(x.icon, y.icon, 20)
}

forall Set x; Set y
where Intersecting(x, y) {
  ensure overlapping(x.icon, y.icon, 20)
  ensure disjoint(x.lbl, y.icon)
  ensure disjoint(y.lbl, x.icon)
}

forall Set x; Set y
where Subset(x, y) {
  ensure disjoint(y.lbl, x.icon, 5)
  ensure contains(y.icon, x.icon, 5)
  layer x.icon above y.icon
}
`;

// ─── Undirected Graph ────────────────────────────────────────────────────────

const UNDIRECTED_GRAPH_DOMAIN = `
type Node
type UEdge
constructor MkUEdge(Node u, Node v) -> UEdge
`;

const UNDIRECTED_GRAPH_STYLE = `
canvas {
  width = 500
  height = 420
}

forall Node v {
  shape v.icon = Circle {
    r : 26
    fillColor : rgba(59, 130, 246, 0.9)
    strokeColor : rgba(29, 78, 216, 1.0)
    strokeWidth : 2
  }
  shape v.lbl = Text {
    string : v.label
    fontSize : "17px"
    fillColor : rgba(255, 255, 255, 1.0)
    fontWeight : "bold"
  }
  ensure contains(v.icon, v.lbl)
  encourage norm(v.lbl.center - v.icon.center) == 0
  layer v.lbl above v.icon
}

forall UEdge e; Node u; Node v
where e := MkUEdge(u, v) {
  shape e.seg = Line {
    start : u.icon.center
    end : v.icon.center
    strokeColor : rgba(100, 116, 139, 0.65)
    strokeWidth : 2.5
  }
  layer e.seg below u.icon
  layer e.seg below v.icon
}

forall Node u; Node v {
  ensure disjoint(u.icon, v.icon, 50)
}
`;

// ─── Directed Graph ──────────────────────────────────────────────────────────

const DIRECTED_GRAPH_DOMAIN = `
type Node
type DEdge
constructor MkDEdge(Node from, Node to) -> DEdge
`;

const DIRECTED_GRAPH_STYLE = `
canvas {
  width = 520
  height = 440
}

forall Node v {
  shape v.icon = Circle {
    r : 30
    fillColor : rgba(16, 185, 129, 0.85)
    strokeColor : rgba(5, 150, 105, 1.0)
    strokeWidth : 2
  }
  shape v.lbl = Text {
    string : v.label
    fontSize : "13px"
    fillColor : rgba(255, 255, 255, 1.0)
    fontWeight : "bold"
  }
  ensure contains(v.icon, v.lbl)
  encourage norm(v.lbl.center - v.icon.center) == 0
  layer v.lbl above v.icon
}

forall DEdge e; Node u; Node v
where e := MkDEdge(u, v) {
  shape e.arr = Line {
    start : u.icon.center + (u.icon.r + 1) * normalize(v.icon.center - u.icon.center)
    end : v.icon.center - (v.icon.r + 1) * normalize(v.icon.center - u.icon.center)
    strokeColor : rgba(51, 65, 85, 0.85)
    strokeWidth : 2.5
    endArrowhead : "straight"
    arrowheadSize : 1.4
  }
  encourage above(u.icon, v.icon, 80)
}

forall Node u; Node v {
  ensure disjoint(u.icon, v.icon, 55)
}
`;

// ─── Trio definitions ────────────────────────────────────────────────────────

// 1. Venn — 2 intersecting sets (A ∩ B ≠ ∅)
export const TRIO_VENN_2_INTERSECT = {
  domain: SET_DOMAIN,
  style: EULER_STYLE,
  substance: `
Set A, B
Intersecting(A, B)
AutoLabel All
`,
  variation: "venn2i",
};

// 2. Venn — 2 disjoint sets
export const TRIO_VENN_2_DISJOINT = {
  domain: SET_DOMAIN,
  style: EULER_STYLE,
  substance: `
Set A, B
Disjoint(A, B)
AutoLabel All
`,
  variation: "venn2d",
};

// 3. Venn — 3 pairwise intersecting (classic 3-circle Venn)
export const TRIO_VENN_3_ALL = {
  domain: SET_DOMAIN,
  style: EULER_STYLE,
  substance: `
Set A, B, C
Intersecting(A, B)
Intersecting(B, C)
Intersecting(A, C)
AutoLabel All
`,
  variation: "venn3a",
};

// 4. Euler — B ⊂ A, C ⊂ A, B∩C = ∅ (subset + disjoint within parent)
export const TRIO_EULER_SUBSET = {
  domain: SET_DOMAIN,
  style: EULER_STYLE,
  substance: `
Set U, A, B
Subset(A, U)
Subset(B, U)
Disjoint(A, B)
AutoLabel All
`,
  variation: "euler_sub",
};

// 5. Euler — nested subsets C ⊂ B ⊂ A
export const TRIO_EULER_NESTED = {
  domain: SET_DOMAIN,
  style: EULER_STYLE,
  substance: `
Set A, B, C
Subset(B, A)
Subset(C, B)
AutoLabel All
`,
  variation: "euler_nest",
};

// 6. Venn — logic operators: highlight A AND B (for Discrete Math)
export const TRIO_VENN_LOGIC = {
  domain: SET_DOMAIN,
  style: EULER_STYLE,
  substance: `
Set P, Q
Intersecting(P, Q)
AutoLabel All
`,
  variation: "logic_pq",
};

// 7. Graph theory — pentagon with chord (undirected)
export const TRIO_GRAPH_PENTAGON = {
  domain: UNDIRECTED_GRAPH_DOMAIN,
  style: UNDIRECTED_GRAPH_STYLE,
  substance: `
Node A, B, C, D, E
UEdge e1 := MkUEdge(A, B)
UEdge e2 := MkUEdge(B, C)
UEdge e3 := MkUEdge(C, D)
UEdge e4 := MkUEdge(D, E)
UEdge e5 := MkUEdge(E, A)
UEdge e6 := MkUEdge(A, C)
AutoLabel All
`,
  variation: "pentagon",
};

// 8. Graph theory — binary tree (undirected, 7 nodes)
export const TRIO_GRAPH_TREE = {
  domain: UNDIRECTED_GRAPH_DOMAIN,
  style: UNDIRECTED_GRAPH_STYLE,
  substance: `
Node Root, L, R, LL, LR, RL, RR
UEdge e1 := MkUEdge(Root, L)
UEdge e2 := MkUEdge(Root, R)
UEdge e3 := MkUEdge(L, LL)
UEdge e4 := MkUEdge(L, LR)
UEdge e5 := MkUEdge(R, RL)
UEdge e6 := MkUEdge(R, RR)
AutoLabel All
`,
  variation: "tree7",
};

// 9. Directed graph — simple DAG (6 nodes)
export const TRIO_DIGRAPH_DAG = {
  domain: DIRECTED_GRAPH_DOMAIN,
  style: DIRECTED_GRAPH_STYLE,
  substance: `
Node A, B, C, D, E, F
DEdge e1 := MkDEdge(A, B)
DEdge e2 := MkDEdge(A, C)
DEdge e3 := MkDEdge(B, D)
DEdge e4 := MkDEdge(C, D)
DEdge e5 := MkDEdge(D, E)
DEdge e6 := MkDEdge(D, F)
AutoLabel All
`,
  variation: "dag6",
};

// 10. Food web (directed: Sun → Grass → Rabbit → Fox → Eagle)
export const TRIO_FOOD_WEB = {
  domain: DIRECTED_GRAPH_DOMAIN,
  style: DIRECTED_GRAPH_STYLE,
  substance: `
Node Sun, Grass, Rabbit, Fox, Eagle
DEdge e1 := MkDEdge(Sun, Grass)
DEdge e2 := MkDEdge(Grass, Rabbit)
DEdge e3 := MkDEdge(Rabbit, Fox)
DEdge e4 := MkDEdge(Rabbit, Eagle)
DEdge e5 := MkDEdge(Fox, Eagle)
AutoLabel All
`,
  variation: "foodweb",
};

// 11. Probability tree — 2 coin flips (directed, 7 nodes)
export const TRIO_PROB_TREE = {
  domain: DIRECTED_GRAPH_DOMAIN,
  style: DIRECTED_GRAPH_STYLE,
  substance: `
Node Flip, H, T, HH, HT, TH, TT
DEdge e1 := MkDEdge(Flip, H)
DEdge e2 := MkDEdge(Flip, T)
DEdge e3 := MkDEdge(H, HH)
DEdge e4 := MkDEdge(H, HT)
DEdge e5 := MkDEdge(T, TH)
DEdge e6 := MkDEdge(T, TT)
AutoLabel All
`,
  variation: "probtree",
};

// 12. Spanning tree — Kruskal result on 6-node graph
export const TRIO_SPANNING_TREE = {
  domain: UNDIRECTED_GRAPH_DOMAIN,
  style: UNDIRECTED_GRAPH_STYLE,
  substance: `
Node A, B, C, D, E, F
UEdge e1 := MkUEdge(A, B)
UEdge e2 := MkUEdge(A, C)
UEdge e3 := MkUEdge(B, D)
UEdge e4 := MkUEdge(C, E)
UEdge e5 := MkUEdge(D, F)
AutoLabel All
`,
  variation: "span6",
};

// ─── More Graph Theory ───────────────────────────────────────────────────────

// 13. Complete graph K4 (every pair connected)
export const TRIO_COMPLETE_K4 = {
  domain: UNDIRECTED_GRAPH_DOMAIN,
  style: UNDIRECTED_GRAPH_STYLE,
  substance: `
Node A, B, C, D
UEdge e1 := MkUEdge(A, B)
UEdge e2 := MkUEdge(A, C)
UEdge e3 := MkUEdge(A, D)
UEdge e4 := MkUEdge(B, C)
UEdge e5 := MkUEdge(B, D)
UEdge e6 := MkUEdge(C, D)
AutoLabel All
`,
  variation: "k4",
};

// 14. Bipartite K_{2,3}
export const TRIO_BIPARTITE = {
  domain: UNDIRECTED_GRAPH_DOMAIN,
  style: UNDIRECTED_GRAPH_STYLE,
  substance: `
Node A, B, X, Y, Z
UEdge e1 := MkUEdge(A, X)
UEdge e2 := MkUEdge(A, Y)
UEdge e3 := MkUEdge(A, Z)
UEdge e4 := MkUEdge(B, X)
UEdge e5 := MkUEdge(B, Y)
UEdge e6 := MkUEdge(B, Z)
AutoLabel All
`,
  variation: "bipartite",
};

// 15. Cycle C6
export const TRIO_CYCLE_C6 = {
  domain: UNDIRECTED_GRAPH_DOMAIN,
  style: UNDIRECTED_GRAPH_STYLE,
  substance: `
Node A, B, C, D, E, F
UEdge e1 := MkUEdge(A, B)
UEdge e2 := MkUEdge(B, C)
UEdge e3 := MkUEdge(C, D)
UEdge e4 := MkUEdge(D, E)
UEdge e5 := MkUEdge(E, F)
UEdge e6 := MkUEdge(F, A)
AutoLabel All
`,
  variation: "cycle6",
};

// 16. Expression tree (binary AST: (a+b) * (c-d))
export const TRIO_EXPR_TREE = {
  domain: DIRECTED_GRAPH_DOMAIN,
  style: DIRECTED_GRAPH_STYLE,
  substance: `
Node Mul, Add, Sub, a, b, c, d
DEdge e1 := MkDEdge(Mul, Add)
DEdge e2 := MkDEdge(Mul, Sub)
DEdge e3 := MkDEdge(Add, a)
DEdge e4 := MkDEdge(Add, b)
DEdge e5 := MkDEdge(Sub, c)
DEdge e6 := MkDEdge(Sub, d)
AutoLabel All
`,
  variation: "exprtree",
};

// ─── Geometry Domain (triangles, polygons, circles) ─────────────────────────

const GEOMETRY_DOMAIN = `
type Point
type Segment
predicate RightAngle(Point p, Point vertex, Point q)
predicate AngleArc(Point p, Point vertex, Point q)
predicate Tick(Segment s)
predicate DoubleTick(Segment s)
predicate Separate(Point p, Point q)
predicate MidpointOf(Point m, Point a, Point b)
predicate PolyAngle(Point p, Point v, Point q)
predicate IsAbove(Point top, Point bottom)
predicate IsLeftOf(Point left, Point right)
predicate IsWellLeftOf(Point left, Point right)
predicate IsCentered(Point p)
predicate Hidden(Point p)
predicate SameRow(Point a, Point b)
predicate IsCenter(Point p)
predicate OnCircle(Point p, Point center)
constructor MkSeg(Point a, Point b) -> Segment
`;

const GEOMETRY_STYLE = `
canvas {
  width = 480
  height = 420
}

forall Point p {
  shape p.dot = Circle {
    r : 5
    fillColor : rgba(20, 30, 80, 1.0)
    strokeColor : rgba(20, 30, 80, 1.0)
    strokeWidth : 0
  }
  shape p.lbl = Text {
    string : p.label
    fontSize : "20px"
    fontWeight : "bold"
    fillColor : rgba(20, 30, 80, 1.0)
    center : p.dot.center + 36 * normalize(p.dot.center + (0.001, 0.001))
  }
  layer p.lbl above p.dot
  encourage lessThan(norm(p.dot.center), 190)
}

forall Point p
where Hidden(p) {
  override p.dot.r = 0
  override p.lbl.fontSize = "18px"
  override p.lbl.fontWeight = "600"
}

forall Segment s; Point a; Point b
where s := MkSeg(a, b) {
  shape s.seg = Line {
    start : a.dot.center
    end : b.dot.center
    strokeColor : rgba(30, 30, 30, 1.0)
    strokeWidth : 2.5
  }
  encourage norm(a.dot.center - b.dot.center) == 120
  layer s.seg below a.dot
  layer s.seg below b.dot
}

forall Segment s
where Tick(s) {
  shape s.tick = Line {
    start : (s.seg.start + s.seg.end) / 2 + 8 * rot90(normalize(s.seg.end - s.seg.start))
    end : (s.seg.start + s.seg.end) / 2 - 8 * rot90(normalize(s.seg.end - s.seg.start))
    strokeColor : rgba(200, 50, 50, 1.0)
    strokeWidth : 2.5
  }
}

forall Segment s
where DoubleTick(s) {
  shape s.tick2a = Line {
    start : (s.seg.start + s.seg.end) / 2 + 8 * rot90(normalize(s.seg.end - s.seg.start)) + 4 * normalize(s.seg.end - s.seg.start)
    end : (s.seg.start + s.seg.end) / 2 - 8 * rot90(normalize(s.seg.end - s.seg.start)) + 4 * normalize(s.seg.end - s.seg.start)
    strokeColor : rgba(50, 120, 200, 1.0)
    strokeWidth : 2.5
  }
  shape s.tick2b = Line {
    start : (s.seg.start + s.seg.end) / 2 + 8 * rot90(normalize(s.seg.end - s.seg.start)) - 4 * normalize(s.seg.end - s.seg.start)
    end : (s.seg.start + s.seg.end) / 2 - 8 * rot90(normalize(s.seg.end - s.seg.start)) - 4 * normalize(s.seg.end - s.seg.start)
    strokeColor : rgba(50, 120, 200, 1.0)
    strokeWidth : 2.5
  }
}

forall Point p; Point vertex; Point q
where RightAngle(p, vertex, q) {
  ensure equal(dot(p.dot.center - vertex.dot.center, q.dot.center - vertex.dot.center), 0)
  shape vertex.ra1 = Line {
    start : vertex.dot.center + 14 * normalize(p.dot.center - vertex.dot.center)
    end : vertex.dot.center + 14 * normalize(p.dot.center - vertex.dot.center) + 14 * normalize(q.dot.center - vertex.dot.center)
    strokeColor : rgba(40, 40, 40, 1.0)
    strokeWidth : 2
  }
  shape vertex.ra2 = Line {
    start : vertex.dot.center + 14 * normalize(q.dot.center - vertex.dot.center)
    end : vertex.dot.center + 14 * normalize(p.dot.center - vertex.dot.center) + 14 * normalize(q.dot.center - vertex.dot.center)
    strokeColor : rgba(40, 40, 40, 1.0)
    strokeWidth : 2
  }
}

forall Point p; Point vertex; Point q
where AngleArc(p, vertex, q) {
  shape vertex.arcPath = Path {
    d : circularArc("open", vertex.dot.center, 30, angleOf(p.dot.center - vertex.dot.center), angleOf(q.dot.center - vertex.dot.center))
    strokeColor : rgba(180, 80, 0, 1.0)
    strokeWidth : 2.5
    fillColor : none()
  }
}

forall Point p; Point q {
  ensure disjoint(p.dot, q.dot, 18)
}

forall Point p; Point q
where Separate(p, q) {
  encourage norm(p.dot.center - q.dot.center) == 290
}

forall Point m; Point a; Point b
where MidpointOf(m, a, b) {
  ensure norm(m.dot.center - (a.dot.center + b.dot.center) / 2) == 0
  override m.lbl.center = m.dot.center + 22 * normalize(rot90(b.dot.center - a.dot.center))
}

forall Point p; Point v; Point q
where PolyAngle(p, v, q) {
  ensure disjoint(p.dot, q.dot, 100)
}

forall Point a; Point b; Point c; Point d
where PolyAngle(d, a, b); PolyAngle(a, b, c); PolyAngle(b, c, d); PolyAngle(c, d, a) {
  ensure isConvex((a.dot.center, b.dot.center, c.dot.center, d.dot.center), true)
  encourage isEquilateral((a.dot.center, b.dot.center, c.dot.center, d.dot.center), true)
}

forall Point a; Point b; Point c; Point d; Point e
where PolyAngle(e, a, b); PolyAngle(a, b, c); PolyAngle(b, c, d); PolyAngle(c, d, e); PolyAngle(d, e, a) {
  ensure isConvex((a.dot.center, b.dot.center, c.dot.center, d.dot.center, e.dot.center), true)
  encourage isEquilateral((a.dot.center, b.dot.center, c.dot.center, d.dot.center, e.dot.center), true)
}

forall Point a; Point b; Point c; Point d; Point e; Point f
where PolyAngle(f, a, b); PolyAngle(a, b, c); PolyAngle(b, c, d); PolyAngle(c, d, e); PolyAngle(d, e, f); PolyAngle(e, f, a) {
  ensure isConvex((a.dot.center, b.dot.center, c.dot.center, d.dot.center, e.dot.center, f.dot.center), true)
  encourage isEquilateral((a.dot.center, b.dot.center, c.dot.center, d.dot.center, e.dot.center, f.dot.center), true)
}

forall Point top; Point bottom
where IsAbove(top, bottom) {
  ensure lessThan(bottom.dot.center[1] + 50, top.dot.center[1])
}

forall Point lft; Point rgt
where IsLeftOf(lft, rgt) {
  ensure lessThan(lft.dot.center[0] + 40, rgt.dot.center[0])
}

forall Point lft; Point rgt
where IsWellLeftOf(lft, rgt) {
  ensure lessThan(lft.dot.center[0] + 120, rgt.dot.center[0])
}

forall Point p
where IsCentered(p) {
  encourage norm(p.dot.center) == 0
}

forall Point a; Point b
where SameRow(a, b) {
  ensure equal(a.dot.center[1], b.dot.center[1])
}

forall Point p
where IsCenter(p) {
  shape p.ring = Circle {
    center : p.dot.center
    r : 130
    fillColor : rgba(180, 220, 255, 0.12)
    strokeColor : rgba(60, 100, 200, 0.85)
    strokeWidth : 2.5
  }
  layer p.ring below p.dot
}

forall Point p; Point center
where OnCircle(p, center) {
  ensure norm(p.dot.center - center.dot.center) == 130
}
`;

// 17. Basic labeled triangle ABC
export const TRIO_TRIANGLE_LABELED = {
  domain: GEOMETRY_DOMAIN,
  style: GEOMETRY_STYLE,
  substance: `
Point A, B, C
Segment ab := MkSeg(A, B)
Segment bc := MkSeg(B, C)
Segment ca := MkSeg(C, A)
IsAbove(C, A)
IsAbove(C, B)
IsLeftOf(A, B)
IsCentered(A)
IsCentered(B)
IsCentered(C)
AutoLabel All
`,
  variation: "tri_abc",
};

// 18. Right triangle — perpendicularity enforced at B
export const TRIO_RIGHT_TRIANGLE = {
  domain: GEOMETRY_DOMAIN,
  style: GEOMETRY_STYLE,
  substance: `
Point A, B, C
Segment ab := MkSeg(A, B)
Segment bc := MkSeg(B, C)
Segment ca := MkSeg(C, A)
RightAngle(A, B, C)
IsAbove(C, A)
IsAbove(C, B)
IsLeftOf(A, B)
IsCentered(A)
IsCentered(B)
IsCentered(C)
AutoLabel All
`,
  variation: "right_tri",
};

// 19. Congruent triangles: △ABC ≅ △DEF (tick marks show equal sides)
export const TRIO_CONGRUENT_TRIANGLES = {
  domain: GEOMETRY_DOMAIN,
  style: GEOMETRY_STYLE,
  substance: `
Point A, B, C, D, E, F
Segment ab := MkSeg(A, B)
Segment bc := MkSeg(B, C)
Segment ca := MkSeg(C, A)
Segment de := MkSeg(D, E)
Segment ef := MkSeg(E, F)
Segment fd := MkSeg(F, D)
Tick(ab)
Tick(de)
DoubleTick(bc)
DoubleTick(ef)
Label A "A"
Label B "B"
Label C "C"
Label D "D"
Label E "E"
Label F "F"
Separate(A, D)
IsAbove(C, A)
IsAbove(C, B)
IsLeftOf(A, B)
IsAbove(F, D)
IsAbove(F, E)
IsLeftOf(D, E)
IsWellLeftOf(B, D)
`,
  variation: "cong_tri",
};

// 20. Similar triangles: △ABC ~ △DEF (different sizes, same shape)
export const TRIO_SIMILAR_TRIANGLES = {
  domain: GEOMETRY_DOMAIN,
  style: GEOMETRY_STYLE,
  substance: `
Point A, B, C, D, E, F
Segment ab := MkSeg(A, B)
Segment bc := MkSeg(B, C)
Segment ca := MkSeg(C, A)
Segment de := MkSeg(D, E)
Segment ef := MkSeg(E, F)
Segment fd := MkSeg(F, D)
Label A "A"
Label B "B"
Label C "C"
Label D "D"
Label E "E"
Label F "F"
Separate(A, D)
IsAbove(C, A)
IsAbove(C, B)
IsLeftOf(A, B)
IsAbove(F, D)
IsAbove(F, E)
IsLeftOf(D, E)
IsWellLeftOf(B, D)
`,
  variation: "sim_tri",
};

// 21. Quadrilateral ABCD (labeled 4-gon)
export const TRIO_QUADRILATERAL = {
  domain: GEOMETRY_DOMAIN,
  style: GEOMETRY_STYLE,
  substance: `
Point A, B, C, D
Segment ab := MkSeg(A, B)
Segment bc := MkSeg(B, C)
Segment cd := MkSeg(C, D)
Segment da := MkSeg(D, A)
PolyAngle(D, A, B)
PolyAngle(A, B, C)
PolyAngle(B, C, D)
PolyAngle(C, D, A)
IsAbove(D, A)
IsAbove(C, B)
IsLeftOf(A, B)
IsLeftOf(D, C)
IsCentered(A)
IsCentered(B)
IsCentered(C)
IsCentered(D)
AutoLabel All
`,
  variation: "quad_abcd",
};

// 22. Pentagon ABCDE (labeled)
export const TRIO_POLYGON_PENTAGON = {
  domain: GEOMETRY_DOMAIN,
  style: GEOMETRY_STYLE,
  substance: `
Point A, B, C, D, E
Segment ab := MkSeg(A, B)
Segment bc := MkSeg(B, C)
Segment cd := MkSeg(C, D)
Segment de := MkSeg(D, E)
Segment ea := MkSeg(E, A)
PolyAngle(E, A, B)
PolyAngle(A, B, C)
PolyAngle(B, C, D)
PolyAngle(C, D, E)
PolyAngle(D, E, A)
IsAbove(A, C)
IsAbove(A, D)
IsLeftOf(E, B)
IsCentered(A)
IsCentered(B)
IsCentered(C)
IsCentered(D)
IsCentered(E)
AutoLabel All
`,
  variation: "pent_abcde",
};

// 23. Hexagon ABCDEF
export const TRIO_POLYGON_HEXAGON = {
  domain: GEOMETRY_DOMAIN,
  style: GEOMETRY_STYLE,
  substance: `
Point A, B, C, D, E, F
Segment ab := MkSeg(A, B)
Segment bc := MkSeg(B, C)
Segment cd := MkSeg(C, D)
Segment de := MkSeg(D, E)
Segment ef := MkSeg(E, F)
Segment fa := MkSeg(F, A)
PolyAngle(F, A, B)
PolyAngle(A, B, C)
PolyAngle(B, C, D)
PolyAngle(C, D, E)
PolyAngle(D, E, F)
PolyAngle(E, F, A)
IsAbove(A, D)
IsAbove(B, E)
IsLeftOf(F, C)
IsCentered(A)
IsCentered(B)
IsCentered(C)
IsCentered(D)
IsCentered(E)
IsCentered(F)
AutoLabel All
`,
  variation: "hex_abcdef",
};

// 24. Triangle with median from A to midpoint M of BC
export const TRIO_TRIANGLE_MEDIAN = {
  domain: GEOMETRY_DOMAIN,
  style: GEOMETRY_STYLE,
  substance: `
Point A, B, C, M
Segment ab := MkSeg(A, B)
Segment ca := MkSeg(C, A)
Segment am := MkSeg(A, M)
Segment bm := MkSeg(B, M)
Segment mc := MkSeg(M, C)
Tick(bm)
Tick(mc)
MidpointOf(M, B, C)
IsAbove(A, B)
IsAbove(A, C)
IsLeftOf(B, C)
IsCentered(A)
IsCentered(B)
IsCentered(C)
IsCentered(M)
AutoLabel All
`,
  variation: "tri_median",
};

// ─── Vector Diagrams ─────────────────────────────────────────────────────────

const VECTOR_DOMAIN = `
type Point
type Vec
constructor MkVec(Point tail, Point head) -> Vec
predicate Resultant(Vec v)
`;

const VECTOR_STYLE = `
canvas {
  width = 500
  height = 440
}

forall Point p {
  shape p.dot = Circle {
    r : 5
    fillColor : rgba(40, 40, 40, 1.0)
    strokeColor : rgba(40, 40, 40, 1.0)
    strokeWidth : 0
  }
  shape p.lbl = Text {
    string : p.label
    fontSize : "15px"
    fontWeight : "bold"
    fillColor : rgba(40, 40, 40, 1.0)
    center : p.dot.center + (0, -18)
  }
  layer p.lbl above p.dot
}

forall Vec v; Point t; Point h
where v := MkVec(t, h) {
  shape v.arr = Line {
    start : t.dot.center
    end : h.dot.center
    strokeWidth : 3
    endArrowhead : "straight"
    arrowheadSize : 1.2
    strokeColor : rgba(30, 80, 200, 1.0)
  }
  shape v.lbl = Text {
    string : v.label
    fontSize : "18px"
    fontWeight : "bold"
    fillColor : rgba(30, 80, 200, 1.0)
    center : (t.dot.center + h.dot.center) / 2 + 24 * rot90(normalize(h.dot.center - t.dot.center))
  }
  layer v.arr below t.dot
  layer v.arr below h.dot
  layer v.lbl above v.arr
}

forall Vec v; Point t; Point h
where v := MkVec(t, h); Resultant(v) {
  override v.arr.strokeColor = rgba(220, 50, 30, 1.0)
  override v.arr.strokeWidth = 4
  override v.lbl.fillColor = rgba(220, 50, 30, 1.0)
}

forall Point p; Point q {
  encourage norm(p.dot.center - q.dot.center) == 150
}
`;

// ─── New Geometry Trios ──────────────────────────────────────────────────────

// 25. Isosceles triangle: AB = CA (single tick marks on equal sides)
export const TRIO_ISOSCELES_TRIANGLE = {
  domain: GEOMETRY_DOMAIN,
  style: GEOMETRY_STYLE,
  substance: `
Point A, B, C
Segment ab := MkSeg(A, B)
Segment bc := MkSeg(B, C)
Segment ca := MkSeg(C, A)
Tick(ab)
Tick(ca)
IsAbove(A, B)
IsAbove(A, C)
IsLeftOf(B, C)
IsCentered(A)
IsCentered(B)
IsCentered(C)
AutoLabel All
`,
  variation: "isosceles",
};

// 26. Triangle with angle arc at vertex B
export const TRIO_ANGLE_ARC = {
  domain: GEOMETRY_DOMAIN,
  style: GEOMETRY_STYLE,
  substance: `
Point A, B, C
Segment ab := MkSeg(A, B)
Segment bc := MkSeg(B, C)
Segment ca := MkSeg(C, A)
AngleArc(A, B, C)
IsAbove(B, A)
IsAbove(B, C)
IsLeftOf(A, C)
IsCentered(A)
IsCentered(B)
IsCentered(C)
AutoLabel All
`,
  variation: "angle_arc",
};

// 27. Right triangle with numeric side labels (3-4-5)
export const TRIO_RIGHT_TRIANGLE_345 = {
  domain: GEOMETRY_DOMAIN,
  style: GEOMETRY_STYLE,
  substance: `
Point A, B, C, U, V, W
Segment ab := MkSeg(A, B)
Segment bc := MkSeg(B, C)
Segment ca := MkSeg(C, A)
RightAngle(A, B, C)
MidpointOf(U, A, B)
MidpointOf(V, B, C)
MidpointOf(W, C, A)
Hidden(U)
Hidden(V)
Hidden(W)
IsAbove(C, A)
IsAbove(C, B)
IsLeftOf(A, B)
IsCentered(A)
IsCentered(B)
IsCentered(C)
Label A "x°"
Label B ""
Label C ""
Label U "4"
Label V "3"
Label W "5"
`,
  variation: "right_tri_345",
};

// 28. Oblique triangle for Law of Cosines practice (three known sides)
export const TRIO_LAW_OF_COSINES = {
  domain: GEOMETRY_DOMAIN,
  style: GEOMETRY_STYLE,
  substance: `
Point A, B, C, U, V, W
Segment ab := MkSeg(A, B)
Segment bc := MkSeg(B, C)
Segment ca := MkSeg(C, A)
MidpointOf(U, A, B)
MidpointOf(V, B, C)
MidpointOf(W, C, A)
Hidden(U)
Hidden(V)
Hidden(W)
IsAbove(C, A)
IsAbove(C, B)
IsLeftOf(A, B)
IsCentered(A)
IsCentered(B)
IsCentered(C)
Label A "A"
Label B "B"
Label C "C"
Label U "11"
Label V "7"
Label W "9"
`,
  variation: "law_cosines",
};

// 29. Oblique triangle for Law of Sines practice (known angles + side)
export const TRIO_LAW_OF_SINES = {
  domain: GEOMETRY_DOMAIN,
  style: GEOMETRY_STYLE,
  substance: `
Point A, B, C, U
Segment ab := MkSeg(A, B)
Segment bc := MkSeg(B, C)
Segment ca := MkSeg(C, A)
MidpointOf(U, A, B)
Hidden(U)
IsAbove(C, A)
IsAbove(C, B)
IsLeftOf(A, B)
IsCentered(A)
IsCentered(B)
IsCentered(C)
Label A "38°"
Label B "72°"
Label C "x°"
Label U "12"
`,
  variation: "law_sines",
};

// 30. Vector addition: u (O→A) + v (A→B) = r (O→B) in tip-to-tail form
export const TRIO_VECTOR_ADDITION = {
  domain: VECTOR_DOMAIN,
  style: VECTOR_STYLE,
  substance: `
Point O, A, B
Vec u := MkVec(O, A)
Vec v := MkVec(A, B)
Vec r := MkVec(O, B)
Resultant(r)
Label O "O"
Label A "A"
Label B "B"
Label u "u"
Label v "v"
Label r "u+v"
`,
  variation: "vec_add",
};

