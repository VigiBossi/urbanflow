import { DrillView } from "@/components/views/DrillView";

export default async function Page({ searchParams }: PageProps<"/practice/drill">) {
  const sp = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  return <DrillView type={one(sp.type) ?? "mixed"} moduleId={one(sp.module)} topic={one(sp.topic)} />;
}
