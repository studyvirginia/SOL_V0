import PracticeTest from "@/components/marketing/PracticeTest";
import { getSubjectBySlug } from "@/lib/solCatalog";
import { listPracticeCourses, getPractice } from "@/lib/practiceCatalog";

export async function getStaticPaths() {
  return {
    paths: listPracticeCourses().map((c) => ({
      params: { subject: c.subject, course: c.course },
    })),
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const bank = getPractice(params.subject, params.course, 1);
  if (!bank) return { notFound: true };
  const subject = getSubjectBySlug(params.subject);
  return {
    props: { bank, subjectName: subject ? subject.name : params.subject },
  };
}

export default function PracticeSetOne({ bank, subjectName }) {
  return <PracticeTest bank={bank} subjectName={subjectName} />;
}
