import type { Lesson, Module } from "../../lib/types";
import { java, md } from "../helpers";

export const module5: Module = {
  id: "m5-loops",
  order: 5,
  title: "Conditionals and Repetitions (Loops) & Lab 5",
  shortTitle: "Loops",
  summary: "for, while, do-while, break / continue, running sums, counting, factorial, digit extraction and nested loops.",
  lessonIds: ["l5-for", "l5-while", "l5-patterns"],
  exerciseIds: ["lab5-1", "lab5-2", "lab5-3", "lab5-4", "lab5-5", "lab5-6"],
  traceIds: ["t-for-sum", "t-for-offbyone", "t-while-digits", "t-dowhile", "t-nested"],
  source: "builtin",
};

export const module5Lessons: Lesson[] = [
  {
    id: "l5-for",
    moduleId: "m5-loops",
    title: "for Loops",
    minutes: 14,
    source: "builtin",
    sections: [
      {
        kind: "text",
        markdown: md(
          "`for (init; condition; update) { body }`",
          "",
          "1. **init** runs once.",
          "2. **condition** is checked — if `false`, the loop ends.",
          "3. **body** runs.",
          "4. **update** runs, then go back to step 2.",
        ),
      },
      {
        kind: "code",
        filename: "Sum.java",
        caption: "Running sum 1..5 — step through it in the tracer.",
        traceId: "t-for-sum",
        code: java`
public class Sum {
    public static void main(String[] args) {
        int sum = 0;
        for (int i = 1; i <= 5; i++) {
            sum = sum + i;
        }
        System.out.println("Sum = " + sum);
    }
}`,
        output: "Sum = 15",
      },
      {
        kind: "keypoints",
        heading: "Counting how many times a loop runs",
        items: [
          "`for (int i = 0; i < n; i++)` → runs **n** times (i = 0 … n-1).",
          "`for (int i = 1; i <= n; i++)` → runs **n** times (i = 1 … n).",
          "`for (int i = 0; i <= n; i++)` → runs **n + 1** times.",
          "`for (int i = 10; i > 0; i -= 3)` → i = 10, 7, 4, 1 → **4** times.",
          "After `for (int i...)` ends, `i` no longer exists (scope is the loop).",
        ],
      },
      {
        kind: "code",
        filename: "OffByOne.java",
        traceId: "t-for-offbyone",
        code: java`
public class OffByOne {
    public static void main(String[] args) {
        int count = 0;
        for (int i = 0; i <= 3; i++) {
            System.out.print(i + " ");
            count++;
        }
        System.out.println();
        System.out.println("count = " + count);
    }
}`,
        output: "0 1 2 3 \ncount = 4",
      },
      {
        kind: "trap",
        title: "Off-by-one: `<` vs `<=`",
        markdown: "`i < 5` from 0 gives 5 iterations (0–4); `i <= 5` gives 6 (0–5). Always check the first and last value of `i`.",
      },
      {
        kind: "trap",
        title: "Stray `;` after `for (...)`",
        markdown:
          "The semicolon becomes the (empty) loop body. The block below runs only **once**, after the loop finishes.",
        code: java`
for (int i = 0; i < 3; i++);   // empty loop body!
{
    System.out.println("Hi");  // prints once
}`,
      },
    ],
  },
  {
    id: "l5-while",
    moduleId: "m5-loops",
    title: "while & do-while",
    minutes: 12,
    source: "builtin",
    sections: [
      {
        kind: "table",
        headers: ["Loop", "Checks condition", "Minimum runs"],
        rows: [
          ["`while (cond) { ... }`", "**before** each iteration", "0"],
          ["`do { ... } while (cond);`", "**after** each iteration", "**1** — always runs at least once"],
        ],
      },
      {
        kind: "code",
        filename: "DoWhile.java",
        traceId: "t-dowhile",
        code: java`
public class DoWhile {
    public static void main(String[] args) {
        int n = 10;
        while (n < 5) {
            System.out.println("while: " + n);
            n++;
        }
        do {
            System.out.println("do-while: " + n);
            n++;
        } while (n < 5);
        System.out.println("n = " + n);
    }
}`,
        output: "do-while: 10\nn = 11",
      },
      {
        kind: "text",
        heading: "Repeat until the input is valid",
        markdown: "`do-while` is perfect for input validation: ask at least once, keep asking while the answer is wrong.",
      },
      {
        kind: "code",
        filename: "Validate.java",
        code: java`
Scanner input = new Scanner(System.in);
int n;
do {
    System.out.print("Enter a number between 1 and 20: ");
    n = input.nextInt();
} while (n < 1 || n > 20);
System.out.println("Thanks, you entered " + n);`,
      },
      {
        kind: "text",
        heading: "Digit extraction",
        markdown: md(
          "`n % 10` gives the **last digit**, `n / 10` **removes** the last digit. Loop while `n > 0`.",
        ),
      },
      {
        kind: "code",
        filename: "Digits.java",
        traceId: "t-while-digits",
        code: java`
public class Digits {
    public static void main(String[] args) {
        int n = 472;
        int sum = 0;
        while (n > 0) {
            int d = n % 10;
            sum += d;
            n /= 10;
        }
        System.out.println("Digit sum = " + sum);
    }
}`,
        output: "Digit sum = 13",
      },
      {
        kind: "trap",
        title: "The do-while semicolon",
        markdown: "`do { ... } while (cond);` **needs** the `;` at the end. A `while (cond)` loop must **not** have one.",
      },
      {
        kind: "trap",
        title: "Infinite loop: no update",
        markdown: "If nothing inside the loop changes the variable in the condition, the loop never ends.",
        code: java`
int i = 0;
while (i < 5) {
    System.out.println(i);   // forgot i++ -> prints 0 forever
}`,
      },
    ],
  },
  {
    id: "l5-patterns",
    moduleId: "m5-loops",
    title: "break, continue & Loop Patterns",
    minutes: 15,
    source: "builtin",
    sections: [
      {
        kind: "keypoints",
        heading: "Jump statements",
        items: [
          "`break` — exit the loop immediately.",
          "`continue` — skip the rest of this iteration and go to the next one (in a `for`, the update still runs).",
        ],
      },
      {
        kind: "code",
        filename: "BreakContinue.java",
        code: java`
for (int i = 1; i <= 10; i++) {
    if (i % 2 == 0) continue;  // skip even numbers
    if (i > 7) break;          // stop completely after 7
    System.out.print(i + " ");
}`,
        output: "1 3 5 7 ",
      },
      {
        kind: "table",
        heading: "Core loop patterns",
        headers: ["Pattern", "Shape"],
        rows: [
          ["Running sum", "`int sum = 0; for (...) sum += x;`"],
          ["Counting", "`int count = 0; for (...) if (cond) count++;`"],
          ["Factorial", "`long f = 1; for (int i = 2; i <= n; i++) f *= i;`"],
          ["Repeat until valid", "`do { read } while (invalid);`"],
          ["Digits", "`while (n > 0) { int d = n % 10; n /= 10; }`"],
          ["Max / min", "`int max = first; if (x > max) max = x;`"],
        ],
      },
      {
        kind: "text",
        heading: "Nested loops",
        markdown: "The inner loop runs **completely** for every single iteration of the outer loop. Outer = rows, inner = columns.",
      },
      {
        kind: "code",
        filename: "Triangle.java",
        traceId: "t-nested",
        code: java`
public class Triangle {
    public static void main(String[] args) {
        for (int row = 1; row <= 3; row++) {
            for (int col = 1; col <= row; col++) {
                System.out.print("*");
            }
            System.out.println();
        }
    }
}`,
        output: "*\n**\n***",
      },
      {
        kind: "trap",
        title: "Factorial overflows `int`",
        markdown: "`13!` is bigger than the `int` limit (2,147,483,647). Use `long` for factorials beyond 12.",
      },
      {
        kind: "trap",
        title: "Resetting inside vs outside the loop",
        markdown:
          "A running total must be initialised **before** the loop. Writing `int sum = 0;` inside the loop resets it every iteration.",
      },
    ],
  },
];
