import GuideArticle from "@/components/marketing/GuideArticle";
import { getGuideBySlug } from "@/lib/marketingGuides";

const guide = getGuideBySlug("sol-testing-accommodations");

const faqs = [
  {
    q: "Does my child need an IEP or 504 plan to get SOL testing accommodations?",
    a: "Generally, yes — accommodations must be documented in a student's IEP or 504 Plan and justified by their individual needs. The plan specifies whether a student takes the standard SOL test with no accommodations, the SOL test with accommodations, or an alternate assessment (VAAP).",
  },
  {
    q: "What accommodations are available for SOL tests?",
    a: "Common accommodations include extended time, use of a calculator on sections that don't normally allow one, text-to-speech for reading passages, and other supports — the specific list is documented in VDOE's Special Test Accommodations Resource Guide and must align with a student's daily classroom instruction.",
  },
  {
    q: "Can accommodations be different from what a student uses in class?",
    a: "No — testing accommodations are expected to align with and be part of a student's daily instruction, not introduced for the first time on test day.",
  },
];

export default function Guide() {
  return (
    <GuideArticle slug={guide.slug} title={guide.title} description={guide.description} faqs={faqs}>
      <p>
        Students with an IEP or 504 Plan aren't simply left to take the
        standard SOL test as-is — Virginia requires every student with a
        documented disability to be considered individually for how they
        participate in state testing.
      </p>

      <h2>The three participation options</h2>
      <p>
        For every student with an IEP or 504 Plan, the plan must specify one
        of three participation paths in Virginia's accountability system:
      </p>
      <ul>
        <li>The standard SOL test, with no accommodations.</li>
        <li>The standard SOL test, with documented accommodations.</li>
        <li>
          The Virginia Alternate Assessment Program (VAAP), for students with
          the most significant cognitive disabilities.
        </li>
      </ul>

      <h2>Common accommodations</h2>
      <p>
        The specific accommodations available are laid out in VDOE's Special
        Test Accommodations Resource Guide, but commonly include:
      </p>
      <ul>
        <li>Extended time to complete the test.</li>
        <li>Use of a calculator on sections that normally restrict one.</li>
        <li>Text-to-speech or read-aloud support for reading passages.</li>
        <li>
          Other supports documented in the student's IEP or 504 Plan and
          consistent with their daily classroom instruction.
        </li>
      </ul>
      <p>
        The key requirement across all of them: accommodations have to be{" "}
        <strong>justified and documented</strong> in the student's plan, and
        they should already be part of how that student learns day to day —
        not something introduced for the first time on test day.
      </p>

      <h2>Where to start</h2>
      <p>
        If your child has an IEP or 504 Plan, testing accommodations should
        already be part of that plan's annual review. If you're not sure
        what's documented, your school's case manager or testing coordinator
        can confirm exactly what your child is approved for before the next
        SOL testing window.
      </p>
    </GuideArticle>
  );
}
