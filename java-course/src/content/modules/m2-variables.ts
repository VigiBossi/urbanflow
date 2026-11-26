import type { Lesson, Module } from "../../lib/types";
import { java, md } from "../helpers";

export const module2: Module = {
  id: "m2-variables",
  order: 2,
  title: "Lecture 2 & Lab 2 — Variables, Data Types & Operators",
  shortTitle: "Variables & Operators",
  summary: "int, double, char, boolean, String, casting, arithmetic, integer division, % and string concatenation.",
  lessonIds: ["l2-types", "l2-operators"],
  exerciseIds: [],
  traceIds: ["t-concat"],
  source: "builtin",
};

export const module2Lessons: Lesson[] = [
  {
    id: "l2-types",
    moduleId: "m2-variables",
    title: "Data Types, Declaration & Casting",
    minutes: 12,
    source: "builtin",
    sections: [
      {
        kind: "table",
        heading: "The five types you use all the time",
        headers: ["Type", "Holds", "Example"],
        rows: [
          ["`int`", "Whole numbers", "`int age = 19;`"],
          ["`double`", "Decimal numbers", "`double price = 4.99;`"],
          ["`char`", "One character, **single quotes**", "`char grade = 'A';`"],
          ["`boolean`", "`true` or `false`", "`boolean passed = true;`"],
          ["`String`", "Text, **double quotes** (capital S)", "`String name = \"Loren\";`"],
        ],
      },
      {
        kind: "text",
        heading: "Declare, assign, use",
        markdown: md(
          "A **declaration** creates a variable with a type. An **assignment** stores a value with `=`. You can do both at once.",
          "",
          "A variable must be given a value before you read it — otherwise: *variable x might not have been initialized*.",
        ),
      },
      {
        kind: "code",
        filename: "Declare.java",
        code: java`
int x;          // declaration
x = 10;         // assignment
int y = 20;     // declaration + assignment
double avg = (x + y) / 2.0;
char initial = 'L';
boolean isBig = y > 15;
String course = "Intro to Programming";
System.out.println(avg + " " + initial + " " + isBig);`,
        output: "15.0 L true",
      },
      {
        kind: "text",
        heading: "Casting",
        markdown: md(
          "Java converts `int` → `double` automatically (**widening**, no information lost): `double d = 5;` stores `5.0`.",
          "",
          "Going `double` → `int` loses the decimals, so Java forces you to be explicit with a **cast**: `(int) value`. The cast **truncates** (chops off) the decimal part — it does not round.",
        ),
      },
      {
        kind: "code",
        filename: "Casting.java",
        code: java`
int a = (int) 5.7;        // 5   (truncated, not rounded)
int b = (int) -5.7;       // -5
double c = 7;             // 7.0 (automatic widening)
double d = (double) 7 / 2; // 3.5 (cast happens before the division)
double e = (double) (7 / 2); // 3.0 (division already happened in int!)
System.out.println(a + " " + b + " " + c + " " + d + " " + e);`,
        output: "5 -5 7.0 3.5 3.0",
      },
      {
        kind: "trap",
        title: "`int x = 5.5;` does not compile",
        markdown:
          "*incompatible types: possible lossy conversion from double to int*. You must write `int x = (int) 5.5;` — which gives `5`.",
      },
      {
        kind: "trap",
        title: "`char` uses single quotes, `String` uses double quotes",
        markdown:
          "`char c = \"A\";` does not compile (that's a String). `String s = 'Hello';` does not compile either. `'A'` is one character; `\"A\"` is a String of length 1.",
      },
    ],
  },
  {
    id: "l2-operators",
    moduleId: "m2-variables",
    title: "Operators, Integer Division & Concatenation",
    minutes: 15,
    source: "builtin",
    sections: [
      {
        kind: "keypoints",
        heading: "Arithmetic operators & precedence",
        items: [
          "`+` `-` `*` `/` `%` (remainder / modulo).",
          "Precedence: `()` first, then `*` `/` `%` (left to right), then `+` `-` (left to right).",
          "`2 + 3 * 4` is `14`, `(2 + 3) * 4` is `20`, `10 - 4 - 3` is `3`.",
        ],
      },
      {
        kind: "table",
        heading: "Integer division drops the decimals",
        headers: ["Expression", "Result", "Why"],
        rows: [
          ["`7 / 2`", "`3`", "int / int → int, decimal part dropped"],
          ["`7 % 2`", "`1`", "remainder of 7 ÷ 2"],
          ["`7 / 2.0`", "`3.5`", "one side is double → double division"],
          ["`1 / 2`", "`0`", "int division"],
          ["`5 / 9`", "`0`", "the classic temperature-conversion bug"],
          ["`17 % 5`", "`2`", "17 = 3·5 + 2"],
          ["`4 % 7`", "`4`", "smaller number % bigger number = itself"],
        ],
      },
      {
        kind: "code",
        filename: "Square.java",
        caption: "Exact class file from Lab 2 (task 2).",
        code: java`
public class Square {

    //task2: find the per and area of a rectangle with width=5 and height=7
    public static void main(String[] args) {
        int width = 5;
        int height = 7;

        int perimeter = 2*(width+height);
        int area = width*height;

        System.out.println("The perimeter " + perimeter);
        System.out.println("The area " + area);
    }
}`,
        output: "The perimeter 24\nThe area 35",
      },
      {
        kind: "text",
        heading: "String concatenation with +",
        markdown: md(
          "`+` means **addition** between numbers and **concatenation** (gluing) when either side is a String. Java evaluates `+` **left to right**, and once the running result is a String, every following `+` is concatenation.",
        ),
      },
      {
        kind: "code",
        filename: "Concat.java",
        traceId: "t-concat",
        code: java`
System.out.println("Sum: " + 2 + 3);    // "Sum: 2" + 3 -> Sum: 23
System.out.println("Sum: " + (2 + 3));  // parentheses first -> Sum: 5
System.out.println(1 + 2 + "3");        // 3 + "3" -> 33
System.out.println("1" + 2 + 3);        // 123
System.out.println(1 + 2 + "3" + 4 + 5); // 3345`,
        output: "Sum: 23\nSum: 5\n33\n123\n3345",
      },
      {
        kind: "table",
        heading: "Compound shortcuts",
        headers: ["Shortcut", "Same as"],
        rows: [
          ["`x++`", "`x = x + 1`"],
          ["`x--`", "`x = x - 1`"],
          ["`x += 3`", "`x = x + 3`"],
          ["`x -= 2`", "`x = x - 2`"],
          ["`x *= 4`", "`x = x * 4`"],
          ["`x /= 2`", "`x = x / 2` (integer division if `x` is int!)"],
          ["`x %= 3`", "`x = x % 3`"],
        ],
      },
      {
        kind: "trap",
        title: "Integer division hides inside formulas",
        markdown:
          "`double avg = (a + b) / 2;` with `int a, b` still does **int** division first, then widens the result. `(3 + 4) / 2` → `3` → `3.0`. Fix: divide by `2.0`.",
      },
      {
        kind: "trap",
        title: "`\"Sum: \" + 2 + 3` is `Sum: 23`",
        markdown: "Left-to-right: the String swallows the 2, then the 3. Wrap arithmetic in parentheses: `\"Sum: \" + (2 + 3)`.",
      },
    ],
  },
];
