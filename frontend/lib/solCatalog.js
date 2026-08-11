import fs from "fs";
import path from "path";

const SUBJECT_FOLDERS = ["Math", "English", "Science", "History"];

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getDataDir() {
  return path.join(process.cwd(), "data");
}

let cachedCatalog = null;

// Reads the same first-party SOL standards data the app itself uses
// (see lib/curriculumService.js) to build a static catalog for SEO pages.
export function getSolCatalog() {
  if (cachedCatalog) return cachedCatalog;

  const dataDir = getDataDir();

  cachedCatalog = SUBJECT_FOLDERS.filter((folder) =>
    fs.existsSync(path.join(dataDir, folder))
  ).map((subjectFolder) => {
    const subjectDir = path.join(dataDir, subjectFolder);
    const files = fs.readdirSync(subjectDir).filter((f) => f.endsWith(".json"));

    const courses = files
      .map((file) => {
        const raw = fs.readFileSync(path.join(subjectDir, file), "utf-8");
        const data = JSON.parse(raw);
        const name = data.course || file.replace(/\.json$/, "");
        const domains = data.domains || [];
        const standardCount = domains.reduce(
          (sum, d) => sum + (d.standards?.length || 0),
          0
        );

        return {
          slug: slugify(name),
          name,
          domains,
          domainCount: domains.length,
          standardCount,
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

    return {
      slug: slugify(subjectFolder),
      name: subjectFolder,
      courses,
    };
  });

  return cachedCatalog;
}

export function getSubjectSlugs() {
  return getSolCatalog().map((s) => s.slug);
}

export function getSubjectBySlug(slug) {
  return getSolCatalog().find((s) => s.slug === slug) || null;
}

export function getCourseBySlugs(subjectSlug, courseSlug) {
  const subject = getSubjectBySlug(subjectSlug);
  if (!subject) return null;
  const course = subject.courses.find((c) => c.slug === courseSlug);
  if (!course) return null;
  return { subject, course };
}

// Strips the heavy per-skill detail down to what SEO pages actually render,
// so getStaticProps payloads stay small.
export function summarizeCourseDomains(domains) {
  return domains.map((domain) => ({
    name: domain.name,
    standards: (domain.standards || []).map((s) => ({
      code: s.code ?? null,
      slug: s.code ? slugify(s.code) : null,
      description: s.description ?? "",
    })),
  }));
}

// Every (subject, course, standard) triple with a real code, for
// getStaticPaths on the standard-detail pages and the sitemap.
export function getAllStandardParams() {
  const params = [];
  for (const subject of getSolCatalog()) {
    for (const course of subject.courses) {
      for (const domain of course.domains) {
        for (const standard of domain.standards || []) {
          if (!standard.code) continue;
          params.push({
            subject: subject.slug,
            course: course.slug,
            standard: slugify(standard.code),
          });
        }
      }
    }
  }
  return params;
}

export function getStandardBySlugs(subjectSlug, courseSlug, standardSlug) {
  const result = getCourseBySlugs(subjectSlug, courseSlug);
  if (!result) return null;
  const { subject, course } = result;

  for (const domain of course.domains) {
    for (const standard of domain.standards || []) {
      if (standard.code && slugify(standard.code) === standardSlug) {
        const siblings = (domain.standards || [])
          .filter((s) => s.code)
          .map((s) => ({
            code: s.code,
            slug: slugify(s.code),
            description: s.description ?? "",
          }));
        const index = siblings.findIndex((s) => s.slug === standardSlug);

        // Other standards in the same reporting strand, for "related standards"
        // internal linking (crawl depth + long-tail keyword coverage).
        const relatedStandards = siblings
          .filter((s) => s.slug !== standardSlug)
          .map((s) => ({ code: s.code, slug: s.slug, description: s.description }));

        return {
          subject: { slug: subject.slug, name: subject.name },
          course: { slug: course.slug, name: course.name },
          domain: { name: domain.name },
          standard: {
            code: standard.code,
            description: standard.description ?? "",
            skills: (standard.skills || []).map((sk) => ({
              description: sk.description ?? "",
              keywords: sk.keywords || [],
            })),
          },
          relatedStandards,
          prevStandard: index > 0
            ? { code: siblings[index - 1].code, slug: siblings[index - 1].slug }
            : null,
          nextStandard: index < siblings.length - 1
            ? { code: siblings[index + 1].code, slug: siblings[index + 1].slug }
            : null,
        };
      }
    }
  }
  return null;
}
