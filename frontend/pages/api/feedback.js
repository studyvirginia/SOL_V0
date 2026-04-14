import fs from "fs";
import path from "path";

/**
 * /api/feedback
 * Logs generation data and developer/user feedback for visual improvements.
 */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { standard, prompt, spec, quality, notes } = req.body;

  try {
    const logDir = path.resolve(process.cwd(), "../backend/data/debug");
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    const logFile = path.join(logDir, "matplotlib_feedback.jsonl");
    const entry = {
      timestamp: new Date().toISOString(),
      standard,
      prompt,
      spec,
      quality, // "good" | "bad" | "flag"
      notes
    };

    fs.appendFileSync(logFile, JSON.stringify(entry) + "\n");
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Feedback logging error:", err);
    return res.status(500).json({ error: "Failed to log feedback" });
  }
}
