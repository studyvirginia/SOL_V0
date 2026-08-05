import Link from "next/link";
import GuideArticle from "@/components/marketing/GuideArticle";
import { getGuideBySlug } from "@/lib/marketingGuides";

const guide = getGuideBySlug("what-is-the-virginia-sol-test");

const faqs = [
  {
    q: "What does SOL stand for?",
    a: "SOL stands for Standards of Learning — Virginia's set of statewide learning expectations for what students should know in each subject and grade, and the tests used to measure whether they've met them.",
  },
  {
    q: "What grades take SOL tests?",
    a: "Virginia public school students take SOL tests starting in grade 3 through reading, writing, math, science, and history/social science, continuing through high school end-of-course exams like Algebra I, Biology, and World History.",
  },
  {
    q: "Are SOL tests the same as final exams?",
    a: "No. SOL tests are statewide assessments set by the Virginia Department of Education, separate from a teacher's own classroom tests or final exams, though some divisions weight SOL results into course grades.",
  },
];

export default function Guide() {
  return (
    <GuideArticle slug={guide.slug} title={guide.title} description={guide.description} faqs={faqs}>
      <p>
        If you're a Virginia parent, you've probably heard the term "SOL test" long
        before anyone explained what it actually is. SOL stands for{" "}
        <strong>Standards of Learning</strong> — the Virginia Department of
        Education's (VDOE) set of statewide academic expectations for what
        students should know and be able to do in each subject, at each grade
        level. The SOL <em>tests</em> are how the state checks whether that
        learning actually happened.
      </p>

      <h2>Which grades and subjects are tested</h2>
      <p>
        SOL testing begins in grade 3 and continues through high school.
        Depending on the subject, tests happen every year or at specific
        checkpoints:
      </p>
      <ul>
        <li>
          <strong>Reading and Math</strong> — tested every year from grade 3
          through grade 8.
        </li>
        <li>
          <strong>Writing</strong> — tested at specific grades (traditionally
          grades 5 and 8), plus a high school end-of-course exam.
        </li>
        <li>
          <strong>Science</strong> — tested at select elementary/middle
          grades, then through high school courses like Biology, Chemistry,
          and Earth Science.
        </li>
        <li>
          <strong>History & Social Science</strong> — tested at select grades,
          then through end-of-course exams like Civics and Economics, World
          History, and U.S./Virginia Government.
        </li>
      </ul>
      <p>
        High school students also take end-of-course SOL exams in courses
        like Algebra I, Algebra II, and Geometry as they complete them, rather
        than waiting for a single grade-level test.
      </p>

      <h2>Why SOL tests exist</h2>
      <p>
        SOL tests give Virginia a consistent way to measure whether schools
        across every division are teaching the same statewide standards, and
        whether individual students are on track. Results feed into school
        accreditation, help identify students who need extra support, and (in
        some divisions) factor into course grades or graduation requirements
        for certain verified credits.
      </p>

      <h2>How this is different from just "studying more"</h2>
      <p>
        Because SOL tests are built directly from published standards — each
        with its own code, like <strong>5.NS.1</strong> for a 5th grade math
        number-sense standard — the most effective prep isn't generic review.
        It's working through the specific standards your child's grade and
        subject are actually tested on.{" "}
        <Link href="/sol" className="text-primary underline underline-offset-4">
          Browse every Virginia SOL standard by subject and grade
        </Link>{" "}
        to see exactly what's covered.
      </p>
    </GuideArticle>
  );
}
