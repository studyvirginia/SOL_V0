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
  {
    q: "How many questions are on an SOL test?",
    a: "Most SOL tests have between 35 and 50 questions, mostly multiple-choice (four answer options), plus technology-enhanced items and, for some subjects, constructed-response or essay questions.",
  },
  {
    q: "What happens if my child doesn't pass an SOL test?",
    a: "It depends on grade and subject. Most grades don't carry automatic consequences for a single test, but Grade 3 Reading is the exception — Virginia law requires students to show reading proficiency by the end of third grade, through the SOL test, an alternate assessment, or a reading portfolio, or they may be retained. In high school, passing certain end-of-course SOL tests is required to earn the five verified credits needed to graduate.",
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

      <h2>What the test actually looks like</h2>
      <p>
        SOL tests are taken on a computer through{" "}
        <Link href="/guides/testnav-virginia-sol" className="text-primary underline underline-offset-4">
          TestNav
        </Link>
        , Virginia's secure testing application. Most tests have{" "}
        <strong>35 to 50 questions</strong> — mostly multiple-choice with four
        answer options, plus technology-enhanced items (drag-and-drop,
        hot-spot, multi-select), and for some subjects, constructed-response
        or essay questions. Math SOL tests are split into a{" "}
        <strong>calculator-inactive section</strong> (number sense, mental
        math, estimation) and a <strong>calculator-active section</strong>,
        which uses an online Desmos calculator built into the test itself.
      </p>

      <h2>When SOL tests happen</h2>
      <p>
        The main SOL testing window generally runs from late spring through
        early summer each year, with high school end-of-course tests given
        as students finish the relevant course rather than on one fixed
        date. Exact testing dates are set by each school division within
        state guidelines — check with your child's school for the specific
        window that applies to them.
      </p>

      <h2>What happens if a student doesn't pass</h2>
      <p>
        For most grades and subjects, a single non-passing SOL score doesn't
        carry an automatic consequence — but there are two real exceptions
        worth knowing:
      </p>
      <ul>
        <li>
          <strong>Grade 3 Reading</strong> is the one grade level where
          reading performance has a direct retention implication under
          Virginia law: students must demonstrate reading proficiency by the
          end of third grade — through the SOL test, an alternate
          assessment, or a reading portfolio — or they may be retained.
          Divisions are required to provide reading intervention services
          before making that call.
        </li>
        <li>
          <strong>High school graduation</strong> requires five{" "}
          <em>verified credits</em>, earned by passing specific end-of-course
          SOL tests: two in English, and one each in math, science, and
          history/social science.
        </li>
      </ul>

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
