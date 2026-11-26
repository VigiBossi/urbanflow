import type { Lesson, Module } from "../../lib/types";
import { java, md } from "../helpers";

export const module6: Module = {
  id: "m6-methods",
  order: 6,
  title: "Methods",
  shortTitle: "Methods",
  summary: "Method structure, void vs return, parameters, pass-by-value, scope, overloading and helper methods.",
  lessonIds: ["l6-basics", "l6-return"],
  exerciseIds: ["meth-1", "meth-2", "meth-3", "meth-4"],
  traceIds: ["t-methods"],
  source: "builtin",
};

export const module6Lessons: Lesson[] = [
  {
    id: "l6-basics",
    moduleId: "m6-methods",
    title: "Defining & Calling Methods",
    minutes: 14,
    source: "builtin",
    sections: [
      {
        kind: "text",
        markdown: md(
          "A method is a named block of code you can call again and again.",
          "",
          "`public static <returnType> <name>(<parameters>) { ... }`",
        ),
      },
      {
        kind: "table",
        headers: ["Part", "Example", "Meaning"],
        rows: [
          ["return type", "`int`, `boolean`, `void`", "What the method gives back (`void` = nothing)."],
          ["name", "`add`, `isEven`", "camelCase, starts lowercase by convention."],
          ["parameters", "`(int a, int b)`", "Inputs, each with a type. Can be empty: `()`."],
          ["body", "`{ return a + b; }`", "The code that runs when called."],
        ],
      },
      {
        kind: "code",
        filename: "Helpers.java",
        traceId: "t-methods",
        caption: "Helper methods live inside the class but outside main.",
        code: java`
public class Helpers {

    public static int add(int a, int b) {
        return a + b;
    }

    public static boolean isEven(int n) {
        return n % 2 == 0;
    }

    public static void greet(String name) {
        System.out.println("Hello, " + name + "!");
    }

    public static void main(String[] args) {
        int s = add(3, 4);
        System.out.println("Sum: " + s);
        System.out.println(isEven(s));
        greet("Loren");
    }
}`,
        output: "Sum: 7\nfalse\nHello, Loren!",
      },
      {
        kind: "keypoints",
        heading: "Calling",
        items: [
          "Arguments are matched to parameters **by position**: `add(3, 4)` → `a = 3`, `b = 4`.",
          "Number and types of arguments must match the parameter list.",
          "A value-returning call can be used anywhere a value fits: `int s = add(1, 2);`, `if (isEven(n))`, `println(add(1, 2))`.",
          "A `void` call is a statement on its own: `greet(\"Ana\");`",
        ],
      },
      {
        kind: "trap",
        title: "Methods can't be defined inside main",
        markdown: "Put every method directly inside the class `{ }`, next to `main`, never inside another method.",
      },
      {
        kind: "trap",
        title: "Using the result of a `void` method",
        markdown: "`int x = greet(\"Ana\");` or `System.out.println(greet(\"Ana\"));` does not compile — a `void` method returns nothing.",
      },
    ],
  },
  {
    id: "l6-return",
    moduleId: "m6-methods",
    title: "Return Values, Scope, Pass-by-Value & Overloading",
    minutes: 15,
    source: "builtin",
    sections: [
      {
        kind: "text",
        heading: "return vs print",
        markdown: md(
          "`return` sends a value **back to the caller** and **ends the method immediately** — nothing after it in that path runs.",
          "`System.out.println` just shows text on screen; the caller gets nothing back.",
        ),
      },
      {
        kind: "code",
        filename: "ReturnVsPrint.java",
        code: java`
public static int square(int x) {
    return x * x;
    // System.out.println("unreachable");  <- would not compile
}

public static void printSquare(int x) {
    System.out.println(x * x);
}

// in main:
int a = square(5) + 1;   // 26 -> the value can be reused
printSquare(5);          // prints 25, but you can't store it`,
      },
      {
        kind: "text",
        heading: "Pass-by-value",
        markdown:
          "For primitives, Java passes a **copy** of the value. Changing the parameter inside the method does **not** change the caller's variable.",
      },
      {
        kind: "code",
        filename: "PassByValue.java",
        code: java`
public class PassByValue {
    public static void addTen(int n) {
        n = n + 10;                 // changes the local copy only
        System.out.println("inside: " + n);
    }

    public static void main(String[] args) {
        int x = 5;
        addTen(x);
        System.out.println("outside: " + x);
    }
}`,
        output: "inside: 15\noutside: 5",
      },
      {
        kind: "keypoints",
        heading: "Scope",
        items: [
          "A variable declared inside a method (or a block / loop) exists **only there**.",
          "Parameters are local variables of their method.",
          "Two different methods can each have their own variable called `x` — they're unrelated.",
        ],
      },
      {
        kind: "text",
        heading: "Overloading",
        markdown:
          "Several methods may share a name if their **parameter lists differ** (number, types or order). The return type alone is **not** enough.",
      },
      {
        kind: "code",
        filename: "Overload.java",
        code: java`
public class Overload {
    public static int max(int a, int b) { return a > b ? a : b; }
    public static double max(double a, double b) { return a > b ? a : b; }
    public static int max(int a, int b, int c) { return max(max(a, b), c); }

    public static void main(String[] args) {
        System.out.println(max(3, 9));
        System.out.println(max(2.5, 1.5));
        System.out.println(max(4, 8, 6));
    }
}`,
        output: "9\n2.5\n8",
      },
      {
        kind: "trap",
        title: "Missing return path",
        markdown: "Every path through a non-void method must `return` a value, or you get *missing return statement*.",
        code: java`
public static String sign(int n) {
    if (n > 0) return "positive";
    else if (n < 0) return "negative";
    // missing: what if n == 0? -> compile error
}`,
      },
      {
        kind: "trap",
        title: "Returning ≠ printing",
        markdown: "Calling `square(5);` on its own line computes 25 and throws it away — nothing is printed.",
      },
    ],
  },
];
