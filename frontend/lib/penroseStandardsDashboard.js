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
  TRIO_PROB_TREE,
  TRIO_SPANNING_TREE,
  TRIO_COMPLETE_K4,
  TRIO_BIPARTITE,
  TRIO_CYCLE_C6,
  TRIO_EXPR_TREE,
  TRIO_FOOD_WEB,
  TRIO_WEIGHTED_GRAPH,
  TRIO_HASSE_POSET,
  TRIO_FUNCTION_MAPPING,
  TRIO_IMPLICATION_CHAIN,
  TRIO_SEQUENCE_TERMS,
  TRIO_GEOMETRIC_SERIES,
  TRIO_TRIANGLE_LABELED,
  TRIO_RIGHT_TRIANGLE,
  TRIO_CONGRUENT_TRIANGLES,
  TRIO_SIMILAR_TRIANGLES,
  TRIO_QUADRILATERAL,
  TRIO_POLYGON_PENTAGON,
  TRIO_POLYGON_HEXAGON,
  TRIO_POLYGON_INTERIOR_ANGLES,
  TRIO_POLYGON_EXTERIOR,
  TRIO_TRIANGLE_MEDIAN,
  TRIO_ISOSCELES_TRIANGLE,
  TRIO_ANGLE_ARC,
  TRIO_RIGHT_TRIANGLE_345,
  TRIO_LAW_OF_COSINES,
  TRIO_LAW_OF_SINES,
  TRIO_VECTOR_ADDITION,
  TRIO_PARALLEL_TRANSVERSAL,
  TRIO_THREE_PARALLEL,
  TRIO_ALTERNATE_INTERIOR,
  TRIO_SPECIAL_30_60_90,
  TRIO_SPECIAL_45_45_90,
  TRIO_ANGLE_ELEVATION,
  TRIO_ANGLE_DEPRESSION,
  TRIO_TRIG_RATIOS,
  TRIO_CIRCLE_CHORD,
  TRIO_CENTRAL_INSCRIBED,
  TRIO_ARC_SECTOR,
  TRIO_TANGENT_CIRCLE,
  TRIO_TANGENT_SECANT,
  TRIO_CHORD_CHORD,
  TRIO_SECANT_EXTERNAL,
  TRIO_SECANT_SECANT,
  TRIO_POWER_POINT,
  TRIO_CYCLIC_QUADRILATERAL,
  TRIO_CIRCUMSCRIBED_TRIANGLE,
  TRIO_TRIANGLE_INCIRCLE,
  TRIO_PERPENDICULAR_BISECTOR,
  TRIO_PYTHAGOREAN_SQUARES,
  TRIO_GEOMETRIC_MEAN_ALTITUDE,
  TRIO_DISTANCE_FORMULA,
  TRIO_MIDPOINT_SEGMENT,
  TRIO_SEGMENT_ADDITION,
  TRIO_COMPLEMENTARY_ANGLES,
  TRIO_SUPPLEMENTARY_ANGLES,
  TRIO_VERTICAL_ANGLES,
  TRIO_EXTERIOR_ANGLE,
  TRIO_TRIANGLE_ALTITUDE,
  TRIO_MIDSEGMENT,
  TRIO_ANGLE_BISECTOR,
  TRIO_AA_SIMILARITY,
  TRIO_HL_CONGRUENCE,
  TRIO_ISOSCELES_TRAPEZOID,
  TRIO_DILATION,
  TRIO_SCALE_FACTOR,
  TRIO_PROPORTION_SEGMENTS,
  TRIO_TRANSLATION,
  TRIO_REFLECTION_LINE,
  TRIO_ROTATION,
  TRIO_LINE_SYMMETRY,
  TRIO_TRAPEZOID,
  TRIO_TRAPEZOID_BASES,
  TRIO_RHOMBUS,
  TRIO_RHOMBUS_SIDES,
  TRIO_KITE,
  TRIO_KITE_QUADRILATERAL,
  TRIO_SLOPE_TRIANGLE,
  TRIO_SLOPE_RISE_RUN,
  TRIO_COORDINATE_QUADRANTS,
  TRIO_NUMBER_LINE,
  TRIO_INEQUALITY_RAY,
  TRIO_UNIT_CIRCLE_POINT,
  TRIO_COTERMINAL_ANGLES,
  TRIO_BICONDITIONAL,
  TRIO_COMPOSITE_FUNCTION,
} from "./penroseTrios";

export const PENROSE_ARCHETYPES = {
  venn_notes: {
    id: "venn_notes",
    title: "Set relationships for notes",
    description: "Three-set overlap scaffold for union, intersection, and subset discussion.",
    trio: TRIO_VENN_3_ALL,
    tags: ["sets", "venn", "logic"],
  },
  euler_subset: {
    id: "euler_subset",
    title: "Subset / nesting notes",
    description: "Nested or disjoint set containment for definitions and symbolic statements.",
    trio: TRIO_EULER_SUBSET,
    tags: ["subset", "containment"],
  },
  venn_practice_intersect: {
    id: "venn_practice_intersect",
    title: "Venn practice: overlap case",
    description: "Two-set overlap prompt for region naming and basic probability or logic questions.",
    trio: TRIO_VENN_2_INTERSECT,
    tags: ["practice", "intersection"],
  },
  venn_practice_disjoint: {
    id: "venn_practice_disjoint",
    title: "Venn practice: disjoint case",
    description: "Two-set disjoint case for complement, union, and exclusivity questions.",
    trio: TRIO_VENN_2_DISJOINT,
    tags: ["practice", "disjoint"],
  },
  venn_logic: {
    id: "venn_logic",
    title: "Logic Venn",
    description: "Minimal P/Q logic picture for conditional or symbolic logic notes.",
    trio: TRIO_VENN_LOGIC,
    tags: ["logic", "symbols"],
  },
  graph_notes: {
    id: "graph_notes",
    title: "Basic graph theory notes",
    description: "Vertex-edge scaffold for degree, adjacency, and path vocabulary.",
    trio: TRIO_GRAPH_PENTAGON,
    tags: ["graph theory", "vertices", "edges"],
  },
  graph_tree: {
    id: "graph_tree",
    title: "Tree structure notes",
    description: "Rooted-tree layout for hierarchy, branching, and traversal examples.",
    trio: TRIO_GRAPH_TREE,
    tags: ["tree", "hierarchy"],
  },
  graph_digraph: {
    id: "graph_digraph",
    title: "Directed graph notes",
    description: "Directed edges for prerequisite flow, state changes, or dependency graphs.",
    trio: TRIO_DIGRAPH_DAG,
    tags: ["digraph", "directed"],
  },
  graph_practice_complete: {
    id: "graph_practice_complete",
    title: "Complete graph practice",
    description: "Dense graph for degree counts, handshaking, and adjacency questions.",
    trio: TRIO_COMPLETE_K4,
    tags: ["practice", "complete graph"],
  },
  graph_practice_spanning: {
    id: "graph_practice_spanning",
    title: "Spanning tree practice",
    description: "Lean tree specimen for connectedness and spanning-tree prompts.",
    trio: TRIO_SPANNING_TREE,
    tags: ["practice", "spanning tree"],
  },
  graph_practice_cycle: {
    id: "graph_practice_cycle",
    title: "Cycle graph practice",
    description: "Cycle layout for path length, cycles, and symmetry in graphs.",
    trio: TRIO_CYCLE_C6,
    tags: ["practice", "cycle"],
  },
  graph_practice_bipartite: {
    id: "graph_practice_bipartite",
    title: "Bipartite graph practice",
    description: "Partitioned graph for matching and bipartite vocabulary.",
    trio: TRIO_BIPARTITE,
    tags: ["practice", "bipartite"],
  },
  graph_expr_tree: {
    id: "graph_expr_tree",
    title: "Expression tree practice",
    description: "Operator tree for recursive structure and evaluation order.",
    trio: TRIO_EXPR_TREE,
    tags: ["practice", "expression tree"],
  },
  prob_tree: {
    id: "prob_tree",
    title: "Probability tree",
    description: "Branching event tree for independent-event probability setups.",
    trio: TRIO_PROB_TREE,
    tags: ["probability", "tree"],
  },
  congruence_notes: {
    id: "congruence_notes",
    title: "Triangle congruence notes",
    description: "Side-marked pair for SSS, SAS, ASA, AAS, and HL conversations.",
    trio: TRIO_CONGRUENT_TRIANGLES,
    tags: ["triangle congruence", "proof"],
  },
  congruence_practice: {
    id: "congruence_practice",
    title: "Congruence practice triangle",
    description: "Clean isosceles or right-triangle prompt for proving or solving side relationships.",
    trio: TRIO_ISOSCELES_TRIANGLE,
    tags: ["practice", "triangle"],
  },
  similarity_notes: {
    id: "similarity_notes",
    title: "Triangle similarity notes",
    description: "Two upright triangles for AA, SAS, and SSS similarity discussions.",
    trio: TRIO_SIMILAR_TRIANGLES,
    tags: ["triangle similarity", "proportions"],
  },
  similarity_practice: {
    id: "similarity_practice",
    title: "Similarity practice",
    description: "Use the same shape scaffold for side-ratio and dilation-style questions.",
    trio: TRIO_SIMILAR_TRIANGLES,
    tags: ["practice", "dilation"],
  },
  right_triangle_notes: {
    id: "right_triangle_notes",
    title: "Right triangle notes",
    description: "Canonical right triangle for trig ratios, side naming, and angle relationships.",
    trio: TRIO_RIGHT_TRIANGLE,
    tags: ["right triangle", "trig"],
  },
  right_triangle_practice: {
    id: "right_triangle_practice",
    title: "3-4-5 right triangle practice",
    description: "Problem-style triangle with numeric side labels and unknown angle marker.",
    trio: TRIO_RIGHT_TRIANGLE_345,
    tags: ["practice", "3-4-5", "pythagorean"],
  },
  law_cosines_practice: {
    id: "law_cosines_practice",
    title: "Law of Cosines practice",
    description: "Oblique triangle with three known sides for solving a missing angle.",
    trio: TRIO_LAW_OF_COSINES,
    tags: ["practice", "law of cosines"],
  },
  law_sines_practice: {
    id: "law_sines_practice",
    title: "Law of Sines practice",
    description: "Oblique triangle with known angles and a known side for side-finding prompts.",
    trio: TRIO_LAW_OF_SINES,
    tags: ["practice", "law of sines"],
  },
  triangle_notes: {
    id: "triangle_notes",
    title: "Generic triangle notes",
    description: "Base triangle archetype for labeling sides, angles, and structural relationships.",
    trio: TRIO_TRIANGLE_LABELED,
    tags: ["triangle", "foundation"],
  },
  triangle_median: {
    id: "triangle_median",
    title: "Median / midpoint notes",
    description: "Midpoint-marked triangle for median, bisector, and segment reasoning.",
    trio: TRIO_TRIANGLE_MEDIAN,
    tags: ["median", "midpoint"],
  },
  angle_arc: {
    id: "angle_arc",
    title: "Angle arc notes",
    description: "Single highlighted angle for interior-angle or included-angle discussion.",
    trio: TRIO_ANGLE_ARC,
    tags: ["angle", "arc"],
  },
  polygon_notes_quad: {
    id: "polygon_notes_quad",
    title: "Quadrilateral notes",
    description: "Four-sided scaffold for quadrilateral classification and markings.",
    trio: TRIO_QUADRILATERAL,
    tags: ["quadrilateral", "polygon"],
  },
  polygon_notes_pent: {
    id: "polygon_notes_pent",
    title: "Pentagon notes",
    description: "Convex polygon scaffold for interior and exterior angle-sum work.",
    trio: TRIO_POLYGON_PENTAGON,
    tags: ["pentagon", "interior angles"],
  },
  polygon_notes_hex: {
    id: "polygon_notes_hex",
    title: "Hexagon notes",
    description: "Regular-looking six-sided scaffold for symmetry and angle-sum discussion.",
    trio: TRIO_POLYGON_HEXAGON,
    tags: ["hexagon", "symmetry"],
  },
  vector_notes: {
    id: "vector_notes",
    title: "Vector addition notes",
    description: "Tip-to-tail vector picture for operations, magnitude, and resultant direction.",
    trio: TRIO_VECTOR_ADDITION,
    tags: ["vectors", "addition"],
  },
  // ── Parallel lines ──────────────────────────────────────────────────────
  parallel_notes: {
    id: "parallel_notes",
    title: "Parallel lines notes",
    description: "Two parallel lines cut by a transversal for angle-pair discussion.",
    trio: TRIO_PARALLEL_TRANSVERSAL,
    tags: ["parallel lines", "transversal"],
  },
  parallel_practice: {
    id: "parallel_practice",
    title: "Alternate interior angles practice",
    description: "Two parallel lines with transversal; identify and solve angle pairs.",
    trio: TRIO_ALTERNATE_INTERIOR,
    tags: ["practice", "alternate interior"],
  },
  three_parallel: {
    id: "three_parallel",
    title: "Three parallel lines practice",
    description: "Three parallel lines cut by transversal for proportional segment reasoning.",
    trio: TRIO_THREE_PARALLEL,
    tags: ["practice", "parallel lines", "transversal"],
  },
  // ── Circle theorems ──────────────────────────────────────────────────────
  circle_notes: {
    id: "circle_notes",
    title: "Circle chord notes",
    description: "Circle with center, two radii and chord AB for basic circle vocabulary.",
    trio: TRIO_CIRCLE_CHORD,
    tags: ["circle", "chord", "radius"],
  },
  central_inscribed: {
    id: "central_inscribed",
    title: "Central vs inscribed angle",
    description: "Circle showing central angle AOB and inscribed angle ACB on the arc.",
    trio: TRIO_CENTRAL_INSCRIBED,
    tags: ["circle", "central angle", "inscribed angle"],
  },
  arc_sector: {
    id: "arc_sector",
    title: "Arc and sector",
    description: "Circle sector with central angle and radius label for arc-length and area.",
    trio: TRIO_ARC_SECTOR,
    tags: ["circle", "arc", "sector"],
  },
  tangent_notes: {
    id: "tangent_notes",
    title: "Tangent to circle notes",
    description: "Circle with radius OT and tangent line perpendicular at T.",
    trio: TRIO_TANGENT_CIRCLE,
    tags: ["circle", "tangent"],
  },
  tangent_secant: {
    id: "tangent_secant",
    title: "Tangent-secant practice",
    description: "External point with tangent and secant for power-of-a-point practice.",
    trio: TRIO_TANGENT_SECANT,
    tags: ["practice", "tangent", "secant"],
  },
  chord_chord: {
    id: "chord_chord",
    title: "Intersecting chords practice",
    description: "Two chords crossing inside a circle for chord-angle and segment product problems.",
    trio: TRIO_CHORD_CHORD,
    tags: ["practice", "chord", "circle"],
  },
  secant_external: {
    id: "secant_external",
    title: "Secant from external point",
    description: "Secant from E through circle at A and B for segment length problems.",
    trio: TRIO_SECANT_EXTERNAL,
    tags: ["practice", "secant", "circle"],
  },
  power_point: {
    id: "power_point",
    title: "Power of a point practice",
    description: "Tangent and secant from external point for EA² = EB·EC problems.",
    trio: TRIO_POWER_POINT,
    tags: ["practice", "power of a point"],
  },
  cyclic_quad: {
    id: "cyclic_quad",
    title: "Cyclic quadrilateral",
    description: "Quadrilateral inscribed in a circle (opposite angles sum to 180°).",
    trio: TRIO_CYCLIC_QUADRILATERAL,
    tags: ["circle", "cyclic", "quadrilateral"],
  },
  circumscribed_tri: {
    id: "circumscribed_tri",
    title: "Circumscribed circle",
    description: "Triangle inscribed in its circumscribed circle for circumcenter discussion.",
    trio: TRIO_CIRCUMSCRIBED_TRIANGLE,
    tags: ["circle", "circumscribed"],
  },
  incircle: {
    id: "incircle",
    title: "Inscribed circle (incircle)",
    description: "Triangle with inscribed circle touching all three sides at I.",
    trio: TRIO_TRIANGLE_INCIRCLE,
    tags: ["circle", "incircle", "inscribed"],
  },
  // ── Angle pairs ──────────────────────────────────────────────────────────
  supplementary_notes: {
    id: "supplementary_notes",
    title: "Supplementary angles",
    description: "Ray OC dividing straight line AB into α + β = 180°.",
    trio: TRIO_SUPPLEMENTARY_ANGLES,
    tags: ["supplementary", "angles"],
  },
  complementary_notes: {
    id: "complementary_notes",
    title: "Complementary angles",
    description: "Right-angle corner subdivided into α + β = 90°.",
    trio: TRIO_COMPLEMENTARY_ANGLES,
    tags: ["complementary", "angles"],
  },
  vertical_angles: {
    id: "vertical_angles",
    title: "Vertical angles",
    description: "Two lines crossing at O with four angle arcs marking all pairs.",
    trio: TRIO_VERTICAL_ANGLES,
    tags: ["vertical angles"],
  },
  exterior_angle: {
    id: "exterior_angle",
    title: "Exterior angle theorem",
    description: "Exterior angle ∠CBD equals sum of two remote interior angles.",
    trio: TRIO_EXTERIOR_ANGLE,
    tags: ["exterior angle", "triangle"],
  },
  // ── Triangle properties ──────────────────────────────────────────────────
  altitude_notes: {
    id: "altitude_notes",
    title: "Altitude to hypotenuse",
    description: "Right triangle with altitude from C creating two similar sub-triangles.",
    trio: TRIO_TRIANGLE_ALTITUDE,
    tags: ["altitude", "triangle"],
  },
  geometric_mean_alt: {
    id: "geometric_mean_alt",
    title: "Geometric mean altitude",
    description: "Altitude to hypotenuse creating geometric mean relationship CD² = AD·DB.",
    trio: TRIO_GEOMETRIC_MEAN_ALTITUDE,
    tags: ["geometric mean", "altitude"],
  },
  midsegment: {
    id: "midsegment",
    title: "Triangle midsegment",
    description: "Midsegment MN connecting midpoints of two sides, parallel to third side.",
    trio: TRIO_MIDSEGMENT,
    tags: ["midsegment", "triangle"],
  },
  angle_bisector_notes: {
    id: "angle_bisector_notes",
    title: "Angle bisector",
    description: "Bisector from A to D on BC with two equal angle arcs at A.",
    trio: TRIO_ANGLE_BISECTOR,
    tags: ["bisector", "triangle"],
  },
  perp_bisector: {
    id: "perp_bisector",
    title: "Perpendicular bisector",
    description: "Segment AB with perpendicular bisector through midpoint M.",
    trio: TRIO_PERPENDICULAR_BISECTOR,
    tags: ["perpendicular bisector", "midpoint"],
  },
  pythagorean_notes: {
    id: "pythagorean_notes",
    title: "Pythagorean theorem diagram",
    description: "Right triangle with sides labeled a², b², c² showing the theorem.",
    trio: TRIO_PYTHAGOREAN_SQUARES,
    tags: ["pythagorean", "right triangle"],
  },
  // ── Trig / special triangles ─────────────────────────────────────────────
  trig_ratios: {
    id: "trig_ratios",
    title: "Trig ratio diagram",
    description: "Right triangle with opp/adj/hyp labels and angle θ at vertex A.",
    trio: TRIO_TRIG_RATIOS,
    tags: ["trig", "ratios", "sin", "cos", "tan"],
  },
  special_30_60_90: {
    id: "special_30_60_90",
    title: "30-60-90 triangle",
    description: "Special right triangle with sides labeled x, x√3, 2x.",
    trio: TRIO_SPECIAL_30_60_90,
    tags: ["special right triangle", "30-60-90"],
  },
  special_45_45_90: {
    id: "special_45_45_90",
    title: "45-45-90 triangle",
    description: "Isosceles right triangle with sides labeled x, x, x√2.",
    trio: TRIO_SPECIAL_45_45_90,
    tags: ["special right triangle", "45-45-90"],
  },
  angle_elevation: {
    id: "angle_elevation",
    title: "Angle of elevation",
    description: "Right triangle showing angle of elevation from observer O to object T.",
    trio: TRIO_ANGLE_ELEVATION,
    tags: ["angle of elevation", "trig"],
  },
  angle_depression: {
    id: "angle_depression",
    title: "Angle of depression",
    description: "Right triangle showing angle of depression for contextual trig problems.",
    trio: TRIO_ANGLE_DEPRESSION,
    tags: ["angle of depression", "trig"],
  },
  unit_circle: {
    id: "unit_circle",
    title: "Unit circle point",
    description: "Unit circle with point P labeled (cos θ, sin θ) and right-angle drop.",
    trio: TRIO_UNIT_CIRCLE_POINT,
    tags: ["unit circle", "trig"],
  },
  coterminal: {
    id: "coterminal",
    title: "Coterminal angles",
    description: "Two rays from origin showing positive θ and negative −θ.",
    trio: TRIO_COTERMINAL_ANGLES,
    tags: ["coterminal", "angles"],
  },
  // ── Transformations ──────────────────────────────────────────────────────
  dilation_notes: {
    id: "dilation_notes",
    title: "Dilation notes",
    description: "Two similar triangles with tick marks showing proportional sides.",
    trio: TRIO_DILATION,
    tags: ["dilation", "similar"],
  },
  scale_factor: {
    id: "scale_factor",
    title: "Scale factor diagram",
    description: "Two similar triangles with sides labeled a and k·a.",
    trio: TRIO_SCALE_FACTOR,
    tags: ["scale factor", "dilation"],
  },
  proportion_segs: {
    id: "proportion_segs",
    title: "Proportional segments",
    description: "Parallel-segment proportionality setup for solving unknown lengths.",
    trio: TRIO_PROPORTION_SEGMENTS,
    tags: ["proportion", "segments", "similarity"],
  },
  translation_notes: {
    id: "translation_notes",
    title: "Translation diagram",
    description: "Triangle ABC shifted to A'B'C' showing a rigid translation.",
    trio: TRIO_TRANSLATION,
    tags: ["translation", "transformation"],
  },
  reflection_notes: {
    id: "reflection_notes",
    title: "Reflection diagram",
    description: "Triangle and its mirror image A'B'C' over a vertical axis.",
    trio: TRIO_REFLECTION_LINE,
    tags: ["reflection", "transformation"],
  },
  rotation_notes: {
    id: "rotation_notes",
    title: "Rotation diagram",
    description: "Triangle and rotated image with arc showing the rotation at O.",
    trio: TRIO_ROTATION,
    tags: ["rotation", "transformation"],
  },
  symmetry_notes: {
    id: "symmetry_notes",
    title: "Line of symmetry",
    description: "Isosceles triangle with vertical axis of symmetry.",
    trio: TRIO_LINE_SYMMETRY,
    tags: ["symmetry", "reflection"],
  },
  // ── Quadrilaterals ───────────────────────────────────────────────────────
  trapezoid_notes: {
    id: "trapezoid_notes",
    title: "Trapezoid with height",
    description: "Trapezoid with two parallel bases and height h marked.",
    trio: TRIO_TRAPEZOID_BASES,
    tags: ["trapezoid", "quadrilateral"],
  },
  rhombus_notes: {
    id: "rhombus_notes",
    title: "Rhombus",
    description: "Quadrilateral with four equal sides marked with tick marks.",
    trio: TRIO_RHOMBUS_SIDES,
    tags: ["rhombus", "quadrilateral"],
  },
  kite_notes: {
    id: "kite_notes",
    title: "Kite quadrilateral",
    description: "Kite with two pairs of adjacent equal sides.",
    trio: TRIO_KITE_QUADRILATERAL,
    tags: ["kite", "quadrilateral"],
  },
  // ── Coordinate / number sense ────────────────────────────────────────────
  number_line: {
    id: "number_line",
    title: "Number line",
    description: "Five labeled integer points on a horizontal number line.",
    trio: TRIO_NUMBER_LINE,
    tags: ["number line", "integers"],
  },
  inequality_ray: {
    id: "inequality_ray",
    title: "Inequality ray",
    description: "Number-line ray from point a showing x > a.",
    trio: TRIO_INEQUALITY_RAY,
    tags: ["inequality", "number line"],
  },
  distance_formula: {
    id: "distance_formula",
    title: "Distance formula diagram",
    description: "Right triangle on a grid with legs Δx, Δy and hypotenuse d.",
    trio: TRIO_DISTANCE_FORMULA,
    tags: ["distance formula", "coordinate"],
  },
  midpoint_notes: {
    id: "midpoint_notes",
    title: "Midpoint of segment",
    description: "Segment AB with midpoint M and equal tick marks.",
    trio: TRIO_MIDPOINT_SEGMENT,
    tags: ["midpoint", "segment"],
  },
  coord_quadrants: {
    id: "coord_quadrants",
    title: "Coordinate plane quadrants",
    description: "x/y axes with Q I–IV labeled.",
    trio: TRIO_COORDINATE_QUADRANTS,
    tags: ["coordinate plane", "quadrants"],
  },
  slope_notes: {
    id: "slope_notes",
    title: "Slope rise/run diagram",
    description: "Right triangle showing rise and run for slope calculation.",
    trio: TRIO_SLOPE_RISE_RUN,
    tags: ["slope", "rise", "run"],
  },
  // ── Sequences / discrete ─────────────────────────────────────────────────
  sequence_notes: {
    id: "sequence_notes",
    title: "Arithmetic sequence diagram",
    description: "Terms a₁→a₂→a₃→a₄→a₅ connected by +d arrows.",
    trio: TRIO_SEQUENCE_TERMS,
    tags: ["sequence", "arithmetic"],
  },
  geometric_series: {
    id: "geometric_series",
    title: "Geometric sequence diagram",
    description: "Terms showing multiplicative ratio r between consecutive terms.",
    trio: TRIO_GEOMETRIC_SERIES,
    tags: ["sequence", "geometric"],
  },
  hasse_poset: {
    id: "hasse_poset",
    title: "Hasse diagram (partial order)",
    description: "Diamond partial order ⊥ < {b,c} < ⊤ for lattice/poset discussion.",
    trio: TRIO_HASSE_POSET,
    tags: ["partial order", "Hasse", "discrete math"],
  },
  function_mapping: {
    id: "function_mapping",
    title: "Function mapping diagram",
    description: "Directed bipartite graph f: {a,b,c} → {p,q,r} for domain/range discussion.",
    trio: TRIO_FUNCTION_MAPPING,
    tags: ["function", "mapping", "domain", "range"],
  },
  implication_chain: {
    id: "implication_chain",
    title: "Implication chain p→q→r",
    description: "Three-node directed chain for logical implication and transitivity.",
    trio: TRIO_IMPLICATION_CHAIN,
    tags: ["logic", "implication"],
  },
  biconditional: {
    id: "biconditional",
    title: "Biconditional relationship",
    description: "Two-way implication p↔q for if-and-only-if reasoning.",
    trio: TRIO_BICONDITIONAL,
    tags: ["biconditional", "logic"],
  },
};

export const PENROSE_TOPIC_RULES = [
  {
    id: "sets_logic",
    label: "Sets / Venn diagrams",
    courseIncludes: ["Geometry", "Discrete Mathematics", "Probability and Statistics", "Algebra Functions Data Analysis", "Grade 8 Math"],
    includeTerms: ["venn diagrams", "venn diagram", "set relationships", "properties of sets", "set operations", "subsets of the real number system", "conditional statements using venn diagrams"],
    excludeTerms: ["two-way tables", "picture graphs", "object graphs"],
    noteArchetypeIds: ["venn_notes", "euler_subset"],
    practiceArchetypeIds: ["venn_practice_intersect", "venn_practice_disjoint", "venn_logic"],
  },
  {
    id: "probability_trees",
    label: "Probability trees",
    courseIncludes: ["Probability and Statistics", "Algebra Functions Data Analysis", "Discrete Mathematics", "Grade 5 Math", "Grade 8 Math"],
    includeTerms: ["tree diagrams", "tree diagram", "independent events", "counting principle"],
    excludeTerms: ["two-way tables"],
    noteArchetypeIds: ["prob_tree"],
    practiceArchetypeIds: ["prob_tree"],
  },
  {
    id: "graph_theory",
    label: "Graph theory",
    courseIncludes: ["Discrete Mathematics"],
    includeTerms: ["graph theory", "directed graph", "digraph", "spanning tree", "adjacency", "hamilton", "euler path", "euler circuit", "graph coloring", "matching"],
    excludeTerms: ["bar graph", "line graph", "scatter plot", "graphing technology", "graph trigonometric"],
    noteArchetypeIds: ["graph_notes", "graph_tree", "graph_digraph"],
    practiceArchetypeIds: ["graph_practice_complete", "graph_practice_spanning", "graph_practice_cycle", "graph_practice_bipartite", "graph_expr_tree"],
  },
  {
    id: "triangle_congruence",
    label: "Triangle congruence",
    courseIncludes: ["Geometry"],
    includeTerms: ["triangle congruence", "triangles are congruent", "sss", "sas", "asa", "aas", "hl"],
    noteArchetypeIds: ["congruence_notes"],
    practiceArchetypeIds: ["congruence_practice", "right_triangle_practice"],
  },
  {
    id: "triangle_similarity",
    label: "Triangle similarity / dilation",
    courseIncludes: ["Geometry", "Grade 7 Math"],
    includeTerms: ["triangle similarity", "triangles are similar", "similar triangles", "aa", "dilation", "scale factor", "scale drawings"],
    excludeTerms: ["graphing technology"],
    noteArchetypeIds: ["similarity_notes", "dilation_notes", "scale_factor"],
    practiceArchetypeIds: ["similarity_practice", "dilation_notes", "proportion_segs"],
  },
  {
    id: "triangle_relations",
    label: "Triangle side / angle relationships",
    courseIncludes: ["Geometry"],
    includeTerms: ["triangle could be formed", "range of the third side", "order the sides of a triangle", "order the angles of a triangle", "interior and exterior angles of a triangle"],
    noteArchetypeIds: ["triangle_notes", "angle_arc", "triangle_median"],
    practiceArchetypeIds: ["triangle_notes", "right_triangle_practice"],
  },
  {
    id: "right_triangle_trig",
    label: "Right triangles / trig ratios",
    courseIncludes: ["Geometry", "Trigonometry", "Grade 8 Math", "Grade 5 Math"],
    includeTerms: ["right triangle", "right triangles", "trigonometric ratios", "pythagorean theorem", "special right triangles", "angles of elevation", "angles of depression"],
    excludeTerms: ["unit circle", "circular trigonometry", "radian", "arc length", "sector area", "coterminal", "equations of circles", "circle", "circles"],
    noteArchetypeIds: ["right_triangle_notes", "angle_arc", "trig_ratios", "pythagorean_notes"],
    practiceArchetypeIds: ["right_triangle_practice", "special_30_60_90", "special_45_45_90", "angle_elevation"],
  },
  {
    id: "law_sines_cosines",
    label: "Law of Sines / Cosines",
    courseIncludes: ["Trigonometry"],
    includeTerms: ["law of sines", "law of cosines", "non-right triangle", "triangle area", "ambiguous case"],
    noteArchetypeIds: ["triangle_notes", "angle_arc"],
    practiceArchetypeIds: ["law_cosines_practice", "law_sines_practice"],
  },
  {
    id: "polygons_quadrilaterals",
    label: "Polygons / quadrilaterals",
    courseIncludes: ["Geometry", "Grade 2 Math", "Grade 3 Math", "Grade 4 Math", "Grade 5 Math", "Grade 6 Math", "Grade 7 Math", "Grade 8 Math", "Kindergarten Math"],
    includeTerms: ["quadrilateral", "quadrilaterals", "polygon", "polygons", "interior angles", "exterior angles", "regular polygons", "convex polygons", "parallelogram", "trapezoid", "rhombi", "rectangle", "rectangles"],
    excludeTerms: ["least squares", "perfect squares", "circle", "circles", "surface area", "volume", "solid figures", "coordinate plane", "triangle", "triangles", "parallel lines", "transversal"],
    noteArchetypeIds: ["polygon_notes_quad", "polygon_notes_pent", "polygon_notes_hex"],
    practiceArchetypeIds: ["polygon_notes_quad", "polygon_notes_pent"],
  },
  {
    id: "figure_symmetry",
    label: "Figure symmetry",
    courseIncludes: ["Geometry", "Grade 2 Math", "Grade 6 Math"],
    includeTerms: ["line of symmetry", "lines of symmetry", "point symmetry", "figure symmetry"],
    excludeTerms: ["function symmetry", "even functions", "odd functions", "polynomial symmetry"],
    noteArchetypeIds: ["polygon_notes_hex", "polygon_notes_pent"],
    practiceArchetypeIds: ["polygon_notes_hex"],
  },
  {
    id: "vectors",
    label: "Vectors",
    courseIncludes: ["Mathematical Analysis"],
    includeTerms: ["vector notation", "vector representation", "vector addition", "vector subtraction", "scalar multiplication", "dot product", "orthogonal vectors", "angle between vectors"],
    excludeTerms: ["matrices", "polar equations"],
    noteArchetypeIds: ["vector_notes"],
    practiceArchetypeIds: ["vector_notes"],
  },
  // ── NEW RULES ──────────────────────────────────────────────────────────────
  {
    id: "parallel_lines_transversal",
    label: "Parallel lines / transversal",
    courseIncludes: ["Geometry", "Grade 7 Math", "Grade 8 Math"],
    includeTerms: ["parallel lines", "transversal", "alternate interior angles", "alternate exterior angles", "corresponding angles", "co-interior angles", "consecutive interior angles", "same-side interior"],
    excludeTerms: ["parallel vectors", "number line"],
    noteArchetypeIds: ["parallel_notes"],
    practiceArchetypeIds: ["parallel_practice", "three_parallel"],
  },
  {
    id: "angle_pairs",
    label: "Angle pairs (supplementary / complementary / vertical)",
    courseIncludes: ["Geometry", "Grade 7 Math", "Grade 8 Math"],
    includeTerms: ["supplementary", "complementary", "vertical angles", "linear pair", "adjacent angles", "angle relationships", "angle pairs"],
    excludeTerms: ["triangle inequality", "polygon interior"],
    noteArchetypeIds: ["supplementary_notes", "complementary_notes", "vertical_angles"],
    practiceArchetypeIds: ["supplementary_notes", "complementary_notes", "vertical_angles"],
  },
  {
    id: "triangle_properties",
    label: "Triangle properties (altitude, bisector, midsegment)",
    courseIncludes: ["Geometry"],
    includeTerms: ["altitude", "angle bisector", "median", "midsegment", "midpoint", "perpendicular bisector", "triangle", "centroid", "orthocenter", "incenter", "circumcenter"],
    excludeTerms: ["trigonometric", "similar triangles", "congruent"],
    noteArchetypeIds: ["altitude_notes", "midsegment", "angle_bisector_notes", "perp_bisector"],
    practiceArchetypeIds: ["altitude_notes", "midsegment"],
  },
  {
    id: "pythagorean_theorem",
    label: "Pythagorean theorem",
    courseIncludes: ["Geometry", "Grade 8 Math", "Grade 7 Math", "Grade 6 Math"],
    includeTerms: ["pythagorean theorem", "pythagorean triple", "pythagorean relationship", "legs of a right triangle", "hypotenuse"],
    excludeTerms: ["trigonometric ratios", "law of sines", "law of cosines"],
    noteArchetypeIds: ["pythagorean_notes", "right_triangle_notes"],
    practiceArchetypeIds: ["pythagorean_notes", "right_triangle_practice", "geometric_mean_alt"],
  },
  {
    id: "special_right_triangles",
    label: "Special right triangles (30-60-90, 45-45-90)",
    courseIncludes: ["Geometry", "Trigonometry"],
    includeTerms: ["special right triangles", "30-60-90", "45-45-90", "30°-60°-90°", "45°-45°-90°", "isosceles right triangle", "equilateral triangle half"],
    noteArchetypeIds: ["special_30_60_90", "special_45_45_90"],
    practiceArchetypeIds: ["special_30_60_90", "special_45_45_90"],
  },
  {
    id: "right_triangle_trig_expanded",
    label: "Trig ratios / elevation / depression",
    courseIncludes: ["Geometry", "Trigonometry"],
    includeTerms: ["trigonometric ratios", "sine", "cosine", "tangent", "secant", "cosecant", "cotangent", "angle of elevation", "angle of depression", "solving right triangles", "right triangle trigonometry"],
    excludeTerms: ["unit circle", "radian", "arc length", "law of sines", "law of cosines"],
    noteArchetypeIds: ["trig_ratios", "right_triangle_notes"],
    practiceArchetypeIds: ["trig_ratios", "angle_elevation", "angle_depression"],
  },
  {
    id: "unit_circle_trig",
    label: "Unit circle / coterminal angles",
    courseIncludes: ["Trigonometry", "Mathematical Analysis", "Algebra, Functions, and Data Analysis"],
    includeTerms: ["unit circle", "coterminal angles", "coterminal", "reference angle", "circular trigonometry", "radian measure", "radian", "general angle"],
    noteArchetypeIds: ["unit_circle", "coterminal"],
    practiceArchetypeIds: ["unit_circle", "coterminal"],
  },
  {
    id: "circle_theorems",
    label: "Circle theorems (arcs, chords, tangents, secants)",
    courseIncludes: ["Geometry"],
    includeTerms: ["arc", "chord", "tangent", "secant", "central angle", "inscribed angle", "arc length", "sector", "circle theorems", "power of a point", "intersecting chords", "angle formed by", "segments from external"],
    excludeTerms: ["area of a circle", "circumference", "diameter", "radius", "unit circle", "trigonometric"],
    noteArchetypeIds: ["circle_notes", "central_inscribed", "arc_sector"],
    practiceArchetypeIds: ["tangent_notes", "tangent_secant", "chord_chord", "secant_external", "power_point"],
  },
  {
    id: "inscribed_circumscribed_circles",
    label: "Inscribed / circumscribed circles",
    courseIncludes: ["Geometry"],
    includeTerms: ["inscribed circle", "circumscribed circle", "incircle", "circumcircle", "incenter", "circumcenter", "cyclic quadrilateral", "inscribed quadrilateral"],
    noteArchetypeIds: ["incircle", "circumscribed_tri", "cyclic_quad"],
    practiceArchetypeIds: ["incircle", "cyclic_quad"],
  },
  {
    id: "transformations_rigid",
    label: "Rigid transformations (translation, reflection, rotation)",
    courseIncludes: ["Geometry", "Grade 6 Math", "Grade 7 Math", "Grade 8 Math"],
    includeTerms: ["translation", "reflection", "rotation", "rigid motion", "rigid transformation", "isometry", "congruence transformation", "image", "preimage"],
    excludeTerms: ["dilation", "scale factor", "similar"],
    noteArchetypeIds: ["translation_notes", "reflection_notes", "rotation_notes"],
    practiceArchetypeIds: ["translation_notes", "reflection_notes", "rotation_notes", "symmetry_notes"],
  },
  {
    id: "transformations_dilation",
    label: "Dilations / similarity transformations",
    courseIncludes: ["Geometry", "Grade 7 Math", "Grade 8 Math"],
    includeTerms: ["dilation", "scale factor", "similarity transformation", "center of dilation", "proportion", "proportional sides"],
    noteArchetypeIds: ["dilation_notes", "scale_factor"],
    practiceArchetypeIds: ["dilation_notes", "scale_factor", "proportion_segs"],
  },
  {
    id: "quadrilaterals_properties",
    label: "Quadrilateral properties (trapezoid, rhombus, kite)",
    courseIncludes: ["Geometry", "Grade 3 Math", "Grade 4 Math", "Grade 5 Math"],
    includeTerms: ["trapezoid", "rhombus", "kite", "parallelogram", "rectangle", "square", "quadrilateral properties", "diagonals"],
    excludeTerms: ["interior angles sum", "polygon general"],
    noteArchetypeIds: ["trapezoid_notes", "rhombus_notes", "kite_notes"],
    practiceArchetypeIds: ["trapezoid_notes", "rhombus_notes"],
  },
  {
    id: "coordinate_geometry",
    label: "Coordinate geometry (distance, midpoint, slope)",
    courseIncludes: ["Geometry", "Algebra 1", "Algebra 2", "Grade 6 Math", "Grade 7 Math", "Grade 8 Math"],
    includeTerms: ["distance formula", "midpoint formula", "midpoint", "coordinate plane", "slope", "distance between two points", "graphing linear", "coordinate geometry"],
    excludeTerms: ["trigonometric", "number line"],
    noteArchetypeIds: ["distance_formula", "midpoint_notes", "slope_notes", "coord_quadrants"],
    practiceArchetypeIds: ["distance_formula", "midpoint_notes", "slope_notes"],
  },
  {
    id: "number_line_inequalities",
    label: "Number line / inequalities",
    courseIncludes: ["Algebra 1", "Grade 6 Math", "Grade 7 Math", "Grade 8 Math", "Kindergarten Math", "Grade 1 Math", "Grade 2 Math"],
    includeTerms: ["number line", "inequality", "inequalities", "integers", "ordering", "comparing", "absolute value"],
    excludeTerms: ["coordinate plane", "graphing linear"],
    noteArchetypeIds: ["number_line", "inequality_ray"],
    practiceArchetypeIds: ["number_line", "inequality_ray"],
  },
  {
    id: "sequences_series",
    label: "Sequences and series (arithmetic, geometric)",
    courseIncludes: ["Algebra 2", "Mathematical Analysis", "Discrete Mathematics", "Grade 5 Math", "Grade 6 Math"],
    includeTerms: ["arithmetic sequence", "geometric sequence", "arithmetic series", "geometric series", "common difference", "common ratio", "recursive", "explicit formula", "sequences", "series"],
    noteArchetypeIds: ["sequence_notes", "geometric_series"],
    practiceArchetypeIds: ["sequence_notes", "geometric_series"],
  },
  {
    id: "functions_mapping",
    label: "Functions / domain / range",
    courseIncludes: ["Algebra 1", "Algebra 2", "Grade 8 Math", "Discrete Mathematics"],
    includeTerms: ["function", "functions", "domain", "range", "input", "output", "mapping", "arrow diagram", "one-to-one", "onto", "bijection", "function notation"],
    excludeTerms: ["trigonometric functions", "inverse trig", "exponential functions"],
    noteArchetypeIds: ["function_mapping"],
    practiceArchetypeIds: ["function_mapping"],
  },
  {
    id: "logic_proofs",
    label: "Logic / conditionals / proofs",
    courseIncludes: ["Geometry", "Discrete Mathematics"],
    includeTerms: ["conditional statement", "converse", "inverse", "contrapositive", "biconditional", "if and only if", "logical equivalence", "implication", "chain rule", "law of syllogism", "law of detachment"],
    noteArchetypeIds: ["implication_chain", "biconditional"],
    practiceArchetypeIds: ["implication_chain", "biconditional"],
  },
  {
    id: "polygon_exterior_angles",
    label: "Polygon exterior angles",
    courseIncludes: ["Geometry"],
    includeTerms: ["exterior angles of a polygon", "sum of exterior angles", "exterior angle of a regular polygon"],
    excludeTerms: ["exterior angle of a triangle"],
    noteArchetypeIds: ["polygon_notes_quad"],
    practiceArchetypeIds: ["polygon_notes_pent"],
  },
];

function unique(list) {
  return [...new Set(list)];
}

function normalizeText(value) {
  return String(value || "").toLowerCase();
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function matchesTerm(text, term) {
  const normalizedTerm = normalizeText(term);
  if (normalizedTerm.includes(" ") || normalizedTerm.includes("°") || normalizedTerm.includes("-")) {
    return text.includes(normalizedTerm);
  }
  const pattern = new RegExp(`(^|[^a-z0-9])${escapeRegExp(normalizedTerm)}($|[^a-z0-9])`);
  return pattern.test(text);
}

function courseAllowed(courseName, rule) {
  if (!rule.courseIncludes || !rule.courseIncludes.length) {
    return true;
  }
  return rule.courseIncludes.includes(courseName);
}

function flattenStandardText(course, domain, standard) {
  const parts = [course.course, domain.name, standard.code, standard.description];
  for (const skill of standard.skills || []) {
    parts.push(skill.description);
    for (const keyword of skill.keywords || []) {
      parts.push(keyword);
    }
  }
  return normalizeText(parts.join(" "));
}

function collectStandardMatches(course, domain, standard) {
  const text = flattenStandardText(course, domain, standard);

  return PENROSE_TOPIC_RULES.filter((rule) => {
    if (!courseAllowed(course.course, rule)) {
      return false;
    }
    const included = rule.includeTerms.some((term) => matchesTerm(text, term));
    const excluded = (rule.excludeTerms || []).some((term) => matchesTerm(text, term));
    return included && !excluded;
  });
}

export function buildPenroseStandardsEntries(courses) {
  const entries = [];
  const seenArchetypeIds = new Set();

  for (const course of courses) {
    for (const domain of course.domains || []) {
      for (const standard of domain.standards || []) {
        const matches = collectStandardMatches(course, domain, standard);
        if (!matches.length) {
          continue;
        }

        const topicIds = unique(matches.map((rule) => rule.id));
        // Filter note/practice archetypes to only include those not already seen
        const noteArchetypeIds = unique(matches.flatMap((rule) => rule.noteArchetypeIds)).filter(id => {
          if (seenArchetypeIds.has(id)) return false;
          seenArchetypeIds.add(id);
          return true;
        });
        const practiceArchetypeIds = unique(matches.flatMap((rule) => rule.practiceArchetypeIds)).filter(id => {
          if (seenArchetypeIds.has(id)) return false;
          seenArchetypeIds.add(id);
          return true;
        });

        // Only add entry if it has at least one unique archetype
        if (noteArchetypeIds.length > 0 || practiceArchetypeIds.length > 0) {
          entries.push({
            code: standard.code,
            description: standard.description,
            course: course.course,
            domain: domain.name,
            topicIds,
            noteArchetypeIds,
            practiceArchetypeIds,
            skillCount: (standard.skills || []).length,
          });
        }
      }
    }
  }

  return entries.sort((left, right) => {
    if (left.course !== right.course) {
      return left.course.localeCompare(right.course);
    }
    return left.code.localeCompare(right.code);
  });
}
