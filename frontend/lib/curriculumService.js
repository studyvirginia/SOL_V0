import fs from "fs";
import path from "path";

const SUBJECT_FOLDERS = {
  math: "Math",
  english: "English",
  history: "History",
  science: "Science",
};

function getRepoRootFromFrontend() {
  const cwd = process.cwd();
  return path.basename(cwd) === "frontend" ? path.resolve(cwd, "..") : cwd;
}

function getDataDirectory() {
  // In both local dev (cwd=frontend) and Vercel, data/ lives inside the project root
  return path.join(process.cwd(), "data");
}

function normalizeSubject(subject) {
  return String(subject || "").trim().toLowerCase();
}

function normalizeCourse(course) {
  return String(course || "").trim();
}

function getSubjectFolder(subject) {
  const normalized = normalizeSubject(subject);
  return SUBJECT_FOLDERS[normalized] || null;
}

function getCourseFilePath(subject, course) {
  const subjectFolder = getSubjectFolder(subject);
  if (!subjectFolder) {
    throw new Error(`Unknown subject "${subject}"`);
  }

  const normalizedCourse = normalizeCourse(course);
  if (!normalizedCourse) {
    throw new Error("Course is required");
  }

  return path.join(getDataDirectory(), subjectFolder, `${normalizedCourse}.json`);
}

async function loadJsonFile(filePath) {
  const raw = await fs.promises.readFile(filePath, "utf-8");
  return JSON.parse(raw);
}

function normalizeSearchText(value) {
  return String(value || "").toLowerCase();
}

function queryMatches(value, query) {
  return normalizeSearchText(value).includes(normalizeSearchText(query));
}

function buildMatch(subject, course, domain, standard, skill, type, snippet) {
  return {
    subject,
    course,
    domain: domain?.name || null,
    standardCode: standard?.code || null,
    standardDescription: standard?.description || null,
    skillDescription: skill?.description || null,
    matchType: type,
    snippet,
  };
}

export async function loadCourseRow(subject, course) {
  return loadCourseJson(subject, course);
}

export async function loadCourseJson(subject, course) {
  const filePath = getCourseFilePath(subject, course);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Course file not found for "${course}" in subject "${subject}"`);
  }
  return loadJsonFile(filePath);
}

export async function getCourseOptions() {
  const dataDir = getDataDirectory();
  const options = {};

  for (const [normalizedSubject, folderName] of Object.entries(SUBJECT_FOLDERS)) {
    options[normalizedSubject] = [];
    const subjectPath = path.join(dataDir, folderName);

    if (!fs.existsSync(subjectPath)) continue;

    const files = await fs.promises.readdir(subjectPath);
    options[normalizedSubject] = files
      .filter((name) => name.toLowerCase().endsWith(".json"))
      .map((name) => path.basename(name, ".json"))
      .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  }

  return options;
}

export async function getCourseBreakdown(subject, course) {
  try {
    const courseJson = await loadCourseJson(subject, course);
    if (!courseJson || !courseJson.domains) return [];

    return courseJson.domains.map(domain => {
      const firstCode = domain.standards?.[0]?.code || "";
      const parts = firstCode.split(".");
      const abbrev = parts.length >= 2 ? `${parts[0]}. ${parts[1]}` : firstCode;
      const label = abbrev ? `${domain.name} (${abbrev})` : domain.name;
      return { label, value: `domain:${domain.name}`, type: "domain" };
    });
  } catch (e) {
    console.error("Error breaking down course:", e);
    return [];
  }
}

export async function getCourseStandards(subject, course) {
  try {
    const courseJson = await loadCourseJson(subject, course);
    if (!courseJson || !courseJson.domains) return [];

    const standards = [];
    courseJson.domains.forEach(domain => {
      (domain.standards || []).forEach(std => {
        const desc = std.description.length > 60
          ? `${std.description.slice(0, 60)}...`
          : std.description;
        standards.push({ label: `${std.code}: ${desc}`, value: std.code, type: "standard" });
      });
    });
    return standards;
  } catch (err) {
    console.error("getCourseStandards error:", err);
    return [];
  }
}

export async function searchCurriculum(query, subject, course) {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return [];

  const subjectsToSearch = subject ? [normalizeSubject(subject)] : Object.keys(SUBJECT_FOLDERS);
  const results = [];

  for (const sub of subjectsToSearch) {
    const folderName = SUBJECT_FOLDERS[sub];
    if (!folderName) continue;

    const subjectPath = path.join(getDataDirectory(), folderName);
    if (!fs.existsSync(subjectPath)) continue;

    const files = course
      ? [`${normalizeCourse(course)}.json`]
      : (await fs.promises.readdir(subjectPath)).filter((name) => name.toLowerCase().endsWith(".json"));

    for (const fileName of files) {
      const filePath = path.join(subjectPath, fileName);
      if (!fs.existsSync(filePath)) continue;

      const courseJson = await loadJsonFile(filePath);
      const courseMatches = [];

      if (queryMatches(courseJson.course, normalizedQuery) || queryMatches(courseJson.subject, normalizedQuery)) {
        courseMatches.push(buildMatch(courseJson.subject, courseJson.course, null, null, null, "course", courseJson.course));
      }

      for (const domain of courseJson.domains || []) {
        if (queryMatches(domain.name, normalizedQuery)) {
          courseMatches.push(buildMatch(courseJson.subject, courseJson.course, domain, null, null, "domain", domain.name));
        }

        for (const standard of domain.standards || []) {
          if (queryMatches(standard.code, normalizedQuery) || queryMatches(standard.description, normalizedQuery)) {
            courseMatches.push(buildMatch(courseJson.subject, courseJson.course, domain, standard, null, "standard", standard.description));
          }

          for (const skill of standard.skills || []) {
            if (
              queryMatches(skill.description, normalizedQuery) ||
              (skill.keywords || []).some((keyword) => queryMatches(keyword, normalizedQuery))
            ) {
              courseMatches.push(buildMatch(courseJson.subject, courseJson.course, domain, standard, skill, "skill", skill.description));
            }
          }
        }
      }

      if (courseMatches.length > 0) {
        results.push(...courseMatches);
      }
    }
  }

  return results;
}

function shallowCourseContext(courseJson) {
  return {
    subject: courseJson.subject,
    course: courseJson.course,
  };
}

function cloneDomain(domain) {
  return {
    name: domain.name,
    standards: [],
  };
}

function cloneStandard(standard) {
  return {
    code: standard.code,
    description: standard.description,
    skills: standard.skills || [],
  };
}

export function extractFocusedCurriculum(courseJson, query) {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return null;

  const focused = shallowCourseContext(courseJson);
  focused.domains = [];

  for (const domain of courseJson.domains || []) {
    const domainMatches = queryMatches(domain.name, normalizedQuery);
    const clonedDomain = cloneDomain(domain);

    for (const standard of domain.standards || []) {
      const standardMatches = queryMatches(standard.code, normalizedQuery) || queryMatches(standard.description, normalizedQuery);
      const matchingSkills = (standard.skills || []).filter((skill) =>
        queryMatches(skill.description, normalizedQuery) ||
        (skill.keywords || []).some((keyword) => queryMatches(keyword, normalizedQuery))
      );

      if (domainMatches || standardMatches || matchingSkills.length > 0) {
        const cloned = cloneStandard(standard);
        cloned.skills = matchingSkills.length > 0 ? matchingSkills : cloned.skills;
        clonedDomain.standards.push(cloned);
      }
    }

    if (clonedDomain.standards.length > 0 || domainMatches) {
      if (!clonedDomain.standards.length && domainMatches) {
        clonedDomain.standards = domain.standards || [];
      }
      focused.domains.push(clonedDomain);
    }
  }

  return focused.domains.length > 0 ? focused : null;
}

export function extractRandomStandards(courseJson, count = 3) {
  const allStandards = [];
  for (const domain of courseJson.domains || []) {
    for (const standard of domain.standards || []) {
      allStandards.push({ domain: domain.name, standard });
    }
  }

  const selected = [];
  const copy = [...allStandards];

  while (copy.length > 0 && selected.length < count) {
    const index = Math.floor(Math.random() * copy.length);
    selected.push(copy.splice(index, 1)[0]);
  }

  return {
    subject: courseJson.subject,
    course: courseJson.course,
    selected: selected.map((item) => ({
      domain: item.domain,
      code: item.standard.code,
      description: item.standard.description,
      skills: item.standard.skills || [],
    })),
  };
}

export function buildCurriculumModeContext(courseJson, mode, message) {
  const summary = buildCurriculumSummary(courseJson);
  const focused = extractFocusedCurriculum(courseJson, message);
  const randomStandards = extractRandomStandards(courseJson, 4);

  const common = {
    subject: courseJson.subject,
    course: courseJson.course,
    mode,
  };

  switch (mode) {
    case "notes":
      return {
        ...common,
        purpose: "Detailed unit notes or a full review summary when no focused topic is detected.",
        focus: focused ? "Focused unit/standard notes" : "Course-wide review notes",
        data: focused || { summary, note: "No exact standard match found; using course summary for notes." },
      };
    case "study-guide":
      return {
        ...common,
        purpose: "Structured study guide for the current topic or broader course material.",
        focus: focused ? "Focused study guide for the current topic" : "Course overview study guide",
        data: focused || summary,
      };
    case "flashcards":
      return {
        ...common,
        purpose: "Flashcard-ready standards, skills, and definitions for memory practice.",
        focus: focused ? "Selected standards and skills for flashcards" : "Random course concepts for flashcards",
        data: focused || randomStandards,
      };
    case "analogies":
      return {
        ...common,
        purpose: "Analogy-driven concept explanations and comparisons.",
        focus: focused ? "Current topic analogies and metaphors" : "Course-wide conceptual analogies",
        data: focused || { summary, note: "No exact match found; using course summary for analogies." },
      };
    case "mastery":
      return {
        ...common,
        purpose: "General mastery review and higher-level framing.",
        focus: focused ? "Mastery themes for the current topic" : "Course-level mastery review",
        data: focused || summary,
      };
    case "practice":
      return {
        ...common,
        purpose: "Randomized practice questions or mini tests built from selected standards.",
        focus: "Random selected standards for practice",
        data: randomStandards,
      };
    default:
      return {
        ...common,
        purpose: "High-level curriculum overview and domain summary.",
        focus: "Domain-level course summary",
        data: summary,
      };
  }
}

export function getTrackableStandards(courseJson) {
  return (courseJson.domains || []).flatMap((domain) =>
    (domain.standards || []).map((standard) => ({
      subject: courseJson.subject,
      course: courseJson.course,
      domain: domain.name,
      code: standard.code,
      description: standard.description,
    }))
  );
}

export function buildCurriculumSummary(courseJson) {
  const domains = (courseJson.domains || []).map((domain) => {
    const standards = domain.standards || [];
    const skillsCount = standards.reduce((sum, standard) => sum + (standard.skills?.length || 0), 0);

    return {
      name: domain.name,
      standardCount: standards.length,
      skillCount: skillsCount,
      standardCodes: standards.map((standard) => standard.code),
    };
  });

  const totalStandards = domains.reduce((sum, domain) => sum + domain.standardCount, 0);
  const totalSkills = domains.reduce((sum, domain) => sum + domain.skillCount, 0);

  return {
    subject: courseJson.subject,
    course: courseJson.course,
    domainCount: domains.length,
    totalStandards,
    totalSkills,
    domains,
  };
}

