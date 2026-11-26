import type { TraceProgram } from "../../lib/types";
import { java } from "../helpers";
import { buildTrace, type StepSpec } from "./builder";

// ------------------------------------------------------------------ Mistery.java
const misteryCode = java`
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
}`;

const mistery = buildTrace(
  {
    id: "t-mistery",
    moduleId: "m4-conditionals",
    title: "Mistery.java — nested if / else",
    filename: "Mistery.java",
    description: "The exact class exercise. Which branches run, and what is printed?",
    code: misteryCode,
  },
  [
    { at: "public static void main", note: "Execution starts at main." },
    { at: "int x=5;", set: { x: 5 }, note: "Declare x and store 5." },
    { at: "int y=6;", set: { y: 6 } },
    { at: "int z=7;", set: { z: 7 } },
    {
      at: "if(x>3)",
      note: "x>3 → 5>3 is TRUE. Run the next statement (x=x+1) and skip the ENTIRE else — including the nested if(z>y).",
    },
    { at: "x=x+1;", set: { x: 6 }, note: "x = 5 + 1 = 6." },
    {
      at: "if(y>0)",
      note: "The nested if/else in the else-branch was skipped, so z is still 7. Now y>0 → 6>0 is TRUE.",
    },
    { at: "y=y+2;", set: { y: 8 }, note: "y = 6 + 2 = 8. The else (y=y-2) is skipped." },
    {
      at: "System.out.println",
      print: "6 8 7\n",
      note: 'x + " " + y + " " + z → "6 8 7".',
    },
  ],
);

// ------------------------------------------------------------------ Braces trap
const bracesCode = java`
public class Braces {
    public static void main(String[] args) {
        int age = 15;
        if (age >= 18)
            System.out.println("Adult");
            System.out.println("Can vote");
        System.out.println("Done");
    }
}`;

const braces = buildTrace(
  {
    id: "t-dangling",
    moduleId: "m4-conditionals",
    title: "Missing braces — indentation lies",
    filename: "Braces.java",
    description: "Without { }, an if controls only ONE statement. Predict before you step.",
    code: bracesCode,
  },
  [
    { at: "int age = 15;", set: { age: 15 } },
    { at: "if (age >= 18)", note: "15 >= 18 is FALSE → skip the ONE statement that belongs to the if." },
    {
      at: '"Can vote"',
      print: "Can vote\n",
      note: "This line is NOT inside the if (no braces!). It always runs, despite the indentation.",
    },
    { at: '"Done"', print: "Done\n" },
  ],
);

// ------------------------------------------------------------------ Concatenation
const concatCode = java`
public class Concat {
    public static void main(String[] args) {
        System.out.println("Sum: " + 2 + 3);
        System.out.println("Sum: " + (2 + 3));
        System.out.println(1 + 2 + "3");
    }
}`;

const concat = buildTrace(
  {
    id: "t-concat",
    moduleId: "m2-variables",
    title: "String concatenation, left to right",
    filename: "Concat.java",
    description: "Watch how + switches from addition to concatenation once a String appears.",
    code: concatCode,
  },
  [
    { at: '"Sum: " + 2 + 3', set: { expression: '"Sum: " + 2' , value: '"Sum: 2"' }, note: "String + int → String. The 2 is glued on." },
    { at: '"Sum: " + 2 + 3', set: { expression: '"Sum: 2" + 3', value: '"Sum: 23"' }, print: "Sum: 23\n", note: "Still String + int → glue the 3. Result: Sum: 23" },
    { at: "(2 + 3)", set: { expression: "(2 + 3)", value: "5" }, note: "Parentheses first: int + int = 5." },
    { at: "(2 + 3)", set: { expression: '"Sum: " + 5', value: '"Sum: 5"' }, print: "Sum: 5\n" },
    { at: '1 + 2 + "3"', set: { expression: "1 + 2", value: "3" }, note: "Left to right: both are ints → addition." },
    { at: '1 + 2 + "3"', set: { expression: '3 + "3"', value: '"33"' }, print: "33\n", note: "int + String → concatenation." },
  ],
);

// ------------------------------------------------------------------ Compare.java
const compareCode = java`
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
}`;

const compare = buildTrace(
  {
    id: "t-compare",
    moduleId: "m3-scanner",
    title: "Compare.java with input 4 and 9",
    filename: "Compare.java",
    description: "Simulated keyboard input: 4, then 9. The typed input is shown in the console.",
    code: compareCode,
    expectedOutput: "Enter first number \nEnter second number \nThe numbers are different\nfalse",
  },
  [
    { at: "Scanner input", set: { input: "Scanner(System.in)" }, note: "Create a Scanner connected to the keyboard." },
    { at: '"Enter first number "', print: "Enter first number \n" },
    { at: "int a=input.nextInt();", set: { a: 4 }, print: "4  ← typed\n", note: "nextInt() waits for the user; they type 4." },
    { at: '"Enter second number "', print: "Enter second number \n" },
    { at: "int b=input.nextInt();", set: { b: 9 }, print: "9  ← typed\n" },
    { at: "if(a==b)", note: "4 == 9 is FALSE → jump to the else block." },
    { at: '"The numbers are different"', print: "The numbers are different\n" },
    { at: '"false"', print: "false\n" },
  ],
);

// ------------------------------------------------------------------ for: running sum
const sumCode = java`
public class Sum {
    public static void main(String[] args) {
        int sum = 0;
        for (int i = 1; i <= 5; i++) {
            sum = sum + i;
        }
        System.out.println("Sum = " + sum);
    }
}`;

const sumSteps: StepSpec[] = [{ at: "int sum = 0;", set: { sum: 0 } }];
{
  let sum = 0;
  for (let i = 1; i <= 6; i++) {
    if (i === 1) sumSteps.push({ at: "for (", set: { i: 1 }, note: "init: i = 1. Check 1 <= 5 → true, enter the body." });
    else
      sumSteps.push({
        at: "for (",
        set: { i },
        note: i <= 5 ? `update: i++ → ${i}. Check ${i} <= 5 → true.` : `update: i++ → 6. Check 6 <= 5 → FALSE, loop ends.`,
      });
    if (i > 5) break;
    const before = sum;
    sum += i;
    sumSteps.push({ at: "sum = sum + i;", set: { sum }, note: `sum = ${before} + ${i} = ${sum}` });
  }
  sumSteps.push({ at: "System.out.println", unset: ["i"], print: `Sum = ${sum}\n`, note: "i is gone: it only existed inside the for." });
}

const forSum = buildTrace(
  {
    id: "t-for-sum",
    moduleId: "m5-loops",
    title: "for loop — running sum 1..5",
    filename: "Sum.java",
    description: "init → check → body → update → check … Watch i and sum change each iteration.",
    code: sumCode,
  },
  sumSteps,
);

// ------------------------------------------------------------------ for: off by one
const obCode = java`
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
}`;

const obSteps: StepSpec[] = [{ at: "int count = 0;", set: { count: 0 } }];
for (let i = 0; i <= 4; i++) {
  obSteps.push({
    at: "for (",
    set: { i },
    note: i === 0 ? "init: i = 0. 0 <= 3 → true." : i <= 3 ? `i++ → ${i}. ${i} <= 3 → true.` : "i++ → 4. 4 <= 3 → FALSE, exit.",
  });
  if (i > 3) break;
  obSteps.push({ at: 'System.out.print(i + " ");', print: `${i} `, note: "print (not println) — stays on the same line." });
  obSteps.push({ at: "count++;", set: { count: i + 1 } });
}
obSteps.push({ at: "System.out.println();", unset: ["i"], print: "\n", note: "End the line." });
obSteps.push({ at: '"count = "', print: "count = 4\n", note: "<= 3 starting from 0 runs 4 times, not 3!" });

const offByOne = buildTrace(
  {
    id: "t-for-offbyone",
    moduleId: "m5-loops",
    title: "for loop — off-by-one with <=",
    filename: "OffByOne.java",
    description: "How many times does `i <= 3` run when i starts at 0?",
    code: obCode,
  },
  obSteps,
);

// ------------------------------------------------------------------ while: digits
const digitsCode = java`
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
}`;

const dSteps: StepSpec[] = [
  { at: "int n = 472;", set: { n: 472 } },
  { at: "int sum = 0;", set: { sum: 0 } },
];
{
  let n = 472;
  let sum = 0;
  let first = true;
  while (true) {
    dSteps.push({
      at: "while (n > 0)",
      unset: first ? undefined : ["d"],
      note: n > 0 ? `${n} > 0 → true, run the body.` : "0 > 0 → FALSE, exit the loop.",
    });
    first = false;
    if (n <= 0) break;
    const d = n % 10;
    dSteps.push({ at: "int d = n % 10;", set: { d }, note: `${n} % 10 = ${d} (last digit)` });
    sum += d;
    dSteps.push({ at: "sum += d;", set: { sum } });
    const before = n;
    n = Math.floor(n / 10);
    dSteps.push({ at: "n /= 10;", set: { n }, note: `${before} / 10 = ${n} (integer division drops the last digit)` });
  }
  dSteps.push({ at: "System.out.println", print: `Digit sum = ${sum}\n` });
}

const whileDigits = buildTrace(
  {
    id: "t-while-digits",
    moduleId: "m5-loops",
    title: "while loop — digit extraction",
    filename: "Digits.java",
    description: "n % 10 takes the last digit, n /= 10 removes it.",
    code: digitsCode,
  },
  dSteps,
);

// ------------------------------------------------------------------ do-while
const dwCode = java`
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
}`;

const doWhile = buildTrace(
  {
    id: "t-dowhile",
    moduleId: "m5-loops",
    title: "while vs do-while",
    filename: "DoWhile.java",
    description: "Same condition, false from the start. Which loop runs?",
    code: dwCode,
  },
  [
    { at: "int n = 10;", set: { n: 10 } },
    { at: "while (n < 5) {", note: "Checked BEFORE the body: 10 < 5 is false → body runs 0 times." },
    { at: "do {", note: "do-while: enter the body first, check later." },
    { at: '"do-while: "', print: "do-while: 10\n" },
    { at: "n++;", nth: 2, set: { n: 11 } },
    { at: "} while (n < 5);", note: "Checked AFTER the body: 11 < 5 is false → stop. The body ran exactly once." },
    { at: '"n = "', print: "n = 11\n" },
  ],
);

// ------------------------------------------------------------------ nested loops
const nestedCode = java`
public class Triangle {
    public static void main(String[] args) {
        for (int row = 1; row <= 3; row++) {
            for (int col = 1; col <= row; col++) {
                System.out.print("*");
            }
            System.out.println();
        }
    }
}`;

const nSteps: StepSpec[] = [];
for (let row = 1; row <= 4; row++) {
  nSteps.push({
    at: "for (int row",
    set: { row },
    note: row <= 3 ? `row = ${row}, ${row} <= 3 → true.` : "row = 4, 4 <= 3 → FALSE. Done.",
  });
  if (row > 3) break;
  for (let col = 1; col <= row + 1; col++) {
    nSteps.push({
      at: "for (int col",
      set: { col },
      note: col <= row ? `col = ${col}, ${col} <= ${row} → true.` : `col = ${col}, ${col} <= ${row} → FALSE, inner loop ends.`,
    });
    if (col > row) break;
    nSteps.push({ at: 'System.out.print("*")', print: "*" });
  }
  nSteps.push({ at: "System.out.println();", unset: ["col"], print: "\n", note: "Inner loop finished → new line." });
}

const nested = buildTrace(
  {
    id: "t-nested",
    moduleId: "m5-loops",
    title: "Nested loops — star triangle",
    filename: "Triangle.java",
    description: "The inner loop runs completely for every outer iteration.",
    code: nestedCode,
  },
  nSteps,
);

// ------------------------------------------------------------------ methods
const methodsCode = java`
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
}`;

const methods = buildTrace(
  {
    id: "t-methods",
    moduleId: "m6-methods",
    title: "Calling methods & returning values",
    filename: "Helpers.java",
    description: "Watch each method get its own variables (its frame) and lose them on return.",
    code: methodsCode,
  },
  [
    { at: "public static void main", note: "Execution starts in main — not at the top of the file." },
    { at: "int s = add(3, 4);", note: "Call add(3, 4): main pauses here." },
    { at: "public static int add", set: { "add: a": 3, "add: b": 4 }, note: "Copies of the arguments: a = 3, b = 4." },
    { at: "return a + b;", note: "return 7 → add ends, its variables a and b disappear." },
    { at: "int s = add(3, 4);", unset: ["add: a", "add: b"], set: { "main: s": 7 }, note: "Back in main: the returned 7 is stored in s." },
    { at: '"Sum: "', print: "Sum: 7\n" },
    { at: "System.out.println(isEven(s));", note: "Call isEven(7)." },
    { at: "public static boolean isEven", set: { "isEven: n": 7 } },
    { at: "return n % 2 == 0;", note: "7 % 2 = 1, 1 == 0 → false. Return false." },
    { at: "System.out.println(isEven(s));", unset: ["isEven: n"], print: "false\n", note: "println prints the returned boolean." },
    { at: 'greet("Loren");', note: "Call greet — a void method, nothing comes back." },
    { at: "public static void greet", set: { "greet: name": '"Loren"' } },
    { at: '"Hello, "', print: "Hello, Loren!\n", note: "The void method prints by itself." },
    { at: 'greet("Loren");', unset: ["greet: name"], note: "greet finishes; back in main, which then ends." },
  ],
);

export const traces: TraceProgram[] = [mistery, braces, concat, compare, forSum, offByOne, whileDigits, doWhile, nested, methods];
