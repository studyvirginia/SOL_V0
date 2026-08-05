import SeoHead, { SITE_NAME, SITE_URL } from "@/components/marketing/SeoHead";
import JsonLd from "@/components/marketing/JsonLd";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import Breadcrumbs from "@/components/marketing/Breadcrumbs";

export default function GuideArticle({ slug, title, description, faqs = [], children }) {
  const path = `/guides/${slug}`;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    url: `${SITE_URL}${path}`,
    image: `${SITE_URL}/api/og?title=${encodeURIComponent(title)}`,
    datePublished: "2026-08-05",
    dateModified: "2026-08-05",
    publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
  };

  const faqJsonLd = faqs.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      }
    : null;

  return (
    <>
      <SeoHead title={title} description={description} path={path} />
      <JsonLd data={articleJsonLd} />
      {faqJsonLd && <JsonLd data={faqJsonLd} />}
      <MarketingLayout>
        <article className="container mx-auto max-w-2xl px-4 py-16">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Guides", href: "/guides" },
              { label: title, href: path },
            ]}
          />
          <h1 className="font-display mt-4 text-3xl font-bold tracking-tight">{title}</h1>
          <div className="prose-guide mt-6 space-y-5 text-muted-foreground [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground [&_strong]:text-foreground [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
            {children}
          </div>
        </article>
      </MarketingLayout>
    </>
  );
}
