import Link from "next/link";
import GuideArticle from "@/components/marketing/GuideArticle";
import { getGuideBySlug } from "@/lib/marketingGuides";

const guide = getGuideBySlug("how-to-study-for-the-sol-test");

const faqs = [
  {
    q: "What's the most effective way to study for an SOL test?",
    a: "Start with a diagnostic to find which specific SOL standards a student is weak on, then study those standards directly — guided notes, flashcards, and practice questions targeted at exactly those gaps — instead of reviewing an entire subject from the beginning.",
  },
  {
    q: "How long before the SOL test should a student start studying?",
    a: "Earlier is better, but the more important factor is targeting: a few focused weeks on the specific standards a student is missing is generally more effective than months of unfocused, general review.",
  },
];

export default function Guide() {
  return (
    <GuideArticle slug={guide.slug} title={guide.title} description={guide.description} faqs={faqs}>
      <p>
        Most SOL "studying" is just re-reading a textbook or grinding through
        random practice questions. Neither approach targets what a specific
        student actually needs — and for a test built directly from a
        published list of standards, that's a missed shortcut.
      </p>

      <h2>Start with a diagnostic, not a review</h2>
      <p>
        Every Virginia SOL course is broken into strands (like "Number and
        Number Sense") and individual standards within them (like{" "}
        <strong>5.NS.1</strong>). A student is rarely weak across all of
        them — usually it's a handful of specific standards dragging down
        the rest. A quick diagnostic identifies exactly which ones, so study
        time goes toward what's actually broken instead of what's already
        solid.
      </p>

      <h2>Study the standard, not the subject</h2>
      <p>
        Once the weak standards are identified, the most efficient path is
        working through each one directly:
      </p>
      <ul>
        <li>
          <strong>Guided notes</strong> written around that specific
          standard, not a generic chapter summary.
        </li>
        <li>
          <strong>Flashcards and mnemonics</strong> for the vocabulary and
          steps that standard actually tests.
        </li>
        <li>
          <strong>An analogy</strong>, when a concept isn't clicking the way
          it was first explained.
        </li>
        <li>
          <strong>Practice questions</strong> in the same style as the real
          SOL test, followed by a short quiz to confirm it stuck.
        </li>
      </ul>

      <h2>Track progress by standard, not by subject</h2>
      <p>
        "I studied math" isn't a useful signal. "I've covered 12 of 14 Grade
        5 Math standards, and I'm still shaky on Measurement and Geometry" is.
        Tracking progress at the standard level makes it obvious when a
        student is actually ready and when there's still a specific gap
        left.
      </p>

      <h2>Where to start</h2>
      <p>
        This is exactly how SOL Prep is built — diagnostic first, then
        notes, flashcards, mnemonics, analogies, and practice questions
        mapped to the specific standard a student needs.{" "}
        <Link href="/sol" className="text-primary underline underline-offset-4">
          Browse the full list of Virginia SOL standards by subject and grade
        </Link>{" "}
        to see what your child's course actually covers, or{" "}
        <a
          href="/#demo"
          className="text-primary underline underline-offset-4"
        >
          try the demo
        </a>
        .
      </p>
    </GuideArticle>
  );
}
