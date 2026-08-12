import { getCourseBySlugs } from "@/lib/solCatalog";
import { getCourseQuestions } from "@/lib/practiceCatalog";

// How many real practice questions to embed on each per-standard page.
const COUNT = 4;

// Ordered list of every standard code in a course (across all reporting strands),
// so each standard has a stable ordinal we can stagger question slices by.
function courseStandardCodes(subjectSlug, courseSlug) {
  const res = getCourseBySlugs(subjectSlug, courseSlug);
  if (!res) return [];
  const codes = [];
  for (const domain of res.course.domains) {
    for (const s of domain.standards || []) {
      if (s.code) codes.push(s.code);
    }
  }
  return codes;
}

// A small, deterministic, DISTINCT slice of the course's real VDOE-released
// practice questions for one standard's page.
//
// These are honestly framed on the page as *course* practice, not as questions
// tagged to this exact standard — our banks are course-tagged, not standard-tagged,
// so we make no false precision claim (which would be a correctness problem on a
// study site). Staggering the slice by the standard's ordinal guarantees no two
// standards in a course show the same questions, so the ~50 pages in a course are
// unique content, not near-duplicates. Deterministic (no RNG) so static builds are
// stable across deploys.
export function getStandardPractice(subjectSlug, courseSlug, standardCode, count = COUNT) {
  const all = getCourseQuestions(subjectSlug, courseSlug);
  if (!all.length) return [];
  const codes = courseStandardCodes(subjectSlug, courseSlug);
  const ordinal = Math.max(0, codes.indexOf(standardCode));
  const start = (ordinal * count) % all.length;
  const take = Math.min(count, all.length);
  const out = [];
  for (let i = 0; i < take; i++) {
    out.push(all[(start + i) % all.length]);
  }
  return out;
}
