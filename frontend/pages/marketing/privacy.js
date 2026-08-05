import SeoHead, { SITE_NAME } from "@/components/marketing/SeoHead";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import Breadcrumbs from "@/components/marketing/Breadcrumbs";

export default function Privacy() {
  return (
    <>
      <SeoHead
        title="Privacy Policy | SOL Prep"
        description="How SOL Prep and solprep.com handle data: what this marketing site collects, what the study app processes, and what we don't do."
        path="/privacy"
      />
      <MarketingLayout>
        <div className="container mx-auto max-w-2xl px-4 py-16">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Privacy", href: "/privacy" }]} />
          <h1 className="font-display mt-4 text-3xl font-bold tracking-tight">Privacy Policy</h1>
          <p className="mt-2 text-sm text-muted-foreground">Last updated: 2026</p>

          <div className="mt-6 space-y-5 text-muted-foreground [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
            <p>
              This page covers two things: the public reference site at{" "}
              <strong>solprep.com</strong>, and the study assistant at{" "}
              <strong>app.solprep.com</strong>. This is a good-faith
              description of how each currently works, written in plain
              language rather than legal boilerplate — it will be reviewed
              and formalized before general launch.
            </p>

            <h2>solprep.com (this site)</h2>
            <p>
              This is a static reference site. It doesn't have accounts,
              logins, or forms that collect personal information. "Get early
              access" links open your own email client via a{" "}
              <code>mailto:</code> link — we only see what you choose to send
              us that way.
            </p>

            <h2>app.solprep.com (the study assistant)</h2>
            <p>
              The study app works differently, since it's an interactive AI
              tutor:
            </p>
            <ul>
              <li>
                Messages you send are processed by a third-party AI provider
                (via OpenRouter) to generate responses. We don't control that
                provider's infrastructure, but we don't use your
                conversations to train our own models.
              </li>
              <li>
                Session and progress data (like which standards you've
                covered) is stored locally in your browser using IndexedDB —
                it stays on your device unless a future account/sync feature
                says otherwise.
              </li>
              <li>
                We do not sell personal data to third parties.
              </li>
            </ul>

            <h2>Questions</h2>
            <p>
              If you have questions about data handling, email{" "}
              <a href="mailto:lincolnljmarine@gmail.com" className="text-primary underline underline-offset-4">
                lincolnljmarine@gmail.com
              </a>
              .
            </p>
          </div>
        </div>
      </MarketingLayout>
    </>
  );
}
