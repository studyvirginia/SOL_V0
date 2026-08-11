// Builds rich, keyword-targeted page content for a single SOL standard from
// first-party catalog data only (description + per-skill keywords). No facts are
// invented: every sentence is a templated framing of data we already hold, so
// 900+ pages gain real depth and long-tail keyword coverage without fabricating
// practice questions, statistics, or claims about the test.

function lowerFirst(str) {
  if (!str) return "";
  return str.charAt(0).toLowerCase() + str.slice(1);
}

function stripPeriod(str) {
  return String(str || "").replace(/\.\s*$/, "");
}

// Unique, order-preserving list of every keyword across the standard's skills —
// this is the raw material for "key concepts" coverage and meta relevance.
export function collectKeywords(standard) {
  const seen = new Set();
  const out = [];
  for (const skill of standard.skills || []) {
    for (const kw of skill.keywords || []) {
      const key = kw.trim().toLowerCase();
      if (key && !seen.has(key)) {
        seen.add(key);
        out.push(kw.trim());
      }
    }
  }
  return out;
}

export function buildStandardContent({ subject, course, domain, standard }) {
  const keywords = collectKeywords(standard);
  const skillCount = (standard.skills || []).length;
  const desc = stripPeriod(standard.description);

  // Keyword-targeted title/description. Leads with the exact "Virginia SOL {code}"
  // phrasing people search, plus course + "practice & study guide" intent.
  const title = `Virginia SOL ${standard.code}: ${course.name} — Practice & Study Guide`;
  const shortDesc = desc.length > 105 ? desc.slice(0, 102).replace(/\s+\S*$/, "") + "…" : desc;
  const description =
    `Virginia SOL ${standard.code} (${course.name}): ${shortDesc}. ` +
    `Skills, key concepts, and practice for the ${course.name} SOL test.`;

  const intro =
    `Virginia SOL ${standard.code} is part of the ${domain.name} strand in ${course.name} ` +
    `(${subject.name}). Under this Standards of Learning objective, students ${lowerFirst(desc)}. ` +
    `Below is what ${standard.code} covers in plain language, the specific skills it is assessed on, ` +
    `the key concepts to review, and how to practice ${standard.code} for the Virginia SOL test.`;

  // FAQ entries — each is answered strictly from catalog data. These target the
  // "what is sol {code}", "what does {code} cover", "how to study {code}" long tail
  // and power FAQPage rich results.
  const faqs = [];

  faqs.push({
    q: `What is Virginia SOL ${standard.code}?`,
    a: `SOL ${standard.code} is a ${course.name} Standard of Learning in the ${domain.name} strand. It expects students to ${lowerFirst(desc)}.`,
  });

  if (skillCount > 0) {
    faqs.push({
      q: `What skills does SOL ${standard.code} cover?`,
      a:
        `SOL ${standard.code} is assessed on ${skillCount} skill${skillCount === 1 ? "" : "s"}: ` +
        (standard.skills || [])
          .map((s) => lowerFirst(stripPeriod(s.description)))
          .join("; ") +
        ".",
    });
  }

  faqs.push({
    q: `What strand of ${course.name} is SOL ${standard.code} in?`,
    a: `SOL ${standard.code} belongs to the ${domain.name} reporting strand of the ${course.name} Virginia Standards of Learning.`,
  });

  faqs.push({
    q: `How do I study and practice for SOL ${standard.code}?`,
    a:
      `Start with a diagnostic to see whether ${standard.code} is already solid, then work the ${skillCount} skill${skillCount === 1 ? "" : "s"} above ` +
      `with guided notes, flashcards, and SOL-style practice questions. For official released items, see the Virginia SOL practice tests guide.`,
  });

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return { keywords, title, description, intro, faqs, faqJsonLd };
}
