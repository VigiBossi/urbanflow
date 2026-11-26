"use client";

import { useState } from "react";
import type { Question } from "@/lib/types";
import { QuestionCard } from "./QuestionCard";
import { Button, ButtonLink, Icon, ProgressBar } from "@/components/ui";

export function Drill({ questions, onRestart, emptyText = "No questions match this selection." }: {
  questions: Question[];
  onRestart?: () => void;
  emptyText?: string;
}) {
  const [i, setI] = useState(0);
  const [results, setResults] = useState<Record<string, boolean>>({});
  const [round, setRound] = useState(0);
  const [list, setList] = useState(questions);

  if (list.length === 0) {
    return <p className="rounded-xl border border-dashed border-border p-8 text-center text-muted">{emptyText}</p>;
  }

  const done = i >= list.length;
  const q = list[Math.min(i, list.length - 1)];
  const answeredCurrent = q.id in results;
  const score = Object.values(results).filter(Boolean).length;
  const missed = list.filter((x) => results[x.id] === false);

  if (done) {
    return (
      <div className="mx-auto max-w-xl rounded-xl border border-border bg-surface p-6 text-center">
        <div className="text-4xl font-semibold tracking-tight">
          {score} / {list.length}
        </div>
        <p className="mt-1 text-muted">correct this round</p>
        <ProgressBar value={score / list.length} className="mt-4" />
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {missed.length > 0 && (
            <Button
              variant="primary"
              onClick={() => {
                setList(missed);
                setResults({});
                setI(0);
                setRound((r) => r + 1);
              }}
            >
              <Icon name="reset" /> Retry the {missed.length} I missed
            </Button>
          )}
          {onRestart && <Button onClick={onRestart}>New set</Button>}
          <ButtonLink href="/review">Open Review queue</ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-3 flex items-center gap-3">
        <ProgressBar value={i / list.length} />
        <span className="shrink-0 font-mono text-xs text-muted">
          {i + 1}/{list.length}
        </span>
      </div>
      <QuestionCard
        key={`${round}-${q.id}`}
        question={q}
        number={i + 1}
        onAnswered={(ok) => setResults((r) => ({ ...r, [q.id]: ok }))}
      />
      <div className="mt-4 flex justify-end">
        <Button variant={answeredCurrent ? "primary" : "secondary"} onClick={() => setI((x) => x + 1)}>
          {i === list.length - 1 ? "Finish" : answeredCurrent ? "Next" : "Skip"} <Icon name="chevron" />
        </Button>
      </div>
    </div>
  );
}
