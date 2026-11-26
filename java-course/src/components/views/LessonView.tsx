"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { getLesson, getModule } from "@/lib/progress";
import { LessonSections } from "@/components/lesson/LessonSections";
import { NotesPanel } from "@/components/lesson/NotesPanel";
import { Button, Icon, cx } from "@/components/ui";
import { NotFound } from "./ModuleView";

export function LessonView({ moduleId, lessonId }: { moduleId: string; lessonId: string }) {
  const router = useRouter();
  const { state, ready, actions } = useStore();
  const [tab, setTab] = useState<"lesson" | "notes">("lesson");
  const m = getModule(state, moduleId);
  const lesson = getLesson(state, lessonId);

  useEffect(() => {
    if (!ready || !lesson || !m) return;
    actions.visitLesson(lesson.id);
    actions.setLastLocation(`/modules/${m.id}/${lesson.id}`, lesson.title, `Module ${m.order} · ${m.shortTitle}`);
    // run once per lesson visit
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, lesson?.id, m?.id]);

  if (!m || !lesson) return ready ? <NotFound what="lesson" /> : null;

  const p = state.progress.lessons[lesson.id];
  const idx = m.lessonIds.indexOf(lesson.id);
  const prevId = idx > 0 ? m.lessonIds[idx - 1] : null;
  const nextId = idx >= 0 && idx < m.lessonIds.length - 1 ? m.lessonIds[idx + 1] : null;
  const prev = prevId ? getLesson(state, prevId) : null;
  const next = nextId ? getLesson(state, nextId) : null;

  return (
    <div>
      <div className="mb-5">
        <div className="flex flex-wrap items-center gap-1 text-sm text-muted">
          <Link href="/" className="hover:text-fg">
            Dashboard
          </Link>
          <span>/</span>
          <Link href={`/modules/${m.id}`} className="hover:text-fg">
            Module {m.order}: {m.shortTitle}
          </Link>
        </div>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{lesson.title}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="mr-1 text-sm text-muted">{lesson.minutes} min read</span>
          <Button
            variant={p?.completed ? "secondary" : "primary"}
            onClick={() => actions.setLessonCompleted(lesson.id, !p?.completed)}
            className="py-1.5"
          >
            <Icon name="check" /> {p?.completed ? "Completed" : "Mark complete"}
          </Button>
          <Button
            onClick={() => actions.setLessonWeak(lesson.id, !p?.markedWeak)}
            className={cx("py-1.5", p?.markedWeak && "border-bad/40 text-bad")}
          >
            <Icon name="flag" /> {p?.markedWeak ? "Marked weak" : "I'm weak on this"}
          </Button>
          {lesson.source === "user" && (
            <Button
              variant="danger"
              className="py-1.5"
              onClick={() => {
                if (confirm(`Delete "${lesson.title}"? Its notes will be deleted too.`)) {
                  actions.deleteUserLesson(lesson.id);
                  router.push("/");
                }
              }}
            >
              <Icon name="trash" /> Delete
            </Button>
          )}
        </div>
      </div>

      {/* Mobile tabs */}
      <div className="mb-4 grid grid-cols-2 rounded-xl border border-border bg-surface p-1 text-sm lg:hidden">
        {(["lesson", "notes"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cx("rounded-lg py-1.5 capitalize", tab === t ? "bg-accent text-accent-fg" : "text-fg-2")}
          >
            {t === "notes" ? "My notes" : "Lesson"}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_380px]">
        <article className={cx("min-w-0", tab !== "lesson" && "hidden lg:block")}>
          <LessonSections sections={lesson.sections} />

          <div className="mt-10 grid gap-3 border-t border-border pt-6 sm:grid-cols-2">
            {prev ? (
              <Link href={`/modules/${m.id}/${prev.id}`} className="rounded-xl border border-border bg-surface p-4 hover:border-fg/25">
                <div className="text-xs text-muted">← Previous</div>
                <div className="font-medium">{prev.title}</div>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link
                href={`/modules/${m.id}/${next.id}`}
                onClick={() => !p?.completed && actions.setLessonCompleted(lesson.id, true)}
                className="rounded-xl border border-border bg-surface p-4 text-right hover:border-fg/25"
              >
                <div className="text-xs text-muted">Complete & next →</div>
                <div className="font-medium">{next.title}</div>
              </Link>
            ) : (
              <Link
                href={`/modules/${m.id}`}
                onClick={() => !p?.completed && actions.setLessonCompleted(lesson.id, true)}
                className="rounded-xl border border-border bg-surface p-4 text-right hover:border-fg/25"
              >
                <div className="text-xs text-muted">Complete & finish →</div>
                <div className="font-medium">Back to module: practice & exercises</div>
              </Link>
            )}
          </div>
        </article>

        <aside className={cx(tab !== "notes" && "hidden lg:block")}>
          <div className="lg:sticky lg:top-20">
            <NotesPanel lessonId={lesson.id} className="h-[60dvh] lg:h-[calc(100dvh-7rem)]" />
          </div>
        </aside>
      </div>
    </div>
  );
}
