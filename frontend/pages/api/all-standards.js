/**
 * /api/all-standards.js
 * Returns every standard from every course in the curriculum data.
 * Used by the standards-wikimedia coverage dashboard.
 */

import fs from "fs";
import path from "path";

const SUBJECT_FOLDERS = { math: "Math", english: "English", history: "History", science: "Science" };

function getDataDir() {
  const cwd = process.cwd();
  const root = path.basename(cwd) === "frontend" ? path.resolve(cwd, "..") : cwd;
  return path.join(root, "backend", "data");
}

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const dataDir = getDataDir();
  const standards = [];

  for (const [subjectKey, folderName] of Object.entries(SUBJECT_FOLDERS)) {
    const subjectPath = path.join(dataDir, folderName);
    if (!fs.existsSync(subjectPath)) continue;

    const files = (await fs.promises.readdir(subjectPath)).filter(f => f.endsWith(".json"));

    for (const fileName of files) {
      const filePath = path.join(subjectPath, fileName);
      try {
        const raw = await fs.promises.readFile(filePath, "utf-8");
        const courseJson = JSON.parse(raw);
        const courseName = path.basename(fileName, ".json");

        for (const domain of courseJson.domains || []) {
          for (const standard of domain.standards || []) {
            standards.push({
              id: `${subjectKey}::${courseName}::${standard.code}`,
              subject: subjectKey,
              course: courseName,
              domain: domain.name,
              code: standard.code,
              description: standard.description,
            });
          }
        }
      } catch (e) {
        console.warn(`Failed to parse ${fileName}:`, e.message);
      }
    }
  }

  res.status(200).json({ standards, total: standards.length });
}
