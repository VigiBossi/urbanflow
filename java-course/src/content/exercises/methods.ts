import type { CodingExercise } from "../../lib/types";
import { java, md } from "../helpers";

const M = "m6-methods";

export const methodsExercises: CodingExercise[] = [
  {
    id: "meth-1",
    moduleId: M,
    lab: "Methods",
    number: 1,
    title: "add, isEven & greet",
    difficulty: 1,
    prompt: md(
      "Write three helper methods **outside `main`**:",
      "",
      "- `add(int a, int b)` returns the sum",
      "- `isEven(int n)` returns `true` if `n` is even",
      "- `greet(String name)` prints `Hello, <name>!` (void)",
      "",
      "In `main`, read a name and two numbers, greet the user, print the sum and whether it is even or odd.",
    ),
    samples: [
      { input: "Ana 3 4", output: "Hello, Ana!\nSum: 7\n7 is odd" },
      { input: "Loren 10 6", output: "Hello, Loren!\nSum: 16\n16 is even" },
    ],
    hints: [
      "Signatures: `public static int add(int a, int b)`, `public static boolean isEven(int n)`, `public static void greet(String name)`.",
      "`isEven` can be one line: `return n % 2 == 0;`",
      "Use the returned value: `int s = add(a, b); if (isEven(s)) ...`",
    ],
    traps: ["`greet` is `void` — call it as a statement, don't put it inside `println`."],
    starterCode: java`
import java.util.*;

public class Basics {

    // TODO: add, isEven, greet

    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        String name = input.next();
        int a = input.nextInt();
        int b = input.nextInt();

        // TODO: use your methods
    }
}`,
    solution: java`
import java.util.*;

public class Basics {

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
        Scanner input = new Scanner(System.in);
        String name = input.next();
        int a = input.nextInt();
        int b = input.nextInt();

        greet(name);
        int s = add(a, b);
        System.out.println("Sum: " + s);
        if (isEven(s)) {
            System.out.println(s + " is even");
        } else {
            System.out.println(s + " is odd");
        }
    }
}`,
  },
  {
    id: "meth-2",
    moduleId: M,
    lab: "Methods",
    number: 2,
    title: "Overloaded max",
    difficulty: 1,
    prompt: md(
      "Write two **overloaded** methods: `max(int a, int b)` and `max(int a, int b, int c)`. The 3-parameter version must **reuse** the 2-parameter one.",
      "",
      "Read three integers and print the largest.",
    ),
    samples: [
      { input: "4 9 2", output: "Max: 9" },
      { input: "-1 -7 -3", output: "Max: -1" },
    ],
    hints: [
      "2 params: `if (a > b) return a; else return b;`",
      "3 params: `return max(max(a, b), c);`",
    ],
    traps: ["Overloads must differ in their **parameter list**; changing only the return type is a compile error."],
    starterCode: java`
import java.util.*;

public class MaxOverload {

    // TODO: max(int, int) and max(int, int, int)

    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        int a = input.nextInt(), b = input.nextInt(), c = input.nextInt();
        // TODO: print "Max: ..."
    }
}`,
    solution: java`
import java.util.*;

public class MaxOverload {

    public static int max(int a, int b) {
        if (a > b) {
            return a;
        }
        return b;
    }

    public static int max(int a, int b, int c) {
        return max(max(a, b), c);
    }

    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        int a = input.nextInt(), b = input.nextInt(), c = input.nextInt();
        System.out.println("Max: " + max(a, b, c));
    }
}`,
  },
  {
    id: "meth-3",
    moduleId: M,
    lab: "Methods",
    number: 3,
    title: "Primes up to N",
    difficulty: 2,
    prompt: md(
      "Write `isPrime(int n)` returning `true` when `n` is prime. In `main`, read `N` and print all primes from 2 to `N` on one line, separated by spaces.",
    ),
    samples: [
      { input: "20", output: "2 3 5 7 11 13 17 19" },
      { input: "10", output: "2 3 5 7" },
    ],
    hints: [
      "Numbers below 2 are not prime: `if (n < 2) return false;`",
      "Try divisors `i` from 2 while `i * i <= n`. If `n % i == 0` → `return false;`",
      "If the loop finishes, `return true;`",
    ],
    traps: ["`return true` inside the loop (in an else) would stop after checking only one divisor."],
    starterCode: java`
import java.util.*;

public class Primes {

    // TODO: isPrime

    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        int n = input.nextInt();
        // TODO: print primes from 2 to n
    }
}`,
    solution: java`
import java.util.*;

public class Primes {

    public static boolean isPrime(int n) {
        if (n < 2) return false;
        for (int i = 2; i * i <= n; i++) {
            if (n % i == 0) return false;
        }
        return true;
    }

    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        int n = input.nextInt();
        String line = "";
        for (int i = 2; i <= n; i++) {
            if (isPrime(i)) {
                if (!line.equals("")) line += " ";
                line += i;
            }
        }
        System.out.println(line);
    }
}`,
  },
  {
    id: "meth-4",
    moduleId: M,
    lab: "Methods",
    number: 4,
    title: "power(base, exp) without Math.pow",
    difficulty: 2,
    prompt: md(
      "Write `long power(int base, int exp)` that computes `base^exp` with a loop (`exp >= 0`). Read the two numbers and print `base^exp = result`.",
    ),
    samples: [
      { input: "2 10", output: "2^10 = 1024" },
      { input: "5 0", output: "5^0 = 1" },
      { input: "3 4", output: "3^4 = 81" },
    ],
    hints: ["Start with `long result = 1;`", "Multiply by `base` exactly `exp` times.", "Return `result` — print in `main`."],
    traps: ["Starting at `result = 0` always gives 0.", "`^` in Java is **not** power (it's XOR): `2 ^ 3` is `1`."],
    starterCode: java`
import java.util.*;

public class Power {

    // TODO: power(int base, int exp)

    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        int base = input.nextInt();
        int exp = input.nextInt();
        // TODO: print base^exp = ...
    }
}`,
    solution: java`
import java.util.*;

public class Power {

    public static long power(int base, int exp) {
        long result = 1;
        for (int i = 1; i <= exp; i++) {
            result *= base;
        }
        return result;
    }

    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        int base = input.nextInt();
        int exp = input.nextInt();
        System.out.println(base + "^" + exp + " = " + power(base, exp));
    }
}`,
  },
];
