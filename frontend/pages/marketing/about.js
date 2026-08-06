import Link from "next/link";
import SeoHead, { SITE_NAME } from "@/components/marketing/SeoHead";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import Breadcrumbs from "@/components/marketing/Breadcrumbs";

export default function About() {
  return (
    <>
      <SeoHead
        title="About SOL Prep"
        description="SOL Prep is an AI study assistant built specifically around Virginia's Standards of Learning, mapping every diagnostic, note, and practice question to the real SOL standards."
        path="/about"
      />
      <MarketingLayout>
        <div className="container mx-auto max-w-2xl px-4 py-16">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "About", href: "/about" }]} />
          <h1 className="font-display mt-4 text-3xl font-bold tracking-tight">About {SITE_NAME}</h1>

          <div className="mt-6 space-y-5 text-muted-foreground [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground [&_p]:leading-relaxed">
            <p>
              SOL Prep is an AI study assistant built specifically around
              Virginia's Standards of Learning (SOL). Instead of generic
              review material, every diagnostic, note, flashcard, mnemonic,
              analogy, and practice question is mapped to a specific,
              published Virginia SOL standard.
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

            <h2>Where things stand</h2>
            <p>
              SOL Prep is in active development. This site,{" "}
              <a href="https://solprep.com" className="text-primary underline underline-offset-4">
                solprep.com
              </a>
              , is our public reference for every Virginia SOL standard by
              subject and grade. You can{" "}
              <a href="/#demo" className="text-primary underline underline-offset-4">
                try a live demo of the AI study assistant
              </a>{" "}
              right on the homepage while the full app is being rebuilt.
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
