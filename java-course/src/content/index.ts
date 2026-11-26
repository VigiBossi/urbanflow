import type { CodingExercise, Lesson, Module, Question, TraceProgram } from "../lib/types";
import { module1, module1Lessons } from "./modules/m1-structure";
import { module2, module2Lessons } from "./modules/m2-variables";
import { module3, module3Lessons } from "./modules/m3-scanner";
import { module4, module4Lessons } from "./modules/m4-conditionals";
import { module5, module5Lessons } from "./modules/m5-loops";
import { module6, module6Lessons } from "./modules/m6-methods";
import { module7, module7Lessons } from "./modules/m7-quiz-prep";
import { lab4 } from "./exercises/lab4";
import { lab5 } from "./exercises/lab5";
import { methodsExercises } from "./exercises/methods";
import { lab6 } from "./exercises/lab6";
import { traces as allTraces } from "./traces";
import { trueFalse } from "./questions/true-false";
import { multipleChoice } from "./questions/multiple-choice";

export const COURSE = {
  title: "Intro to Programming",
  year: "2026 – 2027",
  language: "Java",
  instructor: "Loren Nebiaj",
};

export const builtinModules: Module[] = [module1, module2, module3, module4, module5, module6, module7];

export const builtinLessons: Lesson[] = [
  ...module1Lessons,
  ...module2Lessons,
  ...module3Lessons,
  ...module4Lessons,
  ...module5Lessons,
  ...module6Lessons,
  ...module7Lessons,
];

export const exercises: CodingExercise[] = [...lab4, ...lab5, ...methodsExercises, ...lab6];
export const traces: TraceProgram[] = allTraces;
export const questions: Question[] = [...trueFalse, ...multipleChoice];

export const exerciseById = new Map(exercises.map((e) => [e.id, e]));
export const traceById = new Map(traces.map((t) => [t.id, t]));
export const questionById = new Map(questions.map((q) => [q.id, q]));
