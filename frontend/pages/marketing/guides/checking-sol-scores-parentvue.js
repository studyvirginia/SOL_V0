import Link from "next/link";
import GuideArticle from "@/components/marketing/GuideArticle";
import { getGuideBySlug } from "@/lib/marketingGuides";

const guide = getGuideBySlug("checking-sol-scores-parentvue");

const faqs = [
  {
    q: "Does every Virginia school division use ParentVUE?",
    a: "No. ParentVUE (from Edupoint/Synergy) is widely used across Virginia, including large divisions like Fairfax County, Loudoun County, and Prince William County, but some divisions use other parent portals like PowerSchool. Check your school's website to confirm which one applies to you.",
  },
  {
    q: "I can't find my child's SOL scores in the parent portal. What now?",
    a: "SOL results are typically released after the state's scoring window closes, which can be weeks after the test itself, and portal access sometimes needs to be re-enabled each school year. If it's been a while and you still see nothing, contact your school's front office or testing coordinator directly.",
  },
  {
    q: "Are SOL scores in the parent portal the same as the state report?",
    a: "Generally yes — divisions typically post the same scaled score and performance level (Fail, Pass/Proficient, Pass/Advanced) that appears on the official state score report, though the exact layout varies by division and portal.",
  },
];

export default function Guide() {
  return (
    <GuideArticle slug={guide.slug} title={guide.title} description={guide.description} faqs={faqs}>
      <p>
        SOL scores usually don't come home in a backpack anymore — most
        Virginia divisions post them to a parent portal instead. Here's
        where to actually look.
      </p>

      <h2>Start with your division's parent portal</h2>
      <p>
        <strong>ParentVUE</strong> (built by Edupoint/Synergy) is the most
        widely used parent portal in Virginia, used by large divisions
        including Fairfax County, Loudoun County, and Prince William County.
        But it isn't universal — some divisions use other systems like
        PowerSchool. If you're not sure which one your school uses, check
        your school or division's website, or the welcome materials sent at
        the start of the year.
      </p>

      <h2>Why scores sometimes aren't there yet</h2>
      <p>
        SOL results aren't instant. Tests go through a state scoring window
        before results are finalized and released to divisions, which can
        take a few weeks after the actual test date. If your child just
        tested, an empty scores page in the portal usually just means the
        state hasn't released results yet — not that something's wrong.
      </p>

      <h2>If the portal genuinely has nothing</h2>
      <p>
        If enough time has passed and there's still nothing showing:
      </p>
      <ul>
        <li>Confirm your parent portal account is active for the current school year — some divisions require re-activation annually.</li>
        <li>Check whether your division posts SOL results in a separate report (sometimes a downloadable PDF) rather than inline in the portal.</li>
        <li>Contact your school's testing coordinator or front office directly — they can look up results even if the portal isn't showing them yet.</li>
      </ul>

      <h2>Once you have the score</h2>
      <p>
        A scaled score and a performance level are a start, but they don't
        say which specific standards need work.{" "}
        <Link href="/guides/how-sol-scores-are-reported" className="text-primary underline underline-offset-4">
          See how SOL scoring actually works
        </Link>{" "}
        to make sense of the number, then{" "}
        <Link href="/sol" className="text-primary underline underline-offset-4">
          browse the standards for that subject and grade
        </Link>{" "}
        to find exactly what to focus on next.
      </p>
    </GuideArticle>
  );
}
