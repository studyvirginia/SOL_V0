import {
  TRIO_VENN_2_INTERSECT,
  TRIO_VENN_2_DISJOINT,
  TRIO_VENN_3_ALL,
  TRIO_EULER_SUBSET,
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
  TRIO_TRIANGLE_LABELED,
  TRIO_RIGHT_TRIANGLE,
  TRIO_CONGRUENT_TRIANGLES,
  TRIO_SIMILAR_TRIANGLES,
  TRIO_QUADRILATERAL,
  TRIO_POLYGON_PENTAGON,
  TRIO_POLYGON_HEXAGON,
  TRIO_TRIANGLE_MEDIAN,
  TRIO_ISOSCELES_TRIANGLE,
  TRIO_ANGLE_ARC,
  TRIO_RIGHT_TRIANGLE_345,
  TRIO_LAW_OF_COSINES,
  TRIO_LAW_OF_SINES,
  TRIO_VECTOR_ADDITION,
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
};

export const PENROSE_TOPIC_RULES = [
  {
    id: "sets_logic",
    label: "Sets / Venn diagrams",
    includeTerms: ["venn diagrams", "venn diagram", "set relationships", "subset", "intersection", "union"],
    excludeTerms: ["two-way tables"],
    noteArchetypeIds: ["venn_notes", "euler_subset"],
    practiceArchetypeIds: ["venn_practice_intersect", "venn_practice_disjoint", "venn_logic"],
  },
  {
    id: "probability_trees",
    label: "Probability trees",
    includeTerms: ["tree diagrams", "tree diagram", "independent events"],
    noteArchetypeIds: ["prob_tree"],
    practiceArchetypeIds: ["prob_tree"],
  },
  {
    id: "graph_theory",
    label: "Graph theory",
    includeTerms: ["graph theory", "vertex", "edge", "directed graph", "digraph", "spanning tree", "adjacency"],
    excludeTerms: ["bar graph", "line graph", "scatter plot", "graphing technology", "graph trigonometric"],
    noteArchetypeIds: ["graph_notes", "graph_tree", "graph_digraph"],
    practiceArchetypeIds: ["graph_practice_complete", "graph_practice_spanning", "graph_practice_cycle", "graph_practice_bipartite", "graph_expr_tree"],
  },
  {
    id: "triangle_congruence",
    label: "Triangle congruence",
    includeTerms: ["triangle congruence", "triangles are congruent", "sss", "sas", "asa", "aas", "hl"],
    noteArchetypeIds: ["congruence_notes"],
    practiceArchetypeIds: ["congruence_practice", "right_triangle_practice"],
  },
  {
    id: "triangle_similarity",
    label: "Triangle similarity / dilation",
    includeTerms: ["triangle similarity", "triangles are similar", "similar triangles", "aa", "dilation", "scale factor", "scale drawings"],
    excludeTerms: ["graphing technology"],
    noteArchetypeIds: ["similarity_notes"],
    practiceArchetypeIds: ["similarity_practice"],
  },
  {
    id: "right_triangle_trig",
    label: "Right triangles / trig ratios",
    includeTerms: ["right triangle", "right triangles", "trigonometric ratios", "pythagorean theorem", "special right triangles", "angles of elevation", "angles of depression"],
    noteArchetypeIds: ["right_triangle_notes", "angle_arc"],
    practiceArchetypeIds: ["right_triangle_practice"],
  },
  {
    id: "law_sines_cosines",
    label: "Law of Sines / Cosines",
    includeTerms: ["law of sines", "law of cosines", "non-right triangle", "triangle area", "ambiguous case"],
    noteArchetypeIds: ["triangle_notes", "angle_arc"],
    practiceArchetypeIds: ["law_cosines_practice", "law_sines_practice"],
  },
  {
    id: "polygons_quadrilaterals",
    label: "Polygons / quadrilaterals",
    includeTerms: ["quadrilateral", "quadrilaterals", "polygon", "polygons", "interior angles", "exterior angles", "regular polygons", "convex polygons", "parallelogram", "trapezoid", "rhombi", "rectangles", "squares"],
    noteArchetypeIds: ["polygon_notes_quad", "polygon_notes_pent", "polygon_notes_hex"],
    practiceArchetypeIds: ["polygon_notes_quad", "polygon_notes_pent"],
  },
  {
    id: "figure_symmetry",
    label: "Figure symmetry",
    includeTerms: ["line of symmetry", "lines of symmetry", "point symmetry", "figure symmetry", "regular polygons"],
    excludeTerms: ["function symmetry", "even functions", "odd functions", "polynomial symmetry"],
    noteArchetypeIds: ["polygon_notes_hex", "polygon_notes_pent"],
    practiceArchetypeIds: ["polygon_notes_hex"],
  },
  {
    id: "vectors",
    label: "Vectors",
    includeTerms: ["vector notation", "vector representation", "vector addition", "vector subtraction", "scalar multiplication", "dot product", "orthogonal vectors", "angle between vectors"],
    noteArchetypeIds: ["vector_notes"],
    practiceArchetypeIds: ["vector_notes"],
  },
];

function unique(list) {
  return [...new Set(list)];
}

function normalizeText(value) {
  return String(value || "").toLowerCase();
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
    const included = rule.includeTerms.some((term) => text.includes(term));
    const excluded = (rule.excludeTerms || []).some((term) => text.includes(term));
    return included && !excluded;
  });
}

export function buildPenroseStandardsEntries(courses) {
  const entries = [];

  for (const course of courses) {
    for (const domain of course.domains || []) {
      for (const standard of domain.standards || []) {
        const matches = collectStandardMatches(course, domain, standard);
        if (!matches.length) {
          continue;
        }

        const topicIds = unique(matches.map((rule) => rule.id));
        const noteArchetypeIds = unique(matches.flatMap((rule) => rule.noteArchetypeIds));
        const practiceArchetypeIds = unique(matches.flatMap((rule) => rule.practiceArchetypeIds));

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

  return entries.sort((left, right) => {
    if (left.course !== right.course) {
      return left.course.localeCompare(right.course);
    }
    return left.code.localeCompare(right.code);
  });
}
