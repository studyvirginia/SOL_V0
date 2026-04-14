/**
 * /api/desmos-geometry-generate
 * Generates a Desmos Geometry state for a geometric construction spec.
 *
 * Receives: { type, equations, label_points, course, notes, description }
 * Returns:  { geometryState: { state: <Desmos Geometry state obj>, title: string } }
 *
 * Desmos Geometry is a toolbar-driven construction tool. State is manipulated
 * via getState()/setState(). The LLM generates a state object describing
 * the geometric elements (points, segments, polygons, circles, angles, arcs).
 *
 * Desmos Geometry state format:
 * {
 *   version: 2,
 *   graph: { viewport: { xmin, ymin, xmax, ymax } },
 *   elements: [
 *     { id: "e1", type: "point",   x: 0, y: 0,  label: "A", color: "#6042a6", showLabel: true },
 *     { id: "e2", type: "point",   x: 3, y: 0,  label: "B", color: "#6042a6", showLabel: true },
 *     { id: "e3", type: "segment", startId: "e1", endId: "e2", color: "#2d70b3" },
 *     { id: "e4", type: "polygon", vertexIds: ["e1","e2","e5"], color: "#388c46", fillOpacity: 0.1 },
 *     { id: "e5", type: "circle",  centerId: "e1", radiusPointId: "e2", color: "#388c46" },
 *     { id: "e6", type: "angle",   vertexId: "e2", startId: "e1", endId: "e3", color: "#000000" }
 *   ]
 * }
 *
 * Note: If Desmos.Geometry is not enabled on the API key, the renderer
 * will fall back gracefully with an error message.
 */

import fs from "fs";
import path from "path";
import { generateText } from "ai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { createMistral } from "@ai-sdk/mistral";

function loadApiConfig() {
  try {
    const envPath = path.resolve(process.cwd(), ".env.local");
    const env = { ...process.env };
    if (fs.existsSync(envPath)) {
      for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
        const eq = line.indexOf("=");
        if (eq > 0) env[line.slice(0, eq).trim()] = line.slice(eq + 1).trim();
      }
    }
    if (env.OPENROUTER_API_KEY) {
      return { provider: "openrouter", apiKey: env.OPENROUTER_API_KEY, model: "google/gemini-2.0-flash-lite-001" };
    }
    if (env.MISTRAL_API_KEY) {
      return { provider: "mistral", apiKey: env.MISTRAL_API_KEY, model: "mistral-small-2506" };
    }
    return null;
  } catch { return null; }
}

function buildGeometryPrompt({ type, equations, label_points, course, notes, description }) {
  const pts = (label_points || [])
    .map(p => `(${p.x}, ${p.y})${p.label ? ` → "${p.label}"` : ""}`)
    .join(", ");

  return `You are a Desmos Geometry state generator for a K-12 math tutoring app.
Output ONLY a JSON code block — no explanation, no other text.

=== DESMOS GEOMETRY STATE FORMAT ===
{
  "version": 2,
  "graph": { "viewport": { "xmin": -6, "ymin": -6, "xmax": 6, "ymax": 6 } },
  "elements": [
    { "id": "e1", "type": "point",   "x": 0,   "y": 0,   "label": "A", "showLabel": true,  "color": "#6042a6" },
    { "id": "e2", "type": "point",   "x": 3,   "y": 0,   "label": "B", "showLabel": true,  "color": "#6042a6" },
    { "id": "e3", "type": "point",   "x": 0,   "y": 4,   "label": "C", "showLabel": true,  "color": "#6042a6" },
    { "id": "e4", "type": "segment", "startId": "e1", "endId": "e2", "color": "#2d70b3" },
    { "id": "e5", "type": "segment", "startId": "e2", "endId": "e3", "color": "#2d70b3" },
    { "id": "e6", "type": "segment", "startId": "e3", "endId": "e1", "color": "#2d70b3" },
    { "id": "e7", "type": "polygon", "vertexIds": ["e1","e2","e3"],  "color": "#388c46", "fillOpacity": 0.15 }
  ]
}

=== ELEMENT TYPES ===
- "point":   x, y (numbers), label (string), showLabel (bool), color
- "segment": startId, endId (reference point IDs), color
- "ray":     startId, throughId (reference point IDs), color
- "line":    startId, throughId (reference point IDs), color
- "polygon": vertexIds (array of point IDs in order), color, fillOpacity (0–1)
- "circle":  centerId, radiusPointId (reference point IDs), color
- "angle":   vertexId (the angle vertex), startId, endId (the two sides), color (usually "#000000")

=== RULES ===
- Assign sequential IDs: "e1", "e2", "e3", ...
- All segment/polygon/circle elements must reference point IDs that already exist earlier in the elements array.
- Set viewport to neatly contain the construction — typically ±1–2 units of padding around all points.
- Use these default colors: points = "#6042a6", lines/segments = "#2d70b3", polygons = "#388c46", angles = "#000000"
- Include "fillOpacity": 0.15 on all polygons for a subtle fill.
- For a circle: place one extra point on the circumference as the radius control point.
- If the spec contains algebraic equations (e.g., "y = x²"), this is NOT a geometry construction —
  output: { "version": 2, "graph": { "viewport": { "xmin": -6,"ymin":-6,"xmax":6,"ymax":6 } }, "elements": [], "notApplicable": true }

=== GRAPH SPEC ===
Type: ${type}
${equations && equations.length > 0 ? `Equations: ${equations.join("  |  ")}` : ""}
${description ? `Description: ${description}` : ""}
${pts ? `Key points: ${pts}` : ""}
${course ? `Course: ${course}` : ""}
${notes ? `Notes: ${notes}` : ""}

Output the JSON code block now:`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const {
    type = "geometry",
    equations = [],
    label_points = [],
    course = "",
    notes = "",
    description = "",
  } = req.body || {};

  const config = loadApiConfig();
  if (!config) return res.status(500).json({ error: "No API key configured" });

  const systemPrompt = buildGeometryPrompt({ type, equations, label_points, course, notes, description });

  let model;
  try {
    if (config.provider === "openrouter") {
      model = createOpenAICompatible({
        name: "openrouter",
        baseURL: "https://openrouter.ai/api/v1",
        apiKey: config.apiKey,
      })(config.model);
    } else {
      model = createMistral({ apiKey: config.apiKey })(config.model);
    }
  } catch (err) {
    return res.status(500).json({ error: `Model init error: ${err.message}` });
  }

  let geometryState;
  try {
    const { text } = await generateText({
      model,
      system: systemPrompt,
      prompt: "Generate the Desmos Geometry state JSON for the spec above.",
      maxTokens: 1500,
      temperature: 0.05,
    });

    // Extract JSON from fenced or bare
    const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    const raw = fenced ? fenced[1] : text.match(/(\{[\s\S]*\})/)?.[1];
    if (!raw) {
      return res.status(500).json({ error: "LLM returned no JSON" });
    }

    const parsed = JSON.parse(raw);

    if (parsed.notApplicable) {
      return res.status(200).json({
        geometryState: {
          notApplicable: true,
          title: "Not a geometry construction",
        },
      });
    }

    // Ensure required fields
    if (!parsed.elements) parsed.elements = [];
    if (!parsed.version) parsed.version = 2;
    if (!parsed.graph) parsed.graph = { viewport: { xmin: -6, ymin: -6, xmax: 6, ymax: 6 } };

    const title = description || notes || (equations[0] || "").slice(0, 40);

    return res.status(200).json({
      geometryState: { state: parsed, title },
    });
  } catch (err) {
    console.error("[desmos-geometry-generate] error:", err);
    return res.status(500).json({ error: err.message });
  }
}
