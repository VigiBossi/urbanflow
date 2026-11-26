"use client";

import Link from "next/link";
import { useEffect } from "react";
import { builtinModules, exerciseById, exercises } from "@/content";
import { useStore } from "@/lib/store";
import { ExerciseWorkspace } from "@/components/practice/ExerciseWorkspace";
import { Badge } from "@/components/ui";

export function ExerciseView({ exerciseId }: { exerciseId: string }) {
  const ex = exerciseById.get(exerciseId)!;
  const m = builtinModules.find((x) => x.id === ex.moduleId);
  const { ready, actions } = useStore();
  const siblings = exercises.filter((e) => e.lab === ex.lab);
  const i = siblings.findIndex((e) => e.id === ex.id);
  const prev = siblings[i - 1];
  const next = siblings[i + 1];

  useEffect(() => {
    if (ready) actions.setLastLocation(`/practice/exercises/${ex.id}`, `${ex.lab} #${ex.number}: ${ex.title}`, "Coding exercise");
  }, [ready, ex, actions]);

  return (
    <div>
      <div className="mb-5">
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <Link href="/practice#exercises" className="text-muted hover:text-fg">
            ← All exercises
          </Link>
          <div className="flex gap-3">
            {prev && (
              <Link href={`/practice/exercises/${prev.id}`} className="text-muted hover:text-fg">
                ← #{prev.number}
              </Link>
            )}
            {next && (
              <Link href={`/practice/exercises/${next.id}`} className="text-muted hover:text-fg">
                #{next.number} →
              </Link>
            )}
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Badge tone="accent">
            {ex.lab} · Exercise {ex.number}
          </Badge>
          {m && (
            <Link href={`/modules/${m.id}`} className="text-xs text-muted hover:text-fg">
              Module {m.order}: {m.shortTitle}
            </Link>
          )}
          <span className="text-xs text-muted">Difficulty {"●".repeat(ex.difficulty)}{"○".repeat(3 - ex.difficulty)}</span>
        </div>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{ex.title}</h1>
      </div>
      <ExerciseWorkspace key={ex.id} exercise={ex} />
    </div>
  );
}
