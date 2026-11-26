"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { builtinModules, questions } from "@/content";
import { shuffle } from "@/lib/quizGenerator";
import type { Question } from "@/lib/types";
import { Drill } from "@/components/practice/Drill";
import { PageHeader } from "@/components/ui";

const SET_SIZE = 12;

export function DrillView({ type, moduleId, topic }: { type: string; moduleId?: string; topic?: string }) {
  const [set, setSet] = useState<Question[] | null>(null);
  const [round, setRound] = useState(0);

  useEffect(() => {
    const pool = questions.filter(
      (q) =>
        (type === "mixed" || q.type === type) &&
        (!moduleId || q.moduleId === moduleId) &&
        (!topic || q.topics.includes(topic as Question["topics"][number])),
    );
    // eslint-disable-next-line react-hooks/set-state-in-effect -- shuffle on the client only (avoids hydration mismatch)
    setSet(shuffle(pool).slice(0, SET_SIZE));
  }, [type, moduleId, topic, round]);

  const m = builtinModules.find((x) => x.id === moduleId);
  const title = type === "tf" ? "True / False drill" : type === "mc" ? "Multiple-choice drill" : "Mixed drill";
  const scope = [m && `Module ${m.order}: ${m.shortTitle}`, topic && `Topic: ${topic}`].filter(Boolean).join(" · ") || "All modules";

  return (
    <div>
      <Link href="/practice" className="text-sm text-muted hover:text-fg">
        ← Practice
      </Link>
      <div className="mt-3">
        <PageHeader title={title}>
          {scope} · up to {SET_SIZE} random questions. Wrong answers go straight to your Review queue.
        </PageHeader>
      </div>
      {set && <Drill key={round} questions={set} onRestart={() => setRound((r) => r + 1)} />}
    </div>
  );
}
