import Link from "next/link";
import SeoHead from "@/components/marketing/SeoHead";
import JsonLd from "@/components/marketing/JsonLd";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import Breadcrumbs from "@/components/marketing/Breadcrumbs";
import { Card } from "@/components/ui/card";
import { getSolCatalog, getSubjectBySlug } from "@/lib/solCatalog";

const SUBJECT_INTROS = {
  math:
    "Virginia's Math SOL tests run from Kindergarten through high school, covering number sense, computation, algebra, geometry, and functions — plus electives like Trigonometry, Discrete Mathematics, and Data Science.",
  english:
    "English SOL tests assess reading and writing every year from Kindergarten through Grade 12 — vocabulary, comprehension of fiction and nonfiction, research, and written composition.",
  science:
    "Science SOL tests cover scientific investigation, life science, physical science, and earth science in elementary and middle school, then split into high school electives across Biology, Chemistry, Physics, and Earth Science.",
  history:
    "History & Social Science SOL tests trace history both chronologically and thematically — civics, geography, and Virginia, U.S., and world history — culminating in end-of-course exams like Civics and Economics, World History, and U.S. Government.",
};

export async function getStaticPaths() {
  const catalog = getSolCatalog();
  return {
    paths: catalog.map((s) => ({ params: { subject: s.slug } })),
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const subject = getSubjectBySlug(params.subject);
  if (!subject) return { notFound: true };

  return {
    props: {
      subject: {
        slug: subject.slug,
        name: subject.name,
        courses: subject.courses.map((c) => ({
          slug: c.slug,
          name: c.name,
          domainCount: c.domainCount,
          standardCount: c.standardCount,
        })),
      },
    },
  };
}

export default function SubjectPage({ subject }) {
  const intro = SUBJECT_INTROS[subject.slug] || "";
  const totalStandards = subject.courses.reduce((sum, c) => sum + c.standardCount, 0);

  const faqs = [
    {
      q: `Where can I find ${subject.name} SOL practice tests?`,
      a: `Official ${subject.name} SOL released tests and practice items are published by the Virginia Department of Education at doe.virginia.gov — see our Virginia SOL practice tests guide for direct links. SOL Prep adds standard-by-standard ${subject.name} practice for each course below.`,
    },
    {
      q: `Which grades take the ${subject.name} SOL test?`,
      a: `${intro}`,
    },
    {
      q: `How many ${subject.name} SOL courses and standards are there?`,
      a: `This page lists ${subject.courses.length} ${subject.name} SOL courses covering ${totalStandards} Standards of Learning in total.`,
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

  return (
    <>
      <SeoHead
        title={`${subject.name} SOL Practice Tests — All Grades & Courses | SOL Prep`}
        description={`${subject.name} SOL practice tests and standards by grade and course — ${subject.courses.length} courses, ${totalStandards} standards, and free practice questions from official VDOE released tests.`}
        path={`/sol/${subject.slug}`}
      />
      <JsonLd data={faqJsonLd} />
      <MarketingLayout>
        <div className="container mx-auto max-w-5xl px-4 py-16">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Subjects", href: "/sol" },
              { label: subject.name, href: `/sol/${subject.slug}` },
            ]}
          />

          <h1 className="font-display mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            {subject.name} SOL practice tests &amp; standards
          </h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">{intro}</p>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Pick a course below to practice its Virginia SOL standards, or find official released
            tests in our{" "}
            <Link href="/guides/virginia-sol-practice-tests" className="text-foreground hover:underline">
              Virginia SOL practice tests guide
            </Link>
            .
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {subject.courses.map((course) => (
              <Link key={course.slug} href={`/sol/${subject.slug}/${course.slug}`}>
                <Card className="p-5 transition-colors hover:bg-muted">
                  <h2 className="font-semibold">{course.name}</h2>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {course.domainCount} strands &middot; {course.standardCount} standards
                  </p>
                </Card>
              </Link>
            ))}
          </div>

          <section aria-labelledby="faq-heading" className="mt-16">
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
        </div>
      </MarketingLayout>
    </>
  );
}
