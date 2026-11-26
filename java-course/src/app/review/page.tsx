"use client";

import Link from "next/link";
import { useState } from "react";
import { exerciseById, questionById } from "@/content";
import { useStore } from "@/lib/store";
import { getLesson, getModule } from "@/lib/progress";
import { Inline } from "@/components/Markdown";
import { Drill } from "@/components/practice/Drill";
import type { Question } from "@/lib/types";
import { Badge, Button, ButtonLink, Icon, PageHeader } from "@/components/ui";

export default function ReviewPage() {
  const { state, ready, actions } = useStore();
  const [drill, setDrill] = useState<Question[] | null>(null);
  const [drillRound, setDrillRound] = useState(0);

  const qItems = state.reviewQueue.filter((r) => r.kind === "question" && questionById.has(r.refId));
  const lItems = state.reviewQueue.filter((r) => r.kind === "lesson");
  const eItems = state.reviewQueue.filter((r) => r.kind === "exercise" && exerciseById.has(r.refId));
  const total = qItems.length + lItems.length + eItems.length;

  if (drill) {
    return (
      <div>
        <button onClick={() => setDrill(null)} className="text-sm text-muted hover:text-fg">
          ← Back to queue
        </button>
        <div className="mt-3">
          <PageHeader title="Weak-spot drill">Get a question right twice in a row and it leaves the queue.</PageHeader>
        </div>
        <Drill key={drillRound} questions={drill} emptyText="Queue cleared — nice work!" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader eyebrow="Weak-spot review" title="Needs Review">
        Everything you missed or flagged, in one place. Missed questions leave the queue after{" "}
        <strong>2 correct answers in a row</strong>.
      </PageHeader>

      {ready && total === 0 && (
        <div className="rounded-xl border border-dashed border-border p-10 text-center">
          <Icon name="check" className="mx-auto h-8 w-8 text-good" />
          <p className="mt-2 font-semibold">Your review queue is empty.</p>
          <p className="mt-1 text-sm text-muted">Missed quiz questions and lessons you mark as weak will show up here.</p>
          <ButtonLink href="/practice" variant="primary" className="mt-4">
            Practice something
          </ButtonLink>
        </div>
      )}

      {qItems.length > 0 && (
        <section className="mb-8">
          <div className="mb-2 flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold tracking-wide text-muted uppercase">Missed questions · {qItems.length}</h2>
            <Button
              variant="primary"
              onClick={() => {
                setDrill(qItems.map((r) => questionById.get(r.refId)!));
                setDrillRound((r) => r + 1);
              }}
            >
              <Icon name="bolt" /> Drill all
            </Button>
          </div>
          <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">
            {qItems.map((r) => {
              const q = questionById.get(r.refId)!;
              return (
                <div key={r.id} className="flex items-start gap-3 px-4 py-3">
                  <Badge tone="accent">{q.type === "tf" ? "T/F" : "MC"}</Badge>
                  <div className="min-w-0 flex-1 text-[15px]">
                    <div className="line-clamp-2">
                      <Inline text={q.type === "tf" ? q.statement : q.prompt === "What is printed?" ? `What is printed? ${q.code?.split("\n")[0] ?? ""}…` : q.prompt} />
                    </div>
                    <div className="mt-1 text-xs text-muted">
                      Streak {r.streak}/2 · {q.topics.join(", ")}
                    </div>
                  </div>
                  <button onClick={() => actions.removeReviewItem(r.id)} className="text-muted hover:text-fg" aria-label="Remove from queue" title="Remove from queue">
                    <Icon name="x" />
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {lItems.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-2 text-sm font-semibold tracking-wide text-muted uppercase">Lessons marked weak · {lItems.length}</h2>
          <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">
            {lItems.map((r) => {
              const l = getLesson(state, r.refId);
              if (!l) return null;
              const m = getModule(state, l.moduleId);
              return (
                <div key={r.id} className="flex items-center gap-3 px-4 py-3">
                  <Link href={`/modules/${l.moduleId}/${l.id}`} className="min-w-0 flex-1 hover:text-accent">
                    <div className="truncate font-medium">{l.title}</div>
                    <div className="text-xs text-muted">{m ? `Module ${m.order}: ${m.shortTitle}` : ""}</div>
                  </Link>
                  <Button onClick={() => actions.setLessonWeak(l.id, false)} className="py-1 text-xs">
                    Got it now
                  </Button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {eItems.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-2 text-sm font-semibold tracking-wide text-muted uppercase">Flagged exercises · {eItems.length}</h2>
          <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">
            {eItems.map((r) => {
              const e = exerciseById.get(r.refId)!;
              return (
                <div key={r.id} className="flex items-center gap-3 px-4 py-3">
                  <Link href={`/practice/exercises/${e.id}`} className="min-w-0 flex-1 hover:text-accent">
                    <div className="truncate font-medium">{e.title}</div>
                    <div className="text-xs text-muted">
                      {e.lab} #{e.number}
                    </div>
                  </Link>
                  <Button onClick={() => actions.setExerciseWeak(e.id, false)} className="py-1 text-xs">
                    Unflag
                  </Button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {ready && (
        <div className="mt-12 border-t border-border pt-6 text-sm text-muted">
          <p>Progress, notes and added lessons are stored in this browser (localStorage).</p>
          <button
            className="mt-2 text-bad hover:underline"
            onClick={() => {
              if (confirm("Reset ALL progress, notes, quiz history and added lessons? This cannot be undone.")) actions.resetAll();
            }}
          >
            Reset all my data
          </button>
        </div>
      )}
    </div>
  );
}
