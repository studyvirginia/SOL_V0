import Link from "next/link";
import SeoHead from "@/components/marketing/SeoHead";
import JsonLd from "@/components/marketing/JsonLd";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import Breadcrumbs from "@/components/marketing/Breadcrumbs";
import PracticeQuiz from "@/components/marketing/PracticeQuiz";
import { Button } from "@/components/ui/button";
import { getSubjectBySlug } from "@/lib/solCatalog";
import { listPracticeCourses, getPractice } from "@/lib/practiceCatalog";

const YEAR = new Date().getFullYear();

export async function getStaticPaths() {
  return {
    paths: listPracticeCourses().map((c) => ({
      params: { subject: c.subject, course: c.course },
    })),
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const bank = getPractice(params.subject, params.course);
  if (!bank) return { notFound: true };
  const subject = getSubjectBySlug(params.subject);
  return {
    props: {
      bank,
      subjectName: subject ? subject.name : params.subject,
    },
  };
}

export default function PracticePage({ bank, subjectName }) {
  const { subject, course, courseName, total, questions, attribution } = bank;
  const title = `${courseName} SOL Practice Test — ${total} Questions (${YEAR}) | SOL Prep`;
  const description = `Free ${courseName} Virginia SOL practice test with ${total} questions from official VDOE released tests. Answer, check instantly, and review — no signup.`;
  const path = `/sol/${subject}/${course}/practice`;

  const faqs = [
    {
      q: `Are these ${courseName} SOL practice questions free?`,
      a: `Yes — this ${courseName} SOL practice test is completely free with no signup. Answer each question to check it instantly, or open "Show answer" to review.`,
    },
    {
      q: `How many ${courseName} SOL practice questions are there?`,
      a: `This page has ${questions.length} ${courseName} practice questions${total > questions.length ? `, part of a ${total}-question ${courseName} bank` : ""}, drawn from official Virginia Department of Education released SOL tests.`,
    },
    {
      q: `Are these real Virginia SOL questions?`,
      a: `The questions are adapted from official VDOE released SOL tests for ${courseName}. SOL Prep is an independent study aid and is not affiliated with or endorsed by the Virginia Department of Education.`,
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

  // Quiz structured data (capped set) — helps search + answer engines read the
  // page as a real assessment rather than boilerplate.
  const quizJsonLd = {
    "@context": "https://schema.org",
    "@type": "Quiz",
    name: `${courseName} SOL Practice Test`,
    about: { "@type": "Thing", name: `${courseName} Virginia Standards of Learning` },
    educationalLevel: courseName,
    hasPart: questions.slice(0, 25).map((q) => {
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
  };

  return (
    <>
      <SeoHead title={title} description={description} path={path} />
      <JsonLd data={quizJsonLd} />
      <JsonLd data={faqJsonLd} />
      <MarketingLayout>
        <div className="container mx-auto max-w-3xl px-4 py-16">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Subjects", href: "/sol" },
              { label: subjectName, href: `/sol/${subject}` },
              { label: courseName, href: `/sol/${subject}/${course}` },
              { label: "Practice test", href: path },
            ]}
          />

          <h1 className="font-display mt-4 text-3xl font-bold tracking-tight">
            {courseName} SOL Practice Test
          </h1>
          <p className="mt-4 text-muted-foreground">
            {total} free {courseName} Virginia SOL practice questions drawn from official Virginia
            Department of Education released tests. Pick an answer to check it instantly, or open
            &ldquo;Show answer&rdquo; to review. No signup required.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild variant="outline">
              <Link href={`/sol/${subject}/${course}`}>All {courseName} standards</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/guides/virginia-sol-practice-tests">More official released tests</Link>
            </Button>
          </div>

          <PracticeQuiz questions={questions} />

          <section aria-labelledby="faq-heading" className="mt-14">
            <h2 id="faq-heading" className="text-xl font-semibold">
              {courseName} SOL practice test — FAQ
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

          <p className="mt-10 border-t border-border pt-6 text-xs text-muted-foreground">
            {attribution} Practice items are provided for study purposes and are not affiliated with
            or endorsed by the Virginia Department of Education.
          </p>
        </div>
      </MarketingLayout>
    </>
  );
}
