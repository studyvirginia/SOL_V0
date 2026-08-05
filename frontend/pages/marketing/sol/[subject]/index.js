import Link from "next/link";
import SeoHead from "@/components/marketing/SeoHead";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import Breadcrumbs from "@/components/marketing/Breadcrumbs";
import { Card } from "@/components/ui/card";
import { getSolCatalog, getSubjectBySlug } from "@/lib/solCatalog";

const SUBJECT_INTROS = {
  math:
    "Virginia's Math SOL tests run from Kindergarten through high school, covering number sense, computation, algebra, geometry, and functions — plus electives like Trigonometry, Discrete Mathematics, and Data Science.",
  english:
    "English SOL tests assess reading and writing every year from Kindergarten through Grade 12 — vocabulary, comprehension of fiction and nonfiction, research, and written composition.",
  science:
    "Science SOL tests cover scientific investigation, life science, physical science, and earth science in elementary and middle school, then split into high school electives across Biology, Chemistry, Physics, and Earth Science.",
  history:
    "History & Social Science SOL tests trace history both chronologically and thematically — civics, geography, and Virginia, U.S., and world history — culminating in end-of-course exams like Civics and Economics, World History, and U.S. Government.",
};

export async function getStaticPaths() {
  const catalog = getSolCatalog();
  return {
    paths: catalog.map((s) => ({ params: { subject: s.slug } })),
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const subject = getSubjectBySlug(params.subject);
  if (!subject) return { notFound: true };

  return {
    props: {
      subject: {
        slug: subject.slug,
        name: subject.name,
        courses: subject.courses.map((c) => ({
          slug: c.slug,
          name: c.name,
          domainCount: c.domainCount,
          standardCount: c.standardCount,
        })),
      },
    },
  };
}

export default function SubjectPage({ subject }) {
  const intro = SUBJECT_INTROS[subject.slug] || "";

  return (
    <>
      <SeoHead
        title={`${subject.name} SOL Prep — All Grades & Courses | SOL Prep`}
        description={`${subject.name} SOL standards for every grade and course, with AI-guided study for each one. ${intro}`}
        path={`/sol/${subject.slug}`}
      />
      <MarketingLayout>
        <div className="container mx-auto max-w-5xl px-4 py-16">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Subjects", href: "/sol" },
              { label: subject.name, href: `/sol/${subject.slug}` },
            ]}
          />

          <h1 className="font-display mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            {subject.name} SOL standards
          </h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">{intro}</p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {subject.courses.map((course) => (
              <Link key={course.slug} href={`/sol/${subject.slug}/${course.slug}`}>
                <Card className="p-5 transition-colors hover:bg-muted">
                  <h2 className="font-semibold">{course.name}</h2>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {course.domainCount} strands &middot; {course.standardCount} standards
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </MarketingLayout>
    </>
  );
}
