// ============================================================
// Static course content (shipped in /src/content)
// ============================================================

export type Mastery = "needs-review" | "getting-it" | "mastered";

export type Topic =
  | "structure"
  | "case-sensitivity"
  | "types"
  | "casting"
  | "integer-division"
  | "operators"
  | "strings"
  | "scanner"
  | "conditionals"
  | "switch"
  | "equals"
  | "loops"
  | "do-while"
  | "methods"
  | "void";

export interface Module {
  id: string; // "m4-conditionals"
  order: number; // 1..7 for built-ins, 8+ for user modules
  title: string;
  shortTitle: string;
  summary: string;
  lessonIds: string[];
  exerciseIds: string[];
  traceIds: string[];
  source: "builtin" | "user";
}

export type LessonSection =
  | { kind: "text"; heading?: string; markdown: string }
  | { kind: "code"; filename?: string; code: string; caption?: string; output?: string; traceId?: string }
  | { kind: "trap"; title: string; markdown: string; code?: string }
  | { kind: "keypoints"; heading?: string; items: string[] }
  | { kind: "table"; heading?: string; headers: string[]; rows: string[][] };

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  minutes: number;
  sections: LessonSection[];
  source: "builtin" | "user";
  createdAt?: string;
}

// ---------- Code tracer ----------
export type VarValue = string | number | boolean;

export interface TraceStep {
  line: number; // 1-based line in `code` to highlight
  vars: Record<string, VarValue>; // full snapshot after the line executes
  changed?: string[]; // which vars changed in this step (flash in table)
  output?: string; // full stdout so far
  note?: string; // why this line did what it did
}

export interface TraceProgram {
  id: string;
  moduleId: string;
  title: string;
  filename: string;
  description: string;
  code: string;
  steps: TraceStep[];
  expectedOutput: string;
}

// ---------- Practice ----------
interface QuestionBase {
  id: string;
  moduleId: string;
  topics: Topic[];
  code?: string;
  explanation: string;
}

export interface TrueFalseQuestion extends QuestionBase {
  type: "tf";
  statement: string;
  answer: boolean;
}

export interface MultipleChoiceQuestion extends QuestionBase {
  type: "mc";
  prompt: string;
  options: string[];
  correctIndex: number;
}

export type Question = TrueFalseQuestion | MultipleChoiceQuestion;

export interface CodingExercise {
  id: string;
  moduleId: string;
  lab: string; // "Lab 4", "Lab 5", "Lab 6", "Methods"
  number: number;
  title: string;
  prompt: string; // markdown
  starterCode: string;
  samples: { input: string; output: string }[];
  hints: string[];
  solution: string;
  traps?: string[];
  checklist?: string[]; // self-check before revealing the solution
  difficulty: 1 | 2 | 3;
}

// ============================================================
// User state (persisted through a StorageAdapter)
// ============================================================

export interface LessonProgress {
  completed: boolean;
  markedWeak: boolean;
  lastVisited?: string;
}

export interface ExerciseProgress {
  status: "not-started" | "attempted" | "solved";
  code?: string;
  hintsUsed: number;
  solutionViewed?: boolean;
}

export interface QuestionProgress {
  attempts: number;
  correct: number;
  lastCorrect: boolean;
  lastAt: string;
}

export interface TraceProgress {
  completed: boolean;
  predictedCorrectly?: boolean;
}

export interface UserProgress {
  lessons: Record<string, LessonProgress>;
  exercises: Record<string, ExerciseProgress>;
  questions: Record<string, QuestionProgress>;
  traces: Record<string, TraceProgress>;
  lastLocation?: { href: string; label: string; sub?: string; at: string };
}

export interface Note {
  lessonId: string;
  markdown: string;
  updatedAt: string;
}

export interface ReviewItem {
  id: string; // `${kind}:${refId}`
  kind: "question" | "lesson" | "exercise";
  refId: string;
  reason: "missed" | "marked-weak";
  addedAt: string;
  streak: number; // consecutive correct answers since being added; leaves queue at 2
}

export interface QuizAttempt {
  id: string;
  questionIds: string[];
  exerciseIds: string[];
  answers: Record<string, boolean | number | null>;
  score: number;
  total: number;
  at: string;
}

/** Everything a single learner owns. One document = easy to sync to Supabase later. */
export interface UserState {
  version: 1;
  progress: UserProgress;
  notes: Record<string, Note>;
  reviewQueue: ReviewItem[];
  userModules: Module[];
  userLessons: Lesson[];
  quizAttempts: QuizAttempt[];
}

export const emptyUserState = (): UserState => ({
  version: 1,
  progress: { lessons: {}, exercises: {}, questions: {}, traces: {} },
  notes: {},
  reviewQueue: [],
  userModules: [],
  userLessons: [],
  quizAttempts: [],
});
