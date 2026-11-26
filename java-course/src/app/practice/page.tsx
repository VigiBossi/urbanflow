"use client";

import Link from "next/link";
import { builtinModules, exercises, questions } from "@/content";
import { useStore } from "@/lib/store";
import type { Topic } from "@/lib/types";
import { Badge, ButtonLink, Icon, PageHeader } from "@/components/ui";

const FOCUS: { topic: Topic; label: string }[] = [
  { topic: "integer-division", label: "Integer division" },
  { topic: "do-while", label: "do-while" },
  { topic: "void", label: "void" },
  { topic: "equals", label: ".equals()" },
  { topic: "scanner", label: "Scanner" },
  { topic: "case-sensitivity", label: "Case sensitivity" },
  { topic: "strings", label: "Concatenation" },
  { topic: "conditionals", label: "if / else" },
  { topic: "loops", label: "Loops" },
  { topic: "methods", label: "Methods" },
];

const LABS = ["Lab 4", "Lab 5", "Methods", "Lab 6"];

export default function PracticeHub() {
  const { state } = useStore();
  const count = (type: "tf" | "mc", topic?: Topic) =>
    questions.filter((q) => q.type === type && (!topic || q.topics.includes(topic))).length;

  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <PageHeader eyebrow="Practice" title="Exam-style practice">
        Matches the class quiz format: 10 True/False, 10 Multiple-Choice and short coding exercises.
      </PageHeader>

      <Link
        href="/practice/quiz"
        className="flex flex-col gap-4 rounded-2xl border border-accent/30 bg-accent-soft p-5 transition hover:border-accent sm:flex-row sm:items-center sm:p-6"
      >
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-accent text-accent-fg">
          <Icon name="target" className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <div className="text-lg font-semibold">Full practice quiz</div>
          <div className="text-sm text-fg-2">
            Randomly generated · 10 T/F + 10 MC + 1–3 coding prompts · pick modules · score & history
          </div>
        </div>
        <span className="inline-flex items-center gap-1 text-sm font-medium text-accent">
          Start <Icon name="chevron" />
        </span>
      </Link>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Quick drills</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <DrillCard href="/practice/drill?type=tf" title="True / False" sub={`${count("tf")} statements`} icon="check" />
          <DrillCard href="/practice/drill?type=mc" title="Multiple choice" sub={`${count("mc")} output-prediction & concept questions`} icon="list" />
          <DrillCard href="/practice/drill?type=mixed" title="Mixed" sub="Both types, shuffled" icon="bolt" />
        </div>

        <h3 className="mt-6 mb-2 text-sm font-semibold tracking-wide text-muted uppercase">Drill a classic trap</h3>
        <div className="flex flex-wrap gap-2">
          {FOCUS.map((f) => (
            <Link
              key={f.topic}
              href={`/practice/drill?type=mixed&topic=${f.topic}`}
              className="rounded-full border border-border bg-surface px-3 py-1.5 text-sm hover:border-accent hover:text-accent"
            >
              {f.label} <span className="text-muted">· {count("tf", f.topic) + count("mc", f.topic)}</span>
            </Link>
          ))}
        </div>

        <h3 className="mt-6 mb-2 text-sm font-semibold tracking-wide text-muted uppercase">By module</h3>
        <div className="flex flex-wrap gap-2">
          {builtinModules.map((m) => (
            <Link
              key={m.id}
              href={`/practice/drill?type=mixed&module=${m.id}`}
              className="rounded-full border border-border bg-surface px-3 py-1.5 text-sm hover:border-accent hover:text-accent"
            >
              {m.order}. {m.shortTitle}
            </Link>
          ))}
        </div>
      </section>

      <section id="exercises">
        <h2 className="mb-3 text-lg font-semibold">Coding exercises</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {LABS.map((lab) => (
            <div key={lab}>
              <h3 className="mb-2 text-sm font-semibold tracking-wide text-muted uppercase">{lab}</h3>
              <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">
                {exercises
                  .filter((e) => e.lab === lab)
                  .map((e) => {
                    const st = state.progress.exercises[e.id]?.status;
                    return (
                      <Link key={e.id} href={`/practice/exercises/${e.id}`} className="flex items-center gap-3 px-4 py-2.5 hover:bg-surface-2">
                        <span className="w-5 font-mono text-xs text-muted">{e.number}</span>
                        <span className="min-w-0 flex-1 truncate text-[15px]">{e.title}</span>
                        <span className="text-xs text-muted">{"●".repeat(e.difficulty)}</span>
                        {st === "solved" && <Badge tone="good">solved</Badge>}
                        {st === "attempted" && <Badge tone="warn">started</Badge>}
                      </Link>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <ButtonLink href="/review">
            <Icon name="flag" /> Review missed questions
          </ButtonLink>
        </div>
      </section>
    </div>
  );
}

function DrillCard({ href, title, sub, icon }: { href: string; title: string; sub: string; icon: string }) {
  return (
    <Link href={href} className="rounded-xl border border-border bg-surface p-4 transition hover:border-fg/25">
      <Icon name={icon} className="h-5 w-5 text-accent" />
      <div className="mt-2 font-semibold">{title}</div>
      <div className="text-sm text-muted">{sub}</div>
    </Link>
  );
}
