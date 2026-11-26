"use client";

import Link from "next/link";
import { exerciseById, questions, traceById } from "@/content";
import { useStore } from "@/lib/store";
import { getLesson, getModule, moduleStats } from "@/lib/progress";
import { Badge, ButtonLink, Icon, MasteryBadge, ProgressBar, cx } from "@/components/ui";

export function ModuleView({ moduleId }: { moduleId: string }) {
  const { state, ready } = useStore();
  const m = getModule(state, moduleId);
  if (!m) return ready ? <NotFound what="module" /> : null;
  const s = moduleStats(m, state);
  const tfCount = questions.filter((q) => q.moduleId === m.id && q.type === "tf").length;
  const mcCount = questions.filter((q) => q.moduleId === m.id && q.type === "mc").length;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <Link href="/" className="text-sm text-muted hover:text-fg">
          ← Dashboard
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs text-muted">Module {m.order}</span>
          <MasteryBadge mastery={s.mastery} />
        </div>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">{m.title}</h1>
        <p className="mt-2 text-fg-2">{m.summary}</p>
        <div className="mt-4 flex items-center gap-3">
          <ProgressBar value={s.completion} />
          <span className="shrink-0 text-sm text-muted tabular-nums">{Math.round(s.completion * 100)}%</span>
        </div>
      </div>

      <Section title="Lessons">
        {m.lessonIds.map((id, i) => {
          const l = getLesson(state, id);
          if (!l) return null;
          const p = state.progress.lessons[id];
          return (
            <Row key={id} href={`/modules/${m.id}/${id}`}>
              <span
                className={cx(
                  "grid h-7 w-7 shrink-0 place-items-center rounded-full border text-xs",
                  p?.completed ? "border-good bg-good-soft text-good" : "border-border text-muted",
                )}
              >
                {p?.completed ? <Icon name="check" className="h-3.5 w-3.5" /> : i + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">{l.title}</span>
                <span className="text-xs text-muted">
                  {l.minutes} min{l.source === "user" && " · added by you"}
                </span>
              </span>
              {p?.markedWeak && <Badge tone="bad">weak</Badge>}
            </Row>
          );
        })}
      </Section>

      {m.traceIds.length > 0 && (
        <Section title="Code tracer">
          {m.traceIds.map((id) => {
            const t = traceById.get(id);
            if (!t) return null;
            const done = state.progress.traces[id]?.completed;
            return (
              <Row key={id} href={`/tracer/${id}`}>
                <Icon name="step" className={cx("h-5 w-5 shrink-0", done ? "text-good" : "text-accent")} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{t.title}</span>
                  <span className="font-mono text-xs text-muted">{t.filename}</span>
                </span>
                {done && <Badge tone="good">traced</Badge>}
              </Row>
            );
          })}
        </Section>
      )}

      {m.exerciseIds.length > 0 && (
        <Section title="Coding exercises">
          {m.exerciseIds.map((id) => {
            const e = exerciseById.get(id);
            if (!e) return null;
            const st = state.progress.exercises[id]?.status;
            return (
              <Row key={id} href={`/practice/exercises/${id}`}>
                <span className="w-14 shrink-0 font-mono text-xs text-muted">
                  {e.lab} #{e.number}
                </span>
                <span className="min-w-0 flex-1 truncate font-medium">{e.title}</span>
                {st === "solved" && <Badge tone="good">solved</Badge>}
                {st === "attempted" && <Badge tone="warn">in progress</Badge>}
              </Row>
            );
          })}
        </Section>
      )}

      {(tfCount > 0 || mcCount > 0) && (
        <Section title="Practice this module">
          <div className="flex flex-wrap gap-2 p-4">
            {tfCount > 0 && (
              <ButtonLink href={`/practice/drill?type=tf&module=${m.id}`}>
                <Icon name="check" /> {tfCount} True / False
              </ButtonLink>
            )}
            {mcCount > 0 && (
              <ButtonLink href={`/practice/drill?type=mc&module=${m.id}`}>
                <Icon name="list" /> {mcCount} Multiple choice
              </ButtonLink>
            )}
            <ButtonLink href={`/practice/drill?type=mixed&module=${m.id}`} variant="primary">
              <Icon name="bolt" /> Mixed drill
            </ButtonLink>
          </div>
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 text-sm font-semibold tracking-wide text-muted uppercase">{title}</h2>
      <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">{children}</div>
    </section>
  );
}

function Row({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="flex items-center gap-3 px-4 py-3 transition hover:bg-surface-2">
      {children}
      <Icon name="chevron" className="h-4 w-4 shrink-0 text-muted" />
    </Link>
  );
}

export function NotFound({ what }: { what: string }) {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <p className="text-lg font-semibold">This {what} doesn&apos;t exist.</p>
      <p className="mt-1 text-muted">It may have been deleted, or it was added in another browser.</p>
      <ButtonLink href="/" className="mt-4">
        Back to dashboard
      </ButtonLink>
    </div>
  );
}
