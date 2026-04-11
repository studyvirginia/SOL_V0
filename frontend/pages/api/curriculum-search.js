import { searchCurriculum } from "../../lib/curriculumService";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { q, subject, course } = req.query;
  const query = Array.isArray(q) ? q[0] : q;
  const normalizedSubject = Array.isArray(subject) ? subject[0] : subject;
  const normalizedCourse = Array.isArray(course) ? course[0] : course;

  if (!query) {
    return res.status(400).json({ error: "Missing query parameter q" });
  }

  try {
    const results = await searchCurriculum(query, normalizedSubject, normalizedCourse);
    return res.status(200).json({ results });
  } catch (err) {
    console.error("curriculum-search error", err);
    return res.status(500).json({ error: "Failed to search curriculum", details: err.message });
  }
}
