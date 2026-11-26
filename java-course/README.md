# Intro to Programming (Java) · 2026 – 2027

An interactive learning platform for the *Intro to Programming* course (Java, instructor Loren Nebiaj).
It comes loaded with the class lectures, the exact class files (`FirstProgram.java`, `Square.java`,
`Compare.java`, `Mistery.java`), all 7 Lab 4 exercises, and practice material for loops, methods and Lab 6.

Built with **Next.js 16 (App Router) · TypeScript · Tailwind CSS 4**. Your progress is saved in the browser (LocalStorage), so there is nothing else to set up.

## Run it

Requires Node.js 20+.

```bash
cd java-course
npm install
npm run dev
```

Open <http://localhost:3000>.

Production build:

```bash
npm run build
npm start
```

## What's inside

| Feature | Where |
| --- | --- |
| **Course dashboard**: 7 modules, completion bars, mastery (Needs Review / Getting It / Mastered), Continue Learning | `/` |
| **Lesson workspace**: explanations, highlighted Java with copy buttons, "predict the output" reveals, Common Traps, a personal notes panel that saves as you type | `/modules/[module]/[lesson]` |
| **Interactive code tracer**: step line by line with a variable table and console, or predict the output first. 10 programs, including `Mistery.java`, `for` loops, off-by-one, `while` digits, `do-while`, nested loops and method calls | `/tracer` |
| **Exam-style practice**: 46 True/False and 40 Multiple-Choice questions, each explained the moment you answer. Drill by type, module, or classic trap (integer division, `do-while`, `void`, `.equals()`, Scanner, case sensitivity…) | `/practice` |
| **Practice quiz generator**: 10 T/F + 10 MC + 1–3 coding prompts (class format), scored, with history | `/practice/quiz` |
| **22 coding exercises**: Lab 4 (all 7), Lab 5 (6), Methods (4), Lab 6 (5). Each has an editor, sample inputs/outputs, step-by-step hints, traps, a self-check list and a reference solution | `/practice/exercises/[id]` |
| **Weak-spot review**: missed questions and lessons/exercises you flag. A question leaves the queue after 2 correct answers in a row | `/review` |
| **Add future lessons**: paste notes (with ```` ```java ```` code fences) or upload `.java` / `.pdf` / `.txt` / `.md` files into an existing or new module (Arrays, OOP, …) | **+ Add lesson** in the header |

Light/dark mode follows your system setting and can be toggled from the header. Every page works on phones, with a bottom navigation bar.

> The exercises don't compile Java in the browser. Download your code as a `.java` file (one click) and run it with
> `javac Name.java && java Name`, or paste it into your IDE. Then compare with the reference solution.

## Every Java snippet is verified

```bash
npm run verify:java
```

This compiles and runs every reference solution against its sample inputs, every tracer program, every lesson snippet
that shows an output, and every "What is printed?" question, and checks the output matches what the app claims. You need a JDK
(`javac` and `java` on your PATH). Run it after you edit or add content.

## Project structure

```
src/
├── app/                      # routes (App Router)
│   ├── page.tsx              # dashboard
│   ├── modules/[moduleId]/[lessonId]/
│   ├── tracer/[traceId]/
│   ├── practice/{drill,quiz,exercises/[exerciseId]}/
│   └── review/
├── components/
│   ├── ui/                   # Button, Card, Modal, ProgressBar, MasteryBadge, Icon
│   ├── code/                 # CodeBlock (highlight + copy), CodeEditor
│   ├── lesson/               # LessonSections, NotesPanel, TrapCallout
│   ├── tracer/               # Tracer (step + predict modes)
│   ├── practice/             # QuestionCard, Drill, ExerciseWorkspace
│   ├── views/                # client views behind the dynamic routes
│   └── AddLessonModal.tsx
├── content/                  # ← all course material, as typed data
│   ├── modules/              # m1-structure.ts … m7-quiz-prep.ts (modules + lessons)
│   ├── exercises/            # lab4.ts, lab5.ts, methods.ts, lab6.ts
│   ├── traces/               # tracer programs (steps point at lines by their text)
│   ├── questions/            # true-false.ts, multiple-choice.ts
│   └── index.ts
└── lib/
    ├── types.ts              # data model
    ├── store.tsx             # React context: state + actions
    ├── storage/              # StorageAdapter interface + LocalStorage implementation
    ├── progress.ts           # completion %, mastery, Continue Learning
    ├── quizGenerator.ts
    ├── highlight.ts          # small Java tokenizer
    └── fileImport.ts         # .java / .pdf (pdf.js) / text import
scripts/verify-java.ts
```

## Adding content in code

- **Lesson:** add an object to a module's `…Lessons` array and its id to the module's `lessonIds`. Section kinds are
  `text`, `code` (optional `output` and `traceId`), `trap`, `keypoints` and `table`.
- **Question:** add a `tf({...})` or `mc({...})` entry in `src/content/questions/`.
- **Exercise:** add to a file in `src/content/exercises/` and its id to the module's `exerciseIds`.
- **Trace:** in `src/content/traces/index.ts`, write the program, then list the steps with `at: "text on the line"`,
  plus `set` / `unset` for variables and `print` for output. Line numbers and output are worked out for you.

Run `npm run verify:java` afterwards.

## Moving to Supabase later

All learner data is one `UserState` document (progress, notes, review queue, user-added modules and lessons, quiz
attempts), and every read and write goes through `StorageAdapter` (`src/lib/storage/StorageAdapter.ts`):

```ts
interface StorageAdapter {
  load(): Promise<UserState>;
  save(state: UserState): Promise<void>;
  clear(): Promise<void>;
}
```

To switch:

1. Create a table, e.g. `user_state (user_id uuid primary key references auth.users, data jsonb, updated_at timestamptz)`, with RLS `user_id = auth.uid()`.
2. Write `supabaseAdapter.ts` that implements the three methods with `select` / `upsert`.
3. Change the single line in `src/lib/storage/index.ts` to use it.

None of the components need to change. If you later want finer-grained tables (`notes`, `question_attempts`, …), the
types in `src/lib/types.ts` map one-to-one onto them.
