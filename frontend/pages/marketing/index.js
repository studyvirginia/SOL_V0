import Link from "next/link";
import SeoHead, { SITE_URL, SITE_NAME } from "@/components/marketing/SeoHead";
import JsonLd from "@/components/marketing/JsonLd";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getSolCatalog } from "@/lib/solCatalog";
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
    a: "SOL Prep is in active development. This page will grow into the full site as we get closer to launch — check back for updates.",
  },
];

export async function getStaticProps() {
  const catalog = getSolCatalog();
  return {
    props: {
      subjects: catalog.map((s) => ({
        slug: s.slug,
        name: s.name,
        courseCount: s.courses.length,
      })),
    },
  };
}

export default function MarketingHome({ subjects }) {
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    description:
      "AI-powered study assistant for Virginia Standards of Learning (SOL) exams.",
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

  return (
    <>
      <SeoHead />
      <JsonLd data={organizationJsonLd} />
      <JsonLd data={websiteJsonLd} />
      <JsonLd data={faqJsonLd} />
      <MarketingLayout>
        <div className="container mx-auto max-w-5xl px-4 py-20">
          <header className="text-center">
            <p className="mb-3 text-sm font-medium uppercase tracking-wide text-secondary">
              Coming soon
            </p>
            <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
              An AI study assistant built for Virginia SOL exams
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
              Diagnostics, guided notes, flashcards, mnemonics, and practice
              questions — all mapped directly to the Standards of Learning
              you're actually tested on.
            </p>
            <div className="mt-8 flex items-center justify-center gap-3">
              <Button asChild size="lg">
                <a href="mailto:lincolnljmarine@gmail.com?subject=Early%20access">
                  Get early access
                </a>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href="https://app.solprep.com">Try the app</a>
              </Button>
            </div>
          </header>

          <section aria-labelledby="features-heading" className="mt-24">
            <h2 id="features-heading" className="text-center text-2xl font-semibold">
              How SOL Prep helps you study
            </h2>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((f) => (
                <Card key={f.title} className="p-5">
                  <h3 className="font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
                </Card>
              ))}
            </div>
          </section>

          <section aria-labelledby="subjects-heading" className="mt-24">
            <h2 id="subjects-heading" className="text-center text-2xl font-semibold">
              Browse SOL standards by subject
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-muted-foreground">
              Every grade level and course we support, mapped to the real
              Virginia SOL standards.
            </p>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {subjects.map((s) => (
                <Link key={s.slug} href={`/sol/${s.slug}`}>
                  <Card className="p-5 transition-colors hover:bg-muted">
                    <h3 className="font-semibold">{s.name}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {s.courseCount} courses & grade levels
                    </p>
                  </Card>
                </Link>
              ))}
            </div>
          </section>

          <section aria-labelledby="guides-heading" className="mt-24">
            <h2 id="guides-heading" className="text-center text-2xl font-semibold">
              SOL test guides for parents
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-muted-foreground">
              Scoring, accommodations, retakes, and how to actually study for it.
            </p>
            <div className="mt-10 grid gap-5 sm:grid-cols-2">
              {GUIDES.map((guide) => (
                <Link key={guide.slug} href={`/guides/${guide.slug}`}>
                  <Card className="p-5 transition-colors hover:bg-muted">
                    <h3 className="font-semibold">{guide.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{guide.description}</p>
                  </Card>
                </Link>
              ))}
            </div>
          </section>

          <section aria-labelledby="faq-heading" className="mt-24 max-w-3xl mx-auto">
            <h2 id="faq-heading" className="text-center text-2xl font-semibold">
              Frequently asked questions
            </h2>
            <div className="mt-10 space-y-6">
              {FAQS.map((f) => (
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
