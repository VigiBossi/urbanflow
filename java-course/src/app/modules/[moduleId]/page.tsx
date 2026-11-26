import { ModuleView } from "@/components/views/ModuleView";

export default async function Page({ params }: PageProps<"/modules/[moduleId]">) {
  const { moduleId } = await params;
  return <ModuleView moduleId={moduleId} />;
}
