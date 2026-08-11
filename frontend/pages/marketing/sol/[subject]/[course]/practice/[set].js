import PracticeTest from "@/components/marketing/PracticeTest";
import { getSubjectBySlug } from "@/lib/solCatalog";
import { listPracticeSetParams, getPractice } from "@/lib/practiceCatalog";

export async function getStaticPaths() {
  return {
    paths: listPracticeSetParams().map((p) => ({
      params: { subject: p.subject, course: p.course, set: p.set },
    })),
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const setNumber = parseInt(params.set, 10);
  if (!Number.isInteger(setNumber) || setNumber < 2) return { notFound: true };
  const bank = getPractice(params.subject, params.course, setNumber);
  if (!bank) return { notFound: true };
  const subject = getSubjectBySlug(params.subject);
  return {
    props: { bank, subjectName: subject ? subject.name : params.subject },
  };
}

export default function PracticeSetN({ bank, subjectName }) {
  return <PracticeTest bank={bank} subjectName={subjectName} />;
}
