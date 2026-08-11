# SOLPrep SEO Strategy — "Top 5 Across All Queries"

_Last evaluated: 2026-08-11. Data sources: Google Search Console (sc-domain:solprep.com) + Google Trends (geo=US-VA)._

## Honest goal calibration

"Top 5 on **every** query" is the north star we optimize toward — not a guarantee anyone can make. Realistic segmentation:

| Query class | Example | Winnable top-5? |
|---|---|---|
| Brand | `solprep`, `sol prep` | ✅ Already #1–3. Defend it. |
| Practice-intent, subject/course | `math sol practice test`, `algebra 1 sol practice test`, `sol reading practice test` | ✅ **Winnable — but only with real practice content** (the critical path). |
| Standard long-tail | `sol 5.7`, `sol a.eo.1`, `what is sol a.eo.1` | ✅ Winnable — we own the structured data; almost no competition. |
| Informational | `sol test scores`, `sol pass`, `sol test meaning`, `testnav`, `sol retake` | ✅ Winnable with guide content (no fabrication risk). |
| Authoritative / navigational | `vdoe`, `testnav` (the software), verbatim released items | ⚠️ **Capped** — you will not outrank doe.virginia.gov / Pearson for their own brand. Target the _long-tail around_ them, not the head term. |

Everything below is sequenced to hit the winnable classes before the **spring 2027** traffic wave.

## Current state (the data)

- **Indexing:** 576 indexed / **429 not indexed**. Of the 429, **427 are "Discovered – currently not indexed"** (Google found the URL in the sitemap but is declining to spend crawl budget), only 2 are "Crawled – not indexed." → The blocker is **crawl budget on a 1-week-old, zero-authority domain** publishing ~1,000 templated pages, aggravated by thin content.
- **Performance (3 mo):** 15 clicks / 405 impressions / avg position **20.4** (page 2). All clicks are from brand queries; every non-brand query gets impressions with **0 clicks**.
- **Seasonality (decisive):** "SOL test" interest is **~10× higher in spring, peaking ~May**; **August is the annual trough.** Next spike = **~March–May 2027 (~7 months out).** There is no traffic to win right now — the entire job is to get indexed + build authority + build content **before** the wave.
- **Keyword universe (VA, from Trends "Top" related queries):**
  - Core: `sol practice` (100), `sol practice test` (100), `sol test virginia` (72), `sol pass`, `virginia sols`
  - Subject practice (money): `math sol practice test` (100), `biology sol practice test` (73), `sol reading practice test` (68), `algebra 1 sol practice test` (40), `5th grade science sol practice test`, `world geography sol practice test`
  - Informational: `sol test scores`, `sol test meaning`, `what is sol test`, `sol pass`, `testnav`, `vdoe`, `sol retake`
  - Formula that dominates: **`[subject|course|grade] + sol practice test`**

## The five solution pillars (every lever)

### Pillar 1 — Indexing & crawl budget (unblock the 427)
1. **Add `<lastmod>` (+ `changefreq`/`priority`) to sitemap** and resubmit. *(done this session)*
2. **Request indexing** for the ~30 priority URLs manually in GSC (home, /sol, 4 subject pages, top ~15 courses, 8 guides). Don't waste it on 900 standard stubs.
3. **Strengthen internal linking** so deep pages aren't orphaned — every standard links to siblings, course, subject; every course links to its standards; hub pages link down. *(done this session)* This is the #1 on-site lever for "Discovered – not indexed."
4. **Don't fight to index all 915 thin standard pages at once.** Consider `noindex` on the thinnest until they carry real content, so crawl budget flows to pages that can rank. (Optional — see Pillar 5.)
5. **Build authority (Pillar 4).** Crawl budget scales with authority. This is the real unlock for the 427.

### Pillar 2 — On-page content & keyword targeting *(bulk done this session)*
6. **Retarget titles/H1s to real queries.** Was "{X} SOL Prep — Study Guide"; now leads with **"{X} SOL Practice Test & Study Guide"** to match `[x] sol practice test`.
7. **Quadruple content depth** on the 915 standard pages using real per-skill `keywords[]` + descriptions: plain-English explainer, "skills you'll practice," "key concepts" (keyword chips), "how to study/practice," related standards, FAQ.
8. **FAQ + FAQPage schema on every page** targeting the informational long-tail ("What is SOL X?", "How is X tested?", "Where are practice tests?").
9. **Course/subject pages become honest practice hubs** — target `[subject] sol practice test` by linking to official VDOE released tests + the AI tool + listing standards, without falsely claiming to *be* a test.
10. **Homepage** targets the head term `virginia sol practice test` as primary H1/title.

### Pillar 3 — Technical SEO
11. Canonicals ✅ (already present), OG/Twitter ✅, dynamic OG images ✅, BreadcrumbList + DefinedTerm + Course + FAQ schema ✅ (extend coverage — done).
12. **Core Web Vitals:** verify in GSC "Core Web Vitals" report; Next SSG is fast by default. Keep images/fonts lean.
13. **Mobile-first:** most SOL searches are mobile (students/parents) — verify layout at 375px.
14. **`lastmod` + `changefreq`** in sitemap *(done)*; keep one canonical host (middleware already forces solprep.com).
15. **No thin duplicate of VDOE text** — always add unique framing around the verbatim standard description.

### Pillar 4 — Off-page / authority (the real ranking unlock)
> On-page gets you _eligible_ to rank; **authority decides whether you actually do.** For a new domain this is the highest-leverage lever and the one code can't fix.
16. **Guides are your backlink assets.** Pitch the parent-facing guides (score chart, retake policy, accommodations, TestNav) to: VA PTA sites, homeschool VA groups, r/VirginiaEducation & r/homeschool, local library resource pages, teacher blogs, Facebook parent groups.
17. **Get listed** in Virginia teacher/parent resource directories and free-tool roundups.
18. **HARO / digital PR** on "how to help your kid pass the SOL," score-change news (2026–27 cut scores are a news hook).
19. **The competitor (solprep.app)** ranks partly on being slightly older + linked; a handful of real .edu/.org links likely leapfrogs a solo copycat.
20. **Google Business / social profiles** for brand entity signals.

### Pillar 5 — The practice-content critical path (wins the money keywords)
> The dominant intent is **practice questions**. Course/subject pages can rank for `[x] sol practice test` as hubs, but to actually convert and hold top-5 you need real practice content on-page. This is the copycat's whole advantage ("3,000+ released questions").
21. **Build a validated practice-item pipeline** (generate → schema-validate → SOL-ID + source-tag → human-review → publish). Do **not** ship fabricated Q&A with answer keys to a live student site un-reviewed.
22. **Prioritize the money pages:** start with subject/course practice hubs (math, reading, biology, algebra 1), not all 915 standards.
23. **Ingest official VDOE released items** where licensing allows, and clearly attribute — this is the most trustworthy practice content and what searchers want.
24. Once a course page has real practice items, its "practice test" title becomes fully honest and it can hold top-5.

## Query → page game plan

| Target query | Page that should rank | Status |
|---|---|---|
| `virginia sol practice test`, `sol practice test` | Homepage `/` | Retitle + hero copy *(this session)* → then practice content |
| `math sol practice test` | `/sol/math` (subject hub) | Retitle to practice hub *(this session)* → practice content |
| `algebra 1 sol practice test` | `/sol/math/algebra-1` (course hub) | Retitle + FAQ *(this session)* → practice content |
| `sol reading practice test` | `/sol/english` | *(this session)* → practice content |
| `biology sol practice test` | `/sol/science/biology-i` | *(this session)* → practice content |
| `sol 5.7`, `sol a.eo.1` | `/sol/{subject}/{course}/{standard}` | Enriched *(this session)* — should win, near-zero competition |
| `sol test scores`, `sol pass` | `/guides/how-sol-scores-are-reported` | Exists; build links |
| `what is sol test`, `sol test meaning` | `/guides/what-is-the-virginia-sol-test` | Exists; build links |
| `testnav` | `/guides/testnav-virginia-sol` | Exists (head term capped by Pearson) |
| `sol retake` | `/guides/sol-retake-policy` | Exists |
| `vdoe` | — | Capped (their brand). Don't chase. |

## Seasonal timeline

- **Now → Oct 2026 (trough):** index everything, enrich content (this work), fix technical, **start backlinks**. No traffic to lose; everything compounds.
- **Nov 2026 → Feb 2027:** build the validated practice-content layer on money pages; keep earning links; monitor indexing climbing.
- **Mar → May 2027 (the wave):** harvest. This is when "top 5" pays off. Everything above must be in place _before_ March.

## Implemented this session (see change report in chat)
- Sitemap `lastmod`/`changefreq`/`priority`.
- Standard pages (915): rich content from real skill/keyword data + FAQ schema + related-standard internal linking.
- Course pages (70): practice-hub reframing, keyword-targeted titles, expanded FAQ.
- Subject pages (4) + `/sol` index: `[subject] sol practice test` targeting + FAQ.
- Homepage: `virginia sol practice test` primary targeting.

## Not done here (needs you / separate work)
- **Manual "Request indexing"** in GSC for priority URLs (you, in browser).
- **Backlink outreach** (Pillar 4) — the real authority unlock.
- **Deploy:** changes are local; review and `git push` (auto-deploys via Vercel) when ready.

---

## v2 — Practice-test system + expansion (shipped)

Pillar 5 (practice content) is now built and live, plus a rigorous on-page expansion.

**Practice tests (the money-keyword engine):**
- Parsed **5,860 questions** from official VDOE released tests (`COMPLETE_SOL_BOT/*Test Database.csv`) into per-course banks under `frontend/data/practice/`. Rights-clear (VDOE released items), attributed, with a non-affiliation disclaimer. Voided/visual-only items skipped; answer keys mapped; LaTeX cleaned.
- **30 practice-test pages** at `/sol/{subject}/{course}/practice` (up to 50 real questions each) with interactive check/reveal, **Quiz + FAQPage schema**, targeting `[course] sol practice test`.
- **`/practice` hub** targeting `virginia sol practice tests`; linked from site nav + footer + homepage.
- Internal linking: homepage "popular practice tests", course-hub CTAs, and **every standard page links to its course practice test**.

**On-page/technical expansion:**
- 2 new guides: **When are the SOL tests** (dates/windows) and **SOL test format** (how many questions / item types) — money-keyword gaps + authority assets. Guides now number 10.
- **`/llms.txt`** added for AEO/GEO (AI-crawler citation).
- De-cannibalized course vs practice titles (course → "Study Guide", practice → "Practice Test").

**Deliberate decision — NOT spawning per-set / per-standard practice pages yet.**
With ~427 pages still "Discovered – not indexed," Google is already rationing crawl on this new domain. Adding a few hundred more thin-ish set pages now would spread crawl budget thinner and read as scale-without-substance (the exact pSEO failure mode). So we concentrated value on the 30 money pages and fed all questions there (capped for weight). **Phase 2 (post-authority):** once backlinks lift crawl budget and the 30 pages are indexed + ranking, expand to per-released-test set pages (`/practice/{n}`) to use the full 5,860-question corpus.

**The bottleneck is unchanged and it is not on-page:** authority/backlinks. On-page + technical are maxed; rankings now move on links + time toward the spring 2027 window.
