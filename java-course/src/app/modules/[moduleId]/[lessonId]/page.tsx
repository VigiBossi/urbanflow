import { LessonView } from "@/components/views/LessonView";

export default async function Page({ params }: PageProps<"/modules/[moduleId]/[lessonId]">) {
  const { moduleId, lessonId } = await params;
  return <LessonView moduleId={moduleId} lessonId={lessonId} />;
}
