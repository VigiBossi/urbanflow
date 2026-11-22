# CAI 109 – Logical Circuits Trainer

An interactive, offline training platform for the first-year course **CAI 109 – Logical Circuits**.
It is plain HTML/CSS/JavaScript: there is no build step, no backend and no dependencies, and progress is saved in `localStorage`.

## Run it

Open `index.html` in any modern browser (double-click it; it works from `file://`).
To serve it instead: `python3 -m http.server` in this folder, then open http://localhost:8000.

## Project structure

```
cai109-trainer/
├── index.html                  App shell: sidebar, script loading order
├── css/styles.css              Design system, light/dark themes
├── js/
│   ├── core/                   Engine (no DOM needed, unit-tested)
│   │   ├── util.js             Helpers + global CAI namespace
│   │   ├── storage.js          localStorage progress, mistakes, quiz scores
│   │   ├── boolean.js          Plain-text Boolean parser, truth tables, Quine–McCluskey (SOP/POS)
│   │   ├── numbers.js          Base conversion with working, 2's complement, Gray, BCD,
│   │   │                       Hamming(7,4), CRC, IEEE 754, Huffman, LZ77/LZ78
│   │   ├── checker.js          Answer normalisation, checking and mistake diagnosis
│   │   └── generators.js       48 random problem generators (also used with fixed params)
│   ├── content/                One file per module: lessons, practice bank, review sheet,
│   │   └── m01 … m11           fill-in-the-blanks and quiz questions
│   ├── ui/
│   │   ├── problem.js          Problem widget: hints, "check my steps", solutions, speed bump
│   │   ├── lesson.js           Intuition → rule → step-by-step example → your turn
│   │   ├── dashboard.js        Dashboard, module list, module pages, settings/backup
│   │   ├── practice.js         Module practice sets and endless generators
│   │   ├── tools.js            Base converter, truth table, K-map solver, gate simulator
│   │   ├── exam.js             Review sheets, fill-in-the-blanks, timed quizzes
│   │   └── mistakes.js         Mistakes page with retry
│   └── app.js                  Hash router, sidebar, theme
└── tests/run-tests.js          Self-test for the engine and all content
```

## How answers are checked

- Numbers: `1011`, `0b1011`, `0x1F`, `1F h` and `1011_2` are all accepted. Spaces and case are ignored, and leading zeros are ignored unless a fixed width is required.
- Boolean expressions: `A AND NOT B`, `A'B + AB'`, `!(a & b)`, `A xor B` and `(A NAND A) NAND (B NAND B)` are all accepted. Answers are compared by truth table, so any equivalent form is correct. Where a minimal answer is required, the number of literals is also checked.
- When an answer is wrong, the app explains what went wrong:
  - an answer that equals an intermediate step gets "you jumped to the answer too early";
  - known traps are named (for example, reversed remainders, a forgotten +1, a missing bias, or a forgotten final carry);
  - the wrong digits or truth-table rows are pointed out;
  - you are always reminded to recheck the final step.
- **Check my steps** lets you type your intermediate results and shows the first step that is wrong.

## Tests

```bash
node tests/run-tests.js
```

The test file checks known values (for example, −13.25 = 0xC1540000, the CRC and Hamming examples, and the K-map examples). It runs every generator 40 times and checks that the checker accepts each generated answer. It also checks every lesson, practice problem, quiz and blank.
