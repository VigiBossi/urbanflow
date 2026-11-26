import { builtinLessons, builtinModules, exercises, questions } from "@/content";
import type { Lesson, Mastery, Module, UserState } from "@/lib/types";

export type MasteryState = Mastery | "not-started";

/** Built-in modules + user modules, each with any user-added lessons appended. */
export function getAllModules(state: UserState): Module[] {
  const extra = (moduleId: string) => state.userLessons.filter((l) => l.moduleId === moduleId).map((l) => l.id);
  return [...builtinModules, ...state.userModules]
    .map((m) => ({ ...m, lessonIds: [...m.lessonIds, ...extra(m.id).filter((id) => !m.lessonIds.includes(id))] }))
    .sort((a, b) => a.order - b.order);
}

export function getAllLessons(state: UserState): Lesson[] {
  return [...builtinLessons, ...state.userLessons];
}

export function getModule(state: UserState, id: string): Module | undefined {
  return getAllModules(state).find((m) => m.id === id);
}

export function getLesson(state: UserState, id: string): Lesson | undefined {
  return getAllLessons(state).find((l) => l.id === id);
}

export interface ModuleStats {
  lessonsDone: number;
  lessonsTotal: number;
  exercisesSolved: number;
  exercisesTotal: number;
  tracesDone: number;
  tracesTotal: number;
  questionsAnswered: number;
  questionsTotal: number;
  accuracy: number | null; // 0..1 based on each question's latest answer
  completion: number; // 0..1
  weakCount: number;
  mastery: MasteryState;
}

export function moduleStats(module: Module, state: UserState): ModuleStats {
  const p = state.progress;
  const lessonsDone = module.lessonIds.filter((id) => p.lessons[id]?.completed).length;
  const exercisesSolved = module.exerciseIds.filter((id) => p.exercises[id]?.status === "solved").length;
  const tracesDone = module.traceIds.filter((id) => p.traces[id]?.completed).length;
  const moduleQuestions = questions.filter((q) => q.moduleId === module.id);
  const answered = moduleQuestions.filter((q) => p.questions[q.id]);
  const correctNow = answered.filter((q) => p.questions[q.id].lastCorrect).length;
  const accuracy = answered.length ? correctNow / answered.length : null;

  // Completion: lessons + exercises + traces + (question coverage counted as one block worth up to 3 items)
  const qWeight = moduleQuestions.length ? 3 : 0;
  const qDone = moduleQuestions.length ? (answered.length / moduleQuestions.length) * qWeight : 0;
  const total = module.lessonIds.length + module.exerciseIds.length + module.traceIds.length + qWeight;
  const done = lessonsDone + exercisesSolved + tracesDone + qDone;
  const completion = total ? done / total : 0;

  const moduleExerciseIds = new Set(module.exerciseIds);
  const moduleQuestionIds = new Set(moduleQuestions.map((q) => q.id));
  const moduleLessonIds = new Set(module.lessonIds);
  const weakCount = state.reviewQueue.filter(
    (r) =>
      (r.kind === "lesson" && moduleLessonIds.has(r.refId)) ||
      (r.kind === "question" && moduleQuestionIds.has(r.refId)) ||
      (r.kind === "exercise" && moduleExerciseIds.has(r.refId)),
  ).length;

  const hasActivity =
    lessonsDone > 0 ||
    exercisesSolved > 0 ||
    tracesDone > 0 ||
    answered.length > 0 ||
    module.lessonIds.some((id) => p.lessons[id]?.lastVisited) ||
    module.exerciseIds.some((id) => p.exercises[id]);

  let mastery: MasteryState = "not-started";
  if (hasActivity) {
    const lessonsComplete = lessonsDone === module.lessonIds.length;
    const exercisesOk = module.exerciseIds.length === 0 || exercisesSolved / module.exerciseIds.length >= 0.5;
    const accuracyOk = moduleQuestions.length === 0 || (accuracy !== null && accuracy >= 0.85 && answered.length >= Math.min(5, moduleQuestions.length));
    if (weakCount > 0 || (accuracy !== null && answered.length >= 3 && accuracy < 0.5)) mastery = "needs-review";
    else if (lessonsComplete && exercisesOk && accuracyOk) mastery = "mastered";
    else mastery = "getting-it";
  }

  return {
    lessonsDone,
    lessonsTotal: module.lessonIds.length,
    exercisesSolved,
    exercisesTotal: module.exerciseIds.length,
    tracesDone,
    tracesTotal: module.traceIds.length,
    questionsAnswered: answered.length,
    questionsTotal: moduleQuestions.length,
    accuracy,
    completion,
    weakCount,
    mastery,
  };
}

export function overallStats(state: UserState) {
  const mods = getAllModules(state);
  const stats = mods.map((m) => moduleStats(m, state));
  const qs = Object.values(state.progress.questions);
  const answered = qs.length;
  const correct = qs.filter((q) => q.lastCorrect).length;
  const completion = stats.length ? stats.reduce((a, s) => a + s.completion, 0) / stats.length : 0;
  return {
    completion,
    answered,
    accuracy: answered ? correct / answered : null,
    exercisesSolved: Object.values(state.progress.exercises).filter((e) => e.status === "solved").length,
    exercisesTotal: exercises.length,
    lessonsDone: Object.values(state.progress.lessons).filter((l) => l.completed).length,
    lessonsTotal: getAllLessons(state).length,
    reviewCount: state.reviewQueue.length,
    mastered: stats.filter((s) => s.mastery === "mastered").length,
  };
}

/** Where "Continue Learning" should send the learner. */
export function continueTarget(state: UserState): { href: string; label: string; sub: string } {
  const last = state.progress.lastLocation;
  if (last) return { href: last.href, label: last.label, sub: last.sub ?? "Pick up where you left off" };
  for (const m of getAllModules(state)) {
    for (const id of m.lessonIds) {
      if (!state.progress.lessons[id]?.completed) {
        const l = getLesson(state, id);
        if (l) return { href: `/modules/${m.id}/${l.id}`, label: l.title, sub: `Module ${m.order} · ${m.shortTitle}` };
      }
    }
  }
  return { href: "/practice/quiz", label: "Take a full practice quiz", sub: "All lessons completed — time to test yourself" };
}

export const masteryLabel: Record<MasteryState, string> = {
  "not-started": "Not started",
  "needs-review": "Needs Review",
  "getting-it": "Getting It",
  mastered: "Mastered",
};
