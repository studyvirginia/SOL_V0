import Link from "next/link";
import SeoHead, { SITE_NAME } from "@/components/marketing/SeoHead";
import JsonLd from "@/components/marketing/JsonLd";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import Breadcrumbs from "@/components/marketing/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  getSolCatalog,
  getCourseBySlugs,
  summarizeCourseDomains,
} from "@/lib/solCatalog";
import { getPractice } from "@/lib/practiceCatalog";

export async function getStaticPaths() {
  const catalog = getSolCatalog();
  const paths = catalog.flatMap((subject) =>
    subject.courses.map((course) => ({
      params: { subject: subject.slug, course: course.slug },
    }))
  );
  return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
  const result = getCourseBySlugs(params.subject, params.course);
  if (!result) return { notFound: true };

  const { subject, course } = result;
  const siblings = subject.courses.map((c) => ({ slug: c.slug, name: c.name }));
  const index = siblings.findIndex((c) => c.slug === course.slug);

  const practice = getPractice(subject.slug, course.slug);

  return {
    props: {
      subject: { slug: subject.slug, name: subject.name },
      course: {
        slug: course.slug,
        name: course.name,
        domainCount: course.domainCount,
        standardCount: course.standardCount,
        domains: summarizeCourseDomains(course.domains),
      },
      practiceCount: practice ? practice.total : 0,
      prevCourse: index > 0 ? siblings[index - 1] : null,
      nextCourse: index < siblings.length - 1 ? siblings[index + 1] : null,
    },
  };
}

const YEAR = new Date().getFullYear();

export default function CoursePage({ subject, course, practiceCount = 0, prevCourse, nextCourse }) {
  const title = `${course.name} SOL Study Guide — Standards & Skills | SOL Prep`;
  const description = `${course.name} Virginia SOL study guide: all ${course.standardCount} standards across ${course.domainCount} strands, plus a free ${course.name} practice test and AI-guided study.`;

  const faqs = [
    {
      q: `What is on the ${course.name} SOL test?`,
      a: `The ${course.name} Virginia SOL test is organized into ${course.domainCount} reporting strands: ${course.domains
        .map((d) => d.name)
        .join(", ")}. It assesses the ${course.standardCount} Standards of Learning listed on this page.`,
    },
    {
      q: `How many standards does ${course.name} cover?`,
      a: `${course.name} covers ${course.standardCount} individual Virginia SOL standards across its ${course.domainCount} strands.`,
    },
    {
      q: `Where can I find ${course.name} SOL practice tests?`,
      a: `The Virginia Department of Education publishes official released tests and practice items at doe.virginia.gov — see our Virginia SOL practice tests guide for direct links. SOL Prep adds standard-by-standard practice for each of the ${course.standardCount} ${course.name} standards below.`,
    },
    {
      q: `How should I study for the ${course.name} SOL?`,
      a: `Start with a diagnostic to find which of the ${course.standardCount} ${course.name} standards you're weakest on, then focus practice there instead of re-reviewing what you already know. Work each standard's skills, then take a mixed practice check.`,
    },
  ];

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const courseJsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.name,
    description,
    provider: {
      "@type": "Organization",
      name: SITE_NAME,
      sameAs: "https://solprep.com",
    },
  };

  return (
    <>
      <SeoHead title={title} description={description} path={`/sol/${subject.slug}/${course.slug}`} />
      <JsonLd data={faqJsonLd} />
      <JsonLd data={courseJsonLd} />
      <MarketingLayout>
        <div className="container mx-auto max-w-3xl px-4 py-16">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Subjects", href: "/sol" },
              { label: subject.name, href: `/sol/${subject.slug}` },
              { label: course.name, href: `/sol/${subject.slug}/${course.slug}` },
            ]}
          />

          <h1 className="font-display mt-4 text-3xl font-bold tracking-tight">
            {course.name} SOL Study Guide
          </h1>
          <p className="mt-4 text-muted-foreground">
            Practice for the {course.name} Virginia SOL test across all{" "}
            <strong>{course.standardCount} standards</strong> and{" "}
            <strong>{course.domainCount} strands</strong>. SOL Prep turns every standard into a
            diagnostic, guided notes, flashcards, and SOL-style practice questions — so you drill
            what you&rsquo;re actually weak on instead of re-reviewing what you know.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            {practiceCount > 0 ? (
              <Button asChild>
                <Link href={`/sol/${subject.slug}/${course.slug}/practice`}>
                  Take the {course.name} practice test
                </Link>
              </Button>
            ) : (
              <Button asChild>
                <a href="/#demo">Practice {course.name}</a>
              </Button>
            )}
            <Button asChild variant="outline">
              <Link href={`/sol/${subject.slug}`}>All {subject.name} courses</Link>
            </Button>
          </div>

          <section aria-labelledby="practice-heading" className="mt-12 rounded-lg border border-border p-6">
            <h2 id="practice-heading" className="text-xl font-semibold">
              {course.name} SOL practice tests
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              {practiceCount > 0
                ? `Practice ${course.name} with ${practiceCount} free questions from official Virginia Department of Education released tests, or drill standard by standard with SOL Prep.`
                : `Two ways to practice ${course.name}: work through official released items from the Virginia Department of Education, or drill standard by standard with SOL Prep.`}
            </p>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {practiceCount > 0 && (
                <li>
                  <Link
                    href={`/sol/${subject.slug}/${course.slug}/practice`}
                    className="text-foreground hover:underline"
                  >
                    {course.name} SOL practice test — {practiceCount} questions with answers →
                  </Link>
                </li>
              )}
              <li>
                <Link href="/guides/virginia-sol-practice-tests" className="text-foreground hover:underline">
                  Official VDOE released {course.name} tests &amp; practice items →
                </Link>
              </li>
              <li>
                <a href="/#demo" className="text-foreground hover:underline">
                  Standard-by-standard {course.name} practice with SOL Prep →
                </a>
              </li>
            </ul>
          </section>

          <section aria-labelledby="strands-heading" className="mt-12">
            <h2 id="strands-heading" className="text-xl font-semibold">
              What {course.name} covers
            </h2>
            <div className="mt-6 space-y-8">
              {course.domains.map((domain) => (
                <div key={domain.name}>
                  <h3 className="font-semibold">{domain.name}</h3>
                  <ul className="mt-2 space-y-2">
                    {domain.standards.map((standard, i) => (
                      <li key={standard.code || i} className="text-sm text-muted-foreground">
                        {standard.code && standard.slug ? (
                          <Link
                            href={`/sol/${subject.slug}/${course.slug}/${standard.slug}`}
                            className="font-mono text-xs text-foreground hover:underline"
                          >
                            {standard.code}
                          </Link>
                        ) : (
                          standard.code && (
                            <span className="font-mono text-xs text-foreground">{standard.code}</span>
                          )
                        )}
                        {standard.code && " — "}
                        {standard.description}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          <section aria-labelledby="faq-heading" className="mt-12">
            <h2 id="faq-heading" className="text-xl font-semibold">
              Frequently asked questions
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

          <nav className="mt-16 flex items-center justify-between border-t border-border pt-6 text-sm">
            {prevCourse ? (
              <Link href={`/sol/${subject.slug}/${prevCourse.slug}`} className="hover:underline">
                ← {prevCourse.name}
              </Link>
            ) : (
              <span />
            )}
            {nextCourse && (
              <Link href={`/sol/${subject.slug}/${nextCourse.slug}`} className="hover:underline">
                {nextCourse.name} →
              </Link>
            )}
          </nav>
        </div>
      </MarketingLayout>
    </>
  );
}
