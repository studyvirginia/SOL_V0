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

          <p className="mt-10 border-t border-border pt-6 text-xs text-muted-foreground">
            {attribution} Practice items are provided for study purposes and are not affiliated with
            or endorsed by the Virginia Department of Education.
          </p>
        </div>
      </MarketingLayout>
    </>
  );
}
