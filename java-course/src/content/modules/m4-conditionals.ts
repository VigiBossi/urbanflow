import type { Lesson, Module } from "../../lib/types";
import { java, md } from "../helpers";

export const module4: Module = {
  id: "m4-conditionals",
  order: 4,
  title: "Conditionals & Lab 4 — Conditional Statements",
  shortTitle: "Conditionals",
  summary: "if / else if / else, switch, relational & logical operators, ranges, and the classic = vs == traps.",
  lessonIds: ["l4-if", "l4-logic", "l4-switch"],
  exerciseIds: ["lab4-1", "lab4-2", "lab4-3", "lab4-4", "lab4-5", "lab4-6", "lab4-7"],
  traceIds: ["t-mistery", "t-dangling"],
  source: "builtin",
};

export const module4Lessons: Lesson[] = [
  {
    id: "l4-if",
    moduleId: "m4-conditionals",
    title: "Making Decisions: if, else if, else",
    minutes: 15,
    source: "builtin",
    sections: [
      {
        kind: "keypoints",
        heading: "The three shapes",
        items: [
          "`if (cond) { ... }` — runs the block only when `cond` is `true`.",
          "`if (cond) { ... } else { ... }` — exactly one of the two blocks runs.",
          "`if / else if / ... / else` — conditions are checked top to bottom; **only the first true branch runs**, the rest are skipped.",
        ],
      },
      {
        kind: "code",
        filename: "Grade.java",
        code: java`
int score = 85;
if (score >= 90) {
    System.out.println("A");
} else if (score >= 80) {
    System.out.println("B");     // first true branch -> runs
} else if (score >= 70) {
    System.out.println("C");     // also true, but skipped!
} else {
    System.out.println("F");
}`,
        output: "B",
      },
      {
        kind: "text",
        heading: "Without braces, only ONE statement belongs to the if",
        markdown: md(
          "Braces are optional when a branch has a single statement — that's exactly how `Mistery.java` is written. But it means the `if` controls **only the very next statement**. Indentation means nothing to Java.",
        ),
      },
      {
        kind: "code",
        filename: "Mistery.java",
        caption: "Exact class file from class. Open it in the tracer and step through it line by line.",
        traceId: "t-mistery",
        code: java`
public class Mistery {

    public static void main(String[] args) {
        //task: find the program output
        int x=5;
        int y=6;
        int z=7;

        if(x>3)
            x=x+1;
        else
            if(z>y)
                z=z+y;
            else
                z=z-y;

        if(y>0)
            y=y+2;
        else
            y=y-2;

        System.out.println(x+ " " + y + " " + z);
    }
}`,
        output: "6 8 7",
      },
      {
        kind: "text",
        heading: "How to solve Mistery on paper",
        markdown: md(
          "1. Write down the starting values: `x=5, y=6, z=7`.",
          "2. First `if`: `x>3` → `5>3` is **true** → `x=x+1` → `x=6`. The whole `else` part (including the nested `if(z>y)`) is **skipped**, so `z` stays `7`.",
          "3. Second `if`: `y>0` → `6>0` is **true** → `y=y+2` → `y=8`.",
          "4. Print `x + \" \" + y + \" \" + z` → **`6 8 7`**.",
        ),
      },
      {
        kind: "trap",
        title: "Stray semicolon after `if (...)`",
        markdown:
          "`if (x > 10);` ends the if with an **empty statement**. The block after it always runs, no matter what `x` is.",
        code: java`
int x = 3;
if (x > 10);                     // <- this ; is the whole if-body
{
    System.out.println("Big!");  // always prints
}`,
      },
      {
        kind: "trap",
        title: "Forgetting braces",
        markdown:
          "Only the first statement is controlled by the `if`. The second `println` below always runs, even though it *looks* like it's inside.",
        code: java`
int age = 15;
if (age >= 18)
    System.out.println("Adult");
    System.out.println("Can vote");  // NOT inside the if -> always prints`,
      },
      {
        kind: "trap",
        title: "`=` assigns, `==` compares",
        markdown:
          "`if (x = 5)` does not compile for an `int` (*incompatible types: int cannot be converted to boolean*). Use `if (x == 5)`.",
      },
    ],
  },
  {
    id: "l4-logic",
    moduleId: "m4-conditionals",
    title: "Relational & Logical Operators, Ranges, Strings",
    minutes: 12,
    source: "builtin",
    sections: [
      {
        kind: "table",
        heading: "Relational operators (give a boolean)",
        headers: ["Operator", "Meaning", "Example (x = 5)"],
        rows: [
          ["`==`", "equal to", "`x == 5` → `true`"],
          ["`!=`", "not equal to", "`x != 5` → `false`"],
          ["`<` / `>`", "less / greater than", "`x > 3` → `true`"],
          ["`<=` / `>=`", "less / greater or equal", "`x <= 4` → `false`"],
        ],
      },
      {
        kind: "table",
        heading: "Logical operators",
        headers: ["Operator", "True when", "Example"],
        rows: [
          ["`&&` (and)", "both sides are true", "`x > 0 && x < 10`"],
          ["`||` (or)", "at least one side is true", "`c == 'y' || c == 'Y'`"],
          ["`!` (not)", "the value is false", "`!(x > 0)`"],
        ],
      },
      {
        kind: "text",
        heading: "Ranges need two conditions",
        markdown: md(
          "Math writes `0 < t ≤ 2`. Java needs **two comparisons joined with `&&`**: `t > 0 && t <= 2`.",
          "",
          "`0 < t <= 2` does not compile: `0 < t` is a boolean, and you can't compare a boolean with `<= 2`.",
        ),
      },
      {
        kind: "code",
        filename: "Range.java",
        code: java`
double t = 3.5;
if (t > 0 && t <= 2) {
    System.out.println("100 leke");
} else if (t > 2 && t <= 4) {
    System.out.println("200 leke");   // runs
}`,
        output: "200 leke",
      },
      {
        kind: "text",
        heading: "Comparing Strings: use .equals()",
        markdown: md(
          "`==` on Strings checks whether two variables point to **the same object in memory**, not whether the text is the same. Strings read from `Scanner` are new objects, so `==` usually gives `false` even when the text matches.",
          "",
          "Use `s.equals(\"yes\")` for exact text, or `s.equalsIgnoreCase(\"yes\")` to ignore capitals.",
        ),
      },
      {
        kind: "code",
        filename: "Password.java",
        code: java`
Scanner input = new Scanner(System.in);
String pass = input.next();          // user types: java
if (pass.equals("java")) {           // correct
    System.out.println("Welcome");
}
if (pass == "java") {                // WRONG: compares references
    System.out.println("Never prints for typed input");
}`,
      },
      {
        kind: "trap",
        title: "Strings: `.equals()`, not `==`",
        markdown:
          "This is on almost every quiz. `==` is for primitives (`int`, `double`, `char`, `boolean`). For `String` use `.equals()`.",
      },
      {
        kind: "trap",
        title: "`&&` short-circuits",
        markdown:
          "In `a && b`, if `a` is `false` Java doesn't even evaluate `b`. In `a || b`, if `a` is `true`, `b` is skipped. This is why `x != 0 && 10 / x > 1` never divides by zero.",
      },
    ],
  },
  {
    id: "l4-switch",
    moduleId: "m4-conditionals",
    title: "switch Statements",
    minutes: 10,
    source: "builtin",
    sections: [
      {
        kind: "text",
        markdown: md(
          "`switch` compares one value against several constant `case`s. It works with `int`, `char` and `String` (among others) — **not** with `double` or `boolean`.",
        ),
      },
      {
        kind: "code",
        filename: "Day.java",
        code: java`
int day = 3;
switch (day) {
    case 1:
        System.out.println("Monday");
        break;
    case 2:
        System.out.println("Tuesday");
        break;
    case 3:
        System.out.println("Wednesday");
        break;
    default:
        System.out.println("Other day");
}`,
        output: "Wednesday",
      },
      {
        kind: "trap",
        title: "Fall-through when you forget `break`",
        markdown:
          "Without `break`, execution **falls through** into the next case(s) until it hits a `break` or the end of the switch.",
        code: java`
int n = 2;
switch (n) {
    case 1: System.out.println("one");
    case 2: System.out.println("two");     // match: starts here
    case 3: System.out.println("three");   // falls through
            break;
    default: System.out.println("other");
}
// prints: two
//         three`,
      },
      {
        kind: "keypoints",
        heading: "Remember",
        items: [
          "`default` runs when no case matches (like the final `else`). It's optional.",
          "Several cases can share code: `case 'a': case 'A': ...`",
          "Case values must be constants and unique.",
        ],
      },
    ],
  },
];
