import Link from "next/link";
import SeoHead from "@/components/marketing/SeoHead";
import JsonLd from "@/components/marketing/JsonLd";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import Breadcrumbs from "@/components/marketing/Breadcrumbs";
import PracticeQuiz from "@/components/marketing/PracticeQuiz";
import { Button } from "@/components/ui/button";

const YEAR = new Date().getFullYear();

// Renders one practice-test page (a "set" of questions for a course). Set 1 lives
// at /sol/{s}/{c}/practice; sets 2..N at /sol/{s}/{c}/practice/{n}. Shared by both
// so every set carries the same schema, interactivity, FAQ, and cross-linking.
export default function PracticeTest({ bank, subjectName }) {
  const { subject, course, courseName, total, setNumber, totalSets, questions, attribution } = bank;

  const basePath = `/sol/${subject}/${course}/practice`;
  const path = setNumber === 1 ? basePath : `${basePath}/${setNumber}`;
  const setLabel = totalSets > 1 ? ` — Set ${setNumber} of ${totalSets}` : "";

  const title = `${courseName} SOL Practice Test${setLabel} (${YEAR}) | SOL Prep`;
  const description =
    setNumber === 1
      ? `Free ${courseName} Virginia SOL practice test with ${total} questions from official VDOE released tests. Answer, check instantly, and review — no signup.`
      : `${courseName} SOL practice test, set ${setNumber} of ${totalSets} — ${questions.length} more free questions from official VDOE released tests. No signup.`;

  const faqs = [
    {
      q: `Are these ${courseName} SOL practice questions free?`,
      a: `Yes — this ${courseName} SOL practice test is completely free with no signup. Answer each question to check it instantly, or open "Show answer" to review.`,
    },
    {
      q: `How many ${courseName} SOL practice questions are there?`,
      a: `Across all sets, there are ${total} ${courseName} practice questions drawn from official Virginia Department of Education released SOL tests. This set has ${questions.length}.`,
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

  const quizJsonLd = {
    "@context": "https://schema.org",
    "@type": "Quiz",
    name: `${courseName} SOL Practice Test${setLabel}`,
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

  const setHref = (n) => (n === 1 ? basePath : `${basePath}/${n}`);

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
              { label: setNumber === 1 ? "Practice test" : `Practice test (set ${setNumber})`, href: path },
            ]}
          />

          <h1 className="font-display mt-4 text-3xl font-bold tracking-tight">
            {courseName} SOL Practice Test{setLabel}
          </h1>
          <p className="mt-4 text-muted-foreground">
            {setNumber === 1
              ? `${total} free ${courseName} Virginia SOL practice questions drawn from official Virginia Department of Education released tests. Pick an answer to check it instantly, or open “Show answer” to review. No signup required.`
              : `Set ${setNumber} of ${totalSets} — ${questions.length} more free ${courseName} SOL practice questions from official VDOE released tests.`}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild variant="outline">
              <Link href={`/sol/${subject}/${course}`}>All {courseName} standards</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/guides/virginia-sol-practice-tests">More official released tests</Link>
            </Button>
          </div>

          {totalSets > 1 && (
            <nav aria-label="Practice test sets" className="mt-6 flex flex-wrap gap-2">
              {Array.from({ length: totalSets }, (_, i) => i + 1).map((n) => (
                <Link
                  key={n}
                  href={setHref(n)}
                  aria-current={n === setNumber ? "page" : undefined}
                  className={
                    "rounded-md border px-3 py-1 text-sm " +
                    (n === setNumber
                      ? "border-secondary bg-secondary/10 font-medium text-foreground"
                      : "border-border text-muted-foreground hover:bg-muted")
                  }
                >
                  Test {n}
                </Link>
              ))}
            </nav>
          )}

          <PracticeQuiz questions={questions} />

          {totalSets > 1 && (
            <nav className="mt-10 flex items-center justify-between border-t border-border pt-6 text-sm">
              {setNumber > 1 ? (
                <Link href={setHref(setNumber - 1)} className="hover:underline">
                  ← Test {setNumber - 1}
                </Link>
              ) : (
                <span />
              )}
              {setNumber < totalSets && (
                <Link href={setHref(setNumber + 1)} className="hover:underline">
                  Test {setNumber + 1} →
                </Link>
              )}
            </nav>
          )}

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
