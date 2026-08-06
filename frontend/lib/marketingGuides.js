export const GUIDES = [
  {
    slug: "what-is-the-virginia-sol-test",
    title: "What Is the Virginia SOL Test? A Complete Guide for Parents",
    description:
      "What Virginia's Standards of Learning (SOL) tests are, which grades and subjects they cover, and what they mean for your child — from Kindergarten through high school end-of-course exams.",
  },
  {
    slug: "how-sol-scores-are-reported",
    title: "Virginia SOL Score Chart: Pass, Proficient, and Advanced Explained",
    description:
      "A Virginia SOL score chart covering the 0–600 scoring scale, what Pass/Proficient and Pass/Advanced mean, and how the 2026–27 cut score changes affect your child's results.",
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
  {
    slug: "virginia-sol-practice-tests",
    title: "Virginia SOL Practice Tests: Official Released Items (Free)",
    description:
      "Where to find real, official Virginia SOL practice tests and released test items from VDOE, by subject — plus how they're different from generic practice questions.",
  },
  {
    slug: "testnav-virginia-sol",
    title: "What Is TestNav? How Virginia's Online SOL Testing Works",
    description:
      "TestNav is the platform Virginia students use to take SOL tests online. Here's what parents and students should know before test day.",
  },
  {
    slug: "checking-sol-scores-parentvue",
    title: "How to Check Your Child's SOL Scores Online (ParentVUE & Parent Portals)",
    description:
      "Where Virginia parents actually go to check SOL test scores — ParentVUE and other division parent portals — and what to do if you can't find them.",
  },
];

export function getGuideBySlug(slug) {
  return GUIDES.find((g) => g.slug === slug) || null;
}
