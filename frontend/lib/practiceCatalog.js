import fs from "fs";
import path from "path";

// Reads the parsed practice-question banks (data/practice/{subject}/{course}.json,
// built from official VDOE released tests) that power the /practice SEO pages.
// A course only gets a public practice page if it clears MIN_QUESTIONS, so no
// thin practice pages ship (pSEO discipline: noindex/skip below the threshold).
const MIN_QUESTIONS = 8;
const MAX_ON_PAGE = 50; // questions rendered per practice page (weight + focus)

function practiceDir() {
  return path.join(process.cwd(), "data", "practice");
}

let cached = null;

function loadAll() {
  if (cached) return cached;
  const dir = practiceDir();
  const banks = [];
  if (fs.existsSync(dir)) {
    for (const subject of fs.readdirSync(dir)) {
      const sdir = path.join(dir, subject);
      if (!fs.statSync(sdir).isDirectory()) continue;
      for (const file of fs.readdirSync(sdir)) {
        if (!file.endsWith(".json")) continue;
        const data = JSON.parse(fs.readFileSync(path.join(sdir, file), "utf-8"));
        if ((data.questionCount || 0) >= MIN_QUESTIONS) banks.push(data);
      }
    }
  }
  cached = banks;
  return banks;
}

// [{ subject, course, courseName, count }] for every course with a real bank.
export function listPracticeCourses() {
  return loadAll().map((b) => ({
    subject: b.subject,
    course: b.course,
    courseName: b.courseName,
    count: b.questionCount,
  }));
}

export function hasPractice(subject, course) {
  return loadAll().some((b) => b.subject === subject && b.course === course);
}

// Full bank for one course, trimmed to what a single practice page renders.
export function getPractice(subject, course) {
  const b = loadAll().find((x) => x.subject === subject && x.course === course);
  if (!b) return null;
  return {
    subject: b.subject,
    course: b.course,
    courseName: b.courseName,
    total: b.questionCount,
    attribution: b.attribution,
    questions: b.questions.slice(0, MAX_ON_PAGE).map((q) => ({
      id: q.id,
      stem: q.stem,
      choices: q.choices,
      answer: q.answer,
    })),
  };
}

export function practiceCountsBySubject() {
  const out = {};
  for (const b of loadAll()) {
    out[b.subject] = (out[b.subject] || 0) + b.questionCount;
  }
  return out;
}
