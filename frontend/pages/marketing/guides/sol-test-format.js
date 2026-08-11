import GuideArticle from "@/components/marketing/GuideArticle";
import { getGuideBySlug } from "@/lib/marketingGuides";
import Link from "next/link";

const guide = getGuideBySlug("sol-test-format");

const faqs = [
  {
    q: "How many questions are on the SOL test?",
    a: "It varies by subject and grade, but most Virginia SOL tests have roughly 35–60 scored questions, plus a small number of field-test items that don't count toward the score. Reading tests are on the longer end because of the passages; some tests also include technology-enhanced items alongside multiple-choice questions. Check the test blueprint for your subject and grade for the exact count.",
  },
  {
    q: "What kinds of questions are on the SOL test?",
    a: "Most items are multiple-choice with four answer options, but SOL tests also use technology-enhanced items (TEIs) — drag-and-drop, fill-in-the-blank, hot spot, and similar interactive formats delivered on the computer. Writing tests include a multiple-choice/TEI section plus a written composition (short-paper) component in the grades that take them.",
  },
  {
    q: "Are the SOL tests timed?",
    a: "SOL tests are generally not strictly timed — students are given ample time to finish, and schools schedule testing across multiple days so students aren't rushed. Specific accommodations for extended time are handled through IEPs and 504 plans.",
  },
  {
    q: "Are SOL tests taken on a computer?",
    a: "Yes. Nearly all SOL tests are taken online through TestNav, the secure testing platform. Our TestNav guide covers what the interface looks like and the online tools students can use during the test.",
  },
];

export default function Guide() {
  return (
    <GuideArticle slug={guide.slug} title={guide.title} description={guide.description} faqs={faqs}>
      <p>
        Knowing the <strong>format</strong> of the SOL test — how many questions,
        what kinds, and how long — takes away a lot of test-day anxiety. Here&rsquo;s
        what Virginia SOL tests actually look like, and how the format differs by
        subject.
      </p>

      <h2>How many questions are on the SOL test?</h2>
      <p>
        There isn&rsquo;t one number for every test. Most SOL tests have roughly{" "}
        <strong>35–60 scored questions</strong>, and each also includes a handful of
        unscored <em>field-test</em> items being tried out for future tests — those
        don&rsquo;t count toward the student&rsquo;s score. Reading tests tend to be
        longer because they&rsquo;re built around reading passages. The exact number
        for a given test is published in that subject&rsquo;s{" "}
        <strong>test blueprint</strong> from the Virginia Department of Education.
      </p>

      <h2>Question types: multiple-choice and technology-enhanced items</h2>
      <p>
        Two main formats show up on nearly every SOL test:
      </p>
      <ul>
        <li><strong>Multiple-choice</strong> — a question with four answer options (A–D or F–J), one correct.</li>
        <li><strong>Technology-enhanced items (TEIs)</strong> — interactive computer-based questions such as drag-and-drop, fill-in-the-blank, hot spot (click a region), and select-all-that-apply.</li>
      </ul>
      <p>
        The multiple-choice questions are exactly what you can rehearse with our{" "}
        <Link href="/practice">free SOL practice tests</Link>, which are drawn from
        official released items.
      </p>

      <h2>Writing tests are different</h2>
      <p>
        In the grades that take a <strong>writing</strong> SOL, the test has two
        parts: a multiple-choice/TEI section on editing and revising, and a{" "}
        <strong>written composition</strong> where students plan and write a
        short paper that&rsquo;s scored for both content and conventions.
      </p>

      <h2>How long does the SOL test take?</h2>
      <p>
        SOL tests are generally <strong>not strictly timed</strong>. Students get
        ample time to finish, and schools usually spread testing across multiple
        days. Extended-time and other accommodations are provided through IEPs and
        504 plans — see our{" "}
        <Link href="/guides/sol-testing-accommodations">accommodations guide</Link>.
      </p>

      <h2>It&rsquo;s taken on the computer</h2>
      <p>
        Nearly all SOL tests are delivered online through <strong>TestNav</strong>,
        with on-screen tools like a calculator (where allowed), highlighter, and
        answer eliminator. Getting comfortable with the interface ahead of time
        helps — our{" "}
        <Link href="/guides/testnav-virginia-sol">TestNav guide</Link> walks through it.
      </p>
    </GuideArticle>
  );
}
