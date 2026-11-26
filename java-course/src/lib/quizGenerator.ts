import { exercises, questions } from "@/content";
import type { CodingExercise, MultipleChoiceQuestion, Question, TrueFalseQuestion, UserState } from "@/lib/types";

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export interface QuizOptions {
  moduleIds: string[]; // empty = all
  tfCount: number;
  mcCount: number;
  codingCount: number;
  prioritiseWeak: boolean;
}

export interface GeneratedQuiz {
  tf: TrueFalseQuestion[];
  mc: MultipleChoiceQuestion[];
  coding: CodingExercise[];
}

function pick<T extends Question>(pool: T[], n: number, weakIds: Set<string>, prioritiseWeak: boolean): T[] {
  if (!prioritiseWeak) return shuffle(pool).slice(0, n);
  const weak = shuffle(pool.filter((q) => weakIds.has(q.id)));
  const rest = shuffle(pool.filter((q) => !weakIds.has(q.id)));
  return [...weak, ...rest].slice(0, n);
}

export function generateQuiz(opts: QuizOptions, state: UserState): GeneratedQuiz {
  const inScope = (moduleId: string) => opts.moduleIds.length === 0 || opts.moduleIds.includes(moduleId);
  const weakIds = new Set(state.reviewQueue.filter((r) => r.kind === "question").map((r) => r.refId));
  const tfPool = questions.filter((q): q is TrueFalseQuestion => q.type === "tf" && inScope(q.moduleId));
  const mcPool = questions.filter((q): q is MultipleChoiceQuestion => q.type === "mc" && inScope(q.moduleId));
  const exPool = exercises.filter((e) => inScope(e.moduleId));
  return {
    tf: pick(tfPool, opts.tfCount, weakIds, opts.prioritiseWeak),
    mc: pick(mcPool, opts.mcCount, weakIds, opts.prioritiseWeak),
    coding: shuffle(exPool).slice(0, opts.codingCount),
  };
}
