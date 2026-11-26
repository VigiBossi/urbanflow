"use client";

import Link from "next/link";
import { COURSE } from "@/content";
import { useStore } from "@/lib/store";
import { continueTarget, getAllModules, moduleStats, overallStats } from "@/lib/progress";
import { useOpenAddLesson } from "@/components/AppShell";
import { Card, Icon, MasteryBadge, ProgressBar } from "@/components/ui";

export default function Dashboard() {
  const { state, ready } = useStore();
  const openAdd = useOpenAddLesson();
  const modules = getAllModules(state);
  const stats = overallStats(state);
  const next = continueTarget(state);
  const pct = (v: number) => `${Math.round(v * 100)}%`;

  return (
    <div className="space-y-8">
      <div>
        <div className="mb-1 text-xs font-medium tracking-wide text-muted uppercase">
          {COURSE.language} · {COURSE.year} · Instructor: {COURSE.instructor}
        </div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{COURSE.title}</h1>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Link
          href={next.href}
          className="group relative overflow-hidden rounded-2xl bg-accent p-5 text-accent-fg transition hover:opacity-95 sm:p-6 lg:col-span-2"
        >
          <div className="text-xs font-medium tracking-wide uppercase opacity-80">Continue learning</div>
          <div className="mt-2 text-xl font-semibold sm:text-2xl">{ready ? next.label : "…"}</div>
          <div className="mt-1 text-sm opacity-80">{ready ? next.sub : ""}</div>
          <div className="mt-6 inline-flex items-center gap-1.5 rounded-lg bg-white/15 px-3 py-1.5 text-sm font-medium">
            Resume <Icon name="chevron" />
          </div>
          <span className="pointer-events-none absolute -right-4 -bottom-10 font-mono text-[160px] leading-none opacity-10 select-none">
            {"{}"}
          </span>
        </Link>

        <Card className="p-5">
          <div className="flex items-baseline justify-between">
            <div className="text-sm font-medium text-muted">Course progress</div>
            <div className="text-2xl font-semibold tabular-nums">{pct(stats.completion)}</div>
          </div>
          <ProgressBar value={stats.completion} className="mt-2" />
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <Stat label="Lessons" value={`${stats.lessonsDone}/${stats.lessonsTotal}`} />
            <Stat label="Exercises" value={`${stats.exercisesSolved}/${stats.exercisesTotal}`} />
            <Stat label="Quiz accuracy" value={stats.accuracy === null ? "—" : pct(stats.accuracy)} />
            <Stat label="Mastered" value={`${stats.mastered}/${modules.length}`} />
          </dl>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <QuickAction href="/tracer/t-mistery" icon="step" title="Trace Mistery.java" sub="Step line by line" />
        <QuickAction href="/practice/drill?type=tf" icon="check" title="True / False drill" sub="Instant explanations" />
        <QuickAction href="/practice/quiz" icon="target" title="Exam practice quiz" sub="10 T/F · 10 MC · coding" />
        <QuickAction
          href="/review"
          icon="flag"
          title="Weak-spot review"
          sub={stats.reviewCount ? `${stats.reviewCount} item${stats.reviewCount === 1 ? "" : "s"} waiting` : "Queue is empty"}
          alert={stats.reviewCount > 0}
        />
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Modules</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {modules.map((m) => {
            const s = moduleStats(m, state);
            return (
              <Link
                key={m.id}
                href={`/modules/${m.id}`}
                className="group flex flex-col rounded-xl border border-border bg-surface p-5 transition hover:border-fg/25 hover:shadow-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs text-muted">Module {m.order}</span>
                  <MasteryBadge mastery={s.mastery} />
                </div>
                <h3 className="mt-2 font-semibold text-fg group-hover:text-accent">{m.shortTitle}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-muted">{m.summary}</p>
                <div className="mt-auto pt-4">
                  <div className="mb-1.5 flex justify-between text-xs text-muted">
                    <span>
                      {plural(s.lessonsTotal, "lesson")}
                      {s.exercisesTotal > 0 && ` · ${plural(s.exercisesTotal, "exercise")}`}
                      {s.tracesTotal > 0 && ` · ${plural(s.tracesTotal, "trace")}`}
                    </span>
                    <span className="tabular-nums">{pct(s.completion)}</span>
                  </div>
                  <ProgressBar value={s.completion} />
                </div>
              </Link>
            );
          })}
          <button
            onClick={openAdd}
            className="flex min-h-40 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border p-5 text-muted transition hover:border-accent hover:text-accent"
          >
            <Icon name="plus" className="h-5 w-5" />
            <span className="font-medium">Add a future lesson</span>
            <span className="text-xs">Arrays, OOP… paste notes or upload .java / .pdf</span>
          </button>
        </div>
      </section>
    </div>
  );
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-surface-2 px-3 py-2">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="font-semibold tabular-nums">{value}</dd>
    </div>
  );
}

function QuickAction({ href, icon, title, sub, alert }: { href: string; icon: string; title: string; sub: string; alert?: boolean }) {
  return (
    <Link href={href} className="rounded-xl border border-border bg-surface p-4 transition hover:border-fg/25">
      <Icon name={icon} className={`h-5 w-5 ${alert ? "text-bad" : "text-accent"}`} />
      <div className="mt-2 text-sm font-semibold">{title}</div>
      <div className="text-xs text-muted">{sub}</div>
    </Link>
  );
}
