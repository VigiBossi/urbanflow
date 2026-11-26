import { notFound } from "next/navigation";
import { traceById, traces } from "@/content";
import { TraceView } from "@/components/views/TraceView";

export function generateStaticParams() {
  return traces.map((t) => ({ traceId: t.id }));
}

export default async function Page({ params }: PageProps<"/tracer/[traceId]">) {
  const { traceId } = await params;
  if (!traceById.has(traceId)) notFound();
  return <TraceView traceId={traceId} />;
}
