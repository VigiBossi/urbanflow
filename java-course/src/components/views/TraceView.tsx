"use client";

import Link from "next/link";
import { useEffect } from "react";
import { builtinModules, traceById } from "@/content";
import { useStore } from "@/lib/store";
import { Tracer } from "@/components/tracer/Tracer";

export function TraceView({ traceId }: { traceId: string }) {
  const t = traceById.get(traceId)!;
  const m = builtinModules.find((x) => x.id === t.moduleId);
  const { ready, actions } = useStore();

  useEffect(() => {
    if (ready) actions.setLastLocation(`/tracer/${t.id}`, `Trace: ${t.title}`, t.filename);
  }, [ready, t, actions]);

  return (
    <div>
      <div className="mb-5">
        <Link href="/tracer" className="text-sm text-muted hover:text-fg">
          ← All traces
        </Link>
        <div className="mt-2 font-mono text-xs text-muted">
          {m && `Module ${m.order} · `}
          {t.filename}
        </div>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">{t.title}</h1>
        <p className="mt-1 text-fg-2">{t.description}</p>
      </div>
      <Tracer key={t.id} trace={t} />
    </div>
  );
}
