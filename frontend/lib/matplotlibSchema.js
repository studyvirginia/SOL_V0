import { z } from "zod";

/**
 * MatplotlibSchema
 * Unified schema for educational diagrams.
 * The AI generates the semantic DATA, and the code handles the STYLING.
 */
export const MatplotlibSchema = z.object({
  title: z.string().describe("A concise, textbook-style title for the diagram"),
  description: z.string().describe("Brief educational context or key takeaway shown in the visual"),
  viewport: z.object({
    xRange: z.array(z.number()).length(2).describe("X-axis range [min, max], e.g., [-10, 10]").default([-10, 10]),
    yRange: z.array(z.number()).length(2).describe("Y-axis range [min, max], e.g., [-10, 10]").default([-10, 10]),
    showGrid: z.boolean().describe("Whether to show the background grid lines").default(true),
    isCartesian: z.boolean().describe("If true, origin (0,0) will be centered and axes will be thicker").default(true),
  }).optional(),
  elements: z.array(z.discriminatedUnion("type", [
    // 1. Math Functions
    z.object({
      type: z.literal("function"),
      expression: z.string().describe("Python/Numpy expression for y=f(x). Use 'np.sin(x)', 'x**2', 'np.exp(x)'. Use 'x' as variable."),
      label: z.string().describe("Mathematical label for the function, e.g., 'y = sin(x)'").optional(),
      color: z.enum(["primary", "secondary", "tertiary", "accent"]).describe("Theme-aware color for the line").default("primary"),
      style: z.enum(["solid", "dashed", "dotted"]).describe("Line style for the plot").default("solid"),
    }),
    
    // 2. Geometric Shapes
    z.object({
      type: z.literal("shape"),
      kind: z.enum(["circle", "rectangle", "polygon", "arc"]).describe("Type of geometric shape"),
      points: z.array(z.array(z.number()).length(2)).describe("Corner coordinates [[x,y], ...]. For 'circle', points[0] is center, points[1][0] is radius."),
      label: z.string().describe("Label centered inside or near the shape").optional(),
      fill: z.boolean().describe("Whether to fill the shape with a transparent color").default(false),
      color: z.enum(["primary", "secondary", "tertiary", "accent"]).describe("Theme-aware color for the shape border/fill").default("secondary"),
    }),
    
    // 3. Vectors & Forces
    z.object({
      type: z.literal("vector"),
      origin: z.array(z.number()).length(2).describe("[x, y] start point of the vector"),
      direction: z.array(z.number()).length(2).describe("[dx, dy] components of the vector"),
      magnitude: z.number().describe("Length of the vector (optional code hint)").optional(),
      label: z.string().describe("Label placed near the vector arrow").optional(),
      color: z.enum(["primary", "secondary", "tertiary", "accent"]).describe("Theme-aware color for the arrow").default("accent"),
    }),
    
    // 4. Labels & Text
    z.object({
      type: z.literal("annotation"),
      x: z.number(),
      y: z.number(),
      text: z.string(),
      variant: z.enum(["label", "callout", "title"]).default("label"),
      color: z.string().optional(),
    }),

    // 5. Educational Markers (hollow circles for 'find' points)
    z.object({
      type: z.literal("marker"),
      x: z.number(),
      y: z.number(),
      kind: z.enum(["hollow_circle", "star", "cross"]).default("hollow_circle"),
    })
  ])).describe("Visual elements derived from the SOL standard")
});
