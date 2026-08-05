export const GUIDES = [
  {
    slug: "what-is-the-virginia-sol-test",
    title: "What Is the Virginia SOL Test? A Complete Guide for Parents",
    description:
      "What Virginia's Standards of Learning (SOL) tests are, which grades and subjects they cover, and what they mean for your child — from Kindergarten through high school end-of-course exams.",
  },
  {
    slug: "how-sol-scores-are-reported",
    title: "How Virginia SOL Scores Are Reported: Pass, Proficient, and Advanced Explained",
    description:
      "How the 0–600 SOL scoring scale works, what Pass/Proficient and Pass/Advanced mean, and how the 2026–27 cut score changes affect your child's results.",
  },
  {
    slug: "sol-testing-accommodations",
    title: "SOL Testing Accommodations for IEP and 504 Students",
    description:
      "How Virginia SOL testing accommodations work for students with IEPs and 504 plans — extended time, text-to-speech, calculators, and how to request them.",
  },
  {
    slug: "sol-retake-policy",
    title: "Can My Child Retake a Failed SOL Test? The Expedited Retake Policy Explained",
    description:
      "How Virginia's expedited SOL retake policy works — who's eligible, what remediation is required, and how parental consent factors in.",
  },
  {
    slug: "how-to-study-for-the-sol-test",
    title: "How to Study for the SOL Test: A Standards-Based Approach",
    description:
      "A study strategy built around the actual Virginia SOL standards your child is tested on, instead of generic review — diagnostic first, then targeted practice.",
  },
];

export function getGuideBySlug(slug) {
  return GUIDES.find((g) => g.slug === slug) || null;
}
