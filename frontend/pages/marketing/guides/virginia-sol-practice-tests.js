import Link from "next/link";
import GuideArticle from "@/components/marketing/GuideArticle";
import { getGuideBySlug } from "@/lib/marketingGuides";

const guide = getGuideBySlug("virginia-sol-practice-tests");

const faqs = [
  {
    q: "Where can I find official Virginia SOL practice tests?",
    a: "The Virginia Department of Education publishes official released tests, item sets, and practice items directly on doe.virginia.gov, organized by subject and grade.",
  },
  {
    q: "Are released tests the same as the current year's SOL test?",
    a: "No. Released tests use real retired questions to show the format and difficulty of SOL tests, but they aren't the exact test a student will take. Some courses only have released item sets rather than a full released test, since their item bank can't support a full release.",
  },
  {
    q: "What's the difference between a released test and SOL Prep's practice questions?",
    a: "VDOE's released items show real retired test questions. SOL Prep's practice questions are generated per standard to target exactly what a student is weak on, based on a diagnostic — the two are complementary, not competing.",
  },
];

export default function Guide() {
  return (
    <GuideArticle slug={guide.slug} title={guide.title} description={guide.description} faqs={faqs}>
      <p>
        "Practice test" is one of the most searched terms among Virginia SOL
        parents and students — and the good news is that real, official
        practice material exists and is free. Here's where it actually lives,
        and how to use it well.
      </p>

      <h2>Official VDOE released tests and item sets</h2>
      <p>
        The Virginia Department of Education publishes{" "}
        <a
          href="https://www.doe.virginia.gov/teaching-learning-assessment/student-assessment/sol-practice-items-all-subjects/released-tests-item-sets-all-subjects"
          className="text-primary underline underline-offset-4"
        >
          Released Tests &amp; Item Sets
        </a>{" "}
        for every SOL subject. These use real, retired SOL questions to show
        the actual format, phrasing, and difficulty of the current tests.
        Some courses only have a released <em>item set</em> rather than a
        full released test, because their question bank is too small to
        retire a whole test at once.
      </p>

      <h2>Official SOL practice items</h2>
      <p>
        Separately, VDOE also publishes{" "}
        <a
          href="https://www.doe.virginia.gov/teaching-learning-assessment/student-assessment/sol-practice-items-all-subjects"
          className="text-primary underline underline-offset-4"
        >
          SOL Practice Items
        </a>{" "}
        by content area and grade — including technology-enhanced items
        (TEI), the interactive question types (drag-and-drop, hot-spot,
        multi-select) that appear on the real online test. If a student has
        never seen a TEI question before test day, that's worth fixing first.
      </p>

      <h2>What released tests won't tell you</h2>
      <p>
        A released test shows you the test's format. It doesn't tell you{" "}
        <em>which specific standards</em> a particular student is weak on —
        it's the same fixed set of questions for everyone. That's the gap a
        standard-by-standard diagnostic fills: instead of a generic practice
        test, find exactly which standards need work, then practice those
        directly.{" "}
        <Link href="/sol" className="text-primary underline underline-offset-4">
          Browse every Virginia SOL standard by subject and grade
        </Link>{" "}
        to see what a specific course actually covers.
      </p>
    </GuideArticle>
  );
}
