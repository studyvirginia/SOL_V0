import { getSolCatalog, getAllStandardParams } from "@/lib/solCatalog";
import { GUIDES } from "@/lib/marketingGuides";

const SITE_URL = "https://solprep.com";

function getRoutes() {
  const catalog = getSolCatalog();
  const subjectRoutes = catalog.map((s) => `/sol/${s.slug}`);
  const courseRoutes = catalog.flatMap((s) =>
    s.courses.map((c) => `/sol/${s.slug}/${c.slug}`)
  );
  const standardRoutes = getAllStandardParams().map(
    (p) => `/sol/${p.subject}/${p.course}/${p.standard}`
  );
  const guideRoutes = GUIDES.map((g) => `/guides/${g.slug}`);
  return [
    "/",
    "/sol",
    "/guides",
    ...subjectRoutes,
    ...courseRoutes,
    ...standardRoutes,
    ...guideRoutes,
  ];
}

function generateSitemap() {
  const urls = getRoutes().map(
    (route) => `  <url>
    <loc>${SITE_URL}${route}</loc>
  </url>`
  ).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

export async function getServerSideProps({ res }) {
  res.setHeader("Content-Type", "application/xml");
  res.write(generateSitemap());
  res.end();
  return { props: {} };
}

export default function Sitemap() {
  return null;
}
