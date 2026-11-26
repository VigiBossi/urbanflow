"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { storage } from "@/lib/storage";
import {
  emptyUserState,
  type ExerciseProgress,
  type Lesson,
  type Module,
  type QuizAttempt,
  type ReviewItem,
  type UserState,
} from "@/lib/types";

const now = () => new Date().toISOString();
const STREAK_TO_CLEAR = 2;

type Updater = (s: UserState) => UserState;

function upsertReview(
  queue: ReviewItem[],
  kind: ReviewItem["kind"],
  refId: string,
  reason: ReviewItem["reason"],
): ReviewItem[] {
  const id = `${kind}:${refId}`;
  const existing = queue.find((r) => r.id === id);
  if (existing) return queue.map((r) => (r.id === id ? { ...r, streak: 0, reason } : r));
  return [{ id, kind, refId, reason, addedAt: now(), streak: 0 }, ...queue];
}

export interface StoreActions {
  setLastLocation(href: string, label: string, sub?: string): void;
  visitLesson(lessonId: string): void;
  setLessonCompleted(lessonId: string, completed: boolean): void;
  setLessonWeak(lessonId: string, weak: boolean): void;
  recordAnswer(questionId: string, correct: boolean): void;
  updateExercise(exerciseId: string, patch: Partial<ExerciseProgress>): void;
  setExerciseWeak(exerciseId: string, weak: boolean): void;
  recordTrace(traceId: string, predictedCorrectly?: boolean): void;
  saveNote(lessonId: string, markdown: string): void;
  addUserLesson(lesson: Lesson, newModule?: Module): void;
  deleteUserLesson(lessonId: string): void;
  saveQuizAttempt(a: QuizAttempt): void;
  removeReviewItem(id: string): void;
  resetAll(): void;
}

interface StoreValue {
  state: UserState;
  ready: boolean;
  actions: StoreActions;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<UserState>(emptyUserState);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    storage.load().then((s) => {
      if (!alive) return;
      setState(s);
      setReady(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  // Persist every change immediately (the state document is small), and flush on page hide as a safety net.
  const latest = useRef(state);
  useEffect(() => {
    latest.current = state;
    if (ready) void storage.save(state);
  }, [state, ready]);
  useEffect(() => {
    if (!ready) return;
    const flush = () => void storage.save(latest.current);
    window.addEventListener("pagehide", flush);
    return () => window.removeEventListener("pagehide", flush);
  }, [ready]);

  const update = useCallback((fn: Updater) => setState((s) => fn(s)), []);

  const actions = useMemo<StoreActions>(
    () => ({
      setLastLocation(href, label, sub) {
        update((s) => ({ ...s, progress: { ...s.progress, lastLocation: { href, label, sub, at: now() } } }));
      },
      visitLesson(lessonId) {
        update((s) => {
          const prev = s.progress.lessons[lessonId] ?? { completed: false, markedWeak: false };
          return {
            ...s,
            progress: { ...s.progress, lessons: { ...s.progress.lessons, [lessonId]: { ...prev, lastVisited: now() } } },
          };
        });
      },
      setLessonCompleted(lessonId, completed) {
        update((s) => {
          const prev = s.progress.lessons[lessonId] ?? { completed: false, markedWeak: false };
          return {
            ...s,
            progress: { ...s.progress, lessons: { ...s.progress.lessons, [lessonId]: { ...prev, completed } } },
          };
        });
      },
      setLessonWeak(lessonId, weak) {
        update((s) => {
          const prev = s.progress.lessons[lessonId] ?? { completed: false, markedWeak: false };
          const reviewQueue = weak
            ? upsertReview(s.reviewQueue, "lesson", lessonId, "marked-weak")
            : s.reviewQueue.filter((r) => r.id !== `lesson:${lessonId}`);
          return {
            ...s,
            reviewQueue,
            progress: { ...s.progress, lessons: { ...s.progress.lessons, [lessonId]: { ...prev, markedWeak: weak } } },
          };
        });
      },
      recordAnswer(questionId, correct) {
        update((s) => {
          const prev = s.progress.questions[questionId] ?? { attempts: 0, correct: 0, lastCorrect: false, lastAt: now() };
          const q = {
            attempts: prev.attempts + 1,
            correct: prev.correct + (correct ? 1 : 0),
            lastCorrect: correct,
            lastAt: now(),
          };
          const id = `question:${questionId}`;
          let reviewQueue = s.reviewQueue;
          if (!correct) {
            reviewQueue = upsertReview(reviewQueue, "question", questionId, "missed");
          } else if (reviewQueue.some((r) => r.id === id)) {
            reviewQueue = reviewQueue
              .map((r) => (r.id === id ? { ...r, streak: r.streak + 1 } : r))
              .filter((r) => !(r.id === id && r.streak >= STREAK_TO_CLEAR));
          }
          return {
            ...s,
            reviewQueue,
            progress: { ...s.progress, questions: { ...s.progress.questions, [questionId]: q } },
          };
        });
      },
      updateExercise(exerciseId, patch) {
        update((s) => {
          const prev: ExerciseProgress = s.progress.exercises[exerciseId] ?? { status: "not-started", hintsUsed: 0 };
          const next = { ...prev, ...patch };
          const reviewQueue =
            patch.status === "solved" ? s.reviewQueue.filter((r) => r.id !== `exercise:${exerciseId}`) : s.reviewQueue;
          return {
            ...s,
            reviewQueue,
            progress: { ...s.progress, exercises: { ...s.progress.exercises, [exerciseId]: next } },
          };
        });
      },
      setExerciseWeak(exerciseId, weak) {
        update((s) => ({
          ...s,
          reviewQueue: weak
            ? upsertReview(s.reviewQueue, "exercise", exerciseId, "marked-weak")
            : s.reviewQueue.filter((r) => r.id !== `exercise:${exerciseId}`),
        }));
      },
      recordTrace(traceId, predictedCorrectly) {
        update((s) => {
          const prev = s.progress.traces[traceId];
          return {
            ...s,
            progress: {
              ...s.progress,
              traces: {
                ...s.progress.traces,
                [traceId]: {
                  completed: true,
                  predictedCorrectly: predictedCorrectly ?? prev?.predictedCorrectly,
                },
              },
            },
          };
        });
      },
      saveNote(lessonId, markdown) {
        update((s) => ({ ...s, notes: { ...s.notes, [lessonId]: { lessonId, markdown, updatedAt: now() } } }));
      },
      addUserLesson(lesson, newModule) {
        update((s) => {
          let userModules = s.userModules;
          if (newModule) userModules = [...userModules, newModule];
          return { ...s, userModules, userLessons: [...s.userLessons, lesson] };
        });
      },
      deleteUserLesson(lessonId) {
        update((s) => {
          const userLessons = s.userLessons.filter((l) => l.id !== lessonId);
          // drop user modules that became empty
          const userModules = s.userModules.filter((m) => userLessons.some((l) => l.moduleId === m.id));
          const notes = { ...s.notes };
          delete notes[lessonId];
          return {
            ...s,
            userLessons,
            userModules,
            notes,
            reviewQueue: s.reviewQueue.filter((r) => r.id !== `lesson:${lessonId}`),
          };
        });
      },
      saveQuizAttempt(a) {
        update((s) => ({ ...s, quizAttempts: [a, ...s.quizAttempts].slice(0, 50) }));
      },
      removeReviewItem(id) {
        update((s) => ({ ...s, reviewQueue: s.reviewQueue.filter((r) => r.id !== id) }));
      },
      resetAll() {
        void storage.clear();
        setState(emptyUserState());
      },
    }),
    [update],
  );

  const value = useMemo(() => ({ state, ready, actions }), [state, ready, actions]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside <StoreProvider>");
  return ctx;
}
