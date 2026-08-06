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
      prevCourse: index > 0 ? siblings[index - 1] : null,
      nextCourse: index < siblings.length - 1 ? siblings[index + 1] : null,
    },
  };
}

export default function CoursePage({ subject, course, prevCourse, nextCourse }) {
  const title = `${course.name} SOL Prep — Standards & Study Guide | SOL Prep`;
  const description = `${course.name} covers ${course.domainCount} strands and ${course.standardCount} Virginia SOL standards. Study each one with AI-guided diagnostics, notes, flashcards, and practice questions.`;

  const faqs = [
    {
      q: `What is on the ${course.name} SOL test?`,
      a: `${course.name} is organized into ${course.domainCount} strands: ${course.domains
        .map((d) => d.name)
        .join(", ")}.`,
    },
    {
      q: `How many standards does ${course.name} cover?`,
      a: `${course.name} covers ${course.standardCount} individual Virginia SOL standards across its ${course.domainCount} strands.`,
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
            {course.name} SOL Prep
          </h1>
          <p className="mt-4 text-muted-foreground">
            {course.name} covers <strong>{course.standardCount} Virginia SOL standards</strong>{" "}
            across <strong>{course.domainCount} strands</strong>. SOL Prep turns every one of
            them into a diagnostic, guided notes, flashcards, and practice questions.
          </p>

          <div className="mt-6 flex gap-3">
            <Button asChild>
              <a href="/#demo">Try the demo</a>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/sol/${subject.slug}`}>All {subject.name} courses</Link>
            </Button>
          </div>

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
