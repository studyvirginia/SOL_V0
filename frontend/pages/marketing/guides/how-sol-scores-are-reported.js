import GuideArticle from "@/components/marketing/GuideArticle";
import { getGuideBySlug } from "@/lib/marketingGuides";

const guide = getGuideBySlug("how-sol-scores-are-reported");

const faqs = [
  {
    q: "What is a passing score on the SOL test?",
    a: "SOL scores are reported on a 0–600 scale. A scaled score of 400 or above has historically meant Pass/Proficient, and 500 or above means Pass/Advanced. The Virginia Department of Education is phasing in higher cut scores for reading and math starting in the 2026–27 school year — check with your school for the exact current-year cut score in your child's subject and grade.",
  },
  {
    q: "What does 'Pass/Advanced' mean on an SOL score report?",
    a: "Pass/Advanced is the highest SOL performance level, indicating a student scored well above the minimum proficiency threshold — historically a scaled score of 500 or higher out of 600.",
  },
  {
    q: "Is a 400 still a passing SOL score?",
    a: "It depends on the school year and subject. Historically 400 was the proficient/passing threshold. Virginia is raising the bar for reading and math starting 2026–27, with an 'approaching' level bridging the transition — the Class of 2026 is exempted from the new thresholds. Confirm the current cut score with your school division or the Virginia Department of Education.",
  },
];

export default function Guide() {
  return (
    <GuideArticle slug={guide.slug} title={guide.title} description={guide.description} faqs={faqs}>
      <p>
        SOL score reports use a scale that's unfamiliar to most parents until
        their child brings one home. Here's what the numbers actually mean.
      </p>

      <h2>Virginia SOL score chart</h2>
      <p>
        Every SOL test score is converted onto a common <strong>0–600 scale</strong>,
        regardless of how many raw questions a student got right. That
        scaled score is what determines the performance level on the report:
      </p>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left">
              <th className="px-4 py-2 font-semibold text-foreground">Scaled score</th>
              <th className="px-4 py-2 font-semibold text-foreground">Performance level</th>
              <th className="px-4 py-2 font-semibold text-foreground">Result</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border">
              <td className="px-4 py-2">0–399</td>
              <td className="px-4 py-2">Fail</td>
              <td className="px-4 py-2">Did not pass</td>
            </tr>
            <tr className="border-b border-border">
              <td className="px-4 py-2">400–499</td>
              <td className="px-4 py-2">Pass / Proficient</td>
              <td className="px-4 py-2">Passed</td>
            </tr>
            <tr>
              <td className="px-4 py-2">500–600</td>
              <td className="px-4 py-2">Pass / Advanced</td>
              <td className="px-4 py-2">Passed, highest tier</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="text-sm">
        This is the historical scoring chart used across recent school
        years. Reading and math results in grades 3–8 sometimes report an
        additional "basic" tier below proficient for a more granular
        picture, and — as covered below — the cut scores themselves are
        changing starting 2026–27.
      </p>

      <h2>Cut scores are changing starting 2026–27</h2>
      <p>
        The Virginia Department of Education has been raising the academic
        bar for reading and math proficiency, phased in starting with the
        2026–27 school year, with an <strong>"approaching"</strong> performance
        level acting as a bridge while schools and students adjust. Exact cut
        scores vary by subject and grade and are set by VDOE — your child's
        official score report and your school's testing coordinator are the
        most reliable source for the specific number that applied to their
        test.
      </p>

      <h2>What to actually do with a score report</h2>
      <p>
        A single scaled score is useful, but it doesn't tell you{" "}
        <em>which</em> standards your child struggled with — only the overall
        result. The more actionable view is a standard-by-standard
        breakdown: which specific skills, within which strand, need more
        work. That's the level SOL Prep is built around, rather than a single
        pass/fail number.
      </p>
    </GuideArticle>
  );
}
