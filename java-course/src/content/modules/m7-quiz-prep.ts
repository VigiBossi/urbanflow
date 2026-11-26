import type { Lesson, Module } from "../../lib/types";
import { java, md } from "../helpers";

export const module7: Module = {
  id: "m7-quiz-prep",
  order: 7,
  title: "Lab 6 Recap & Quiz Prep",
  shortTitle: "Lab 6 & Quiz Prep",
  summary: "Combined Scanner + conditionals + loops + methods exercises, and a full exam-format practice quiz.",
  lessonIds: ["l7-recap", "l7-exam"],
  exerciseIds: ["lab6-1", "lab6-2", "lab6-3", "lab6-4", "lab6-5"],
  traceIds: [],
  source: "builtin",
};

export const module7Lessons: Lesson[] = [
  {
    id: "l7-recap",
    moduleId: "m7-quiz-prep",
    title: "Lab 6 Recap: Putting It All Together",
    minutes: 12,
    source: "builtin",
    sections: [
      {
        kind: "text",
        markdown: md(
          "Lab 6 problems combine everything: **read** input with Scanner, **decide** with if/switch, **repeat** with loops, and **organise** with methods. A reliable plan for any problem:",
          "",
          "1. Write the skeleton: `import java.util.*;`, the class, `main`, the Scanner.",
          "2. Read the inputs into well-named variables.",
          "3. Put the core logic in a helper method that **returns** a value (easy to test).",
          "4. In `main`, call the method and print the result in the exact format asked.",
          "5. Trace one sample input by hand before you submit.",
        ),
      },
      {
        kind: "code",
        filename: "PrimeCheck.java",
        caption: "A typical combined program: Scanner + loop + method + if.",
        code: java`
import java.util.*;

public class PrimeCheck {

    public static boolean isPrime(int n) {
        if (n < 2) return false;
        for (int i = 2; i * i <= n; i++) {
            if (n % i == 0) return false;   // found a divisor -> stop
        }
        return true;
    }

    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        System.out.print("Enter a number: ");
        int n = input.nextInt();
        if (isPrime(n)) {
            System.out.println(n + " is prime");
        } else {
            System.out.println(n + " is not prime");
        }
    }
}`,
      },
      {
        kind: "trap",
        title: "Printing inside the helper instead of returning",
        markdown:
          "If the exercise says *write a method that returns...*, the method must `return` the value — print it in `main`.",
      },
    ],
  },
  {
    id: "l7-exam",
    moduleId: "m7-quiz-prep",
    title: "Exam Cheat Sheet: the 15 Most-Tested Facts",
    minutes: 10,
    source: "builtin",
    sections: [
      {
        kind: "text",
        markdown:
          "The class quiz format is **10 True/False + 10 Multiple-Choice + 1–3 short coding exercises**. These facts cover most of the T/F and MC questions:",
      },
      {
        kind: "keypoints",
        items: [
          "Class name = file name. Execution starts in `main`.",
          "Java is case-sensitive: `System`, `String`, `main`.",
          "`println` adds a new line, `print` does not.",
          "`int / int` → int (decimals dropped): `7 / 2` = `3`, `5 / 9` = `0`.",
          "`%` gives the remainder: `7 % 2` = `1`, `n % 10` = last digit.",
          "`(int) 5.7` = `5` (truncates). `int x = 5.5;` does not compile.",
          "`\"Sum: \" + 2 + 3` = `Sum: 23`; `1 + 2 + \"3\"` = `33`.",
          "`char` uses `'A'`, `String` uses `\"A\"`.",
          "`nextLine()` after `nextInt()` reads an empty line — clear it first.",
          "Only the first true branch of `if / else if` runs.",
          "Without braces, `if` controls only the next statement.",
          "Strings are compared with `.equals()`, not `==`.",
          "`do-while` always runs at least once; `while` may run zero times.",
          "`switch` without `break` falls through.",
          "`void` methods return nothing; `return` ends a method immediately.",
        ],
      },
      {
        kind: "code",
        filename: "QuickCheck.java",
        caption: "Predict the output before scrolling to it.",
        code: java`
int a = 7, b = 2;
double c = a / b;
System.out.println(c);
System.out.println(a % b + "" + a / b);
System.out.println("R" + a + b);`,
        output: "3.0\n13\nR72",
      },
    ],
  },
];
