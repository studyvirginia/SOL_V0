import Link from "next/link";
import SeoHead, { SITE_URL } from "@/components/marketing/SeoHead";
import JsonLd from "@/components/marketing/JsonLd";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import Breadcrumbs from "@/components/marketing/Breadcrumbs";
import { Button } from "@/components/ui/button";
import PracticeQuiz from "@/components/marketing/PracticeQuiz";
import { getAllStandardParams, getStandardBySlugs } from "@/lib/solCatalog";
import { buildStandardContent } from "@/lib/standardContent";
import { hasPractice } from "@/lib/practiceCatalog";
import { getStandardPractice } from "@/lib/standardPractice";

export async function getStaticPaths() {
  return {
    paths: getAllStandardParams().map((params) => ({ params })),
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const result = getStandardBySlugs(params.subject, params.course, params.standard);
  if (!result) return { notFound: true };
  const practice = getStandardPractice(params.subject, params.course, result.standard.code);
  return {
    props: {
      ...result,
      coursePractice: hasPractice(params.subject, params.course),
      practice,
    },
  };
}

export default function StandardPage({
  subject,
  course,
  domain,
  standard,
  relatedStandards = [],
  coursePractice = false,
  practice = [],
  prevStandard,
  nextStandard,
}) {
  const path = `/sol/${subject.slug}/${course.slug}/${standard.code
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")}`;

  const { keywords, title, description, intro, faqs, faqJsonLd } = buildStandardContent({
    subject,
    course,
    domain,
    standard,
  });

  const definedTermJsonLd = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: standard.code,
    description: standard.description,
    inDefinedTermSet: {
      "@type": "DefinedTermSet",
      name: `${course.name} Virginia SOL Standards`,
      url: `${SITE_URL}/sol/${subject.slug}/${course.slug}`,
    },
  };

  // Real, unique practice content lifts these pages out of "thin": a page with
  // embedded questions is indexed; one without (course has no bank) stays noindex.
  const hasEmbeddedPractice = practice.length > 0;
  const quizJsonLd = hasEmbeddedPractice
    ? {
        "@context": "https://schema.org",
        "@type": "Quiz",
        name: `${course.name} SOL practice — ${standard.code}`,
        about: { "@type": "Thing", name: `${course.name} Virginia Standards of Learning` },
        educationalLevel: course.name,
        hasPart: practice.map((q) => {
          const correct = q.choices.find((c) => c.label === q.answer);
          return {
            "@type": "Question",
            eduQuestionType: "Multiple choice",
            text: q.stem,
            acceptedAnswer: { "@type": "Answer", text: correct ? correct.text : q.answer },
            suggestedAnswer: q.choices
              .filter((c) => c.label !== q.answer)
              .map((c) => ({ "@type": "Answer", text: c.text })),
          };
        }),
      }
    : null;

  return (
    <>
      {/* Pages with embedded real questions are indexable (unique, useful content).
          Pages whose course has no question bank stay noindex, follow — kept for
          users + internal linking but out of the index so the footprint stays
          quality-dominated. See SEO_STRATEGY.md. */}
      <SeoHead title={title} description={description} path={path} noindex={!hasEmbeddedPractice} />
      {quizJsonLd && <JsonLd data={quizJsonLd} />}
      <JsonLd data={definedTermJsonLd} />
      <JsonLd data={faqJsonLd} />
      <MarketingLayout>
        <div className="container mx-auto max-w-3xl px-4 py-16">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Subjects", href: "/sol" },
              { label: subject.name, href: `/sol/${subject.slug}` },
              { label: course.name, href: `/sol/${subject.slug}/${course.slug}` },
              { label: standard.code, href: path },
            ]}
          />

          <p className="mt-4 text-sm font-medium uppercase tracking-wide text-secondary">
            {course.name} &middot; {domain.name}
          </p>
          <h1 className="font-display mt-2 text-3xl font-bold tracking-tight">
            Virginia SOL {standard.code}
          </h1>
          <p className="mt-4 text-muted-foreground">{intro}</p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild>
              <a href="/#demo">Practice {standard.code}</a>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/sol/${subject.slug}/${course.slug}`}>All {course.name} standards</Link>
            </Button>
          </div>

          <section aria-labelledby="what-heading" className="mt-12">
            <h2 id="what-heading" className="text-xl font-semibold">
              What SOL {standard.code} means
            </h2>
            <p className="mt-4 text-sm text-muted-foreground">{standard.description}</p>
          </section>

          {hasEmbeddedPractice && (
            <section aria-labelledby="practice-heading" className="mt-12">
              <h2 id="practice-heading" className="text-xl font-semibold">
                Practice {course.name} SOL questions
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Free {course.name} questions from official Virginia Department of Education released
                SOL tests — good practice while you work on {standard.code} and the rest of the
                course. Pick an answer to check it instantly, or open “Show answer” to review.
              </p>
              <PracticeQuiz questions={practice} />
              {coursePractice && (
                <p className="mt-6 text-sm">
                  <Link
                    href={`/sol/${subject.slug}/${course.slug}/practice`}
                    className="font-medium text-foreground hover:underline"
                  >
                    → Take the full free {course.name} SOL practice test
                  </Link>
                </p>
              )}
            </section>
          )}

          {standard.skills.length > 0 && (
            <section aria-labelledby="skills-heading" className="mt-12">
              <h2 id="skills-heading" className="text-xl font-semibold">
                Skills you&rsquo;ll practice for {standard.code}
              </h2>
              <ul className="mt-4 space-y-3">
                {standard.skills.map((skill, i) => (
                  <li key={i} className="text-sm text-muted-foreground">
                    {skill.description}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {keywords.length > 0 && (
            <section aria-labelledby="concepts-heading" className="mt-12">
              <h2 id="concepts-heading" className="text-xl font-semibold">
                Key concepts covered by {standard.code}
              </h2>
              <ul className="mt-4 flex flex-wrap gap-2">
                {keywords.map((kw) => (
                  <li
                    key={kw}
                    className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground"
                  >
                    {kw}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section aria-labelledby="study-heading" className="mt-12">
            <h2 id="study-heading" className="text-xl font-semibold">
              How to study and practice SOL {standard.code}
            </h2>
            <p className="mt-4 text-sm text-muted-foreground">
              Start with a quick diagnostic to see whether {standard.code} is already solid, then
              work each skill above with guided notes, flashcards, and SOL-style practice questions.
              For official released items, see our{" "}
              <Link href="/guides/virginia-sol-practice-tests" className="text-foreground hover:underline">
                Virginia SOL practice tests guide
              </Link>{" "}
              and{" "}
              <Link href="/guides/how-to-study-for-the-sol-test" className="text-foreground hover:underline">
                how to study for the SOL test
              </Link>
              .
            </p>
            {coursePractice && (
              <p className="mt-4 text-sm">
                <Link
                  href={`/sol/${subject.slug}/${course.slug}/practice`}
                  className="font-medium text-foreground hover:underline"
                >
                  → Take the free {course.name} SOL practice test
                </Link>
              </p>
            )}
          </section>

          {relatedStandards.length > 0 && (
            <section aria-labelledby="related-heading" className="mt-12">
              <h2 id="related-heading" className="text-xl font-semibold">
                Related {course.name} standards in {domain.name}
              </h2>
              <ul className="mt-4 space-y-2">
                {relatedStandards.map((rel) => (
                  <li key={rel.slug} className="text-sm text-muted-foreground">
                    <Link
                      href={`/sol/${subject.slug}/${course.slug}/${rel.slug}`}
                      className="font-mono text-xs text-foreground hover:underline"
                    >
                      {rel.code}
                    </Link>
                    {" — "}
                    {rel.description}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {faqs.length > 0 && (
            <section aria-labelledby="faq-heading" className="mt-12">
              <h2 id="faq-heading" className="text-xl font-semibold">
                Frequently asked questions about SOL {standard.code}
              </h2>
              <div className="mt-6 space-y-6">
                {faqs.map((f) => (
                  <div key={f.q}>
                    <h3 className="font-semibold">{f.q}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{f.a}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          <nav className="mt-16 flex items-center justify-between border-t border-border pt-6 text-sm">
            {prevStandard ? (
              <Link
                href={`/sol/${subject.slug}/${course.slug}/${prevStandard.slug}`}
                className="hover:underline"
              >
                ← {prevStandard.code}
              </Link>
            ) : (
              <span />
            )}
            {nextStandard && (
              <Link
                href={`/sol/${subject.slug}/${course.slug}/${nextStandard.slug}`}
                className="hover:underline"
              >
                {nextStandard.code} →
              </Link>
            )}
          </nav>
        </div>
      </MarketingLayout>
    </>
  );
}
