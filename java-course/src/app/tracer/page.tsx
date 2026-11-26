"use client";

import Link from "next/link";
import { builtinModules, traces } from "@/content";
import { useStore } from "@/lib/store";
import { Badge, Icon, PageHeader } from "@/components/ui";

export default function TracerIndex() {
  const { state } = useStore();
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader eyebrow="Interactive" title="Code Tracer">
        Step through tricky programs line by line and watch every variable change — or predict the output first, then
        check yourself.
      </PageHeader>
      <div className="space-y-6">
        {builtinModules
          .filter((m) => m.traceIds.length)
          .map((m) => (
            <section key={m.id}>
              <h2 className="mb-2 text-sm font-semibold tracking-wide text-muted uppercase">
                Module {m.order} · {m.shortTitle}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {traces
                  .filter((t) => t.moduleId === m.id)
                  .map((t) => {
                    const p = state.progress.traces[t.id];
                    return (
                      <Link
                        key={t.id}
                        href={`/tracer/${t.id}`}
                        className="rounded-xl border border-border bg-surface p-4 transition hover:border-fg/25"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-xs text-muted">{t.filename}</span>
                          {p?.predictedCorrectly ? (
                            <Badge tone="good">predicted ✓</Badge>
                          ) : p?.completed ? (
                            <Badge tone="good">traced</Badge>
                          ) : null}
                        </div>
                        <div className="mt-1.5 flex items-center gap-2 font-medium">
                          <Icon name="step" className="h-4 w-4 text-accent" /> {t.title}
                        </div>
                        <p className="mt-1 text-sm text-muted">{t.description}</p>
                      </Link>
                    );
                  })}
              </div>
            </section>
          ))}
      </div>
    </div>
  );
}
