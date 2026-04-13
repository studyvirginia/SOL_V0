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
predicate SameRow(Node a, Node b)
predicate SameColumn(Node a, Node b)
predicate IsAbove(Node a, Node b)
predicate IsLeftOf(Node a, Node b)
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
    fillColor : rgba(37, 99, 235, 0.9)
    strokeColor : rgba(30, 64, 175, 1.0)
    strokeWidth : 2.5
  }
  shape v.lbl = Text {
    string : v.label
    fontSize : "17px"
    fillColor : rgba(255, 255, 255, 1.0)
    fontWeight : "bold"
    fontFamily : "Outfit, sans-serif"
  }
  ensure contains(v.icon, v.lbl)
  ensure equal(v.lbl.center[0], v.icon.center[0])
  ensure equal(v.lbl.center[1], v.icon.center[1])
  layer v.lbl above v.icon
}

forall UEdge e; Node u; Node v
where e := MkUEdge(u, v) {
  shape e.seg = Line {
    start : u.icon.center
    end : v.icon.center
    strokeColor : rgba(71, 85, 105, 0.7)
    strokeWidth : 3
  }
  layer e.seg below u.icon
  layer e.seg below v.icon
}

forall Node u; Node v {
  ensure disjoint(u.icon, v.icon, 70)
}

forall Node a; Node b
where SameRow(a, b) {
  ensure equal(a.icon.center[1], b.icon.center[1])
}

forall Node a; Node b
where SameColumn(a, b) {
  ensure equal(a.icon.center[0], b.icon.center[0])
}

forall Node a; Node b
where IsAbove(a, b) {
  ensure lessThan(b.icon.center[1] + 80, a.icon.center[1])
}

forall Node a; Node b
where IsLeftOf(a, b) {
  ensure lessThan(a.icon.center[0] + 100, b.icon.center[0])
}
`;

// ─── Directed Graph ──────────────────────────────────────────────────────────

const DIRECTED_GRAPH_DOMAIN = `
type Node
type DEdge
predicate SameRow(Node a, Node b)
predicate SameColumn(Node a, Node b)
predicate IsAbove(Node a, Node b)
predicate IsLeftOf(Node a, Node b)
predicate IsCentered(Node a)
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
    fillColor : rgba(16, 185, 129, 0.9)
    strokeColor : rgba(6, 95, 70, 1.0)
    strokeWidth : 2.5
  }
  shape v.lbl = Text {
    string : v.label
    fontSize : "16px"
    fillColor : rgba(255, 255, 255, 1.0)
    fontWeight : "bold"
    fontFamily : "Outfit, sans-serif"
  }
  ensure contains(v.icon, v.lbl)
  ensure equal(v.lbl.center[0], v.icon.center[0])
  ensure equal(v.lbl.center[1], v.icon.center[1])
  layer v.lbl above v.icon
}

forall Node a; Node b
where IsAbove(a, b) {
  ensure lessThan(b.icon.center[1] + 60, a.icon.center[1])
}

forall Node a; Node b
where IsLeftOf(a, b) {
  ensure lessThan(a.icon.center[0] + 160, b.icon.center[0])
}

forall Node a
where IsCentered(a) {
  ensure equal(a.icon.center[0], 0)
}

forall DEdge e; Node u; Node v
where e := MkDEdge(u, v) {
  shape e.arr = Line {
    start : u.icon.center + (u.icon.r + 1) * normalize(v.icon.center - u.icon.center)
    end : v.icon.center - (v.icon.r + 1) * normalize(v.icon.center - u.icon.center)
    strokeColor : rgba(30, 41, 59, 0.85)
    strokeWidth : 3
    endArrowhead : "straight"
    arrowheadSize : 1.5
  }
  encourage above(u.icon, v.icon, 80)
}

forall Node u; Node v {
  ensure disjoint(u.icon, v.icon, 60)
}

forall Node a; Node b
where SameRow(a, b) {
  ensure equal(a.icon.center[1], b.icon.center[1])
}

forall Node a; Node b
where SameColumn(a, b) {
  ensure equal(a.icon.center[0], b.icon.center[0])
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
  style: EULER_STYLE + `
    forall Set \`A\`; Set \`B\`; Set \`C\` {
      override \`A\`.icon.center = (0, 60)
      override \`B\`.icon.center = (-65, -50)
      override \`C\`.icon.center = (65, -50)
      override \`A\`.icon.r = 90
      override \`B\`.icon.r = 90
      override \`C\`.icon.r = 90
    }
  `,
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
  style: EULER_STYLE + `
    forall Set \`U\`; Set \`A\`; Set \`B\` {
      override \`U\`.icon.center = (0, 0)
      override \`A\`.icon.center = (-65, 0)
      override \`B\`.icon.center = (65, 0)
      override \`U\`.icon.r = 150
      override \`A\`.icon.r = 50
      override \`B\`.icon.r = 50
    }
  `,
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
  style: EULER_STYLE + `
    forall Set \`A\`; Set \`B\`; Set \`C\` {
      override \`A\`.icon.center = (0, 0)
      override \`B\`.icon.center = (20, -20)
      override \`C\`.icon.center = (40, -40)
      override \`A\`.icon.r = 150
      override \`B\`.icon.r = 90
      override \`C\`.icon.r = 40
    }
  `,
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
  style: EULER_STYLE + `
    forall Set \`P\`; Set \`Q\` {
      override \`P\`.icon.center = (-65, 0)
      override \`Q\`.icon.center = (65, 0)
      override \`P\`.icon.r = 100
      override \`Q\`.icon.r = 100
    }
  `,
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
  style: UNDIRECTED_GRAPH_STYLE + `
    forall Node \`A\`; Node \`B\`; Node \`C\`; Node \`D\`; Node \`E\` {
      override \`A\`.icon.center = (0, 120)
      override \`B\`.icon.center = (-114, 37)
      override \`C\`.icon.center = (-71, -97)
      override \`D\`.icon.center = (71, -97)
      override \`E\`.icon.center = (114, 37)
    }
  `,
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
  style: UNDIRECTED_GRAPH_STYLE + `
    forall Node \`Root\`; Node \`L\`; Node \`R\`; Node \`LL\`; Node \`LR\`; Node \`RL\`; Node \`RR\` {
      override \`Root\`.icon.center = (0, 130)
      override \`L\`.icon.center = (-100, 30)
      override \`R\`.icon.center = (100, 30)
      override \`LL\`.icon.center = (-150, -70)
      override \`LR\`.icon.center = (-50, -70)
      override \`RL\`.icon.center = (50, -70)
      override \`RR\`.icon.center = (150, -70)
    }
  `,
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
  style: DIRECTED_GRAPH_STYLE + `
    forall Node \`A\`; Node \`B\`; Node \`C\`; Node \`D\`; Node \`E\`; Node \`F\` {
      override \`A\`.icon.center = (0, 130)
      override \`B\`.icon.center = (-80, 40)
      override \`C\`.icon.center = (80, 40)
      override \`D\`.icon.center = (0, -50)
      override \`E\`.icon.center = (-80, -140)
      override \`F\`.icon.center = (80, -140)
    }
  `,
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
IsAbove(Sun, Grass)
IsAbove(Grass, Rabbit)
IsAbove(Rabbit, Fox)
IsAbove(Rabbit, Eagle)
IsAbove(Fox, Eagle)
AutoLabel All
`,
  variation: "foodweb",
};

// 11. Probability tree — 2 coin flips (directed, 7 nodes)
export const TRIO_PROB_TREE = {
  domain: DIRECTED_GRAPH_DOMAIN,
  style: DIRECTED_GRAPH_STYLE + `
    forall Node \`Flip\`; Node \`H\`; Node \`T\`; Node \`HH\`; Node \`HT\`; Node \`TH\`; Node \`TT\` {
      override \`Flip\`.icon.center = (0, 150)
      override \`H\`.icon.center = (-120, 30)
      override \`T\`.icon.center = (120, 30)
      override \`HH\`.icon.center = (-180, -70)
      override \`HT\`.icon.center = (-60, -70)
      override \`TH\`.icon.center = (60, -70)
      override \`TT\`.icon.center = (180, -70)
    }
  `,
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
  style: UNDIRECTED_GRAPH_STYLE + `
    forall Node \`A\`; Node \`B\`; Node \`C\`; Node \`D\`; Node \`E\`; Node \`F\` {
      override \`A\`.icon.center = (0, 130)
      override \`B\`.icon.center = (-80, 50)
      override \`C\`.icon.center = (80, 50)
      override \`D\`.icon.center = (-80, -30)
      override \`E\`.icon.center = (80, -30)
      override \`F\`.icon.center = (-80, -110)
    }
  `,
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
  style: UNDIRECTED_GRAPH_STYLE + `
    forall Node \`A\`; Node \`B\`; Node \`C\`; Node \`D\` {
      override \`A\`.icon.center = (-70, 70)
      override \`B\`.icon.center = (70, 70)
      override \`C\`.icon.center = (-70, -70)
      override \`D\`.icon.center = (70, -70)
    }
  `,
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
  style: UNDIRECTED_GRAPH_STYLE + `
    forall Node \`A\`; Node \`B\`; Node \`X\`; Node \`Y\`; Node \`Z\` {
      override \`A\`.icon.center = (-100, 100)
      override \`B\`.icon.center = (-100, -100)
      override \`X\`.icon.center = (100, 100)
      override \`Y\`.icon.center = (100, 0)
      override \`Z\`.icon.center = (100, -100)
    }
  `,
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
  style: UNDIRECTED_GRAPH_STYLE + `
    forall Node \`A\`; Node \`B\`; Node \`C\`; Node \`D\`; Node \`E\`; Node \`F\` {
      override \`A\`.icon.center = (0, 110)
      override \`B\`.icon.center = (95, 55)
      override \`C\`.icon.center = (95, -55)
      override \`D\`.icon.center = (0, -110)
      override \`E\`.icon.center = (-95, -55)
      override \`F\`.icon.center = (-95, 55)
    }
  `,
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
  style: DIRECTED_GRAPH_STYLE + `
    forall Node \`Mul\`; Node \`Add\`; Node \`Sub\`; Node \`a\`; Node \`b\`; Node \`c\`; Node \`d\` {
      override \`Mul\`.icon.center = (0, 130)
      override \`Add\`.icon.center = (-100, 30)
      override \`Sub\`.icon.center = (100, 30)
      override \`a\`.icon.center = (-150, -70)
      override \`b\`.icon.center = (-50, -70)
      override \`c\`.icon.center = (50, -70)
      override \`d\`.icon.center = (150, -70)
    }
  `,
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
predicate SameColumn(Point a, Point b)
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
  override p.lbl.fontWeight = "bold"
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
  shape v.arcPath = Path {
    d : circularArc("open", v.dot.center, 28, angleOf(p.dot.center - v.dot.center), angleOf(q.dot.center - v.dot.center))
    strokeColor : rgba(180, 80, 0, 0.9)
    strokeWidth : 2
    fillColor : none()
  }
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

forall Point a; Point b
where SameColumn(a, b) {
  ensure equal(a.dot.center[0], b.dot.center[0])
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

const NUMBER_LINE_STYLE = `
${GEOMETRY_STYLE}

forall Point p {
  override p.lbl.center = p.dot.center + (0, -28)
  override p.lbl.fontSize = "18px"
  override p.lbl.fontWeight = "bold"
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
  style: GEOMETRY_STYLE + `
    forall Point \`A\`; Point \`B\`; Point \`C\`; Point \`D\` {
      override \`A\`.dot.center = (-90, 80)
      override \`B\`.dot.center = (110, 60)
      override \`C\`.dot.center = (120, -90)
      override \`D\`.dot.center = (-100, -110)
    }
  `,
  substance: `
Point A, B, C, D
Segment ab := MkSeg(A, B)
Segment bc := MkSeg(B, C)
Segment cd := MkSeg(C, D)
Segment da := MkSeg(D, A)
PolyAngle(D, A, B)
PolyAngle(C, B, A)
PolyAngle(D, C, B)
PolyAngle(C, D, A)
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
PolyAngle(C, B, A)
PolyAngle(D, C, B)
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
PolyAngle(C, B, A)
PolyAngle(D, C, B)
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

// ─── Parallel Lines & Transversal ───────────────────────────────────────────

// 31. Two parallel horizontal lines cut by a diagonal transversal
// Intersection points P (top) and Q (bottom) are hidden; angle arc at P.
export const TRIO_PARALLEL_TRANSVERSAL = {
  domain: GEOMETRY_DOMAIN,
  style: GEOMETRY_STYLE,
  substance: `
Point A, P, B, C, Q, D
Segment ap := MkSeg(A, P)
Segment pb := MkSeg(P, B)
Segment cq := MkSeg(C, Q)
Segment qd := MkSeg(Q, D)
Segment pq := MkSeg(P, Q)
SameRow(A, P)
SameRow(P, B)
SameRow(C, Q)
SameRow(Q, D)
Separate(A, B)
Separate(C, D)
Separate(P, Q)
IsAbove(A, C)
IsAbove(P, Q)
IsLeftOf(A, B)
IsLeftOf(C, D)
Hidden(P)
Hidden(Q)
AngleArc(A, P, Q)
Label A ""
Label B ""
Label C ""
Label D ""
Label P ""
Label Q ""
`,
  variation: "parallel_transversal",
};

// ─── Special Right Triangles ─────────────────────────────────────────────────

// 32. 30-60-90 special right triangle with labeled angle and side ratios
export const TRIO_SPECIAL_30_60_90 = {
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
Label A "30°"
Label B "90°"
Label C "60°"
Label U "x√3"
Label V "x"
Label W "2x"
`,
  variation: "special_30_60_90",
};

// 33. 45-45-90 special right triangle (isosceles) with labeled sides
export const TRIO_SPECIAL_45_45_90 = {
  domain: GEOMETRY_DOMAIN,
  style: GEOMETRY_STYLE,
  substance: `
Point A, B, C, U, V, W
Segment ab := MkSeg(A, B)
Segment bc := MkSeg(B, C)
Segment ca := MkSeg(C, A)
RightAngle(A, B, C)
Tick(ab)
Tick(bc)
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
Label A "45°"
Label B "90°"
Label C "45°"
Label U "x"
Label V "x"
Label W "x√2"
`,
  variation: "special_45_45_90",
};

// ─── Angle of Elevation ──────────────────────────────────────────────────────

// 34. Right triangle showing angle of elevation θ from observer O to object T
export const TRIO_ANGLE_ELEVATION = {
  domain: GEOMETRY_DOMAIN,
  style: GEOMETRY_STYLE,
  substance: `
Point O, G, T, M
Segment og := MkSeg(O, G)
Segment gt := MkSeg(G, T)
Segment ot := MkSeg(O, T)
RightAngle(O, G, T)
SameRow(O, G)
IsAbove(T, G)
IsLeftOf(O, G)
IsWellLeftOf(O, T)
AngleArc(G, O, T)
MidpointOf(M, G, T)
Hidden(M)
Label O "O"
Label G ""
Label T "T"
Label M "h"
`,
  variation: "angle_elevation",
};

// ─── Circle Diagrams ─────────────────────────────────────────────────────────

// 35. Circle with center O, two radii OA and OB, and chord AB
export const TRIO_CIRCLE_CHORD = {
  domain: GEOMETRY_DOMAIN,
  style: GEOMETRY_STYLE,
  substance: `
Point O, A, B
Segment oa := MkSeg(O, A)
Segment ob := MkSeg(O, B)
Segment ab := MkSeg(A, B)
IsCenter(O)
OnCircle(A, O)
OnCircle(B, O)
IsCentered(O)
Label O "O"
Label A "A"
Label B "B"
`,
  variation: "circle_chord",
};

// 36. Circle with central angle at O and inscribed angle at C on the arc — central ∠ = 2×inscribed ∠
export const TRIO_CENTRAL_INSCRIBED = {
  domain: GEOMETRY_DOMAIN,
  style: GEOMETRY_STYLE,
  substance: `
Point O, A, B, C
Segment oa := MkSeg(O, A)
Segment ob := MkSeg(O, B)
Segment ca := MkSeg(C, A)
Segment cb := MkSeg(C, B)
IsCenter(O)
OnCircle(A, O)
OnCircle(B, O)
OnCircle(C, O)
IsCentered(O)
AngleArc(A, O, B)
AngleArc(A, C, B)
Label O "O"
Label A "A"
Label B "B"
Label C "C"
`,
  variation: "central_inscribed",
};

// ─── Chunk 3: Bisectors, Circles, Angle Pairs, Pythagorean ──────────────────

// 43. Perpendicular bisector of AB: segment AB + perpendicular through midpoint M
export const TRIO_PERPENDICULAR_BISECTOR = {
  domain: GEOMETRY_DOMAIN,
  style: GEOMETRY_STYLE,
  substance: `
Point A, B, M, P, Q
Segment ma := MkSeg(M, A)
Segment mb := MkSeg(M, B)
Segment pm := MkSeg(P, M)
Segment mq := MkSeg(M, Q)
RightAngle(A, M, P)
SameRow(A, M)
SameRow(M, B)
IsLeftOf(A, M)
IsLeftOf(M, B)
IsAbove(P, M)
IsAbove(M, Q)
Tick(ma)
Tick(mb)
Label A "A"
Label B "B"
Label M "M"
Label P "P"
Label Q "Q"
`,
  variation: "perp_bisector",
};

// 44. Triangle inscribed in its circumscribed circle (circumcenter O)
export const TRIO_CIRCUMSCRIBED_TRIANGLE = {
  domain: GEOMETRY_DOMAIN,
  style: GEOMETRY_STYLE,
  substance: `
Point O, A, B, C
Segment ab := MkSeg(A, B)
Segment bc := MkSeg(B, C)
Segment ca := MkSeg(C, A)
IsCenter(O)
OnCircle(A, O)
OnCircle(B, O)
OnCircle(C, O)
IsCentered(O)
Label O "O"
Label A "A"
Label B "B"
Label C "C"
`,
  variation: "circumscribed_tri",
};

// 45. Right triangle with sides labeled a², b², c² at midpoints (Pythagorean theorem)
export const TRIO_PYTHAGOREAN_SQUARES = {
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
Label A ""
Label B ""
Label C ""
Label U "a²"
Label V "b²"
Label W "c²"
`,
  variation: "pythagorean_squares",
};

// 46. Complementary angles: right-angle corner O with ray OC dividing into α + β = 90°
export const TRIO_COMPLEMENTARY_ANGLES = {
  domain: GEOMETRY_DOMAIN,
  style: GEOMETRY_STYLE,
  substance: `
Point O, A, B, C
Segment oa := MkSeg(O, A)
Segment ob := MkSeg(O, B)
Segment oc := MkSeg(O, C)
RightAngle(B, O, A)
AngleArc(A, O, C)
AngleArc(C, O, B)
SameRow(O, A)
IsAbove(B, O)
IsAbove(C, O)
IsLeftOf(O, A)
IsCentered(O)
Label O "O"
Label A ""
Label B ""
Label C "C"
`,
  variation: "complementary",
};

// 47. Cyclic quadrilateral: four vertices on a circle (opposite angles sum to 180°)
export const TRIO_CYCLIC_QUADRILATERAL = {
  domain: GEOMETRY_DOMAIN,
  style: GEOMETRY_STYLE + `
    forall Point \`O\`; Point \`A\`; Point \`B\`; Point \`C\`; Point \`D\` {
      forall Point \`O\` { override \`O\`.dot.center = (0, 0) }
      override \`A\`.dot.center = (0, 110)
      override \`B\`.dot.center = (104, 34)
      override \`C\`.dot.center = (65, -89)
      override \`D\`.dot.center = (-89, -65)
    }
  `,
  substance: `
Point O, A, B, C, D
Segment ab := MkSeg(A, B)
Segment bc := MkSeg(B, C)
Segment cd := MkSeg(C, D)
Segment da := MkSeg(D, A)
IsCenter(O)
OnCircle(A, O)
OnCircle(B, O)
OnCircle(C, O)
OnCircle(D, O)
Label O "O"
Label A "A"
Label B "B"
Label C "C"
Label D "D"
`,
  variation: "cyclic_quad",
};

// 48. Arc / sector: circle with center O, two radii OA and OB and central angle arc
export const TRIO_ARC_SECTOR = {
  domain: GEOMETRY_DOMAIN,
  style: GEOMETRY_STYLE,
  substance: `
Point O, A, B, M
Segment oa := MkSeg(O, A)
Segment ob := MkSeg(O, B)
IsCenter(O)
OnCircle(A, O)
OnCircle(B, O)
AngleArc(A, O, B)
MidpointOf(M, O, A)
Hidden(M)
IsCentered(O)
Label O "O"
Label A "A"
Label B "B"
Label M "r"
`,
  variation: "arc_sector",
};

// ─── Angle Pairs & Triangle Properties ──────────────────────────────────────

// 37. Altitude from vertex C to foot F on base AB — creates two right triangles
export const TRIO_TRIANGLE_ALTITUDE = {
  domain: GEOMETRY_DOMAIN,
  style: GEOMETRY_STYLE,
  substance: `
Point A, B, C, F
Segment ab := MkSeg(A, B)
Segment bc := MkSeg(B, C)
Segment ca := MkSeg(C, A)
Segment cf := MkSeg(C, F)
RightAngle(C, F, A)
SameRow(A, F)
SameRow(F, B)
IsLeftOf(A, F)
IsLeftOf(F, B)
IsAbove(C, A)
IsAbove(C, B)
IsCentered(C)
Label A "A"
Label B "B"
Label C "C"
Label F "F"
`,
  variation: "triangle_altitude",
};

// 38. Exterior angle theorem: extend AB to D; ∠CBD = ∠A + ∠C
export const TRIO_EXTERIOR_ANGLE = {
  domain: GEOMETRY_DOMAIN,
  style: GEOMETRY_STYLE,
  substance: `
Point A, B, C, D
Segment ab := MkSeg(A, B)
Segment bc := MkSeg(B, C)
Segment ca := MkSeg(C, A)
Segment bd := MkSeg(B, D)
SameRow(A, B)
SameRow(B, D)
IsLeftOf(A, B)
IsLeftOf(B, D)
IsAbove(C, A)
IsAbove(C, B)
AngleArc(C, A, B)
AngleArc(A, C, B)
AngleArc(C, B, D)
Label A "A"
Label B "B"
Label C "C"
Label D "D"
`,
  variation: "exterior_angle",
};

// 39. Midsegment theorem: MN connects midpoints of AB and AC, MN ∥ BC, MN = ½BC
export const TRIO_MIDSEGMENT = {
  domain: GEOMETRY_DOMAIN,
  style: GEOMETRY_STYLE,
  substance: `
Point A, B, C, M, N
Segment ab := MkSeg(A, B)
Segment bc := MkSeg(B, C)
Segment ca := MkSeg(C, A)
Segment mn := MkSeg(M, N)
MidpointOf(M, A, B)
MidpointOf(N, A, C)
IsAbove(A, B)
IsAbove(A, C)
IsLeftOf(B, C)
IsCentered(A)
Label A "A"
Label B "B"
Label C "C"
Label M "M"
Label N "N"
`,
  variation: "midsegment",
};

// 40. Angle bisector from A to D on BC — two equal angle arcs at A
export const TRIO_ANGLE_BISECTOR = {
  domain: GEOMETRY_DOMAIN,
  style: GEOMETRY_STYLE,
  substance: `
Point A, B, C, D
Segment ab := MkSeg(A, B)
Segment bc := MkSeg(B, C)
Segment ca := MkSeg(C, A)
Segment ad := MkSeg(A, D)
AngleArc(B, A, D)
AngleArc(D, A, C)
IsAbove(A, B)
IsAbove(A, C)
IsLeftOf(B, C)
IsCentered(A)
Label A "A"
Label B "B"
Label C "C"
Label D "D"
`,
  variation: "angle_bisector",
};

// 41. Supplementary angles: ray OC splits straight line AB into α + β = 180°
export const TRIO_SUPPLEMENTARY_ANGLES = {
  domain: GEOMETRY_DOMAIN,
  style: GEOMETRY_STYLE,
  substance: `
Point A, O, B, C
Segment ao := MkSeg(A, O)
Segment ob := MkSeg(O, B)
Segment oc := MkSeg(O, C)
SameRow(A, O)
SameRow(O, B)
IsLeftOf(A, O)
IsLeftOf(O, B)
IsAbove(C, O)
IsCentered(O)
AngleArc(A, O, C)
AngleArc(C, O, B)
Label A ""
Label O "O"
Label B ""
Label C "C"
`,
  variation: "supplementary",
};

// 42. Vertical angles: two lines cross at O — opposite angles are congruent
export const TRIO_VERTICAL_ANGLES = {
  domain: GEOMETRY_DOMAIN,
  style: GEOMETRY_STYLE,
  substance: `
Point A, B, C, D, O
Segment ao := MkSeg(A, O)
Segment ob := MkSeg(O, B)
Segment co := MkSeg(C, O)
Segment od := MkSeg(O, D)
IsLeftOf(A, O)
IsLeftOf(O, B)
IsAbove(C, O)
IsAbove(O, D)
IsCentered(O)
AngleArc(A, O, C)
AngleArc(C, O, B)
AngleArc(B, O, D)
AngleArc(D, O, A)
Label A ""
Label B ""
Label C ""
Label D ""
Label O "O"
`,
  variation: "vertical_angles",
};

// ─── Chunk 4: Transformations, Number Line, Hasse, Function Map, Incircle ───

// 49. Dilation: two similar triangles with matching tick marks showing proportional sides
export const TRIO_DILATION = {
  domain: GEOMETRY_DOMAIN,
  style: GEOMETRY_STYLE,
  substance: `
Point A, B, C, Ap, Bp, Cp
Segment ab := MkSeg(A, B)
Segment bc := MkSeg(B, C)
Segment ca := MkSeg(C, A)
Segment apbp := MkSeg(Ap, Bp)
Segment bpcp := MkSeg(Bp, Cp)
Segment cpap := MkSeg(Cp, Ap)
Tick(ab)
Tick(apbp)
DoubleTick(bc)
DoubleTick(bpcp)
IsWellLeftOf(A, Ap)
IsWellLeftOf(B, Bp)
IsWellLeftOf(C, Cp)
IsAbove(C, A)
IsAbove(C, B)
IsAbove(Cp, Ap)
IsAbove(Cp, Bp)
IsLeftOf(A, B)
IsLeftOf(Ap, Bp)
Label A "A"
Label B "B"
Label C "C"
Label Ap "A'"
Label Bp "B'"
Label Cp "C'"
`,
  variation: "dilation",
};

// 50. Reflection: triangle ABC and its mirror image A'B'C' over a vertical axis
export const TRIO_REFLECTION_LINE = {
  domain: GEOMETRY_DOMAIN,
  style: GEOMETRY_STYLE,
  substance: `
Point A, B, C, Ap, Bp, Cp, T, U
Segment ab := MkSeg(A, B)
Segment bc := MkSeg(B, C)
Segment ca := MkSeg(C, A)
Segment apbp := MkSeg(Ap, Bp)
Segment bpcp := MkSeg(Bp, Cp)
Segment cpap := MkSeg(Cp, Ap)
Segment tu := MkSeg(T, U)
IsLeftOf(A, T)
IsLeftOf(B, T)
IsLeftOf(C, T)
IsLeftOf(T, Ap)
IsLeftOf(T, Bp)
IsLeftOf(T, Cp)
IsAbove(T, U)
IsAbove(C, A)
IsAbove(C, B)
IsAbove(Cp, Ap)
IsAbove(Cp, Bp)
IsLeftOf(A, B)
IsLeftOf(Ap, Bp)
IsCentered(T)
Label A "A"
Label B "B"
Label C "C"
Label Ap "A'"
Label Bp "B'"
Label Cp "C'"
Label T ""
Label U ""
`,
  variation: "reflection_line",
};

// 51. Hasse diagram (diamond partial order): ⊥ < {b, c} < ⊤
export const TRIO_HASSE_POSET = {
  domain: GEOMETRY_DOMAIN,
  style: GEOMETRY_STYLE,
  substance: `
Point bot, l, r, top
Segment bl := MkSeg(bot, l)
Segment br := MkSeg(bot, r)
Segment lt := MkSeg(l, top)
Segment rt := MkSeg(r, top)
IsAbove(top, l)
IsAbove(top, r)
IsAbove(l, bot)
IsAbove(r, bot)
IsLeftOf(l, r)
IsCentered(bot)
IsCentered(top)
Label bot "⊥"
Label l "b"
Label r "c"
Label top "⊤"
`,
  variation: "hasse_poset",
};

// 52. Number line: five equally-spaced labeled integer points
export const TRIO_NUMBER_LINE = {
  domain: GEOMETRY_DOMAIN,
  style: NUMBER_LINE_STYLE,
  substance: `
Point P, A, B, C, Q
Segment pa := MkSeg(P, A)
Segment ab := MkSeg(A, B)
Segment bc := MkSeg(B, C)
Segment cq := MkSeg(C, Q)
SameRow(P, A)
SameRow(A, B)
SameRow(B, C)
SameRow(C, Q)
IsLeftOf(P, A)
IsLeftOf(A, B)
IsLeftOf(B, C)
IsLeftOf(C, Q)
IsCentered(B)
Label P "−2"
Label A "−1"
Label B "0"
Label C "1"
Label Q "2"
`,
  variation: "number_line",
};

// 65. Function mapping diagram: directed bipartite graph f: {a,b,c} → {p,q,r} for domain/range discussion
export const TRIO_FUNCTION_MAPPING = {
  domain: DIRECTED_GRAPH_DOMAIN,
  style: DIRECTED_GRAPH_STYLE + `
    forall Node \`b\`; Node \`q\` {
      ensure equal(\`b\`.icon.center[0] + 320, \`q\`.icon.center[0])
    }
    
    forall Node \`a\`; Node \`b\`; Node \`c\`; Node \`d\` {
      ensure equal(\`a\`.icon.center[1], \`b\`.icon.center[1] + 85)
      ensure equal(\`b\`.icon.center[1], \`c\`.icon.center[1] + 85)
      ensure equal(\`c\`.icon.center[1], \`d\`.icon.center[1] + 85)
      
      override \`a\`.icon.fillColor = rgba(255, 255, 255, 1.0)
      override \`b\`.icon.fillColor = rgba(255, 255, 255, 1.0)
      override \`c\`.icon.fillColor = rgba(255, 255, 255, 1.0)
      override \`d\`.icon.fillColor = rgba(255, 255, 255, 1.0)
      
      override \`a\`.lbl.fillColor = rgba(30, 100, 200, 1.0)
      override \`b\`.lbl.fillColor = rgba(30, 100, 200, 1.0)
      override \`c\`.lbl.fillColor = rgba(30, 100, 200, 1.0)
      override \`d\`.lbl.fillColor = rgba(30, 100, 200, 1.0)
      override \`a\`.icon.strokeColor = rgba(30, 100, 200, 1.0)
      override \`b\`.icon.strokeColor = rgba(30, 100, 200, 1.0)
      override \`c\`.icon.strokeColor = rgba(30, 100, 200, 1.0)
      override \`d\`.icon.strokeColor = rgba(30, 100, 200, 1.0)
      
      shape \`b\`.domainOval = Ellipse {
        center: (\`b\`.icon.center + \`c\`.icon.center) / 2
        rx: 80
        ry: 200
        fillColor: rgba(30, 100, 200, 0.08)
        strokeColor: rgba(30, 100, 200, 0.6)
        strokeWidth: 2.5
      }
      
      shape \`b\`.domainLbl = Text {
        string: "Domain"
        fontSize: "24px"
        fontWeight: "bold"
        fillColor: rgba(30, 100, 200, 1.0)
        center: \`a\`.icon.center + (0, 75)
      }
      layer \`b\`.domainOval below \`a\`.icon
      layer \`b\`.domainOval below \`b\`.icon
      layer \`b\`.domainOval below \`c\`.icon
      layer \`b\`.domainOval below \`d\`.icon
    }
    
    forall Node \`p\`; Node \`q\`; Node \`r\`; Node \`s\` {
      ensure equal(\`p\`.icon.center[1], \`q\`.icon.center[1] + 85)
      ensure equal(\`q\`.icon.center[1], \`r\`.icon.center[1] + 85)
      ensure equal(\`r\`.icon.center[1], \`s\`.icon.center[1] + 85)
      
      override \`p\`.icon.fillColor = rgba(255, 255, 255, 1.0)
      override \`q\`.icon.fillColor = rgba(255, 255, 255, 1.0)
      override \`r\`.icon.fillColor = rgba(255, 255, 255, 1.0)
      override \`s\`.icon.fillColor = rgba(255, 255, 255, 1.0)
      
      override \`p\`.lbl.fillColor = rgba(16, 185, 129, 1.0)
      override \`q\`.lbl.fillColor = rgba(16, 185, 129, 1.0)
      override \`r\`.lbl.fillColor = rgba(16, 185, 129, 1.0)
      override \`s\`.lbl.fillColor = rgba(16, 185, 129, 1.0)
      override \`p\`.icon.strokeColor = rgba(16, 185, 129, 1.0)
      override \`q\`.icon.strokeColor = rgba(16, 185, 129, 1.0)
      override \`r\`.icon.strokeColor = rgba(16, 185, 129, 1.0)
      override \`s\`.icon.strokeColor = rgba(16, 185, 129, 1.0)

      shape \`q\`.rangeOval = Ellipse {
        center: (\`q\`.icon.center + \`r\`.icon.center) / 2
        rx: 80
        ry: 200
        fillColor: rgba(16, 185, 129, 0.08)
        strokeColor: rgba(16, 185, 129, 0.6)
        strokeWidth: 2.5
      }
      
      shape \`q\`.rangeLbl = Text {
        string: "Codomain"
        fontSize: "24px"
        fontWeight: "bold"
        fillColor: rgba(16, 185, 129, 1.0)
        center: \`p\`.icon.center + (0, 75)
      }
      layer \`q\`.rangeOval below \`p\`.icon
      layer \`q\`.rangeOval below \`q\`.icon
      layer \`q\`.rangeOval below \`r\`.icon
      layer \`q\`.rangeOval below \`s\`.icon
    }
  `,
  substance: `
Node a, b, c, d, p, q, r, s
DEdge e1 := MkDEdge(a, q)
DEdge e2 := MkDEdge(b, p)
DEdge e3 := MkDEdge(c, q)
DEdge e4 := MkDEdge(d, s)

SameColumn(a, b)
SameColumn(b, c)
SameColumn(c, d)

SameColumn(p, q)
SameColumn(q, r)
SameColumn(r, s)

SameRow(a, p)
SameRow(b, q)
SameRow(c, r)
SameRow(d, s)

Label a "a"
Label b "b"
Label c "c"
Label d "d"
Label p "p"
Label q "q"
Label r "r"
Label s "s"
`,
  variation: "func_map",
};

// 54. Triangle with its incircle (circle inscribed, touching all three sides)
export const TRIO_TRIANGLE_INCIRCLE = {
  domain: GEOMETRY_DOMAIN,
  style: GEOMETRY_STYLE,
  substance: `
Point A, B, C, I
Segment ab := MkSeg(A, B)
Segment bc := MkSeg(B, C)
Segment ca := MkSeg(C, A)
IsCenter(I)
IsAbove(A, B)
IsAbove(A, C)
IsLeftOf(B, C)
IsCentered(I)
SameColumn(A, I)
SameRow(B, C)
Label A "A"
Label B "B"
Label C "C"
Label I "I"
`,
  variation: "triangle_incircle",
};

// ─── Weighted Graph Domain ────────────────────────────────────────────────────

const WEIGHTED_GRAPH_DOMAIN = `
type Node
type WEdge
predicate SameRow(Node a, Node b)
predicate SameColumn(Node a, Node b)
predicate IsAbove(Node a, Node b)
predicate IsLeftOf(Node a, Node b)
constructor MkWEdge(Node u, Node v) -> WEdge
`;

const WEIGHTED_GRAPH_STYLE = `
canvas {
  width = 500
  height = 420
}

forall Node v {
  shape v.icon = Circle {
    r : 28
    fillColor : rgba(124, 58, 237, 0.9)
    strokeColor : rgba(91, 33, 182, 1.0)
    strokeWidth : 2.5
  }
  shape v.lbl = Text {
    string : v.label
    fontSize : "17px"
    fillColor : rgba(255, 255, 255, 1.0)
    fontWeight : "bold"
    fontFamily : "Outfit, sans-serif"
  }
  ensure contains(v.icon, v.lbl)
  ensure equal(v.lbl.center[0], v.icon.center[0])
  ensure equal(v.lbl.center[1], v.icon.center[1])
  layer v.lbl above v.icon
}

forall WEdge e; Node u; Node v
where e := MkWEdge(u, v) {
  shape e.seg = Line {
    start : u.icon.center
    end : v.icon.center
    strokeColor : rgba(71, 85, 105, 0.7)
    strokeWidth : 3
  }
  shape e.wlbl = Text {
    string : e.label
    fontSize : "15px"
    fillColor : rgba(30, 41, 59, 1.0)
    fontWeight : "bold"
    fontFamily : "Outfit, sans-serif"
    center : (u.icon.center + v.icon.center) / 2 + 18 * rot90(normalize(v.icon.center - u.icon.center))
  }
  layer e.seg below u.icon
  layer e.seg below v.icon
  layer e.wlbl above e.seg
}

forall Node u; Node v {
  ensure disjoint(u.icon, v.icon, 75)
}

forall Node a; Node b
where SameRow(a, b) {
  ensure equal(a.icon.center[1], b.icon.center[1])
}

forall Node a; Node b
where SameColumn(a, b) {
  ensure equal(a.icon.center[0], b.icon.center[0])
}

forall Node a; Node b
where IsAbove(a, b) {
  ensure lessThan(b.icon.center[1] + 80, a.icon.center[1])
}

forall Node a; Node b
where IsLeftOf(a, b) {
  ensure lessThan(a.icon.center[0] + 100, b.icon.center[0])
}
`;

// ─── Chunk 5: Weighted graph, sequence, coterminal, unit circle, proportion, translation ──

// 55. Weighted undirected graph: 4 nodes with labeled edge weights
export const TRIO_WEIGHTED_GRAPH = {
  domain: WEIGHTED_GRAPH_DOMAIN,
  style: WEIGHTED_GRAPH_STYLE,
  substance: `
Node A, B, C, D
WEdge ab := MkWEdge(A, B)
WEdge bc := MkWEdge(B, C)
WEdge cd := MkWEdge(C, D)
WEdge ad := MkWEdge(A, D)
WEdge bd := MkWEdge(B, D)
Label A "A"
Label B "B"
Label C "C"
Label D "D"
Label ab "5"
Label bc "3"
Label cd "7"
Label ad "4"
Label bd "6"
`,
  variation: "weighted_graph",
};

// 56. Arithmetic sequence: 5 terms connected by arrows showing +d pattern
export const TRIO_SEQUENCE_TERMS = {
  domain: DIRECTED_GRAPH_DOMAIN,
  style: DIRECTED_GRAPH_STYLE + `
    forall Node \`a1\`; Node \`a2\`; Node \`a3\`; Node \`a4\`; Node \`a5\` {
      override \`a1\`.icon.center = (-210, 0)
      override \`a2\`.icon.center = (-105, 0)
      override \`a3\`.icon.center = (0, 0)
      override \`a4\`.icon.center = (105, 0)
      override \`a5\`.icon.center = (210, 0)
    }
    
    forall DEdge e; Node u; Node v
    where e := MkDEdge(u, v) {
      shape e.lbl = Text {
        string : e.label
        fontSize : "22px"
        fontWeight : "bold"
        fontFamily : "Outfit, sans-serif"
        fillColor : rgba(30, 41, 59, 1.0)
        center : (u.icon.center + v.icon.center) / 2 + (0, 35)
      }
    }
  `,
  substance: `
Node a1, a2, a3, a4, a5
DEdge e1 := MkDEdge(a1, a2)
DEdge e2 := MkDEdge(a2, a3)
DEdge e3 := MkDEdge(a3, a4)
DEdge e4 := MkDEdge(a4, a5)
SameRow(a1, a2)
SameRow(a2, a3)
SameRow(a3, a4)
SameRow(a4, a5)
IsCentered(a3)
Label a1 "a₁"
Label a2 "a₂"
Label a3 "a₃"
Label a4 "a₄"
Label a5 "a₅"
Label e1 "+d"
Label e2 "+d"
Label e3 "+d"
Label e4 "+d"
`,
  variation: "sequence_terms",
};

// 57. Coterminal angles: two rays from origin sharing angle, one positive one negative
export const TRIO_COTERMINAL_ANGLES = {
  domain: GEOMETRY_DOMAIN,
  style: GEOMETRY_STYLE,
  substance: `
Point O, A, B, C
Segment oa := MkSeg(O, A)
Segment ob := MkSeg(O, B)
Segment oc := MkSeg(O, C)
AngleArc(A, O, B)
AngleArc(B, O, C)
IsCentered(O)
IsLeftOf(O, A)
IsAbove(B, O)
IsAbove(C, O)
IsLeftOf(C, O)
Label O "O"
Label A ""
Label B "θ"
Label C "-θ"
`,
  variation: "coterminal",
};

// 58. Unit circle: center O, radius to standard-position point P on circle
export const TRIO_UNIT_CIRCLE_POINT = {
  domain: GEOMETRY_DOMAIN,
  style: GEOMETRY_STYLE,
  substance: `
Point O, P, R, Q, U
Segment op := MkSeg(O, P)
Segment pr := MkSeg(P, R)
Segment or2 := MkSeg(O, R)
IsCenter(O)
OnCircle(P, O)
RightAngle(O, R, P)
SameRow(O, R)
AngleArc(U, O, P)
IsCentered(O)
IsLeftOf(O, R)
IsAbove(P, O)
Hidden(U)
Label O "O"
Label P "(cos θ, sin θ)"
Label R ""
Label U ""
`,
  variation: "unit_circle_pt",
};

// 59. Proportion diagram: two similar triangles sharing a vertex (AA similarity setup)
export const TRIO_PROPORTION_SEGMENTS = {
  domain: GEOMETRY_DOMAIN,
  style: GEOMETRY_STYLE,
  substance: `
Point A, B, C, D, E, M, N
Segment ab := MkSeg(A, B)
Segment ac := MkSeg(A, C)
Segment bc := MkSeg(B, C)
Segment de := MkSeg(D, E)
Segment bd := MkSeg(B, D)
Segment ce := MkSeg(C, E)
MidpointOf(M, A, B)
MidpointOf(N, A, C)
Hidden(M)
Hidden(N)
IsAbove(A, B)
IsAbove(A, C)
IsLeftOf(B, C)
IsLeftOf(D, E)
IsAbove(B, D)
IsAbove(C, E)
IsCentered(A)
Label A "A"
Label B "B"
Label C "C"
Label D "D"
Label E "E"
Label M "a"
Label N "b"
`,
  variation: "proportion_segs",
};

// 60. Translation: triangle ABC shifted to A'B'C' with arrow showing vector of translation
export const TRIO_TRANSLATION = {
  domain: GEOMETRY_DOMAIN,
  style: GEOMETRY_STYLE,
  substance: `
Point A, B, C, Ap, Bp, Cp
Segment ab := MkSeg(A, B)
Segment bc := MkSeg(B, C)
Segment ca := MkSeg(C, A)
Segment apbp := MkSeg(Ap, Bp)
Segment bpcp := MkSeg(Bp, Cp)
Segment cpap := MkSeg(Cp, Ap)
Separate(A, Ap)
Separate(B, Bp)
Separate(C, Cp)
IsWellLeftOf(A, Ap)
IsWellLeftOf(B, Bp)
IsWellLeftOf(C, Cp)
IsAbove(C, A)
IsAbove(C, B)
IsAbove(Cp, Ap)
IsAbove(Cp, Bp)
IsLeftOf(A, B)
IsLeftOf(Ap, Bp)
Label A "A"
Label B "B"
Label C "C"
Label Ap "A'"
Label Bp "B'"
Label Cp "C'"
`,
  variation: "translation",
};

// ─── Chunk 6: Rotation, Symmetry, Polygon Angles, Trig Ratios, Tangent, Chords ───

// 61. Rotation: triangle ABC and rotated image A'B'C' with arc at center of rotation O
export const TRIO_ROTATION = {
  domain: GEOMETRY_DOMAIN,
  style: GEOMETRY_STYLE,
  substance: `
Point O, A, B, C, Ap, Bp, Cp
Segment oa := MkSeg(O, A)
Segment ob := MkSeg(O, B)
Segment oc := MkSeg(O, C)
Segment oap := MkSeg(O, Ap)
Segment obp := MkSeg(O, Bp)
Segment ocp := MkSeg(O, Cp)
Segment ab := MkSeg(A, B)
Segment bc := MkSeg(B, C)
Segment ca := MkSeg(C, A)
Segment apbp := MkSeg(Ap, Bp)
Segment bpcp := MkSeg(Bp, Cp)
Segment cpap := MkSeg(Cp, Ap)
AngleArc(A, O, Ap)
IsAbove(A, O)
IsAbove(Ap, O)
IsLeftOf(A, O)
IsLeftOf(O, Ap)
IsAbove(C, A)
IsAbove(Cp, Ap)
IsCentered(O)
Label O "O"
Label A "A"
Label B "B"
Label C "C"
Label Ap "A'"
Label Bp "B'"
Label Cp "C'"
`,
  variation: "rotation",
};

// 62. Line of symmetry through an isosceles triangle (vertical axis of symmetry)
export const TRIO_LINE_SYMMETRY = {
  domain: GEOMETRY_DOMAIN,
  style: GEOMETRY_STYLE,
  substance: `
Point A, B, C, T, U
Segment ab := MkSeg(A, B)
Segment bc := MkSeg(B, C)
Segment ca := MkSeg(C, A)
Segment tu := MkSeg(T, U)
Tick(ab)
Tick(ca)
IsAbove(A, B)
IsAbove(A, C)
IsLeftOf(B, C)
IsCentered(A)
IsAbove(T, A)
IsAbove(A, U)
SameRow(B, C)
Label A "A"
Label B "B"
Label C "C"
Label T ""
Label U ""
`,
  variation: "line_symmetry",
};

// 63. Interior angles of a pentagon with PolyAngle arcs — sum = (5-2)×180 = 540°
export const TRIO_POLYGON_INTERIOR_ANGLES = {
  domain: GEOMETRY_DOMAIN,
  style: GEOMETRY_STYLE,
  substance: `
Point A, B, C, D, E
Segment ab := MkSeg(A, B)
Segment bc := MkSeg(B, C)
Segment cd := MkSeg(C, D)
Segment de := MkSeg(D, E)
Segment ea := MkSeg(E, A)
AngleArc(E, A, B)
AngleArc(A, B, C)
AngleArc(B, C, D)
AngleArc(C, D, E)
AngleArc(D, E, A)
PolyAngle(E, A, B)
PolyAngle(A, B, C)
PolyAngle(B, C, D)
PolyAngle(C, D, E)
PolyAngle(D, E, A)
Label A "A"
Label B "B"
Label C "C"
Label D "D"
Label E "E"
`,
  variation: "polygon_interior",
};

// 64. Right triangle with opp/adj/hyp labels at midpoints and angle θ at A
export const TRIO_TRIG_RATIOS = {
  domain: GEOMETRY_DOMAIN,
  style: GEOMETRY_STYLE,
  substance: `
Point A, B, C, U, V, W
Segment ab := MkSeg(A, B)
Segment bc := MkSeg(B, C)
Segment ca := MkSeg(C, A)
RightAngle(A, B, C)
AngleArc(B, A, C)
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
Label A "θ"
Label B ""
Label C ""
Label U "adj"
Label V "opp"
Label W "hyp"
`,
  variation: "trig_ratios",
};

// 65. Tangent line to circle: center O, radius OT, tangent line at T (OT ⊥ tangent)
export const TRIO_TANGENT_CIRCLE = {
  domain: GEOMETRY_DOMAIN,
  style: GEOMETRY_STYLE,
  substance: `
Point O, T, P, Q
Segment ot := MkSeg(O, T)
Segment pq := MkSeg(P, Q)
RightAngle(O, T, P)
IsCenter(O)
OnCircle(T, O)
SameRow(P, T)
SameRow(T, Q)
IsLeftOf(P, T)
IsLeftOf(T, Q)
IsCentered(O)
IsAbove(O, T)
Label O "O"
Label T "T"
Label P ""
Label Q ""
`,
  variation: "tangent_circle",
};

// 66. Two chords PQ and RS intersecting inside circle at point X  (chord-chord angle)
export const TRIO_CHORD_CHORD = {
  domain: GEOMETRY_DOMAIN,
  style: GEOMETRY_STYLE,
  substance: `
Point O, P, Q, R, S, X
Segment px := MkSeg(P, X)
Segment xq := MkSeg(X, Q)
Segment rx := MkSeg(R, X)
Segment xs := MkSeg(X, S)
IsCenter(O)
OnCircle(P, O)
OnCircle(Q, O)
OnCircle(R, O)
OnCircle(S, O)
IsCentered(O)
IsCentered(X)
AngleArc(P, X, R)
Label O "O"
Label P "P"
Label Q "Q"
Label R "R"
Label S "S"
Label X "X"
`,
  variation: "chord_chord",
};

// ─── Chunk 7: Secant, Midpoint, Distance, Coordinate Plane, Inequality, Proof ──

// 67. Secant from external point E through circle: E-A-B on one line
export const TRIO_SECANT_EXTERNAL = {
  domain: GEOMETRY_DOMAIN,
  style: GEOMETRY_STYLE,
  substance: `
Point O, E, A, B
Segment ea := MkSeg(E, A)
Segment ab := MkSeg(A, B)
IsCenter(O)
OnCircle(A, O)
OnCircle(B, O)
IsWellLeftOf(E, O)
SameRow(E, A)
SameRow(A, B)
IsLeftOf(E, A)
IsLeftOf(A, B)
IsCentered(O)
Label O "O"
Label E "E"
Label A "A"
Label B "B"
`,
  variation: "secant_external",
};

// 68. Midpoint of a segment: M is the midpoint of AB, with tick marks
export const TRIO_MIDPOINT_SEGMENT = {
  domain: GEOMETRY_DOMAIN,
  style: GEOMETRY_STYLE + `
    forall Point \`A\` { \`A\`.lbl.center = \`A\`.dot.center + (-40, 25) }
    forall Point \`B\` { \`B\`.lbl.center = \`B\`.dot.center + (40, 25) }
    forall Point \`M\` { \`M\`.lbl.center = \`M\`.dot.center + (0, 35) }
    forall Point \`A\`; Point \`B\` {
      ensure equal(norm(\`A\`.dot.center - \`B\`.dot.center), 260)
    }
  `,
  substance: `
Point A, B, M
Segment am := MkSeg(A, M)
Segment mb := MkSeg(M, B)
Tick(am)
Tick(mb)
MidpointOf(M, A, B)
SameRow(A, M)
SameRow(M, B)
IsLeftOf(A, M)
IsLeftOf(M, B)
Label A "(x₁, y₁)"
Label B "(x₂, y₂)"
Label M "((x₁ + x₂)/2, (y₁ + y₂)/2)"
`,
  variation: "midpoint_segment",
};

// 69. Distance formula: right triangle on a grid with horizontal leg Δx, vertical leg Δy, hypotenuse d
export const TRIO_DISTANCE_FORMULA = {
  domain: GEOMETRY_DOMAIN,
  style: GEOMETRY_STYLE + `
    forall Point \`P\` { \`P\`.lbl.center = \`P\`.dot.center + (-40, -25) }
    forall Point \`R\` { \`R\`.lbl.center = \`R\`.dot.center + (40, 25) }
    forall Point \`U\` { \`U\`.lbl.center = \`U\`.dot.center + (0, -32) }
    forall Point \`V\` { \`V\`.lbl.center = \`V\`.dot.center + (48, 0) }
    forall Point \`W\` { \`W\`.lbl.center = \`W\`.dot.center + (-20, 25) }
  `,
  substance: `
Point P, Q, R, U, V, W
Segment pq := MkSeg(P, Q)
Segment qr := MkSeg(Q, R)
Segment rp := MkSeg(R, P)
RightAngle(P, Q, R)
SameRow(P, Q)
IsAbove(R, Q)
IsLeftOf(P, Q)
MidpointOf(U, P, Q)
MidpointOf(V, Q, R)
MidpointOf(W, P, R)
Hidden(U)
Hidden(V)
Hidden(W)
Label P "(x₁, y₁)"
Label R "(x₂, y₂)"
Label Q ""
Label U "|x₂ - x₁|"
Label V "|y₂ - y₁|"
Label W "d"
`,
  variation: "distance_formula",
};

// 70. Coordinate plane quadrants: four labeled quadrant regions around origin O
export const TRIO_COORDINATE_QUADRANTS = {
  domain: GEOMETRY_DOMAIN,
  style: GEOMETRY_STYLE + `
    forall Point \`O\` { \`O\`.lbl.center = \`O\`.dot.center + (-24, -24) }
    forall Point \`X\` { \`X\`.lbl.center = \`X\`.dot.center + (0, -20) }
    forall Point \`Y\` { \`Y\`.lbl.center = \`Y\`.dot.center + (24, 0) }
    forall Point \`Q1\` { \`Q1\`.lbl.center = \`Q1\`.dot.center }
    forall Point \`Q2\` { \`Q2\`.lbl.center = \`Q2\`.dot.center }
    forall Point \`Q3\` { \`Q3\`.lbl.center = \`Q3\`.dot.center }
    forall Point \`Q4\` { \`Q4\`.lbl.center = \`Q4\`.dot.center }
    
    forall Point \`O\` { override \`O\`.dot.center = (0, 0) }
    forall Point \`Q1\` { override \`Q1\`.dot.center = (90, 80) }
    forall Point \`Q2\` { override \`Q2\`.dot.center = (-90, 80) }
    forall Point \`Q3\` { override \`Q3\`.dot.center = (-90, -80) }
    forall Point \`Q4\` { override \`Q4\`.dot.center = (90, -80) }

    forall Segment \`xAxis\` { ensure equal(norm(\`xAxis\`.seg.start - \`xAxis\`.seg.end), 320) }
    forall Segment \`yAxis\` { ensure equal(norm(\`yAxis\`.seg.start - \`yAxis\`.seg.end), 280) }
  `,
  substance: `
Point O, X, Xneg, Y, Yneg
Point Q1, Q2, Q3, Q4
Segment xAxis := MkSeg(Xneg, X)
Segment yAxis := MkSeg(Yneg, Y)
MidpointOf(O, Xneg, X)
MidpointOf(O, Yneg, Y)
SameRow(Xneg, X)
SameColumn(Yneg, Y)
IsAbove(Y, O)
IsAbove(O, Yneg)
IsLeftOf(Xneg, O)
IsLeftOf(O, X)
IsCentered(O)
-- Quadrant placements
IsAbove(Q1, O)
IsLeftOf(O, Q1)
IsAbove(Q2, O)
IsLeftOf(Q2, O)
IsAbove(O, Q3)
IsLeftOf(Q3, O)
IsAbove(O, Q4)
IsLeftOf(O, Q4)
Hidden(Q1)
Hidden(Q2)
Hidden(Q3)
Hidden(Q4)
Hidden(Xneg)
Hidden(Yneg)
Label O "(0,0)"
Label X "x"
Label Y "y"
Label Q1 "Quadrant I (+,+)"
Label Q2 "Quadrant II (-,+)"
Label Q3 "Quadrant III (-,-)"
Label Q4 "Quadrant IV (+,-)"
`,
  variation: "coord_quadrants",
};

// 71. Number-line inequality: ray from point A going right (x > a)
export const TRIO_INEQUALITY_RAY = {
  domain: GEOMETRY_DOMAIN,
  style: GEOMETRY_STYLE + `
    forall Segment \`axis\` {
      override \`axis\`.seg.startArrowhead = "straight"
      override \`axis\`.seg.endArrowhead = "straight"
      override \`axis\`.seg.strokeColor = rgba(30, 30, 30, 1.0)
      override \`axis\`.seg.arrowheadSize = 1.0
    }
    forall Segment \`ray\` {
      override \`ray\`.seg.strokeColor = rgba(16, 185, 129, 1.0)
      override \`ray\`.seg.strokeWidth = 6
      override \`ray\`.seg.endArrowhead = "straight"
      override \`ray\`.seg.arrowheadSize = 0.85
    }
    forall Point \`A\` {
      override \`A\`.dot.r = 8
      override \`A\`.dot.fillColor = rgba(255, 255, 255, 1.0)
      override \`A\`.dot.strokeWidth = 4
      override \`A\`.dot.strokeColor = rgba(16, 185, 129, 1.0)
      override \`A\`.lbl.center = \`A\`.dot.center + (0, -35)
      override \`A\`.lbl.fontSize = "26px"
    }
    forall Point \`Eq\`; Point \`A\`; Point \`R\` {
      override \`Eq\`.lbl.center = (\`A\`.dot.center + \`R\`.dot.center) / 2 + (-25, 38)
      override \`Eq\`.lbl.fillColor = rgba(16, 185, 129, 1.0)
      override \`Eq\`.lbl.fontSize = "28px"
    }
    forall Point \`L\`; Point \`R\` {
      ensure equal(norm(\`L\`.dot.center - \`R\`.dot.center), 400)
    }
    forall Segment \`ray\`; Segment \`axis\`; Point \`A\` {
      layer \`ray\`.seg above \`axis\`.seg
      layer \`A\`.dot above \`ray\`.seg
    }
  `,
  substance: `
Point L, A, R, Eq
Segment axis := MkSeg(L, R)
Segment ray := MkSeg(A, R)
SameRow(L, A)
SameRow(A, R)
IsLeftOf(L, A)
IsLeftOf(A, R)
IsCentered(A)
Hidden(L)
Hidden(R)
Hidden(Eq)
Label L ""
Label A "a"
Label R ""
Label Eq "x > a"
`,
  variation: "inequality_ray",
};

// 72. Logical implication chain: p → q → r (three nodes in a directed chain)
export const TRIO_IMPLICATION_CHAIN = {
  domain: DIRECTED_GRAPH_DOMAIN,
  style: DIRECTED_GRAPH_STYLE,
  substance: `
Node p, q, r
DEdge e1 := MkDEdge(p, q)
DEdge e2 := MkDEdge(q, r)
Label p "p"
Label q "q"
Label r "r"
Label e1 "→"
Label e2 "→"
`,
  variation: "implication_chain",
};

// ─── Chunk 8: slope, altitude, trapezoid, kite, rhombus ─────────────────────

// 73. Geometric mean altitude: right triangle with altitude CD to hypotenuse creating similar sub-triangles
export const TRIO_GEOMETRIC_MEAN_ALTITUDE = {
  domain: GEOMETRY_DOMAIN,
  style: GEOMETRY_STYLE + `
    forall Point \`A\`; Point \`D\`; Point \`B\`; Point \`C\` {
      override \`D\`.dot.center = (0, -40)
      override \`A\`.dot.center = (-80, -40)
      override \`B\`.dot.center = (60, -40)
      override \`C\`.dot.center = (0, 30)
    }
  `,
  substance: `
Point A, D, B, C, U, V, W
Segment ad := MkSeg(A, D)
Segment db := MkSeg(D, B)
Segment ca := MkSeg(C, A)
Segment cb := MkSeg(C, B)
Segment cd := MkSeg(C, D)
RightAngle(A, C, B)
RightAngle(A, D, C)
MidpointOf(U, A, D)
MidpointOf(V, D, B)
MidpointOf(W, C, D)
Hidden(U)
Hidden(V)
Hidden(W)
Label A "A"
Label B "B"
Label C "C"
Label D "D"
Label U "p"
Label V "q"
Label W "h"
`,
  variation: "geometric_mean_alt",
};

// 74. Slope triangle: horizontal "run" and vertical "rise" from P up to R
export const TRIO_SLOPE_TRIANGLE = {
  domain: GEOMETRY_DOMAIN,
  style: GEOMETRY_STYLE + `
    forall Point \`P\`; Point \`Q\`; Point \`R\` {
      override \`Q\`.dot.center = (80, -60)
      override \`P\`.dot.center = (-100, -60)
      override \`R\`.dot.center = (80, 80)
    }
    forall Point \`U\` { \`U\`.lbl.center = \`U\`.dot.center + (0, -32) }
    forall Point \`V\` { \`V\`.lbl.center = \`V\`.dot.center + (80, 0) }
    forall Point \`W\` { \`W\`.lbl.center = \`W\`.dot.center + (-25, 35) }
  `,
  substance: `
Point P, Q, R, U, V, W
Segment pq := MkSeg(P, Q)
Segment qr := MkSeg(Q, R)
Segment rp := MkSeg(R, P)
RightAngle(P, Q, R)
MidpointOf(U, P, Q)
MidpointOf(V, Q, R)
MidpointOf(W, R, P)
Hidden(U)
Hidden(V)
Hidden(W)
Label P "(x₁, y₁)"
Label Q ""
Label R "(x₂, y₂)"
Label U "run = x₂ − x₁"
Label V "rise = y₂ − y₁"
Label W "slope = rise / run"
`,
  variation: "slope_triangle",
};

// 75. Trapezoid: AB ∥ CD (one pair of parallel sides)
export const TRIO_TRAPEZOID = {
  domain: GEOMETRY_DOMAIN,
  style: GEOMETRY_STYLE + `
    forall Point \`A\`; Point \`B\`; Point \`C\`; Point \`D\` {
      override \`A\`.dot.center = (-30, 60)
      override \`B\`.dot.center = (40, 60)
      override \`C\`.dot.center = (70, -60)
      override \`D\`.dot.center = (-70, -60)
    }
  `,
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
Label A "A"
Label B "B"
Label C "C"
Label D "D"
`,
  variation: "trapezoid",
};

// 76. Isosceles trapezoid: AB ∥ CD with equal legs AD = BC (tick marks)
export const TRIO_ISOSCELES_TRAPEZOID = {
  domain: GEOMETRY_DOMAIN,
  style: GEOMETRY_STYLE + `
    forall Point \`A\`; Point \`B\`; Point \`C\`; Point \`D\` {
      override \`A\`.dot.center = (-45, 60)
      override \`B\`.dot.center = (45, 60)
      override \`C\`.dot.center = (85, -60)
      override \`D\`.dot.center = (-85, -60)
    }
  `,
  substance: `
Point A, B, C, D
Segment ab := MkSeg(A, B)
Segment bc := MkSeg(B, C)
Segment cd := MkSeg(C, D)
Segment da := MkSeg(D, A)
Tick(bc)
Tick(da)
PolyAngle(D, A, B)
PolyAngle(A, B, C)
PolyAngle(B, C, D)
PolyAngle(C, D, A)
Label A "A"
Label B "B"
Label C "C"
Label D "D"
`,
  variation: "isosceles_trap",
};

// 77. Kite: AB = AD (top pair), CB = CD (bottom pair) — adjacent equal sides
export const TRIO_KITE = {
  domain: GEOMETRY_DOMAIN,
  style: GEOMETRY_STYLE + `
    forall Point \`A\`; Point \`B\`; Point \`C\`; Point \`D\` {
      override \`A\`.dot.center = (0, 80)
      override \`B\`.dot.center = (50, 20)
      override \`C\`.dot.center = (0, -100)
      override \`D\`.dot.center = (-50, 20)
    }
  `,
  substance: `
Point A, B, C, D
Segment ab := MkSeg(A, B)
Segment bc := MkSeg(B, C)
Segment cd := MkSeg(C, D)
Segment da := MkSeg(D, A)
Tick(ab)
Tick(da)
DoubleTick(bc)
DoubleTick(cd)
PolyAngle(D, A, B)
PolyAngle(A, B, C)
PolyAngle(B, C, D)
PolyAngle(C, D, A)
Label A "A"
Label B "B"
Label C "C"
Label D "D"
`,
  variation: "kite",
};

// 78. Rhombus: all four sides equal (all single tick marks)
export const TRIO_RHOMBUS = {
  domain: GEOMETRY_DOMAIN,
  style: GEOMETRY_STYLE + `
    forall Point \`A\`; Point \`B\`; Point \`C\`; Point \`D\` {
      override \`A\`.dot.center = (0, 90)
      override \`B\`.dot.center = (55, 0)
      override \`C\`.dot.center = (0, -90)
      override \`D\`.dot.center = (-55, 0)
    }
  `,
  substance: `
Point A, B, C, D
Segment ab := MkSeg(A, B)
Segment bc := MkSeg(B, C)
Segment cd := MkSeg(C, D)
Segment da := MkSeg(D, A)
Tick(ab)
Tick(bc)
Tick(cd)
Tick(da)
PolyAngle(D, A, B)
PolyAngle(A, B, C)
PolyAngle(B, C, D)
PolyAngle(C, D, A)
Label A "A"
Label B "B"
Label C "C"
Label D "D"
`,
  variation: "rhombus",
};

// ─── Chunk 9: Angle depression, HL, AA, segment addition, composition ────────

// 79. Angle of depression: observer O at height, horizontal reference H, target T below
export const TRIO_ANGLE_DEPRESSION = {
  domain: GEOMETRY_DOMAIN,
  style: GEOMETRY_STYLE,
  substance: `
Point O, H, T, M
Segment oh := MkSeg(O, H)
Segment ht := MkSeg(H, T)
Segment ot := MkSeg(O, T)
RightAngle(O, H, T)
SameRow(O, H)
IsLeftOf(O, H)
IsAbove(O, T)
IsAbove(H, T)
AngleArc(H, O, T)
MidpointOf(M, H, T)
Hidden(M)
Label O "O"
Label H ""
Label T "T"
Label M "d"
`,
  variation: "angle_depression",
};

// 80. HL congruence: two right triangles — hypotenuses equal (Tick), one leg equal (DoubleTick)
export const TRIO_HL_CONGRUENCE = {
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
RightAngle(B, A, C)
RightAngle(E, D, F)
Tick(bc)
Tick(ef)
DoubleTick(ab)
DoubleTick(de)
IsWellLeftOf(B, E)
IsWellLeftOf(A, D)
IsWellLeftOf(C, F)
IsAbove(C, A)
IsAbove(C, B)
IsAbove(F, D)
IsAbove(F, E)
IsLeftOf(A, B)
IsLeftOf(D, E)
Label A "A"
Label B "B"
Label C "C"
Label D "D"
Label E "E"
Label F "F"
`,
  variation: "hl_congruence",
};

// 81. AA similarity: two triangles with matching angle arcs at corresponding pairs
export const TRIO_AA_SIMILARITY = {
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
AngleArc(C, A, B)
AngleArc(F, D, E)
AngleArc(A, B, C)
AngleArc(D, E, F)
IsWellLeftOf(B, E)
IsWellLeftOf(A, D)
IsWellLeftOf(C, F)
IsAbove(C, A)
IsAbove(C, B)
IsAbove(F, D)
IsAbove(F, E)
IsLeftOf(A, B)
IsLeftOf(D, E)
Label A "A"
Label B "B"
Label C "C"
Label D "D"
Label E "E"
Label F "F"
`,
  variation: "aa_similarity",
};

// 82. Segment addition postulate: A--M--B with labeled segment lengths a, b
export const TRIO_SEGMENT_ADDITION = {
  domain: GEOMETRY_DOMAIN,
  style: GEOMETRY_STYLE,
  substance: `
Point A, M, B, U, V
Segment am := MkSeg(A, M)
Segment mb := MkSeg(M, B)
SameRow(A, M)
SameRow(M, B)
IsLeftOf(A, M)
IsLeftOf(M, B)
MidpointOf(U, A, M)
MidpointOf(V, M, B)
Hidden(U)
Hidden(V)
IsCentered(M)
Label A "A"
Label M "M"
Label B "B"
Label U "a"
Label V "b"
`,
  variation: "segment_addition",
};

// 83. Composite function: X -f→ Y -g→ Z with diagonal shortcut g∘f from X to Z
export const TRIO_COMPOSITE_FUNCTION = {
  domain: DIRECTED_GRAPH_DOMAIN,
  style: DIRECTED_GRAPH_STYLE,
  substance: `
Node X, Y, Z
DEdge f := MkDEdge(X, Y)
DEdge g := MkDEdge(Y, Z)
DEdge gf := MkDEdge(X, Z)
Label X "X"
Label Y "Y"
Label Z "Z"
`,
  variation: "composite_fn",
};

// 84. Biconditional: p ↔ q shown as mutual directed edges
export const TRIO_BICONDITIONAL = {
  domain: DIRECTED_GRAPH_DOMAIN,
  style: DIRECTED_GRAPH_STYLE,
  substance: `
Node p, q
DEdge pq := MkDEdge(p, q)
DEdge qp := MkDEdge(q, p)
Label p "p"
Label q "q"
`,
  variation: "biconditional",
};

// 84. Geometric sequence diagram: showing multiplicative ratio r between consecutive terms
export const TRIO_GEOMETRIC_SERIES = {
  domain: DIRECTED_GRAPH_DOMAIN,
  style: DIRECTED_GRAPH_STYLE + `
    forall Node \`g1\`; Node \`g2\`; Node \`g3\`; Node \`g4\` {
      override \`g1\`.icon.center = (-180, 0)
      override \`g2\`.icon.center = (-60, 0)
      override \`g3\`.icon.center = (60, 0)
      override \`g4\`.icon.center = (180, 0)
    }
    
    forall DEdge e; Node u; Node v
    where e := MkDEdge(u, v) {
      shape e.lbl = Text {
        string : e.label
        fontSize : "22px"
        fontWeight : "bold"
        fontFamily : "Outfit, sans-serif"
        fillColor : rgba(30, 41, 59, 1.0)
        center : (u.icon.center + v.icon.center) / 2 + (0, 35)
      }
    }
  `,
  substance: `
Node g1, g2, g3, g4
DEdge e1 := MkDEdge(g1, g2)
DEdge e2 := MkDEdge(g2, g3)
DEdge e3 := MkDEdge(g3, g4)
SameRow(g1, g2)
SameRow(g2, g3)
SameRow(g3, g4)
Label g1 "a"
Label g2 "ar"
Label g3 "ar²"
Label g4 "ar³"
Label e1 "×r"
Label e2 "×r"
Label e3 "×r"
`,
  variation: "geom_series",
};

// ─── Chunk 10: Three parallels, polygon exterior, geometric series, tangent-secant, alternate interior, scale factor ──

// 85. Three parallel lines cut by one transversal — corresponding angles at P, Q, R
export const TRIO_THREE_PARALLEL = {
  domain: GEOMETRY_DOMAIN,
  style: GEOMETRY_STYLE,
  substance: `
Point A, P, B, C, Q, D, E, R, F
Segment ap := MkSeg(A, P)
Segment pb := MkSeg(P, B)
Segment cq := MkSeg(C, Q)
Segment qd := MkSeg(Q, D)
Segment er := MkSeg(E, R)
Segment rf := MkSeg(R, F)
Segment pq := MkSeg(P, Q)
Segment qr := MkSeg(Q, R)
SameRow(A, P)
SameRow(P, B)
SameRow(C, Q)
SameRow(Q, D)
SameRow(E, R)
SameRow(R, F)
IsAbove(A, C)
IsAbove(C, E)
IsAbove(P, Q)
IsAbove(Q, R)
IsLeftOf(A, B)
IsLeftOf(C, D)
IsLeftOf(E, F)
IsLeftOf(P, Q)
IsLeftOf(Q, R)
Hidden(P)
Hidden(Q)
Hidden(R)
AngleArc(A, P, Q)
AngleArc(C, Q, R)
Label A ""
Label B ""
Label C ""
Label D ""
Label E ""
Label F ""
Label P ""
Label Q ""
Label R ""
`,
  variation: "three_parallel",
};

// 86. Polygon exterior angle: pentagon with one side extended, exterior angle arc at B
export const TRIO_POLYGON_EXTERIOR = {
  domain: GEOMETRY_DOMAIN,
  style: GEOMETRY_STYLE,
  substance: `
Point A, B, C, D, E, F
Segment ab := MkSeg(A, B)
Segment bc := MkSeg(B, C)
Segment cd := MkSeg(C, D)
Segment de := MkSeg(D, E)
Segment ea := MkSeg(E, A)
Segment bf := MkSeg(B, F)
PolyAngle(E, A, B)
PolyAngle(A, B, C)
PolyAngle(B, C, D)
PolyAngle(C, D, E)
PolyAngle(D, E, A)
SameRow(A, B)
SameRow(B, F)
IsLeftOf(A, B)
IsLeftOf(B, F)
AngleArc(C, B, F)
Label A "A"
Label B "B"
Label C "C"
Label D "D"
Label E "E"
Label F ""
`,
  variation: "polygon_exterior",
};


// 88. Tangent-secant from external point P: tangent PT (PT² = PA·PB)
export const TRIO_TANGENT_SECANT = {
  domain: GEOMETRY_DOMAIN,
  style: GEOMETRY_STYLE,
  substance: `
Point O, P, T, A, B
Segment pt := MkSeg(P, T)
Segment pa := MkSeg(P, A)
Segment ab := MkSeg(A, B)
RightAngle(O, T, P)
IsCenter(O)
OnCircle(T, O)
OnCircle(A, O)
OnCircle(B, O)
IsWellLeftOf(P, O)
SameRow(P, A)
SameRow(A, B)
IsLeftOf(P, A)
IsLeftOf(A, B)
IsCentered(O)
Label O "O"
Label P "P"
Label T "T"
Label A "A"
Label B "B"
`,
  variation: "tangent_secant",
};

// 89. Alternate interior angles: two parallel lines, transversal, arcs on opposite sides at P and Q
export const TRIO_ALTERNATE_INTERIOR = {
  domain: GEOMETRY_DOMAIN,
  style: GEOMETRY_STYLE,
  substance: `
Point A, P, B, C, Q, D
Segment ap := MkSeg(A, P)
Segment pb := MkSeg(P, B)
Segment cq := MkSeg(C, Q)
Segment qd := MkSeg(Q, D)
Segment pq := MkSeg(P, Q)
SameRow(A, P)
SameRow(P, B)
SameRow(C, Q)
SameRow(Q, D)
Separate(A, B)
Separate(C, D)
IsAbove(A, C)
IsAbove(P, Q)
IsLeftOf(A, B)
IsLeftOf(C, D)
IsLeftOf(P, Q)
Hidden(P)
Hidden(Q)
AngleArc(A, P, Q)
AngleArc(P, Q, D)
Label A ""
Label B ""
Label C ""
Label D ""
Label P ""
Label Q ""
`,
  variation: "alternate_interior",
};

// 90. Scale factor: two similar triangles with corresponding side labels a, b, c and ka, kb, kc
export const TRIO_SCALE_FACTOR = {
  domain: GEOMETRY_DOMAIN,
  style: GEOMETRY_STYLE,
  substance: `
Point A, B, C, D, E, F, U, X
Segment ab := MkSeg(A, B)
Segment bc := MkSeg(B, C)
Segment ca := MkSeg(C, A)
Segment de := MkSeg(D, E)
Segment ef := MkSeg(E, F)
Segment fd := MkSeg(F, D)
MidpointOf(U, A, B)
MidpointOf(X, D, E)
Hidden(U)
Hidden(X)
IsWellLeftOf(B, E)
IsWellLeftOf(A, D)
IsWellLeftOf(C, F)
IsAbove(C, A)
IsAbove(C, B)
IsAbove(F, D)
IsAbove(F, E)
IsLeftOf(A, B)
IsLeftOf(D, E)
Label A "A"
Label B "B"
Label C "C"
Label D "D"
Label E "E"
Label F "F"
Label U "a"
Label X "k·a"
`,
  variation: "scale_factor",
};

// ─── Chunk 9: Final set ─────────────────────────────────────────────────

// 91. Secant-secant from external point
export const TRIO_SECANT_SECANT = {
  domain: GEOMETRY_DOMAIN,
  style: GEOMETRY_STYLE,
  substance: `
Point O, E, A, B, C, D
Segment ea := MkSeg(E, A)
Segment ab := MkSeg(A, B)
Segment ec := MkSeg(E, C)
Segment cd := MkSeg(C, D)
IsCenter(O)
OnCircle(A, O)
OnCircle(B, O)
OnCircle(C, O)
OnCircle(D, O)
IsWellLeftOf(E, O)
IsAbove(A, E)
IsAbove(B, E)
IsCentered(O)
Label O "O"
Label E "E"
Label A "A"
Label B "B"
Label C "C"
Label D "D"
`,
  variation: "secant_secant",
};

// 92. Trapezoid with parallel bases

// 93. Kite quadrilateral

// 94. Slope triangle on coordinate plane

// 95. Rhombus with four equal sides

// 96. Power of a point: tangent and secant
export const TRIO_POWER_POINT = {
  domain: GEOMETRY_DOMAIN,
  style: GEOMETRY_STYLE,
  substance: `
Point O, E, A, B, C, T
Segment ea := MkSeg(E, A)
Segment eb := MkSeg(E, B)
Segment bc := MkSeg(B, C)
Segment et := MkSeg(E, T)
RightAngle(O, T, E)
IsCenter(O)
OnCircle(A, O)
OnCircle(B, O)
OnCircle(C, O)
OnCircle(T, O)
IsWellLeftOf(E, O)
IsAbove(A, E)
IsCentered(O)
Label O "O"
Label E "E"
Label A "A"
Label B "B"
Label C "C"
Label T "T"
`,
  variation: "power_point",
};
// Final 4 unique trios (avoiding name conflicts)

// 93. Trapezoid with parallel bases
export const TRIO_TRAPEZOID_BASES = {
  domain: GEOMETRY_DOMAIN,
  style: GEOMETRY_STYLE + `
    forall Point \`A\`; Point \`B\`; Point \`C\`; Point \`D\`; Point \`F\`; Point \`H\` {
      override \`D\`.dot.center = (-50, 60)
      override \`C\`.dot.center = (30, 60)
      override \`H\`.dot.center = (-20, 60)
      override \`A\`.dot.center = (-90, -60)
      override \`B\`.dot.center = (70, -60)
      override \`F\`.dot.center = (-20, -60)
    }
    forall Point \`H\` { \`H\`.lbl.center = \`H\`.dot.center + (0, 35) }
  `,
  substance: `
Point A, B, C, D, F, H
Segment ab := MkSeg(A, B)
Segment bc := MkSeg(B, C)
Segment cd := MkSeg(C, D)
Segment da := MkSeg(D, A)
Segment fh := MkSeg(F, H)
RightAngle(B, F, H)
Hidden(F)
Label A "A"
Label B "B"
Label C "C"
Label D "D"
Label H "h"
`,
  variation: "trapezoid_bases",
};

// 94. Kite quadrilateral
export const TRIO_KITE_QUADRILATERAL = {
  domain: GEOMETRY_DOMAIN,
  style: GEOMETRY_STYLE + `
    forall Point \`A\`; Point \`B\`; Point \`C\`; Point \`D\` {
      override \`A\`.dot.center = (0, 80)
      override \`B\`.dot.center = (50, 20)
      override \`C\`.dot.center = (0, -100)
      override \`D\`.dot.center = (-50, 20)
    }
  `,
  substance: `
Point A, B, C, D
Segment ab := MkSeg(A, B)
Segment bc := MkSeg(B, C)
Segment cd := MkSeg(C, D)
Segment da := MkSeg(D, A)
Tick(ab)
Tick(da)
DoubleTick(bc)
DoubleTick(cd)
Label A "A"
Label B "B"
Label C "C"
Label D "D"
`,
  variation: "kite_quadrilateral",
};

// 95. Slope triangle on coordinate plane  
export const TRIO_SLOPE_RISE_RUN = {
  domain: GEOMETRY_DOMAIN,
  style: GEOMETRY_STYLE + `
    forall Point \`P1\`; Point \`P2\`; Point \`P3\` {
      override \`P2\`.dot.center = (80, -60)
      override \`P1\`.dot.center = (-100, -60)
      override \`P3\`.dot.center = (80, 80)
    }
    forall Point \`M\` { \`M\`.lbl.center = \`M\`.dot.center + (0, -32) }
    forall Point \`N\` { \`N\`.lbl.center = \`N\`.dot.center + (80, 0) }
    forall Point \`W\` { \`W\`.lbl.center = \`W\`.dot.center + (-25, 35) }
  `,
  substance: `
Point P1, P2, P3, M, N, W
Segment p1p2 := MkSeg(P1, P2)
Segment p2p3 := MkSeg(P2, P3)
Segment p3p1 := MkSeg(P3, P1)
RightAngle(P3, P2, P1)
SameRow(P1, P2)
IsAbove(P3, P2)
MidpointOf(M, P1, P2)
MidpointOf(N, P2, P3)
MidpointOf(W, P3, P1)
Hidden(M)
Hidden(N)
Hidden(W)
Label P1 "(x₂, y₂)"
Label P2 ""
Label P3 "(x₁, y₁)"
Label M "run = x₂ − x₁"
Label N "rise = y₂ − y₁"
Label W "slope = rise / run"
`,
  variation: "slope_rise_run",
};

// 96. Rhombus with four equal sides
export const TRIO_RHOMBUS_SIDES = {
  domain: GEOMETRY_DOMAIN,
  style: GEOMETRY_STYLE + `
    forall Point \`A\`; Point \`B\`; Point \`C\`; Point \`D\` {
      override \`A\`.dot.center = (0, 70)
      override \`B\`.dot.center = (110, 0)
      override \`C\`.dot.center = (0, -70)
      override \`D\`.dot.center = (-110, 0)
    }
    forall Point \`P\` { \`P\`.lbl.center = \`P\`.dot.center + 25 * normalize(\`P\`.dot.center + (0.1, 0.1)) }
  `,
  substance: `
Point A, B, C, D
Segment ab := MkSeg(A, B)
Segment bc := MkSeg(B, C)
Segment cd := MkSeg(C, D)
Segment da := MkSeg(D, A)
Tick(ab)
Tick(bc)
Tick(cd)
Tick(da)
Label A "A"
Label B "B"
Label C "C"
Label D "D"
`,
  variation: "rhombus_sides",
};
