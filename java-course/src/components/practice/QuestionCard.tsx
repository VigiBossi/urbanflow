"use client";

import { useState } from "react";
import type { Question } from "@/lib/types";
import { useStore } from "@/lib/store";
import { Inline, Markdown } from "@/components/Markdown";
import { CodeBlock } from "@/components/code/CodeBlock";
import { Badge, Icon, cx } from "@/components/ui";

export type Answer = boolean | number | null;

export const isCorrect = (q: Question, a: Answer) => (q.type === "tf" ? a === q.answer : a === q.correctIndex);

/**
 * mode "instant": answer is recorded and explained immediately (drills).
 * mode "exam": controlled by the parent; feedback only when `revealed`.
 */
export function QuestionCard({
  question: q,
  number,
  mode = "instant",
  value,
  onChange,
  revealed,
  onAnswered,
}: {
  question: Question;
  number?: number;
  mode?: "instant" | "exam";
  value?: Answer;
  onChange?: (a: Answer) => void;
  revealed?: boolean;
  onAnswered?: (correct: boolean) => void;
}) {
  const { actions } = useStore();
  const [local, setLocal] = useState<Answer>(null);
  const answer = mode === "exam" ? (value ?? null) : local;
  const show = mode === "exam" ? !!revealed : local !== null;
  const correct = answer !== null && isCorrect(q, answer);

  const choose = (a: boolean | number) => {
    if (mode === "exam") {
      if (!revealed) onChange?.(a);
      return;
    }
    if (local !== null) return;
    setLocal(a);
    const ok = isCorrect(q, a);
    actions.recordAnswer(q.id, ok);
    onAnswered?.(ok);
  };

  const optionClass = (selected: boolean, isRight: boolean) =>
    cx(
      "w-full rounded-lg border px-3.5 py-2.5 text-left text-[15px] transition",
      !show && selected && "border-accent bg-accent-soft",
      !show && !selected && "border-border bg-surface hover:border-fg/30",
      show && isRight && "border-good/50 bg-good-soft",
      show && selected && !isRight && "border-bad/50 bg-bad-soft",
      show && !selected && !isRight && "border-border bg-surface opacity-60",
    );

  return (
    <div className="rounded-xl border border-border bg-surface p-4 sm:p-5">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {number !== undefined && <span className="font-mono text-xs text-muted">Q{number}</span>}
        <Badge tone="accent">{q.type === "tf" ? "True / False" : "Multiple choice"}</Badge>
        {q.topics.slice(0, 2).map((t) => (
          <Badge key={t}>{t}</Badge>
        ))}
      </div>
      <div className="mb-3 text-[15px] leading-relaxed font-medium text-fg">
        <Inline text={q.type === "tf" ? q.statement : q.prompt} />
      </div>
      {q.code && <CodeBlock code={q.code} className="mb-4" compact showLineNumbers={false} />}

      {q.type === "tf" ? (
        <div className="grid grid-cols-2 gap-2">
          {[true, false].map((v) => (
            <button key={String(v)} onClick={() => choose(v)} className={optionClass(answer === v, show && q.answer === v)}>
              {v ? "True" : "False"}
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {q.options.map((opt, i) => (
            <button key={i} onClick={() => choose(i)} className={optionClass(answer === i, show && q.correctIndex === i)}>
              <span className="mr-2 font-mono text-xs text-muted">{String.fromCharCode(65 + i)}.</span>
              {opt.includes("\n") ? (
                <pre className="mt-1 inline-block align-top font-mono text-sm whitespace-pre">{opt}</pre>
              ) : (
                <Inline text={opt.startsWith("`") || !/[;(){}"]/.test(opt) ? opt : "`" + opt + "`"} />
              )}
            </button>
          ))}
        </div>
      )}

      {show && (
        <div
          className={cx(
            "mt-4 rounded-lg border p-3.5 text-sm",
            answer === null ? "border-border bg-surface-2" : correct ? "border-good/30 bg-good-soft" : "border-bad/30 bg-bad-soft",
          )}
        >
          <div
            className={cx(
              "mb-1 flex items-center gap-1.5 font-semibold",
              answer === null ? "text-muted" : correct ? "text-good" : "text-bad",
            )}
          >
            <Icon name={correct ? "check" : "x"} />
            {answer === null ? "Not answered" : correct ? "Correct" : "Incorrect — added to your Review queue"}
          </div>
          <Markdown text={q.explanation} />
        </div>
      )}
    </div>
  );
}
