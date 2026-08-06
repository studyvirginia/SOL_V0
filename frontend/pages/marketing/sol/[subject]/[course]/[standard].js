import Link from "next/link";
import SeoHead, { SITE_NAME, SITE_URL } from "@/components/marketing/SeoHead";
import JsonLd from "@/components/marketing/JsonLd";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import Breadcrumbs from "@/components/marketing/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { getAllStandardParams, getStandardBySlugs } from "@/lib/solCatalog";

export async function getStaticPaths() {
  return {
    paths: getAllStandardParams().map((params) => ({ params })),
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const result = getStandardBySlugs(params.subject, params.course, params.standard);
  if (!result) return { notFound: true };
  return { props: result };
}

export default function StandardPage({
  subject,
  course,
  domain,
  standard,
  prevStandard,
  nextStandard,
}) {
  const path = `/sol/${subject.slug}/${course.slug}/${standard.code
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")}`;
  const title = `${standard.code} — ${course.name} SOL Standard | SOL Prep`;
  const description = `Virginia SOL standard ${standard.code} (${course.name}, ${domain.name}): ${standard.description}`;

  const definedTermJsonLd = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: standard.code,
    description: standard.description,
    inDefinedTermSet: {
      "@type": "DefinedTermSet",
      name: `${course.name} Virginia SOL Standards`,
      url: `${SITE_URL}/sol/${subject.slug}/${course.slug}`,
    },
  };

  return (
    <>
      <SeoHead title={title} description={description} path={path} />
      <JsonLd data={definedTermJsonLd} />
      <MarketingLayout>
        <div className="container mx-auto max-w-3xl px-4 py-16">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Subjects", href: "/sol" },
              { label: subject.name, href: `/sol/${subject.slug}` },
              { label: course.name, href: `/sol/${subject.slug}/${course.slug}` },
              { label: standard.code, href: path },
            ]}
          />

          <p className="mt-4 text-sm font-medium uppercase tracking-wide text-secondary">
            {domain.name}
          </p>
          <h1 className="font-display mt-2 text-3xl font-bold tracking-tight">
            Virginia SOL {standard.code}
          </h1>
          <p className="mt-4 text-muted-foreground">{standard.description}</p>

          <div className="mt-6 flex gap-3">
            <Button asChild>
              <a href="/#demo">Try the demo</a>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/sol/${subject.slug}/${course.slug}`}>Back to {course.name}</Link>
            </Button>
          </div>

          {standard.skills.length > 0 && (
            <section aria-labelledby="skills-heading" className="mt-12">
              <h2 id="skills-heading" className="text-xl font-semibold">
                What students need to be able to do
              </h2>
              <ul className="mt-4 space-y-3">
                {standard.skills.map((skill, i) => (
                  <li key={i} className="text-sm text-muted-foreground">
                    {skill.description}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <nav className="mt-16 flex items-center justify-between border-t border-border pt-6 text-sm">
            {prevStandard ? (
              <Link
                href={`/sol/${subject.slug}/${course.slug}/${prevStandard.slug}`}
                className="hover:underline"
              >
                ← {prevStandard.code}
              </Link>
            ) : (
              <span />
            )}
            {nextStandard && (
              <Link
                href={`/sol/${subject.slug}/${course.slug}/${nextStandard.slug}`}
                className="hover:underline"
              >
                {nextStandard.code} →
              </Link>
            )}
          </nav>
        </div>
      </MarketingLayout>
    </>
  );
}
