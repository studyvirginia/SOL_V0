import GuideArticle from "@/components/marketing/GuideArticle";
import { getGuideBySlug } from "@/lib/marketingGuides";

const guide = getGuideBySlug("sol-retake-policy");

const faqs = [
  {
    q: "Can a student retake a failed SOL test?",
    a: "Yes, in many cases. Students in grades 3–12 who scored within a 'narrow margin' of passing — a scaled score of 375–399 — are generally eligible for an expedited retake before the next scheduled test administration. Students who missed passing by a wider margin may also qualify if there are documented extenuating circumstances.",
  },
  {
    q: "Do parents have to approve an SOL retake?",
    a: "Yes. For students in grades 3–8, school divisions must obtain and document affirmative parental consent before an expedited retake.",
  },
  {
    q: "Does a student need to do anything before retaking an SOL test?",
    a: "Yes — students must complete a comprehensive remediation program targeted at the specific gaps identified by their original test results before taking an expedited retake.",
  },
];

export default function Guide() {
  return (
    <GuideArticle slug={guide.slug} title={guide.title} description={guide.description} faqs={faqs}>
      <p>
        A failed SOL test isn't necessarily the end of the story for that
        school year. Virginia has a formal <strong>expedited retake</strong>{" "}
        process, though it comes with real requirements — it's not automatic.
      </p>

      <h2>Who's eligible</h2>
      <p>
        Students in grades 3 through 12 who scored within a{" "}
        <strong>narrow margin</strong> of passing — generally a scaled score
        of 375 to 399 — are eligible for an expedited retake before the next
        regularly scheduled test administration. Students who missed passing
        by a wider margin can still qualify if there are documented{" "}
        <strong>extenuating circumstances</strong>, or if they missed the
        original test for a legitimate reason. The division superintendent
        makes the final call on what counts as "extenuating" or "legitimate"
        for a given case.
      </p>

      <h2>What has to happen first</h2>
      <p>
        An expedited retake isn't just a second attempt at the same test.
        Before it happens, two things are required:
      </p>
      <ul>
        <li>
          <strong>Remediation</strong> — a comprehensive program targeted at
          the specific gaps the original test results identified, not
          general review.
        </li>
        <li>
          <strong>Parental consent</strong> — for grades 3–8, the school
          division must obtain and document affirmative parental permission
          before the retake happens.
        </li>
      </ul>

      <h2>Why targeted remediation matters more than a second attempt</h2>
      <p>
        Because remediation is a required step before an expedited retake —
        not just a formality — the retake window is actually a real
        opportunity to close specific gaps rather than re-take the same test
        cold. That's exactly what a standard-by-standard diagnostic is for:
        finding precisely which SOL standards a student missed, instead of
        re-studying an entire subject.
      </p>
    </GuideArticle>
  );
}
