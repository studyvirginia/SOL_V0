import GuideArticle from "@/components/marketing/GuideArticle";
import { getGuideBySlug } from "@/lib/marketingGuides";
import Link from "next/link";

const guide = getGuideBySlug("when-are-the-sol-tests");

const faqs = [
  {
    q: "When are the Virginia SOL tests given?",
    a: "Most Virginia SOL tests are administered during a spring testing window, typically in May near the end of the school year. High school end-of-course (EOC) tests are also offered in fall and summer windows, and expedited retakes are available for eligible students. Exact dates are set by each school division, so check your division's testing calendar for the specific days.",
  },
  {
    q: "What month are SOL tests in?",
    a: "The main SOL testing window falls in the spring — usually May — for grades 3–8 reading, math, science, and history. Writing tests for the applicable grades are often earlier in the spring. High school EOC courses also test in fall and summer.",
  },
  {
    q: "Are there SOL testing windows other than spring?",
    a: "Yes. High school end-of-course SOL tests run in fall, spring, and summer windows so students taking a course in a given term can test at its end. Expedited retakes let eligible students who narrowly missed a passing score retake before the year ends.",
  },
  {
    q: "How do I find the exact SOL test dates for my child?",
    a: "Exact dates vary by division and school. Check your school division's testing or academic calendar, or ask your child's teacher or school counselor. The Virginia Department of Education publishes the overall test administration schedule that divisions build their windows from.",
  },
];

export default function Guide() {
  return (
    <GuideArticle slug={guide.slug} title={guide.title} description={guide.description} faqs={faqs}>
      <p>
        &ldquo;When are the SOL tests?&rdquo; is one of the most common questions
        Virginia parents ask each spring. The short answer: most SOL tests happen
        in a <strong>spring testing window, usually in May</strong> — but the exact
        days depend on your school division, and high school courses have extra
        windows.
      </p>

      <h2>The spring SOL testing window</h2>
      <p>
        For grades 3–8, the reading, mathematics, science, and history &amp; social
        science SOL tests are given in the <strong>spring</strong>, most often in{" "}
        <strong>May</strong>, in the final weeks of the school year. Writing tests
        for the grades that take them are typically scheduled a bit earlier in the
        spring. Because Virginia SOL tests are generally not strictly timed, schools
        spread testing across several days so students aren&rsquo;t rushed.
      </p>

      <h2>High school end-of-course (EOC) windows</h2>
      <p>
        High school SOL tests are tied to <strong>end-of-course (EOC)</strong> exams
        — Algebra 1, Geometry, Biology, World History, and so on. Because students
        finish these courses at different times, EOC tests are offered in{" "}
        <strong>fall, spring, and summer</strong> windows. A student who finishes a
        course in the fall semester can take its EOC test in the fall window rather
        than waiting until May.
      </p>

      <h2>Retake and expedited retake windows</h2>
      <p>
        Virginia offers <strong>expedited retakes</strong> for eligible students who
        just miss a passing score, so they can retest before the school year ends
        instead of waiting a full year. Summer windows also give some students an
        additional chance. Our{" "}
        <Link href="/guides/sol-retake-policy">SOL retake policy guide</Link>{" "}
        covers who&rsquo;s eligible and how it works.
      </p>

      <h2>How to find your division&rsquo;s exact dates</h2>
      <ul>
        <li>Check your <strong>school division&rsquo;s testing or academic calendar</strong> — divisions set the specific days within the state window.</li>
        <li>Ask your child&rsquo;s <strong>teacher or school counselor</strong> for the schedule.</li>
        <li>The <strong>Virginia Department of Education</strong> publishes the overall test administration schedule divisions build from.</li>
      </ul>

      <h2>Use the runway before test day</h2>
      <p>
        Because the main window is in May, the months before are the time to close
        gaps. Start with a{" "}
        <Link href="/practice">free SOL practice test</Link> to see which standards
        are shaky, then focus your review there. Our{" "}
        <Link href="/guides/how-to-study-for-the-sol-test">standards-based study guide</Link>{" "}
        walks through how to prioritize.
      </p>
    </GuideArticle>
  );
}
