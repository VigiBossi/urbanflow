import { notFound } from "next/navigation";
import { exerciseById, exercises } from "@/content";
import { ExerciseView } from "@/components/views/ExerciseView";

export function generateStaticParams() {
  return exercises.map((e) => ({ exerciseId: e.id }));
}

export default async function Page({ params }: PageProps<"/practice/exercises/[exerciseId]">) {
  const { exerciseId } = await params;
  if (!exerciseById.has(exerciseId)) notFound();
  return <ExerciseView exerciseId={exerciseId} />;
}
