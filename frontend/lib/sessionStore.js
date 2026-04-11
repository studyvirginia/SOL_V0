import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

function dataDir() {
  // Keep writable data under frontend so Next can access it reliably.
  return path.join(process.cwd(), ".data", "sessions");
}

async function ensureDir() {
  await fs.mkdir(dataDir(), { recursive: true });
}

export function newSessionId() {
  return crypto.randomBytes(16).toString("hex");
}

function sessionPath(sessionId) {
  return path.join(dataDir(), `${sessionId}.json`);
}

export async function readSession(sessionId) {
  await ensureDir();
  try {
    const raw = await fs.readFile(sessionPath(sessionId), "utf8");
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

export async function writeSession(sessionId, session) {
  await ensureDir();
  const next = {
    ...session,
    updatedAt: new Date().toISOString(),
  };
  await fs.writeFile(sessionPath(sessionId), JSON.stringify(next, null, 2), "utf8");
  return next;
}

