import Link from "next/link";
import SeoHead from "@/components/marketing/SeoHead";
import JsonLd from "@/components/marketing/JsonLd";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import Breadcrumbs from "@/components/marketing/Breadcrumbs";
import { Card } from "@/components/ui/card";
import { getSubjectBySlug } from "@/lib/solCatalog";
import { listPracticeCourses } from "@/lib/practiceCatalog";

const SUBJECT_ORDER = ["math", "english", "science", "history"];

export async function getStaticProps() {
  const courses = listPracticeCourses();
  const bySubject = {};
  for (const c of courses) {
    (bySubject[c.subject] = bySubject[c.subject] || []).push(c);
  }
  const subjects = SUBJECT_ORDER.filter((s) => bySubject[s]).map((slug) => {
    const subject = getSubjectBySlug(slug);
    return {
      slug,
      name: subject ? subject.name : slug,
      courses: bySubject[slug].sort((a, b) => a.courseName.localeCompare(b.courseName, undefined, { numeric: true })),
    };
  });
  const total = courses.reduce((n, c) => n + c.count, 0);
  return { props: { subjects, total, courseCount: courses.length } };
}

export default function PracticeHub({ subjects, total, courseCount }) {
  const title = "Virginia SOL Practice Tests — Free Questions by Course | SOL Prep";
  const description = `${total.toLocaleString()} free Virginia SOL practice questions across ${courseCount} courses, drawn from official VDOE released tests. Answer and check instantly — no signup.`;

  const faqs = [
    {
      q: "Are these Virginia SOL practice tests free?",
      a: "Yes. Every practice test on SOL Prep is free with no signup — pick an answer to check it instantly, or reveal the answer to review.",
    },
    {
      q: "Where do the questions come from?",
      a: "The questions are drawn from official Virginia Department of Education released SOL tests, organized by course.",
    },
    {
      q: "Which SOL subjects have practice tests?",
      a: `Practice tests are available across ${courseCount} courses in ${subjects.map((s) => s.name).join(", ")}.`,
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
      <SeoHead title={title} description={description} path="/practice" />
      <JsonLd data={faqJsonLd} />
      <MarketingLayout>
        <div className="container mx-auto max-w-5xl px-4 py-16">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Practice tests", href: "/practice" }]} />

          <h1 className="font-display mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Virginia SOL practice tests
          </h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            {total.toLocaleString()} free Virginia SOL practice questions across {courseCount}{" "}
            courses, drawn from official VDOE released tests. Choose a course to start — answer each
            question to check it instantly, no signup required.
          </p>

          <div className="mt-10 space-y-10">
            {subjects.map((subject) => (
              <section key={subject.slug} aria-labelledby={`${subject.slug}-heading`}>
                <h2 id={`${subject.slug}-heading`} className="text-xl font-semibold">
                  {subject.name} SOL practice tests
                </h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {subject.courses.map((c) => (
                    <Link key={c.course} href={`/sol/${c.subject}/${c.course}/practice`}>
                      <Card className="p-4 text-sm transition-colors hover:bg-muted">
                        <span className="font-semibold">{c.courseName}</span>
                        <span className="mt-1 block text-xs text-muted-foreground">
                          {c.count} practice questions
                        </span>
                      </Card>
                    </Link>
                  ))}
                </div>
              </section>
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
