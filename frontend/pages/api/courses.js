import { getCourseOptions } from "../../lib/curriculumService";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const options = await getCourseOptions();
    return res.status(200).json({ options });
  } catch (err) {
    console.error("getCourseOptions error", err);
    return res.status(500).json({ error: "Failed to load course options", details: err.message });
  }
}
