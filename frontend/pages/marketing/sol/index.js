import Link from "next/link";
import SeoHead from "@/components/marketing/SeoHead";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import Breadcrumbs from "@/components/marketing/Breadcrumbs";
import { Card } from "@/components/ui/card";
import { getSolCatalog } from "@/lib/solCatalog";

export async function getStaticProps() {
  const catalog = getSolCatalog();
  return {
    props: {
      subjects: catalog.map((s) => ({
        slug: s.slug,
        name: s.name,
        courses: s.courses.map((c) => ({ slug: c.slug, name: c.name })),
      })),
    },
  };
}

export default function SolIndex({ subjects }) {
  const totalCourses = subjects.reduce((sum, s) => sum + s.courses.length, 0);

  return (
    <>
      <SeoHead
        title="Virginia SOL Practice Tests by Subject & Grade | SOL Prep"
        description={`Virginia SOL practice by subject and grade across ${subjects.length} subjects and ${totalCourses} courses — Math, English, Science, and History. Standard-by-standard practice plus links to official VDOE released tests.`}
        path="/sol"
      />
      <MarketingLayout>
        <div className="container mx-auto max-w-5xl px-4 py-16">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Subjects", href: "/sol" }]} />

          <h1 className="font-display mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Virginia SOL practice tests, by subject and grade
          </h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Virginia's Standards of Learning define what students are tested on
            in each subject and grade, from kindergarten through high school
            end-of-course exams. SOL Prep maps every one of these standards to
            diagnostics, notes, flashcards, and SOL-style practice questions.
            Start with your subject below, or find official released tests in our{" "}
            <Link href="/guides/virginia-sol-practice-tests" className="text-foreground hover:underline">
              Virginia SOL practice tests guide
            </Link>
            .
          </p>

          <div className="mt-10 space-y-10">
            {subjects.map((subject) => (
              <section key={subject.slug} aria-labelledby={`${subject.slug}-heading`}>
                <div className="flex items-baseline justify-between">
                  <h2 id={`${subject.slug}-heading`} className="text-xl font-semibold">
                    <Link href={`/sol/${subject.slug}`} className="hover:underline">
                      {subject.name}
                    </Link>
                  </h2>
                  <span className="text-sm text-muted-foreground">
                    {subject.courses.length} courses
                  </span>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {subject.courses.map((course) => (
                    <Link key={course.slug} href={`/sol/${subject.slug}/${course.slug}`}>
                      <Card className="p-4 text-sm transition-colors hover:bg-muted">
                        {course.name}
                      </Card>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </MarketingLayout>
    </>
  );
}
