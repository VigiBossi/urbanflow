import type { Lesson, Module } from "../../lib/types";
import { java, md } from "../helpers";

export const module1: Module = {
  id: "m1-structure",
  order: 1,
  title: "Lecture 1 & Lab 1 — Java Program Structure",
  shortTitle: "Program Structure",
  summary: "Classes, the main method, println vs print, statements, blocks, comments and case sensitivity.",
  lessonIds: ["l1-anatomy", "l1-printing"],
  exerciseIds: [],
  traceIds: [],
  source: "builtin",
};

export const module1Lessons: Lesson[] = [
  {
    id: "l1-anatomy",
    moduleId: "m1-structure",
    title: "Anatomy of a Java Program",
    minutes: 10,
    source: "builtin",
    sections: [
      {
        kind: "text",
        markdown: md(
          "Every Java program you write in this course has the same skeleton. Learn it once and every later topic just fills in the body of `main`.",
        ),
      },
      {
        kind: "keypoints",
        heading: "Core rules",
        items: [
          "Every Java program lives inside a `public class` whose name **must match the `.java` filename** (`FirstProgram` → `FirstProgram.java`).",
          "Execution starts at `public static void main(String[] args)` — always, no matter where it is in the class.",
          "Statements end with `;`. Blocks of code are grouped with `{ }`.",
          "Java is **case-sensitive**: `Main` ≠ `main`, `system` ≠ `System`, `String` ≠ `string`.",
        ],
      },
      {
        kind: "code",
        filename: "FirstProgram.java",
        caption: "Exact class file from Lecture 1.",
        code: java`
/*program i pare ne java
 * Author: Loren Nebiaj
 * Date: 09/10/2026
 */

public class FirstProgram {     //klasa
    public static void main(String[] args) { //metoda main
        System.out.println("Hello to Western Balkan University");
        System.out.println("Computer Science and AI");
    }
}`,
        output: "Hello to Western Balkan University\nComputer Science and AI",
      },
      {
        kind: "table",
        heading: "Reading the program piece by piece",
        headers: ["Part", "Meaning"],
        rows: [
          ["`/* ... */`", "Multi-line comment — ignored by the compiler (author, date)."],
          ["`public class FirstProgram`", "Declares the class. Must match the file name `FirstProgram.java`."],
          ["`{ ... }` after the class", "The class body. Everything belongs inside it."],
          ["`public static void main(String[] args)`", "The entry point. The JVM looks for exactly this signature."],
          ["`System.out.println(\"...\");`", "Prints the text, then moves to a new line."],
          ["`//klasa`, `//metoda main`", "Single-line comments — everything after `//` on that line is ignored."],
        ],
      },
      {
        kind: "trap",
        title: "File name ≠ class name",
        markdown:
          "If the file is `firstprogram.java` but the class is `public class FirstProgram`, it will **not compile**: *class FirstProgram is public, should be declared in a file named FirstProgram.java*. Capitalization counts too.",
      },
      {
        kind: "trap",
        title: "A misspelled `main` compiles but won't run",
        markdown:
          "`public static void Main(String[] args)` is a perfectly legal method — it's just not *the* main method. The program compiles, then fails at run time because the JVM can't find `main`.",
        code: java`
public static void Main(String[] args) { // capital M -> not the entry point
    System.out.println("Never runs");
}`,
      },
    ],
  },
  {
    id: "l1-printing",
    moduleId: "m1-structure",
    title: "Printing Output & Comments",
    minutes: 8,
    source: "builtin",
    sections: [
      {
        kind: "text",
        heading: "println vs print",
        markdown: md(
          "`System.out.println(...)` prints its text and then **moves the cursor to a new line**.",
          "`System.out.print(...)` prints its text and **stays on the same line** — the next output continues right after it.",
        ),
      },
      {
        kind: "code",
        filename: "PrintDemo.java",
        code: java`
public class PrintDemo {
    public static void main(String[] args) {
        System.out.print("Java ");
        System.out.print("is ");
        System.out.println("fun");
        System.out.println("New line here");
        System.out.println();          // prints just an empty line
        System.out.print("A");
        System.out.println("B");
    }
}`,
        output: "Java is fun\nNew line here\n\nAB",
      },
      {
        kind: "keypoints",
        heading: "Comments",
        items: [
          "`// text` — single-line comment: from `//` to the end of the line.",
          "`/* text */` — multi-line comment: can span many lines.",
          "Comments are for humans; the compiler ignores them completely.",
        ],
      },
      {
        kind: "text",
        heading: "Escape sequences",
        markdown: md(
          "Inside a String, a backslash starts an escape sequence:",
          "- `\\n` — new line",
          "- `\\t` — tab",
          "- `\\\"` — a double quote inside the text",
          "- `\\\\` — a single backslash",
        ),
      },
      {
        kind: "code",
        filename: "Escapes.java",
        code: java`
public class Escapes {
    public static void main(String[] args) {
        System.out.println("Line 1\nLine 2");
        System.out.println("She said \"hi\"");
    }
}`,
        output: 'Line 1\nLine 2\nShe said "hi"',
      },
      {
        kind: "trap",
        title: "Case sensitivity everywhere",
        markdown:
          "`system.out.println(\"Hi\");` does not compile — the class is `System` with a capital **S**. Same for `string` vs `String`, and `Println` vs `println`.",
      },
      {
        kind: "trap",
        title: "Missing semicolon",
        markdown:
          "Every statement needs `;`. The compiler error usually points at the line *after* the missing semicolon, so look one line up.",
      },
    ],
  },
];
