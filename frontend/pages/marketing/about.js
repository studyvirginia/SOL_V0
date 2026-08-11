import Link from "next/link";
import SeoHead, { SITE_NAME } from "@/components/marketing/SeoHead";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import Breadcrumbs from "@/components/marketing/Breadcrumbs";

export default function About() {
  return (
    <>
      <SeoHead
        title="About SOL Prep — Free Virginia SOL Practice & AI Tutor"
        description="Free Virginia SOL practice tests from official VDOE released items, plus an AI study assistant mapped to the real Standards of Learning. Full app September 2026."
        path="/about"
      />
      <MarketingLayout>
        <div className="container mx-auto max-w-2xl px-4 py-16">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "About", href: "/about" }]} />
          <h1 className="font-display mt-4 text-3xl font-bold tracking-tight">About {SITE_NAME}</h1>

          <div className="mt-6 space-y-5 text-muted-foreground [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground [&_p]:leading-relaxed">
            <p>
              SOL Prep gives Virginia students free{" "}
              <Link href="/practice" className="text-primary underline underline-offset-4">
                SOL practice tests
              </Link>{" "}
              and an AI study assistant, built specifically around Virginia's
              Standards of Learning (SOL). Instead of generic review material,
              every practice question, diagnostic, note, and flashcard is mapped
              to a specific, published Virginia SOL standard.
            </p>

            <h2>Why we built it</h2>
            <p>
              SOL tests are built from a public, well-defined list of
              standards — each with its own code, like{" "}
              <Link href="/sol/math/grade-5-math/5-ns-1" className="text-primary underline underline-offset-4">
                5.NS.1
              </Link>
              . Most study tools treat that structure as an afterthought and
              hand students generic review material instead. We built SOL
              Prep to work the other way around: start with a diagnostic to
              find exactly which standards a student is weak on, then study
              those specific standards directly.
            </p>

            <h2>What&rsquo;s available now</h2>
            <p>
              Free and live today on{" "}
              <a href="https://solprep.com" className="text-primary underline underline-offset-4">
                solprep.com
              </a>
              : thousands of{" "}
              <Link href="/practice" className="text-primary underline underline-offset-4">
                SOL practice questions
              </Link>{" "}
              drawn from official Virginia Department of Education released tests,
              a reference for every SOL standard by subject and grade, parent{" "}
              <Link href="/guides" className="text-primary underline underline-offset-4">
                guides
              </Link>
              , and a{" "}
              <a href="/#demo" className="text-primary underline underline-offset-4">
                live AI study assistant
              </a>
              . No signup required. The full SOL Prep app — with diagnostics,
              guided study modes, and progress tracking — launches{" "}
              <strong className="text-foreground">September 2026</strong>.
            </p>

            <h2>Get in touch</h2>
            <p>
              Questions, feedback, or press inquiries:{" "}
              <a href="mailto:lincolnljmarine@gmail.com" className="text-primary underline underline-offset-4">
                lincolnljmarine@gmail.com
              </a>
              .
            </p>
          </div>
        </div>
      </MarketingLayout>
    </>
  );
}
