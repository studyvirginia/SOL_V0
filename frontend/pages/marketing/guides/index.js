import Link from "next/link";
import SeoHead from "@/components/marketing/SeoHead";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import Breadcrumbs from "@/components/marketing/Breadcrumbs";
import { Card } from "@/components/ui/card";
import { GUIDES } from "@/lib/marketingGuides";

export default function GuidesIndex() {
  return (
    <>
      <SeoHead
        title="SOL Test Guides for Parents | SOL Prep"
        description="Plain-English guides to the Virginia SOL test — scoring, accommodations, retakes, and how to actually study for it."
        path="/guides"
      />
      <MarketingLayout>
        <div className="container mx-auto max-w-3xl px-4 py-16">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Guides", href: "/guides" }]} />

          <h1 className="font-display mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            SOL test guides for parents
          </h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Straight answers to the questions parents actually have about
            Virginia's Standards of Learning tests — how they're scored, what
            accommodations exist, what happens after a failed test, and how
            to actually help your child study for one.
          </p>

          <div className="mt-10 space-y-4">
            {GUIDES.map((guide) => (
              <Link key={guide.slug} href={`/guides/${guide.slug}`}>
                <Card className="p-5 transition-colors hover:bg-muted">
                  <h2 className="font-semibold">{guide.title}</h2>
                  <p className="mt-2 text-sm text-muted-foreground">{guide.description}</p>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </MarketingLayout>
    </>
  );
}
