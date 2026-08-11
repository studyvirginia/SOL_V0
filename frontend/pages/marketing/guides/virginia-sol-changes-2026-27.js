import GuideArticle from "@/components/marketing/GuideArticle";
import { getGuideBySlug } from "@/lib/marketingGuides";
import Link from "next/link";

const guide = getGuideBySlug("virginia-sol-changes-2026-27");

const faqs = [
  {
    q: "Are Virginia SOL passing scores going up?",
    a: "Yes — the Virginia Board of Education is phasing in higher SOL cut scores (the scaled score needed to pass) for reading and mathematics, beginning with the 2026–27 school year, as part of raising expectations across the state. The exact current-year cut score varies by subject and grade, so confirm it with your school division or the Virginia Department of Education.",
  },
  {
    q: "Do SOL scores count toward final grades in 2026–27?",
    a: "According to reporting on Virginia's plan, SOL results are being tied more directly to student outcomes starting in 2026–27, including counting toward a portion of final grades in affected courses. Because implementation details vary, check with your school division for exactly how SOL results factor into grades this year.",
  },
  {
    q: "Why do these SOL changes matter for my child?",
    a: "Higher cut scores and greater weight on SOL results mean the margin for error is smaller than in past years, especially for high school end-of-course tests tied to verified graduation credits. Targeted practice on the specific standards a student is weak on matters more than ever.",
  },
  {
    q: "Does Virginia still have pandemic learning loss?",
    a: "Recovery is ongoing. State assessment data through 2025 has continued to show achievement gaps relative to pre-pandemic levels in several subjects, which is part of why the state is raising expectations and attaching more weight to SOL performance.",
  },
];

export default function Guide() {
  return (
    <GuideArticle slug={guide.slug} title={guide.title} description={guide.description} faqs={faqs}>
      <p>
        The stakes on Virginia&rsquo;s Standards of Learning tests are rising. Two
        changes phasing in around the <strong>2026–27 school year</strong> — higher
        passing scores and SOL results carrying more weight — mean SOL preparation
        matters more than it has in years. Here&rsquo;s what&rsquo;s changing and why.
      </p>

      <h2>1. Higher SOL cut scores</h2>
      <p>
        The <strong>Virginia Board of Education</strong> is raising the{" "}
        <strong>cut scores</strong> — the scaled score a student needs to pass — for
        reading and mathematics, phased in starting in 2026–27. In practice that means
        a score that passed in a previous year may not clear the new bar, and a
        transitional &ldquo;approaching&rdquo; level is being used to bridge the change.
        As reported by outlets including <em>Virginia Mercury</em>, this is part of a
        broader push to raise academic expectations statewide. Confirm the exact
        current-year cut score for your child&rsquo;s subject and grade with your school
        division or the Virginia Department of Education (doe.virginia.gov). See our{" "}
        <Link href="/guides/how-sol-scores-are-reported">SOL score chart guide</Link>{" "}
        for how the 0–600 scale and performance levels work.
      </p>

      <h2>2. SOL results carry more weight</h2>
      <p>
        Beyond passing thresholds, Virginia is tying SOL results more directly to
        student outcomes starting in 2026–27 — including counting toward a portion of
        final grades in affected courses, as covered in local reporting (for example,{" "}
        <em>WAVY</em>). For high school <Link href="/guides/sol-retake-policy">end-of-course
        tests</Link>, a passing score is also required to earn the verified credits
        needed for graduation. Because the specifics vary by division, ask your school
        exactly how SOL results factor into grades and credits this year.
      </p>

      <h2>3. Learning loss recovery is ongoing</h2>
      <p>
        The backdrop to these changes is a state still recovering from pandemic-era
        learning loss. Assessment data through 2025 has continued to show achievement
        gaps in several subjects relative to pre-pandemic levels — reporting from
        outlets such as <em>The Washington Post</em> has documented the uneven recovery.
        Rising expectations plus lingering gaps is exactly why <em>targeted</em>,
        standard-by-standard practice beats generic review.
      </p>

      <h2>What this means for how you prepare</h2>
      <p>
        With a higher bar and more weight on the outcome, guessing which topics to
        study is riskier. The efficient path: find the specific standards your student
        is weak on, then drill those.
      </p>
      <ul>
        <li>Start with a <Link href="/practice">free SOL practice test</Link> to surface weak spots.</li>
        <li>Review the <Link href="/sol">standards for the course</Link> so you know exactly what&rsquo;s tested.</li>
        <li>Use a <Link href="/guides/how-to-study-for-the-sol-test">standards-based study plan</Link> instead of re-reading everything.</li>
      </ul>

      <p className="text-xs">
        This guide summarizes publicly reported changes for general information and is
        not official guidance. For authoritative, current details, consult the Virginia
        Department of Education (doe.virginia.gov) and your school division.
      </p>
    </GuideArticle>
  );
}
