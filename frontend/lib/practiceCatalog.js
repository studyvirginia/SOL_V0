import fs from "fs";
import path from "path";

// Reads the parsed practice-question banks (data/practice/{subject}/{course}.json,
// built from official VDOE released tests) that power the /practice SEO pages.
// A course only gets a public practice page if it clears MIN_QUESTIONS, so no
// thin practice pages ship (pSEO discipline: noindex/skip below the threshold).
const MIN_QUESTIONS = 8;
const SET_SIZE = 50; // questions per practice-test page (weight + focus)
const MAX_SETS = 6;  // cap set pages per course so page growth stays bounded

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

function totalSetsFor(count) {
  return Math.min(Math.ceil(count / SET_SIZE), MAX_SETS);
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

// Full bank for one course, sliced to a single set (set 1 = the main /practice page).
export function getPractice(subject, course, setNumber = 1) {
  const b = loadAll().find((x) => x.subject === subject && x.course === course);
  if (!b) return null;
  const totalSets = totalSetsFor(b.questionCount);
  if (setNumber < 1 || setNumber > totalSets) return null;
  const start = (setNumber - 1) * SET_SIZE;
  return {
    subject: b.subject,
    course: b.course,
    courseName: b.courseName,
    total: b.questionCount,
    setNumber,
    totalSets,
    setSize: SET_SIZE,
    attribution: b.attribution,
    questions: b.questions.slice(start, start + SET_SIZE).map((q) => ({
      id: q.id,
      stem: q.stem,
      choices: q.choices,
      answer: q.answer,
    })),
  };
}

// getStaticPaths for the extra set pages (sets 2..N; set 1 lives on /practice).
export function listPracticeSetParams() {
  const out = [];
  for (const b of loadAll()) {
    const totalSets = totalSetsFor(b.questionCount);
    for (let n = 2; n <= totalSets; n++) {
      out.push({ subject: b.subject, course: b.course, set: String(n) });
    }
  }
  return out;
}

export function practiceCountsBySubject() {
  const out = {};
  for (const b of loadAll()) {
    out[b.subject] = (out[b.subject] || 0) + b.questionCount;
  }
  return out;
}
