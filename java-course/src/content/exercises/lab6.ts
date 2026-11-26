import type { CodingExercise } from "../../lib/types";
import { java, md } from "../helpers";

const M = "m7-quiz-prep";

export const lab6: CodingExercise[] = [
  {
    id: "lab6-1",
    moduleId: M,
    lab: "Lab 6",
    number: 1,
    title: "Calculator with switch & a Method",
    difficulty: 2,
    prompt: md(
      "Read two numbers and an operator (`+ - * /`). Write a method `double calculate(double a, double b, char op)` that uses a `switch`.",
      "",
      "Print `Result: <value>`. For division by zero print `Cannot divide by zero`; for an unknown operator print `Unknown operator`.",
    ),
    samples: [
      { input: "8 2 /", output: "Result: 4.0" },
      { input: "3 4 *", output: "Result: 12.0" },
      { input: "5 0 /", output: "Cannot divide by zero" },
      { input: "5 1 ?", output: "Unknown operator" },
    ],
    hints: [
      "Read the operator with `input.next().charAt(0)`.",
      "Check the special cases in `main` before calling the method (zero divisor, unknown operator).",
      "Inside the switch, each case can `return` directly — then you don't need `break`.",
    ],
    traps: ["`switch` cases for chars use single quotes: `case '+':`.", "Without `return`/`break`, cases fall through."],
    starterCode: java`
import java.util.*;

public class Calculator {

    // TODO: calculate(double a, double b, char op)

    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        System.out.print("Enter: number number operator: ");
        double a = input.nextDouble();
        double b = input.nextDouble();
        char op = input.next().charAt(0);

        // TODO
    }
}`,
    solution: java`
import java.util.*;

public class Calculator {

    public static double calculate(double a, double b, char op) {
        switch (op) {
            case '+': return a + b;
            case '-': return a - b;
            case '*': return a * b;
            default:  return a / b;   // '/' (validated in main)
        }
    }

    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        System.out.print("Enter: number number operator: ");
        double a = input.nextDouble();
        double b = input.nextDouble();
        char op = input.next().charAt(0);

        if (op != '+' && op != '-' && op != '*' && op != '/') {
            System.out.println("Unknown operator");
        } else if (op == '/' && b == 0) {
            System.out.println("Cannot divide by zero");
        } else {
            System.out.println("Result: " + calculate(a, b, op));
        }
    }
}`,
  },
  {
    id: "lab6-2",
    moduleId: M,
    lab: "Lab 6",
    number: 2,
    title: "Grade Report",
    difficulty: 2,
    prompt: md(
      "Read the number of students `n`, then `n` integer scores (0–100). Write `char letterGrade(int score)`: A ≥ 90, B ≥ 80, C ≥ 70, D ≥ 60, otherwise F.",
      "",
      "Print `score -> letter` for each student, then the class average with one decimal.",
    ),
    samples: [
      { input: "3\n95 72 58", output: "95 -> A\n72 -> C\n58 -> F\nAverage: 75.0" },
      { input: "2\n80 89", output: "80 -> B\n89 -> B\nAverage: 84.5" },
    ],
    hints: [
      "`letterGrade` is an `if / else if` chain returning `'A'`, `'B'`, ...",
      "Keep a running `int total` in the loop.",
      "`System.out.printf(\"Average: %.1f%n\", (double) total / n);`",
    ],
    traps: ["Integer division in the average.", "Order the conditions from highest to lowest (≥ 90 first)."],
    starterCode: java`
import java.util.*;

public class GradeReport {

    // TODO: letterGrade(int score)

    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        int n = input.nextInt();
        // TODO
    }
}`,
    solution: java`
import java.util.*;

public class GradeReport {

    public static char letterGrade(int score) {
        if (score >= 90) return 'A';
        else if (score >= 80) return 'B';
        else if (score >= 70) return 'C';
        else if (score >= 60) return 'D';
        else return 'F';
    }

    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        int n = input.nextInt();
        int total = 0;
        for (int i = 0; i < n; i++) {
            int score = input.nextInt();
            total += score;
            System.out.println(score + " -> " + letterGrade(score));
        }
        System.out.printf("Average: %.1f%n", (double) total / n);
    }
}`,
  },
  {
    id: "lab6-3",
    moduleId: M,
    lab: "Lab 6",
    number: 3,
    title: "ATM Menu Loop",
    difficulty: 3,
    prompt: md(
      "Start with a balance of `1000.0`. Show a menu in a loop until the user chooses 4:",
      "",
      "`1` Deposit · `2` Withdraw · `3` Show balance · `4` Exit",
      "",
      "Withdrawing more than the balance prints `Insufficient funds`. Write methods `deposit` and `withdraw` that **return the new balance**.",
      "",
      "_In the samples the input is `choice [amount]` per line and the repeated menu lines are omitted from the output._",
    ),
    samples: [
      { input: "1 500\n2 2000\n2 300\n3\n4", output: "Insufficient funds\nBalance: 1200.0\nGoodbye!" },
      { input: "3\n4", output: "Balance: 1000.0\nGoodbye!" },
    ],
    hints: [
      "`do { show menu; read choice; switch (choice) {...} } while (choice != 4);`",
      "`public static double withdraw(double balance, double amount)` returns `balance` unchanged (after printing the message) if the amount is too big.",
      "Assign the result back: `balance = deposit(balance, amount);` — pass-by-value means the method can't change `balance` for you.",
    ],
    traps: [
      "Calling `deposit(balance, 500);` without assigning the result changes nothing.",
      "`switch` without `break` will run the next case too.",
    ],
    starterCode: java`
import java.util.*;

public class ATM {

    // TODO: deposit and withdraw, both returning the new balance

    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        double balance = 1000.0;
        int choice;

        // TODO: do-while menu loop
    }
}`,
    solution: java`
import java.util.*;

public class ATM {

    public static double deposit(double balance, double amount) {
        return balance + amount;
    }

    public static double withdraw(double balance, double amount) {
        if (amount > balance) {
            System.out.println("Insufficient funds");
            return balance;
        }
        return balance - amount;
    }

    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        double balance = 1000.0;
        int choice;

        do {
            System.out.println("1) Deposit 2) Withdraw 3) Balance 4) Exit");
            choice = input.nextInt();
            switch (choice) {
                case 1:
                    balance = deposit(balance, input.nextDouble());
                    break;
                case 2:
                    balance = withdraw(balance, input.nextDouble());
                    break;
                case 3:
                    System.out.println("Balance: " + balance);
                    break;
                case 4:
                    System.out.println("Goodbye!");
                    break;
                default:
                    System.out.println("Invalid choice");
            }
        } while (choice != 4);
    }
}`,
  },
  {
    id: "lab6-4",
    moduleId: M,
    lab: "Lab 6",
    number: 4,
    title: "Perfect Numbers",
    difficulty: 2,
    prompt: md(
      "A number is **perfect** if it equals the sum of its divisors smaller than itself (6 = 1 + 2 + 3).",
      "",
      "Write `int sumOfDivisors(int n)` and `boolean isPerfect(int n)`. Read `N` and print all perfect numbers from 1 to `N` separated by spaces.",
    ),
    samples: [
      { input: "1000", output: "6 28 496" },
      { input: "30", output: "6 28" },
    ],
    hints: [
      "`sumOfDivisors`: loop `i` from 1 to `n - 1`, add `i` when `n % i == 0`.",
      "`isPerfect(n)` is just `return n > 1 && sumOfDivisors(n) == n;`",
    ],
    traps: ["Don't include `n` itself in the divisor sum.", "1 has divisor sum 0, so it is not perfect."],
    starterCode: java`
import java.util.*;

public class Perfect {

    // TODO: sumOfDivisors, isPerfect

    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        int n = input.nextInt();
        // TODO
    }
}`,
    solution: java`
import java.util.*;

public class Perfect {

    public static int sumOfDivisors(int n) {
        int sum = 0;
        for (int i = 1; i < n; i++) {
            if (n % i == 0) sum += i;
        }
        return sum;
    }

    public static boolean isPerfect(int n) {
        return n > 1 && sumOfDivisors(n) == n;
    }

    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        int n = input.nextInt();
        String line = "";
        for (int i = 1; i <= n; i++) {
            if (isPerfect(i)) {
                if (!line.equals("")) line += " ";
                line += i;
            }
        }
        System.out.println(line);
    }
}`,
  },
  {
    id: "lab6-5",
    moduleId: M,
    lab: "Lab 6",
    number: 5,
    title: "Password Validator",
    difficulty: 3,
    prompt: md(
      "Read a password (one word). Write `boolean isValid(String p)`: it is valid when it has **at least 8 characters**, **at least one digit** and **at least one uppercase letter**.",
      "",
      "Loop over the characters with `charAt(i)`. Print `Valid password` or `Invalid password`.",
    ),
    samples: [
      { input: "Java2026", output: "Valid password" },
      { input: "java2026", output: "Invalid password" },
      { input: "Java", output: "Invalid password" },
    ],
    hints: [
      "Length: `p.length()` (a method — with parentheses).",
      "Digit check: `c >= '0' && c <= '9'`. Uppercase check: `c >= 'A' && c <= 'Z'`.",
      "Use two booleans, `hasDigit` and `hasUpper`, set to `true` inside the loop.",
    ],
    traps: ["Loop with `i < p.length()`, not `<=` — the last index is `length() - 1`.", "Compare chars with `==` / `<=`, but Strings with `.equals()`."],
    starterCode: java`
import java.util.*;

public class PasswordCheck {

    // TODO: isValid(String p)

    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        System.out.print("Password: ");
        String p = input.next();
        // TODO
    }
}`,
    solution: java`
import java.util.*;

public class PasswordCheck {

    public static boolean isValid(String p) {
        if (p.length() < 8) return false;
        boolean hasDigit = false, hasUpper = false;
        for (int i = 0; i < p.length(); i++) {
            char c = p.charAt(i);
            if (c >= '0' && c <= '9') hasDigit = true;
            if (c >= 'A' && c <= 'Z') hasUpper = true;
        }
        return hasDigit && hasUpper;
    }

    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        System.out.print("Password: ");
        String p = input.next();
        if (isValid(p)) {
            System.out.println("Valid password");
        } else {
            System.out.println("Invalid password");
        }
    }
}`,
  },
];
