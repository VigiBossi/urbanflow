import type { CodingExercise } from "../../lib/types";
import { java, md } from "../helpers";

const M = "m4-conditionals";

export const lab4: CodingExercise[] = [
  {
    id: "lab4-1",
    moduleId: M,
    lab: "Lab 4",
    number: 1,
    title: "Ordinal Suffix (1st, 2nd, 3rd, nth)",
    difficulty: 1,
    prompt: md(
      "Read a number between **1 and 20**. Print `1st` for 1, `2nd` for 2, `3rd` for 3, and `<n>th` for 4–20.",
      "",
      "Validate the input: if it is outside 1–20, print an error message instead.",
    ),
    samples: [
      { input: "1", output: "1st" },
      { input: "3", output: "3rd" },
      { input: "12", output: "12th" },
      { input: "25", output: "Invalid number! Enter a number between 1 and 20." },
    ],
    hints: [
      "Check the invalid range first: `if (n < 1 || n > 20)`.",
      "Then use `else if (n == 1)`, `else if (n == 2)`, `else if (n == 3)` and a final `else` for 4–20.",
      "For 4–20 you can concatenate: `System.out.println(n + \"th\");`",
    ],
    traps: [
      "11, 12 and 13 end in 1, 2, 3 but are still `th` — since the range stops at 20, you only special-case exactly 1, 2 and 3.",
      "`n < 1 || n > 20` uses `||` (or). With `&&` the condition can never be true.",
    ],
    checklist: ["Did you test 1, 2, 3, 4, 20?", "Did you test 0 and 21?", "Is the output exactly `1st`, not `1 st`?"],
    starterCode: java`
import java.util.*;

public class Ordinal {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        System.out.print("Enter a number (1-20): ");
        int n = input.nextInt();

        // TODO: validate 1..20, then print 1st / 2nd / 3rd / nth
    }
}`,
    solution: java`
import java.util.*;

public class Ordinal {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        System.out.print("Enter a number (1-20): ");
        int n = input.nextInt();

        if (n < 1 || n > 20) {
            System.out.println("Invalid number! Enter a number between 1 and 20.");
        } else if (n == 1) {
            System.out.println("1st");
        } else if (n == 2) {
            System.out.println("2nd");
        } else if (n == 3) {
            System.out.println("3rd");
        } else {
            System.out.println(n + "th");
        }
    }
}`,
  },
  {
    id: "lab4-2",
    moduleId: M,
    lab: "Lab 4",
    number: 2,
    title: "Parking Lot Price",
    difficulty: 1,
    prompt: md(
      "Read the parking time in hours and print the amount to pay:",
      "",
      "- `0 < time <= 2` → `100 leke`",
      "- `2 < time <= 4` → `200 leke`",
      "- `4 < time <= 6` → `300 leke`",
      "- `time > 6` → `400 leke`",
      "",
      "Example: input `5` → `Amount: 300 leke`. Print an error for a time ≤ 0.",
    ),
    samples: [
      { input: "5", output: "Amount: 300 leke" },
      { input: "1.5", output: "Amount: 100 leke" },
      { input: "4", output: "Amount: 200 leke" },
      { input: "7", output: "Amount: 400 leke" },
      { input: "0", output: "Invalid time!" },
    ],
    hints: [
      "Use `double time = input.nextDouble();` so `1.5` hours works.",
      "Each range needs two comparisons: `time > 2 && time <= 4`.",
      "Because `else if` only runs when the previous conditions were false, you could also write just `time <= 4` after checking `time <= 2`.",
    ],
    traps: [
      "`2 < time <= 4` is math notation and does **not** compile in Java.",
      "Boundaries: exactly `2` is 100 leke, exactly `4` is 200 leke (`<=`).",
    ],
    checklist: ["Did you test the boundaries 2, 4 and 6?", "Does 0 or a negative number print an error?"],
    starterCode: java`
import java.util.*;

public class Parking {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        System.out.print("Enter parking time (hours): ");
        double time = input.nextDouble();
        int amount = 0;

        // TODO: decide the amount using the ranges

        // TODO: print "Amount: <amount> leke"
    }
}`,
    solution: java`
import java.util.*;

public class Parking {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        System.out.print("Enter parking time (hours): ");
        double time = input.nextDouble();
        int amount = 0;

        if (time <= 0) {
            System.out.println("Invalid time!");
        } else {
            if (time > 0 && time <= 2) {
                amount = 100;
            } else if (time > 2 && time <= 4) {
                amount = 200;
            } else if (time > 4 && time <= 6) {
                amount = 300;
            } else {
                amount = 400;
            }
            System.out.println("Amount: " + amount + " leke");
        }
    }
}`,
  },
  {
    id: "lab4-3",
    moduleId: M,
    lab: "Lab 4",
    number: 3,
    title: "Partial (Piecewise) Function",
    difficulty: 1,
    prompt: md(
      "Read an integer `x` and compute:",
      "",
      "- `f(x) = x + 1` if `60 <= x < 100`",
      "- `f(x) = 50` if `x == 20`",
      "- `f(x) = x - 1` if `x == 0`",
      "- `f(x) = 0` otherwise",
      "",
      "Print `f(x) = <value>`.",
    ),
    samples: [
      { input: "75", output: "f(x) = 76" },
      { input: "20", output: "f(x) = 50" },
      { input: "0", output: "f(x) = -1" },
      { input: "100", output: "f(x) = 0" },
      { input: "60", output: "f(x) = 61" },
    ],
    hints: [
      "Translate `60 <= x < 100` into `x >= 60 && x < 100`.",
      "Use `==` for the single-value cases: `x == 20`, `x == 0`.",
      "Store the answer in `int fx` and print it once at the end.",
    ],
    traps: ["`x = 20` (assignment) instead of `x == 20` will not compile inside an `if`.", "`100` is **not** in the first range (`< 100`)."],
    checklist: ["Did you test 59, 60, 99 and 100?", "Did you test 20 and 0?"],
    starterCode: java`
import java.util.*;

public class Piecewise {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        System.out.print("Enter x: ");
        int x = input.nextInt();
        int fx;

        // TODO: compute fx

        System.out.println("f(x) = " + fx);
    }
}`,
    solution: java`
import java.util.*;

public class Piecewise {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        System.out.print("Enter x: ");
        int x = input.nextInt();
        int fx;

        if (x >= 60 && x < 100) {
            fx = x + 1;
        } else if (x == 20) {
            fx = 50;
        } else if (x == 0) {
            fx = x - 1;
        } else {
            fx = 0;
        }

        System.out.println("f(x) = " + fx);
    }
}`,
  },
  {
    id: "lab4-4",
    moduleId: M,
    lab: "Lab 4",
    number: 4,
    title: "Celsius / Fahrenheit Converter",
    difficulty: 2,
    prompt: md(
      "Read a `char` choice: `'C'` or `'F'`. For anything else print `Invalid input`.",
      "",
      "- If `'C'`: read a temperature in **Fahrenheit** and print it in Celsius: `C = (5.0 / 9) * (F - 32)`",
      "- If `'F'`: read a temperature in **Celsius** and print it in Fahrenheit: `F = (9.0 / 5) * C + 32`",
      "",
      "Print the result with 2 decimals, e.g. `Celsius: 100.00`.",
    ),
    samples: [
      { input: "C\n212", output: "Celsius: 100.00" },
      { input: "F\n100", output: "Fahrenheit: 212.00" },
      { input: "C\n50", output: "Celsius: 10.00" },
      { input: "X", output: "Invalid input" },
    ],
    hints: [
      "Read the choice with `char choice = input.next().charAt(0);`",
      "Compare chars with `==` and single quotes: `if (choice == 'C')`.",
      "Use `5.0 / 9`, not `5 / 9`. Print with `System.out.printf(\"Celsius: %.2f%n\", c);`",
    ],
    traps: [
      "**`5 / 9` is `0` in integer division!** So `(5 / 9) * (F - 32)` is always `0.0`. At least one side must be a double: `5.0 / 9`.",
      "`'C'` and `'c'` are different characters — Java is case-sensitive. (Optionally accept both with `||`.)",
      "Only read the temperature *inside* the valid branches — for invalid input, don't ask for a number.",
    ],
    checklist: ["Does 212 °F give exactly 100 °C?", "Does 'X' print `Invalid input` without asking for a temperature?"],
    starterCode: java`
import java.util.*;

public class Temperature {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        System.out.print("Convert to (C/F): ");
        char choice = input.next().charAt(0);

        // TODO: if 'C' read Fahrenheit and convert to Celsius
        // TODO: if 'F' read Celsius and convert to Fahrenheit
        // TODO: otherwise print "Invalid input"
    }
}`,
    solution: java`
import java.util.*;

public class Temperature {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        System.out.print("Convert to (C/F): ");
        char choice = input.next().charAt(0);

        if (choice == 'C') {
            System.out.print("Enter temperature in Fahrenheit: ");
            double f = input.nextDouble();
            double c = (5.0 / 9) * (f - 32);   // 5 / 9 would be 0!
            System.out.printf("Celsius: %.2f%n", c);
        } else if (choice == 'F') {
            System.out.print("Enter temperature in Celsius: ");
            double c = input.nextDouble();
            double f = (9.0 / 5) * c + 32;
            System.out.printf("Fahrenheit: %.2f%n", f);
        } else {
            System.out.println("Invalid input");
        }
    }
}`,
  },
  {
    id: "lab4-5",
    moduleId: M,
    lab: "Lab 4",
    number: 5,
    title: "Seconds Converter",
    difficulty: 2,
    prompt: md(
      "Read an integer number of seconds and convert it to days, hours, minutes and seconds using `/` and `%`.",
      "",
      "Example: `100000` → `1 day 3 hour 46 minutes 40 seconds`",
    ),
    samples: [
      { input: "100000", output: "1 day 3 hour 46 minutes 40 seconds" },
      { input: "3661", output: "0 day 1 hour 1 minutes 1 seconds" },
      { input: "59", output: "0 day 0 hour 0 minutes 59 seconds" },
    ],
    hints: [
      "1 day = 86400 s, 1 hour = 3600 s, 1 minute = 60 s.",
      "`days = total / 86400;` then what's left over is `total % 86400`.",
      "Repeat the same `/` then `%` idea for hours (3600) and minutes (60).",
    ],
    traps: [
      "Use the **remainder** at every step. `hours = total / 3600` without removing the days first gives 27 for 100000.",
      "All variables are `int` — integer division is exactly what you want here.",
    ],
    checklist: ["Does 100000 give 1, 3, 46, 40?", "Does 86400 give exactly 1 day 0 hour 0 minutes 0 seconds?"],
    starterCode: java`
import java.util.*;

public class Seconds {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        System.out.print("Enter seconds: ");
        int total = input.nextInt();

        // TODO: compute days, hours, minutes, seconds with / and %

        // TODO: print "<d> day <h> hour <m> minutes <s> seconds"
    }
}`,
    solution: java`
import java.util.*;

public class Seconds {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        System.out.print("Enter seconds: ");
        int total = input.nextInt();

        int days = total / 86400;
        int rest = total % 86400;
        int hours = rest / 3600;
        rest = rest % 3600;
        int minutes = rest / 60;
        int seconds = rest % 60;

        System.out.println(days + " day " + hours + " hour " + minutes + " minutes " + seconds + " seconds");
    }
}`,
  },
  {
    id: "lab4-6",
    moduleId: M,
    lab: "Lab 4",
    number: 6,
    title: "5-Digit Palindrome",
    difficulty: 2,
    prompt: md(
      "Read a **5-digit** integer and check whether it is a palindrome (reads the same forwards and backwards, e.g. `12321`). Extract the digits with `/` and `%` — no Strings.",
      "",
      "If the number does not have exactly 5 digits, print an error.",
    ),
    samples: [
      { input: "12321", output: "12321 is a palindrome" },
      { input: "12345", output: "12345 is not a palindrome" },
      { input: "45554", output: "45554 is a palindrome" },
      { input: "123", output: "Please enter a 5-digit number" },
    ],
    hints: [
      "A 5-digit number is between `10000` and `99999`.",
      "First digit: `n / 10000`. Second: `n / 1000 % 10`. Fourth: `n / 10 % 10`. Last: `n % 10`.",
      "It's a palindrome when `d1 == d5 && d2 == d4` (the middle digit doesn't matter).",
    ],
    traps: [
      "`n / 1000` for 12321 is `12` — you still need `% 10` to get the single digit `2`.",
      "Don't forget to validate: `if (n < 10000 || n > 99999)`.",
    ],
    checklist: ["Did you test 12321 and 12345?", "Did you test 10001 (palindrome) and 10000 (not)?"],
    starterCode: java`
import java.util.*;

public class Palindrome {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        System.out.print("Enter a 5-digit number: ");
        int n = input.nextInt();

        // TODO: validate, extract the 5 digits, compare
    }
}`,
    solution: java`
import java.util.*;

public class Palindrome {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        System.out.print("Enter a 5-digit number: ");
        int n = input.nextInt();

        if (n < 10000 || n > 99999) {
            System.out.println("Please enter a 5-digit number");
        } else {
            int d1 = n / 10000;
            int d2 = n / 1000 % 10;
            int d4 = n / 10 % 10;
            int d5 = n % 10;

            if (d1 == d5 && d2 == d4) {
                System.out.println(n + " is a palindrome");
            } else {
                System.out.println(n + " is not a palindrome");
            }
        }
    }
}`,
  },
  {
    id: "lab4-7",
    moduleId: M,
    lab: "Lab 4",
    number: 7,
    title: "3-Digit Lottery Game",
    difficulty: 3,
    prompt: md(
      "Generate a random 3-digit number with `(int)(Math.random() * 900) + 100` and read a 3-digit guess from the user. Award:",
      "",
      "- **10,000 points** — exact match (same digits, same order)",
      "- **3,000 points** — all 3 digits match, in any order",
      "- **1,000 points** — at least one digit matches",
      "- **0 points** — no digit matches",
      "",
      "Print the lottery number and the points.",
    ),
    samples: [
      { input: "lottery = 123, guess 123", output: "Exact match! You win 10000 points" },
      { input: "lottery = 123, guess 312", output: "All digits match! You win 3000 points" },
      { input: "lottery = 123, guess 145", output: "One digit matches! You win 1000 points" },
      { input: "lottery = 123, guess 456", output: "Sorry, no match. 0 points" },
    ],
    hints: [
      "Split both numbers into digits: `l1 = lottery / 100`, `l2 = lottery / 10 % 10`, `l3 = lottery % 10` (same for the guess).",
      "\"Same digits, any order\": the simplest check for this lab is to compare all 6 permutations of the guess digits, e.g. `(g1==l1 && g2==l3 && g3==l2) || ...`.",
      "\"At least one digit\": check if `g1`, `g2` or `g3` equals any of `l1`, `l2`, `l3`.",
      "Check the conditions from the most valuable to the least valuable with `if / else if`.",
    ],
    traps: [
      "`Math.random()` returns a `double` in `[0, 1)` — the cast `(int)(...)` must wrap the whole multiplication, otherwise `(int) Math.random()` is always 0.",
      "Order matters: an exact match also satisfies \"all digits match\" and \"one digit matches\", so test the exact match first.",
    ],
    checklist: [
      "While testing, temporarily print the lottery number first so you can enter known guesses.",
      "Test an exact match, a permutation, one common digit, and no common digit.",
    ],
    starterCode: java`
import java.util.*;

public class Lottery {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        int lottery = (int)(Math.random() * 900) + 100;

        System.out.print("Enter your 3-digit guess: ");
        int guess = input.nextInt();

        // TODO: extract digits of lottery and guess

        // TODO: exact -> 10000, all digits any order -> 3000, one digit -> 1000

        System.out.println("The lottery number was " + lottery);
    }
}`,
    solution: java`
import java.util.*;

public class Lottery {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        int lottery = (int)(Math.random() * 900) + 100;

        System.out.print("Enter your 3-digit guess: ");
        int guess = input.nextInt();

        int l1 = lottery / 100, l2 = lottery / 10 % 10, l3 = lottery % 10;
        int g1 = guess / 100,   g2 = guess / 10 % 10,   g3 = guess % 10;

        boolean allDigitsAnyOrder =
                   (g1 == l1 && g2 == l2 && g3 == l3)
                || (g1 == l1 && g2 == l3 && g3 == l2)
                || (g1 == l2 && g2 == l1 && g3 == l3)
                || (g1 == l2 && g2 == l3 && g3 == l1)
                || (g1 == l3 && g2 == l1 && g3 == l2)
                || (g1 == l3 && g2 == l2 && g3 == l1);

        boolean oneDigit =
                   g1 == l1 || g1 == l2 || g1 == l3
                || g2 == l1 || g2 == l2 || g2 == l3
                || g3 == l1 || g3 == l2 || g3 == l3;

        if (guess == lottery) {
            System.out.println("Exact match! You win 10000 points");
        } else if (allDigitsAnyOrder) {
            System.out.println("All digits match! You win 3000 points");
        } else if (oneDigit) {
            System.out.println("One digit matches! You win 1000 points");
        } else {
            System.out.println("Sorry, no match. 0 points");
        }

        System.out.println("The lottery number was " + lottery);
    }
}`,
  },
];
