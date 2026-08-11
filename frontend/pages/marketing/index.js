import Link from "next/link";
import SeoHead, { SITE_URL, SITE_NAME } from "@/components/marketing/SeoHead";
import JsonLd from "@/components/marketing/JsonLd";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getSolCatalog } from "@/lib/solCatalog";
import { listPracticeCourses, practiceCountsBySubject } from "@/lib/practiceCatalog";
import { GUIDES } from "@/lib/marketingGuides";

const FEATURES = [
  {
    title: "Diagnostic first",
    body: "Start with a quick diagnostic that finds exactly which SOL standards you're shaky on, instead of re-studying what you already know.",
  },
  {
    title: "Guided study notes",
    body: "Notes built around the actual Virginia SOL standards for your subject — not a generic textbook summary.",
  },
  {
    title: "Flashcards & mnemonics",
    body: "Spaced-repetition flashcards and memory aids generated for the specific standard you're working on.",
  },
  {
    title: "Analogies that click",
    body: "Stuck on a concept? Get it re-explained with an analogy that actually maps to how you think about it.",
  },
  {
    title: "Practice questions & quizzes",
    body: "SOL-style practice questions with explanations, followed by quizzes that check whether it actually stuck.",
  },
  {
    title: "Progress tracking",
    body: "See which standards you've covered and which ones still need work, so studying stops feeling directionless.",
  },
];

const FAQS = [
  {
    q: "What is the Virginia SOL exam?",
    a: "Standards of Learning (SOL) tests are the statewide assessments Virginia public school students take in subjects like reading, math, science, and history to show they've met the state's learning standards.",
  },
  {
    q: "What is SOL Prep?",
    a: "SOL Prep is an AI study assistant built specifically around Virginia's SOL standards. It diagnoses weak spots, builds guided notes and flashcards, and gives you SOL-style practice questions for the standard you're actually being tested on.",
  },
  {
    q: "Where can I find real Virginia SOL practice tests?",
    a: "The Virginia Department of Education publishes official released tests and practice items for every SOL subject at doe.virginia.gov. Our practice tests guide has direct links by subject, plus how official released items differ from standard-by-standard practice.",
  },
  {
    q: "What is a passing SOL score?",
    a: "SOL scores are reported on a 0–600 scale. A scaled score of 400+ is Pass/Proficient and 500+ is Pass/Advanced, though Virginia is phasing in higher cut scores for reading and math starting 2026–27. See our SOL score chart for the full breakdown.",
  },
  {
    q: "Is SOL Prep available now?",
    a: "Yes — free SOL practice tests and the AI study assistant are live right now, no signup required. The full SOL Prep app, with diagnostics, guided study modes, and progress tracking, launches in September 2026 — you can get notified when it's ready.",
  },
  {
    q: "When does the full SOL Prep app launch?",
    a: "The full app is launching in September 2026. In the meantime, the free practice tests and AI tutor on this site are available now, so students can start preparing today.",
  },
];

const FEATURED_GUIDE_SLUGS = [
  "what-is-the-virginia-sol-test",
  "virginia-sol-changes-2026-27",
  "how-sol-scores-are-reported",
  "virginia-sol-practice-tests",
];

const SUBJECT_BLURB = {
  math: "Algebra, Geometry, and grades 3–8",
  english: "Reading practice, grades 3–12",
  science: "Biology, Chemistry, Earth Science, K–8",
  history: "Civics, World & US History, VA Studies",
};

export async function getStaticProps() {
  const catalog = getSolCatalog();
  const practiceCourses = listPracticeCourses();
  const topPractice = practiceCourses
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)
    .map((c) => ({ subject: c.subject, course: c.course, courseName: c.courseName, count: c.count }));
  const counts = practiceCountsBySubject();
  const totalQuestions = Object.values(counts).reduce((n, v) => n + v, 0);
  return {
    props: {
      subjects: catalog.map((s) => ({
        slug: s.slug,
        name: s.name,
        courseCount: s.courses.length,
      })),
      topPractice,
      stats: {
        questions: totalQuestions,
        practiceTests: practiceCourses.length,
        courses: catalog.reduce((n, s) => n + s.courses.length, 0),
      },
    },
  };
}

export default function MarketingHome({ subjects, topPractice = [], stats }) {
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    description: "Free Virginia SOL practice tests and an AI study assistant for Standards of Learning (SOL) exams.",
  };
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
  };
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const featuredGuides = FEATURED_GUIDE_SLUGS.map((slug) =>
    GUIDES.find((g) => g.slug === slug)
  ).filter(Boolean);

  return (
    <>
      <SeoHead
        title="Virginia SOL Practice Tests & AI Study Assistant | SOL Prep"
        description="Free Virginia SOL practice tests and an AI study assistant for every subject and grade — practice questions, diagnostics, and study guides mapped to the SOL standards."
      />
      <JsonLd data={organizationJsonLd} />
      <JsonLd data={websiteJsonLd} />
      <JsonLd data={faqJsonLd} />
      <MarketingLayout>
        {/* ---------- Hero ---------- */}
        <section className="relative overflow-hidden">
          <div className="container mx-auto max-w-4xl px-4 pt-16 pb-14 text-center sm:pt-24">
            <span className="inline-flex items-center gap-2 rounded-full border-2 border-foreground bg-success-soft px-3 py-1 text-xs font-semibold uppercase tracking-wide text-success">
              <span className="inline-block size-2 rounded-full bg-success" aria-hidden="true" />
              Free practice + AI tutor — live now
            </span>
            <h1 className="font-display mt-6 text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
              Free Virginia SOL practice tests, powered by an AI tutor
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
              Real questions from official VDOE released tests, mapped to the exact
              Standards of Learning your student is tested on — plus a live AI tutor.
              The full SOL Prep app launches <strong className="text-foreground">September 2026</strong>.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg">
                <a href="/practice">Start a free practice test</a>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href="#demo">Try the AI tutor</a>
              </Button>
            </div>
            <p className="mt-5 text-sm text-muted-foreground">
              Grades 3–12 · Real VDOE released questions · No signup ·{" "}
              <a
                href="mailto:lincolnljmarine@gmail.com?subject=Notify%20me%20when%20SOL%20Prep%20launches"
                className="font-medium text-foreground underline underline-offset-4"
              >
                get notified at launch
              </a>
            </p>
          </div>
        </section>

        {/* ---------- Stats band ---------- */}
        <section aria-label="At a glance" className="container mx-auto max-w-5xl px-4">
          <Card className="grid grid-cols-2 gap-6 p-6 text-center sm:grid-cols-4 sm:p-8">
            {[
              { n: stats?.questions ? stats.questions.toLocaleString() : "5,000+", l: "Real practice questions" },
              { n: stats?.courses ?? 70, l: "SOL courses covered" },
              { n: "3–12", l: "Grades supported" },
              { n: "Free", l: "No signup, ever" },
            ].map((s) => (
              <div key={s.l}>
                <div className="font-display text-3xl font-bold text-primary sm:text-4xl">{s.n}</div>
                <div className="mt-1 text-xs text-muted-foreground sm:text-sm">{s.l}</div>
              </div>
            ))}
          </Card>
        </section>

        {/* ---------- Practice by subject (primary action) ---------- */}
        <section aria-labelledby="practice-heading" className="mt-24 border-y-2 border-foreground bg-card">
          <div className="container mx-auto max-w-5xl px-4 py-16 sm:py-20">
            <h2 id="practice-heading" className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Start practicing — free SOL practice tests
            </h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Pick a subject to take a real Virginia SOL practice test. Answer each
              question and check it instantly — drawn from official VDOE released tests.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {subjects.map((s) => (
                <Link key={s.slug} href={`/sol/${s.slug}`} className="group">
                  <Card className="h-full p-5 transition-transform group-hover:-translate-y-0.5">
                    <h3 className="font-display text-lg font-bold">{s.name}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {SUBJECT_BLURB[s.slug] || `${s.courseCount} courses`}
                    </p>
                    <span className="mt-3 inline-block text-sm font-medium text-primary">
                      Practice {s.name} →
                    </span>
                  </Card>
                </Link>
              ))}
            </div>

            {topPractice.length > 0 && (
              <>
                <p className="mt-10 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Popular practice tests
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {topPractice.map((c) => (
                    <Link
                      key={`${c.subject}-${c.course}`}
                      href={`/sol/${c.subject}/${c.course}/practice`}
                      className="rounded-full border-2 border-foreground bg-background px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted"
                    >
                      {c.courseName} <span className="text-muted-foreground">· {c.count} Q</span>
                    </Link>
                  ))}
                </div>
                <p className="mt-8">
                  <Button asChild>
                    <Link href="/practice">See all SOL practice tests</Link>
                  </Button>
                </p>
              </>
            )}
          </div>
        </section>

        {/* ---------- Why it matters ---------- */}
        <section aria-labelledby="stakes-heading" className="container mx-auto max-w-5xl px-4 py-20">
          <h2 id="stakes-heading" className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Why Virginia SOL prep matters more than ever
          </h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            The bar is rising for the 2026–27 school year. Here&rsquo;s what&rsquo;s changing.
          </p>
          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {[
              {
                t: "Higher passing scores",
                b: "Virginia is phasing in higher SOL cut scores for reading and math, so a score that passed before may not clear the new bar.",
              },
              {
                t: "SOL results carry more weight",
                b: "Starting 2026–27, SOL performance is being tied more directly to outcomes — including a share of final grades in affected courses.",
              },
              {
                t: "Learning gaps persist",
                b: "Recovery from pandemic learning loss is ongoing, making targeted, standard-by-standard practice more important than generic review.",
              },
            ].map((c) => (
              <Card key={c.t} className="p-5">
                <h3 className="font-display font-bold">{c.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{c.b}</p>
              </Card>
            ))}
          </div>
          <p className="mt-6">
            <Link
              href="/guides/virginia-sol-changes-2026-27"
              className="font-medium text-primary underline underline-offset-4"
            >
              Read the full breakdown of the 2026–27 SOL changes →
            </Link>
          </p>
        </section>

        {/* ---------- AI tutor demo ---------- */}
        <section id="demo" aria-labelledby="demo-heading" className="border-y-2 border-foreground bg-card">
          <div className="container mx-auto max-w-3xl px-4 py-16 sm:py-20">
            <h2 id="demo-heading" className="font-display text-center text-3xl font-bold tracking-tight sm:text-4xl">
              Try the AI study assistant now
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">
              A live, working AI tutor — no signup. The full app launches September 2026.
            </p>
            <div className="mt-8 overflow-hidden rounded-2xl border-2 border-foreground shadow-[3px_4px_0_0_hsl(var(--foreground))]">
              <iframe
                src="https://www.playlab.ai/embedded/cmklr3bry6c6jnb0t5968zi8e"
                title="Virginia SOL Study Assistant - AI Powered SOL Test Prep"
                height="700"
                loading="lazy"
                allow="clipboard-write"
                className="block w-full border-0"
              />
            </div>
          </div>
        </section>

        {/* ---------- How it works ---------- */}
        <section aria-labelledby="features-heading" className="container mx-auto max-w-5xl px-4 py-20">
          <h2 id="features-heading" className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            How SOL Prep helps you study
          </h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Built around the actual standards — so studying stops feeling directionless.
          </p>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <Card key={f.title} className="p-5">
                <h3 className="font-display font-bold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* ---------- Guides ---------- */}
        <section aria-labelledby="guides-heading" className="border-y-2 border-foreground bg-card">
          <div className="container mx-auto max-w-5xl px-4 py-16 sm:py-20">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 id="guides-heading" className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                  SOL guides for parents & students
                </h2>
                <p className="mt-3 max-w-2xl text-muted-foreground">
                  Scoring, test dates, accommodations, and how to actually study for it.
                </p>
              </div>
              <Button asChild variant="outline">
                <Link href="/guides">All SOL guides</Link>
              </Button>
            </div>
            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              {featuredGuides.map((guide) => (
                <Link key={guide.slug} href={`/guides/${guide.slug}`} className="group">
                  <Card className="h-full p-5 transition-transform group-hover:-translate-y-0.5">
                    <h3 className="font-display font-bold">{guide.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{guide.description}</p>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- FAQ ---------- */}
        <section aria-labelledby="faq-heading" className="container mx-auto max-w-3xl px-4 py-20">
          <h2 id="faq-heading" className="font-display text-center text-3xl font-bold tracking-tight sm:text-4xl">
            Frequently asked questions
          </h2>
          <div className="mt-10 space-y-6">
            {FAQS.map((f) => (
              <div key={f.q} className="border-b border-border pb-6 last:border-0">
                <h3 className="font-display font-bold">{f.q}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ---------- Closing CTA ---------- */}
        <section aria-label="Get started" className="container mx-auto max-w-5xl px-4 pb-24">
          <Card className="bg-primary p-10 text-center text-primary-foreground sm:p-14">
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Start preparing for the SOL — free
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-primary-foreground/80">
              Take a real practice test now, or get notified when the full SOL Prep app
              launches in September 2026.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg" variant="secondary">
                <a href="/practice">Start a free practice test</a>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-transparent text-primary-foreground">
                <a href="mailto:lincolnljmarine@gmail.com?subject=Notify%20me%20when%20SOL%20Prep%20launches">
                  Get notified at launch
                </a>
              </Button>
            </div>
          </Card>
        </section>
      </MarketingLayout>
    </>
  );
}
