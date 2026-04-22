import { getCourseStandards } from "../../lib/curriculumService";
import { supabase } from "../../lib/supabaseClient";

async function getAuthenticatedUser(req) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return null;
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const authenticatedUser = await getAuthenticatedUser(req);
  if (!authenticatedUser) return res.status(401).json({ error: "Unauthorized" });

  const { subject, course } = req.body;
  if (!subject || !course) {
    return res.status(400).json({ error: "Subject and course are required" });
  }

  try {
    const standards = await getCourseStandards(subject, course);
    return res.status(200).json({ standards: standards || [] });
  } catch (err) {
    console.error("getCourseStandards error", err);
    return res.status(500).json({ error: "Failed to load standards", details: err.message });
  }
}
