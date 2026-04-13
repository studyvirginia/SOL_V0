import { getCourseBreakdown } from "../../lib/curriculumService";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { subject, course } = req.body;
  if (!subject || !course) {
    return res.status(400).json({ error: "Subject and course are required" });
  }

  try {
    const breakdown = await getCourseBreakdown(subject, course);
    return res.status(200).json({ breakdown: breakdown || [] });
  } catch (err) {
    console.error("getCourseBreakdown error", err);
    return res.status(500).json({ error: "Failed to load course breakdown", details: err.message });
  }
}
