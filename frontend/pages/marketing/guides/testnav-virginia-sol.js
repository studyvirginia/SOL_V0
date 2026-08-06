import Link from "next/link";
import GuideArticle from "@/components/marketing/GuideArticle";
import { getGuideBySlug } from "@/lib/marketingGuides";

const guide = getGuideBySlug("testnav-virginia-sol");

const faqs = [
  {
    q: "What is TestNav?",
    a: "TestNav is the secure testing application (built by Pearson) that Virginia public schools use to administer SOL tests online. Students use it in school, under a proctor, not as a general study app.",
  },
  {
    q: "Can students practice with TestNav before test day?",
    a: "Yes. TestNav has a practice mode that loads VDOE's official SOL practice items without needing a real test ticket or login, so students can get comfortable with the interface before the actual test.",
  },
  {
    q: "Why does the TestNav interface matter?",
    a: "TestNav's toolbar, answer-flagging system, and navigation between questions work differently from a typical online quiz. Students who've never seen it before test day sometimes lose time just figuring out the interface instead of the content.",
  },
];

export default function Guide() {
  return (
    <GuideArticle slug={guide.slug} title={guide.title} description={guide.description} faqs={faqs}>
      <p>
        If your child mentioned "TestNav" and you weren't sure what it meant
        — it's not a study app or a website you log into from home. It's the
        actual software Virginia schools use to run the SOL test itself.
      </p>

      <h2>TestNav is the testing platform, not a study tool</h2>
      <p>
        TestNav is built by Pearson and used by Virginia's SOL assessment
        program to deliver tests online. Students access it at school, on a
        school-managed device, under a proctor — it isn't something a
        student logs into independently from a home computer to take the
        real test.
      </p>

      <h2>Practice mode exists, and it's official</h2>
      <p>
        TestNav has a practice mode that loads VDOE's official SOL practice
        items without a real test ticket. This is the same interface
        students will see on test day — the toolbar, the question
        navigation, the way flagged/skipped questions are marked — just with
        practice content instead of a live test. It's a genuinely useful
        first step before test day, separate from studying the actual
        subject content.
      </p>

      <h2>Interface familiarity is worth 10 minutes</h2>
      <p>
        Technology-enhanced items — drag-and-drop, hot-spot, multi-select
        questions — behave differently from a typical multiple-choice quiz.
        A student who's comfortable with the content but has never seen
        these interaction types before can lose time on test day just
        figuring out how to answer, not what the answer is. Ten minutes in
        TestNav's practice mode ahead of time removes that variable
        entirely.
      </p>

      <h2>Where TestNav practice fits into studying</h2>
      <p>
        TestNav practice mode gets a student comfortable with{" "}
        <em>how</em> the test works. It doesn't tell you which standards a
        student is actually weak on — that's a separate, more useful
        question.{" "}
        <Link href="/guides/virginia-sol-practice-tests" className="text-primary underline underline-offset-4">
          See where to find official released tests and practice items
        </Link>{" "}
        for the content side, or{" "}
        <Link href="/sol" className="text-primary underline underline-offset-4">
          browse SOL standards by subject and grade
        </Link>{" "}
        to study the specific standards a course covers.
      </p>
    </GuideArticle>
  );
}
