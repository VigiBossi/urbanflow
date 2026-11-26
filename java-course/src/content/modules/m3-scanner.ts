import type { Lesson, Module } from "../../lib/types";
import { java, md } from "../helpers";

export const module3: Module = {
  id: "m3-scanner",
  order: 3,
  title: "Scanner Usage & User Input",
  shortTitle: "Scanner & Input",
  summary: "import java.util.*, creating a Scanner, nextInt / nextDouble / next / nextLine / charAt(0) and the nextLine trap.",
  lessonIds: ["l3-scanner", "l3-nextline"],
  exerciseIds: [],
  traceIds: ["t-compare"],
  source: "builtin",
};

export const module3Lessons: Lesson[] = [
  {
    id: "l3-scanner",
    moduleId: "m3-scanner",
    title: "Reading Input with Scanner",
    minutes: 12,
    source: "builtin",
    sections: [
      {
        kind: "keypoints",
        heading: "Three steps",
        items: [
          "Import it at the very top of the file: `import java.util.*;` (or `import java.util.Scanner;`).",
          "Create one scanner connected to the keyboard: `Scanner input = new Scanner(System.in);`",
          "Call a method to read the next value: `int a = input.nextInt();`",
        ],
      },
      {
        kind: "table",
        heading: "Scanner methods",
        headers: ["Method", "Reads", "Example input → value"],
        rows: [
          ["`nextInt()`", "an `int`", "`42` → `42`"],
          ["`nextDouble()`", "a `double`", "`3.5` → `3.5`"],
          ["`next()`", "one word (stops at a space)", "`Loren Nebiaj` → `\"Loren\"`"],
          ["`nextLine()`", "the rest of the line (spaces included)", "`Loren Nebiaj` → `\"Loren Nebiaj\"`"],
          ["`next().charAt(0)`", "a single `char`", "`C` → `'C'`"],
          ["`nextBoolean()`", "a `boolean`", "`true` → `true`"],
        ],
      },
      {
        kind: "code",
        filename: "Compare.java",
        caption: "Exact class file from class. Step through it in the tracer with input 4 and 9.",
        traceId: "t-compare",
        code: java`
import java.util.*;

public class Compare {

    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        System.out.println("Enter first number ");
        int a=input.nextInt();
        System.out.println("Enter second number ");
        int b=input.nextInt();

        if(a==b) {
            System.out.println("The numbers are the same");
            System.out.println("true");
        }else {
            System.out.println("The numbers are different");
            System.out.println("false");
        }
    }
}`,
        output: "Enter first number \n4\nEnter second number \n9\nThe numbers are different\nfalse",
      },
      {
        kind: "trap",
        title: "Forgetting the import",
        markdown: "Without `import java.util.*;` you get *cannot find symbol: class Scanner*. The import goes **above** `public class`.",
      },
      {
        kind: "trap",
        title: "Typing the wrong kind of value",
        markdown:
          "If `nextInt()` receives `abc` or `3.5`, the program crashes with `InputMismatchException`. `nextDouble()` happily accepts `5` though (it becomes `5.0`).",
      },
    ],
  },
  {
    id: "l3-nextline",
    moduleId: "m3-scanner",
    title: "The nextLine() Trap & Reading chars",
    minutes: 8,
    source: "builtin",
    sections: [
      {
        kind: "text",
        heading: "Why nextLine() returns an empty String",
        markdown: md(
          "When you type `20` and press **Enter**, the input buffer contains `20\\n`.",
          "`nextInt()` reads `20` but **leaves the `\\n` behind**. A `nextLine()` right after it reads up to that newline — which is immediately — and returns `\"\"`.",
        ),
      },
      {
        kind: "code",
        filename: "Buggy.java",
        code: java`
Scanner input = new Scanner(System.in);
System.out.print("Age: ");
int age = input.nextInt();
System.out.print("Full name: ");
String name = input.nextLine();   // BUG: reads the leftover "\n" -> ""
System.out.println(name + " is " + age);`,
      },
      {
        kind: "code",
        filename: "Fixed.java",
        code: java`
Scanner input = new Scanner(System.in);
System.out.print("Age: ");
int age = input.nextInt();
input.nextLine();                  // clear the leftover newline
System.out.print("Full name: ");
String name = input.nextLine();   // now reads the real line
System.out.println(name + " is " + age);`,
      },
      {
        kind: "trap",
        title: "The fix: one extra `input.nextLine();`",
        markdown:
          "Whenever you call `nextLine()` after `nextInt()`, `nextDouble()` or `next()`, call `input.nextLine();` once first to throw away the leftover newline.",
      },
      {
        kind: "text",
        heading: "Reading a single character",
        markdown: md(
          "Scanner has no `nextChar()`. Read a word and take its first character: `char choice = input.next().charAt(0);`",
          "",
          "Characters are compared with `==` and single quotes: `if (choice == 'C')`. Remember Java is case-sensitive, so `'c'` ≠ `'C'`. To accept both, check `choice == 'C' || choice == 'c'`.",
        ),
      },
      {
        kind: "code",
        filename: "CharChoice.java",
        code: java`
import java.util.*;

public class CharChoice {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        System.out.print("Enter Y or N: ");
        char answer = input.next().charAt(0);
        if (answer == 'Y' || answer == 'y') {
            System.out.println("Yes!");
        } else {
            System.out.println("No.");
        }
    }
}`,
      },
    ],
  },
];
