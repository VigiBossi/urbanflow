"use client";

import Link from "next/link";
import { useState } from "react";
import { builtinModules } from "@/content";
import { useStore } from "@/lib/store";
import { generateQuiz, type GeneratedQuiz } from "@/lib/quizGenerator";
import { QuestionCard, isCorrect, type Answer } from "@/components/practice/QuestionCard";
import { Markdown } from "@/components/Markdown";
import { Badge, Button, Card, Icon, PageHeader, ProgressBar, cx } from "@/components/ui";

type Phase = "setup" | "taking" | "results";

export default function QuizPage() {
  const { state, actions } = useStore();
  const [phase, setPhase] = useState<Phase>("setup");
  const [moduleIds, setModuleIds] = useState<string[]>([]);
  const [codingCount, setCodingCount] = useState(2);
  const [prioritiseWeak, setPrioritiseWeak] = useState(true);
  const [quiz, setQuiz] = useState<GeneratedQuiz | null>(null);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [coding, setCoding] = useState<Record<string, boolean | null>>({});

  const start = () => {
    const q = generateQuiz({ moduleIds, tfCount: 10, mcCount: 10, codingCount, prioritiseWeak }, state);
    setQuiz(q);
    setAnswers({});
    setCoding({});
    setPhase("taking");
    window.scrollTo({ top: 0 });
  };

  const objective = quiz ? [...quiz.tf, ...quiz.mc] : [];
  const answeredCount = objective.filter((q) => answers[q.id] !== undefined && answers[q.id] !== null).length;

  const submit = () => {
    if (!quiz) return;
    if (answeredCount < objective.length && !confirm(`You left ${objective.length - answeredCount} question(s) blank. Submit anyway?`)) return;
    let score = 0;
    for (const q of objective) {
      const a = answers[q.id] ?? null;
      const ok = a !== null && isCorrect(q, a);
      if (ok) score++;
      actions.recordAnswer(q.id, ok);
    }
    for (const e of quiz.coding) {
      if (coding[e.id]) score++;
      if (coding[e.id] === false) actions.setExerciseWeak(e.id, true);
    }
    actions.saveQuizAttempt({
      id: `quiz-${Date.now()}`,
      questionIds: objective.map((q) => q.id),
      exerciseIds: quiz.coding.map((e) => e.id),
      answers: { ...answers, ...Object.fromEntries(Object.entries(coding).map(([k, v]) => [`code:${k}`, v])) },
      score,
      total: objective.length + quiz.coding.length,
      at: new Date().toISOString(),
    });
    setPhase("results");
    window.scrollTo({ top: 0 });
  };

  if (phase === "setup" || !quiz) {
    return (
      <div className="mx-auto max-w-3xl">
        <Link href="/practice" className="text-sm text-muted hover:text-fg">
          ← Practice
        </Link>
        <div className="mt-3">
          <PageHeader title="Practice quiz">
            Class format: <strong>Part A</strong> 10 True/False · <strong>Part B</strong> 10 Multiple-Choice ·{" "}
            <strong>Part C</strong> short coding exercises. No feedback until you submit — just like the real thing.
          </PageHeader>
        </div>

        <Card className="space-y-5 p-5">
          <div>
            <div className="mb-2 text-sm font-semibold">Modules to include</div>
            <div className="flex flex-wrap gap-2">
              <Chip active={moduleIds.length === 0} onClick={() => setModuleIds([])}>
                All modules
              </Chip>
              {builtinModules.map((m) => (
                <Chip
                  key={m.id}
                  active={moduleIds.includes(m.id)}
                  onClick={() => setModuleIds((ids) => (ids.includes(m.id) ? ids.filter((x) => x !== m.id) : [...ids, m.id]))}
                >
                  {m.order}. {m.shortTitle}
                </Chip>
              ))}
            </div>
            {moduleIds.length > 0 && (
              <p className="mt-2 text-xs text-muted">With fewer modules selected, Part A/B may have fewer than 10 questions.</p>
            )}
          </div>
          <div>
            <div className="mb-2 text-sm font-semibold">Coding exercises (Part C)</div>
            <div className="flex gap-2">
              {[1, 2, 3].map((n) => (
                <Chip key={n} active={codingCount === n} onClick={() => setCodingCount(n)}>
                  {n}
                </Chip>
              ))}
            </div>
          </div>
          <label className="flex cursor-pointer items-center gap-2.5 text-[15px]">
            <input
              type="checkbox"
              checked={prioritiseWeak}
              onChange={(e) => setPrioritiseWeak(e.target.checked)}
              className="accent-[var(--accent)]"
            />
            Prioritise questions from my Review queue ({state.reviewQueue.filter((r) => r.kind === "question").length})
          </label>
          <Button variant="primary" onClick={start} className="w-full py-2.5 sm:w-auto">
            <Icon name="play" /> Generate quiz
          </Button>
        </Card>

        {state.quizAttempts.length > 0 && (
          <section className="mt-8">
            <h2 className="mb-2 text-sm font-semibold tracking-wide text-muted uppercase">Recent attempts</h2>
            <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">
              {state.quizAttempts.slice(0, 8).map((a) => (
                <div key={a.id} className="flex items-center gap-4 px-4 py-2.5 text-sm">
                  <span className="w-36 text-muted">{new Date(a.at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}</span>
                  <ProgressBar value={a.score / a.total} />
                  <span className="w-16 shrink-0 text-right font-medium tabular-nums">
                    {a.score}/{a.total}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    );
  }

  const revealed = phase === "results";
  const tfScore = quiz.tf.filter((q) => isCorrect(q, answers[q.id] ?? null)).length;
  const mcScore = quiz.mc.filter((q) => isCorrect(q, answers[q.id] ?? null)).length;
  const codeScore = quiz.coding.filter((e) => coding[e.id]).length;
  const total = quiz.tf.length + quiz.mc.length + quiz.coding.length;
  const score = tfScore + mcScore + codeScore;

  return (
    <div className="mx-auto max-w-3xl">
      {revealed ? (
        <Card className="mb-8 p-6 text-center">
          <div className="text-xs font-medium tracking-wide text-muted uppercase">Your score</div>
          <div className="mt-1 text-5xl font-semibold tracking-tight tabular-nums">
            {score}/{total}
          </div>
          <ProgressBar value={score / total} className="mx-auto mt-4 max-w-sm" />
          <div className="mt-4 flex flex-wrap justify-center gap-2 text-sm">
            <Badge>
              Part A: {tfScore}/{quiz.tf.length}
            </Badge>
            <Badge>
              Part B: {mcScore}/{quiz.mc.length}
            </Badge>
            <Badge>
              Part C: {codeScore}/{quiz.coding.length}
            </Badge>
          </div>
          <p className="mt-4 text-sm text-muted">Missed questions were added to your Review queue. Explanations are below.</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Button variant="primary" onClick={() => setPhase("setup")}>
              New quiz
            </Button>
            <Link href="/review" className="inline-flex items-center rounded-lg border border-border px-3.5 py-2 text-sm hover:bg-surface-2">
              Go to Review
            </Link>
          </div>
        </Card>
      ) : (
        <div className="sticky top-14 z-20 -mx-4 mb-6 border-b border-border bg-bg/90 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-b-xl sm:border-x">
          <div className="flex items-center gap-3">
            <ProgressBar value={answeredCount / Math.max(1, objective.length)} />
            <span className="shrink-0 text-xs text-muted tabular-nums">
              {answeredCount}/{objective.length} answered
            </span>
            <Button variant="primary" onClick={submit} className="shrink-0 py-1.5">
              Submit
            </Button>
          </div>
        </div>
      )}

      <Part title="Part A — True / False" count={quiz.tf.length}>
        {quiz.tf.map((q, i) => (
          <QuestionCard
            key={q.id}
            question={q}
            number={i + 1}
            mode="exam"
            value={answers[q.id] ?? null}
            onChange={(a) => setAnswers((s) => ({ ...s, [q.id]: a }))}
            revealed={revealed}
          />
        ))}
      </Part>

      <Part title="Part B — Multiple Choice" count={quiz.mc.length}>
        {quiz.mc.map((q, i) => (
          <QuestionCard
            key={q.id}
            question={q}
            number={quiz.tf.length + i + 1}
            mode="exam"
            value={answers[q.id] ?? null}
            onChange={(a) => setAnswers((s) => ({ ...s, [q.id]: a }))}
            revealed={revealed}
          />
        ))}
      </Part>

      <Part title="Part C — Coding" count={quiz.coding.length}>
        {quiz.coding.map((e) => (
          <div key={e.id} className="rounded-xl border border-border bg-surface p-4 sm:p-5">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge tone="accent">
                {e.lab} #{e.number}
              </Badge>
              <span className="font-semibold">{e.title}</span>
            </div>
            <Markdown text={e.prompt} />
            <p className="mt-3 text-sm text-muted">
              Write it on paper or in your IDE, or use the{" "}
              <Link href={`/practice/exercises/${e.id}`} target="_blank" className="text-accent underline">
                exercise editor
              </Link>{" "}
              (opens in a new tab). Then grade yourself honestly against the reference solution after submitting.
            </p>
            {revealed ? (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-sm text-fg-2">Self-assessment:</span>
                {coding[e.id] === true && <Badge tone="good">Solved</Badge>}
                {coding[e.id] === false && <Badge tone="bad">Not solved — flagged for review</Badge>}
                {coding[e.id] == null && <Badge>Not graded</Badge>}
                <Link href={`/practice/exercises/${e.id}`} className="text-sm text-accent underline">
                  See reference solution
                </Link>
              </div>
            ) : (
              <div className="mt-3 flex flex-wrap gap-2">
                <Chip active={coding[e.id] === true} onClick={() => setCoding((c) => ({ ...c, [e.id]: true }))}>
                  ✓ I solved it
                </Chip>
                <Chip active={coding[e.id] === false} onClick={() => setCoding((c) => ({ ...c, [e.id]: false }))}>
                  ✗ I couldn&apos;t
                </Chip>
              </div>
            )}
          </div>
        ))}
      </Part>

      {!revealed && (
        <div className="flex justify-end">
          <Button variant="primary" onClick={submit} className="py-2.5">
            Submit quiz
          </Button>
        </div>
      )}
    </div>
  );
}

function Part({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  if (count === 0) return null;
  return (
    <section className="mb-10">
      <h2 className="mb-3 text-lg font-semibold">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cx(
        "rounded-full border px-3 py-1.5 text-sm transition",
        active ? "border-accent bg-accent text-accent-fg" : "border-border bg-surface hover:border-fg/30",
      )}
    >
      {children}
    </button>
  );
}
