import type { CodingExercise } from "../../lib/types";
import { java, md } from "../helpers";

const M = "m5-loops";

export const lab5: CodingExercise[] = [
  {
    id: "lab5-1",
    moduleId: M,
    lab: "Lab 5",
    number: 1,
    title: "Sum & Average of N Numbers",
    difficulty: 1,
    prompt: md(
      "Read how many numbers `n` the user will enter, then read `n` integers. Print their sum and their average (as a decimal).",
    ),
    samples: [
      { input: "5\n1 2 3 4 5", output: "Sum = 15\nAverage = 3.0" },
      { input: "4\n7 8 9 10", output: "Sum = 34\nAverage = 8.5" },
    ],
    hints: [
      "Running sum: declare `int sum = 0;` **before** the loop.",
      "`for (int i = 1; i <= n; i++) { sum += input.nextInt(); }`",
      "Average: `(double) sum / n` — cast before dividing.",
    ],
    traps: ["`sum / n` with two ints gives 8, not 8.5.", "Declaring `sum` inside the loop resets it every time."],
    checklist: ["Does 7 8 9 10 give 8.5 (not 8.0)?"],
    starterCode: java`
import java.util.*;

public class SumAverage {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        System.out.print("How many numbers? ");
        int n = input.nextInt();

        // TODO: read n numbers and add them up

        // TODO: print Sum = ... and Average = ...
    }
}`,
    solution: java`
import java.util.*;

public class SumAverage {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        System.out.print("How many numbers? ");
        int n = input.nextInt();

        int sum = 0;
        for (int i = 1; i <= n; i++) {
            System.out.print("Number " + i + ": ");
            sum += input.nextInt();
        }

        double average = (double) sum / n;
        System.out.println("Sum = " + sum);
        System.out.println("Average = " + average);
    }
}`,
  },
  {
    id: "lab5-2",
    moduleId: M,
    lab: "Lab 5",
    number: 2,
    title: "Factorial with Input Validation",
    difficulty: 1,
    prompt: md(
      "Keep asking for a number until the user enters a value `>= 0` (use `do-while`). Then compute and print `n!` using a loop.",
      "",
      "Remember `0! = 1`.",
    ),
    samples: [
      { input: "5", output: "5! = 120" },
      { input: "-3\n0", output: "0! = 1" },
      { input: "15", output: "15! = 1307674368000" },
    ],
    hints: [
      "`do { read n } while (n < 0);`",
      "Start the product at `1` (not 0!): `long fact = 1;`",
      "`for (int i = 2; i <= n; i++) fact *= i;`",
    ],
    traps: ["Starting with `fact = 0` makes every answer 0.", "`int` overflows after 12! — use `long`."],
    checklist: ["Does a negative number make it ask again?", "Does 0 print 1?"],
    starterCode: java`
import java.util.*;

public class Factorial {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        int n;

        // TODO: do-while until n >= 0

        // TODO: compute n! in a long and print "n! = ..."
    }
}`,
    solution: java`
import java.util.*;

public class Factorial {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        int n;

        do {
            System.out.print("Enter a non-negative number: ");
            n = input.nextInt();
        } while (n < 0);

        long fact = 1;
        for (int i = 2; i <= n; i++) {
            fact *= i;
        }
        System.out.println(n + "! = " + fact);
    }
}`,
  },
  {
    id: "lab5-3",
    moduleId: M,
    lab: "Lab 5",
    number: 3,
    title: "Multiplication Table",
    difficulty: 1,
    prompt: "Read an integer `n` and print its multiplication table from 1 to 10 in the format `n x i = result`.",
    samples: [
      {
        input: "7",
        output:
          "7 x 1 = 7\n7 x 2 = 14\n7 x 3 = 21\n7 x 4 = 28\n7 x 5 = 35\n7 x 6 = 42\n7 x 7 = 49\n7 x 8 = 56\n7 x 9 = 63\n7 x 10 = 70",
      },
    ],
    hints: ["One `for` loop from 1 to 10.", "`System.out.println(n + \" x \" + i + \" = \" + (n * i));`"],
    traps: ["Without parentheses, `\" = \" + n * i` still works (`*` before `+`), but `\" = \" + n + i` would glue the digits."],
    starterCode: java`
import java.util.*;

public class Table {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        System.out.print("Enter a number: ");
        int n = input.nextInt();

        // TODO: print n x 1 ... n x 10
    }
}`,
    solution: java`
import java.util.*;

public class Table {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        System.out.print("Enter a number: ");
        int n = input.nextInt();

        for (int i = 1; i <= 10; i++) {
            System.out.println(n + " x " + i + " = " + (n * i));
        }
    }
}`,
  },
  {
    id: "lab5-4",
    moduleId: M,
    lab: "Lab 5",
    number: 4,
    title: "Reverse, Count & Sum Digits",
    difficulty: 2,
    prompt: md(
      "Read a positive integer. Using a `while` loop with `% 10` and `/ 10`, print:",
      "",
      "- the number reversed",
      "- how many digits it has",
      "- the sum of its digits",
    ),
    samples: [
      { input: "12345", output: "Reversed: 54321\nDigits: 5\nSum of digits: 15" },
      { input: "907", output: "Reversed: 709\nDigits: 3\nSum of digits: 16" },
    ],
    hints: [
      "Pattern: `while (n > 0) { int d = n % 10; ...; n /= 10; }`",
      "Building the reverse: `reversed = reversed * 10 + d;`",
      "Count with `count++` and sum with `sum += d` in the same loop.",
    ],
    traps: ["The loop destroys `n` — if you need the original value later, copy it first.", "Forgetting `n /= 10` → infinite loop."],
    starterCode: java`
import java.util.*;

public class DigitTools {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        System.out.print("Enter a positive number: ");
        int n = input.nextInt();
        int reversed = 0, count = 0, sum = 0;

        // TODO: while loop extracting digits

        System.out.println("Reversed: " + reversed);
        System.out.println("Digits: " + count);
        System.out.println("Sum of digits: " + sum);
    }
}`,
    solution: java`
import java.util.*;

public class DigitTools {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        System.out.print("Enter a positive number: ");
        int n = input.nextInt();
        int reversed = 0, count = 0, sum = 0;

        while (n > 0) {
            int d = n % 10;
            reversed = reversed * 10 + d;
            count++;
            sum += d;
            n /= 10;
        }

        System.out.println("Reversed: " + reversed);
        System.out.println("Digits: " + count);
        System.out.println("Sum of digits: " + sum);
    }
}`,
  },
  {
    id: "lab5-5",
    moduleId: M,
    lab: "Lab 5",
    number: 5,
    title: "Sentinel Loop: Count, Sum, Max",
    difficulty: 2,
    prompt: md(
      "Read integers until the user enters `0` (the **sentinel** — it is not part of the data). Print how many numbers were entered, their sum and the largest one.",
      "",
      "If the very first number is `0`, print `No numbers entered`.",
    ),
    samples: [
      { input: "4 9 -2 7 0", output: "Count: 4\nSum: 18\nMax: 9" },
      { input: "-5 -1 -8 0", output: "Count: 3\nSum: -14\nMax: -1" },
      { input: "0", output: "No numbers entered" },
    ],
    hints: [
      "Read the first number before the loop, then `while (x != 0) { ...; x = input.nextInt(); }`.",
      "Initialise `max` with the **first** number, not with 0 (all numbers might be negative).",
      "Alternatively use `while (true)` with `if (x == 0) break;`.",
    ],
    traps: ["`int max = 0;` gives the wrong answer for all-negative inputs.", "Don't count or add the sentinel 0."],
    starterCode: java`
import java.util.*;

public class Sentinel {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        System.out.println("Enter numbers (0 to stop):");

        // TODO: loop until 0, track count, sum and max
    }
}`,
    solution: java`
import java.util.*;

public class Sentinel {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        System.out.println("Enter numbers (0 to stop):");

        int x = input.nextInt();
        if (x == 0) {
            System.out.println("No numbers entered");
        } else {
            int count = 0, sum = 0, max = x;
            while (x != 0) {
                count++;
                sum += x;
                if (x > max) max = x;
                x = input.nextInt();
            }
            System.out.println("Count: " + count);
            System.out.println("Sum: " + sum);
            System.out.println("Max: " + max);
        }
    }
}`,
  },
  {
    id: "lab5-6",
    moduleId: M,
    lab: "Lab 5",
    number: 6,
    title: "Number Triangle (Nested Loops)",
    difficulty: 2,
    prompt: md("Read `n` and print a number triangle with `n` rows. Row `r` contains the numbers `1` to `r` separated by spaces."),
    samples: [
      { input: "4", output: "1\n1 2\n1 2 3\n1 2 3 4" },
      { input: "2", output: "1\n1 2" },
    ],
    hints: [
      "Outer loop: `for (int row = 1; row <= n; row++)`.",
      "Inner loop: `for (int col = 1; col <= row; col++)` prints `col`.",
      "After the inner loop finishes, call `System.out.println();` to end the row.",
      "To avoid a trailing space, print the space only when `col < row`.",
    ],
    traps: ["Using `println` inside the inner loop puts every number on its own line.", "Inner condition must depend on `row`, not `n`."],
    starterCode: java`
import java.util.*;

public class NumberTriangle {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        System.out.print("Rows: ");
        int n = input.nextInt();

        // TODO: nested loops
    }
}`,
    solution: java`
import java.util.*;

public class NumberTriangle {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        System.out.print("Rows: ");
        int n = input.nextInt();
        System.out.println();

        for (int row = 1; row <= n; row++) {
            for (int col = 1; col <= row; col++) {
                System.out.print(col);
                if (col < row) System.out.print(" ");
            }
            System.out.println();
        }
    }
}`,
  },
];
