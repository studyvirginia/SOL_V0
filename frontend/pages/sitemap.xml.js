import { getSolCatalog, getAllStandardParams } from "@/lib/solCatalog";
import { GUIDES } from "@/lib/marketingGuides";
import { listPracticeCourses } from "@/lib/practiceCatalog";

const SITE_URL = "https://solprep.com";

// Priority signals crawl importance to Google. Hub pages that target the
// highest-volume "practice test" queries get the most weight; deep standard
// pages the least. changefreq/lastmod nudge re-crawl of the pages we just enriched.
function getRoutes() {
  const catalog = getSolCatalog();
  const subjectRoutes = catalog.map((s) => ({ path: `/sol/${s.slug}`, priority: "0.9" }));
  const courseRoutes = catalog.flatMap((s) =>
    s.courses.map((c) => ({ path: `/sol/${s.slug}/${c.slug}`, priority: "0.8" }))
  );
  const standardRoutes = getAllStandardParams().map((p) => ({
    path: `/sol/${p.subject}/${p.course}/${p.standard}`,
    priority: "0.6",
  }));
  const guideRoutes = GUIDES.map((g) => ({ path: `/guides/${g.slug}`, priority: "0.7" }));
  // Practice pages target the highest-volume "[course] sol practice test" queries
  // and carry real question content — highest crawl priority after the home hub.
  const practiceRoutes = listPracticeCourses().map((c) => ({
    path: `/sol/${c.subject}/${c.course}/practice`,
    priority: "0.9",
  }));
  return [
    { path: "/", priority: "1.0" },
    { path: "/sol", priority: "0.9" },
    { path: "/practice", priority: "0.9" },
    { path: "/guides", priority: "0.7" },
    { path: "/about", priority: "0.4" },
    { path: "/privacy", priority: "0.2" },
    { path: "/terms", priority: "0.2" },
    ...subjectRoutes,
    ...practiceRoutes,
    ...courseRoutes,
    ...standardRoutes,
    ...guideRoutes,
  ];
}

function generateSitemap(lastmod) {
  const urls = getRoutes()
    .map(
      ({ path, priority }) => `  <url>
    <loc>${SITE_URL}${path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

export async function getServerSideProps({ res }) {
  const lastmod = new Date().toISOString().split("T")[0];
  res.setHeader("Content-Type", "application/xml");
  res.write(generateSitemap(lastmod));
  res.end();
  return { props: {} };
}

export default function Sitemap() {
  return null;
}
