import type { TrueFalseQuestion } from "../../lib/types";
import { java } from "../helpers";

type TF = Omit<TrueFalseQuestion, "type">;
const tf = (q: TF): TrueFalseQuestion => ({ type: "tf", ...q });

export const trueFalse: TrueFalseQuestion[] = [
  // ---------------- Module 1: structure & case sensitivity
  tf({ id: "tf-01", moduleId: "m1-structure", topics: ["structure"], statement: "A public class named `FirstProgram` must be saved in a file named `FirstProgram.java`.", answer: true, explanation: "The public class name and the file name must match exactly, including capitalization." }),
  tf({ id: "tf-02", moduleId: "m1-structure", topics: ["case-sensitivity"], statement: "Java is not case-sensitive, so `main` and `Main` refer to the same method.", answer: false, explanation: "Java is case-sensitive. `Main` is a different method name; the JVM only starts from `main`." }),
  tf({ id: "tf-03", moduleId: "m1-structure", topics: ["structure"], statement: "`System.out.print(\"Hi\");` moves the cursor to a new line after printing.", answer: false, explanation: "`print` stays on the same line. `println` is the one that moves to a new line." }),
  tf({ id: "tf-04", moduleId: "m1-structure", topics: ["structure"], statement: "Program execution always starts at the `main` method, regardless of where it appears in the class.", answer: true, explanation: "The JVM looks for `public static void main(String[] args)` and starts there." }),
  tf({ id: "tf-05", moduleId: "m1-structure", topics: ["structure"], statement: "Text after `//` on a line is ignored by the compiler.", answer: true, explanation: "`//` starts a single-line comment that lasts until the end of the line." }),
  tf({ id: "tf-06", moduleId: "m1-structure", topics: ["case-sensitivity"], statement: "`system.out.println(\"Hello\");` compiles correctly.", answer: false, explanation: "The class is `System` with a capital S. `system` is an unknown name → compile error." }),
  tf({ id: "tf-07", moduleId: "m1-structure", topics: ["structure"], statement: "Every Java statement must end with a semicolon `;`.", answer: true, explanation: "Statements end with `;`. Blocks `{ }` and class/method headers don't need one." }),

  // ---------------- Module 2: types, integer division, strings
  tf({ id: "tf-08", moduleId: "m2-variables", topics: ["integer-division"], statement: "The expression `7 / 2` evaluates to `3.5` in Java.", answer: false, explanation: "Both operands are `int`, so this is integer division: the result is `3`." }),
  tf({ id: "tf-09", moduleId: "m2-variables", topics: ["integer-division"], statement: "The expression `7 % 2` evaluates to `1`.", answer: true, explanation: "`%` gives the remainder: 7 = 3·2 + 1." }),
  tf({ id: "tf-10", moduleId: "m2-variables", topics: ["integer-division"], statement: "`5 / 9` evaluates to `0` in Java.", answer: true, explanation: "Integer division: 5 ÷ 9 = 0.55…, decimals dropped → 0. This is why `(5 / 9) * (F - 32)` is always 0." }),
  tf({ id: "tf-11", moduleId: "m2-variables", topics: ["casting"], statement: "`int x = 5.5;` compiles and stores `5` in x.", answer: false, explanation: "It doesn't compile: possible lossy conversion from double to int. You need an explicit cast `(int) 5.5`." }),
  tf({ id: "tf-12", moduleId: "m2-variables", topics: ["casting"], statement: "`(int) 5.7` gives `6` because it rounds to the nearest integer.", answer: false, explanation: "Casting truncates (chops off) the decimals: `(int) 5.7` is `5`." }),
  tf({ id: "tf-13", moduleId: "m2-variables", topics: ["strings"], statement: "`\"Sum: \" + 2 + 3` produces the String `\"Sum: 5\"`.", answer: false, explanation: "Left to right: `\"Sum: \" + 2` is `\"Sum: 2\"`, then `+ 3` → `\"Sum: 23\"`." }),
  tf({ id: "tf-14", moduleId: "m2-variables", topics: ["strings"], statement: "`1 + 2 + \"3\"` produces the String `\"33\"`.", answer: true, explanation: "`1 + 2` is int addition (3), then `3 + \"3\"` is concatenation → `\"33\"`." }),
  tf({ id: "tf-15", moduleId: "m2-variables", topics: ["types"], statement: "`char c = \"A\";` is a valid declaration.", answer: false, explanation: "`\"A\"` is a String. A char literal uses single quotes: `'A'`." }),
  tf({ id: "tf-16", moduleId: "m2-variables", topics: ["integer-division"], statement: "`7 / 2.0` evaluates to `3.5`.", answer: true, explanation: "One operand is a double, so Java does floating-point division." }),
  tf({ id: "tf-17", moduleId: "m2-variables", topics: ["operators"], statement: "After `int x = 10; x /= 4;` the value of x is `2`.", answer: true, explanation: "`x /= 4` is `x = x / 4` → 10 / 4 in int division = 2." }),
  tf({ id: "tf-18", moduleId: "m2-variables", topics: ["operators"], statement: "`2 + 3 * 4` evaluates to `20`.", answer: false, explanation: "`*` has higher precedence: 3 * 4 = 12, then 2 + 12 = 14." }),
  tf({ id: "tf-19", moduleId: "m2-variables", topics: ["types"], statement: "A `boolean` variable can only hold `true` or `false`.", answer: true, explanation: "Unlike some languages, Java does not treat 0/1 as booleans." }),

  // ---------------- Module 3: Scanner
  tf({ id: "tf-20", moduleId: "m3-scanner", topics: ["scanner"], statement: "To use `Scanner` you need `import java.util.*;` (or `import java.util.Scanner;`).", answer: true, explanation: "Scanner lives in the `java.util` package." }),
  tf({ id: "tf-21", moduleId: "m3-scanner", topics: ["scanner"], statement: "`input.next()` reads a whole line of text including spaces.", answer: false, explanation: "`next()` reads one word (up to whitespace). `nextLine()` reads the whole line." }),
  tf({ id: "tf-22", moduleId: "m3-scanner", topics: ["scanner"], statement: "Calling `nextLine()` right after `nextInt()` may return an empty String.", answer: true, explanation: "`nextInt()` leaves the newline in the buffer; `nextLine()` reads up to it immediately. Call `input.nextLine();` once to clear it." }),
  tf({ id: "tf-23", moduleId: "m3-scanner", topics: ["scanner"], statement: "Scanner has a `nextChar()` method for reading a single character.", answer: false, explanation: "There is no `nextChar()`. Use `input.next().charAt(0)`." }),
  tf({ id: "tf-24", moduleId: "m3-scanner", topics: ["scanner"], statement: "`Scanner input = new Scanner(System.in);` creates a Scanner that reads from the keyboard.", answer: true, explanation: "`System.in` is the standard input stream (the keyboard)." }),

  // ---------------- Module 4: conditionals
  tf({ id: "tf-25", moduleId: "m4-conditionals", topics: ["equals"], statement: "To compare the text of two Strings you should use `==`.", answer: false, explanation: "`==` compares references (same object?). Use `s1.equals(s2)` to compare text." }),
  tf({ id: "tf-26", moduleId: "m4-conditionals", topics: ["equals"], statement: "`\"Java\".equals(\"java\")` evaluates to `true`.", answer: false, explanation: "`equals` is case-sensitive. Use `equalsIgnoreCase` to ignore capitals." }),
  tf({ id: "tf-27", moduleId: "m4-conditionals", topics: ["conditionals"], statement: "In an `if / else if / else` chain, every branch whose condition is true is executed.", answer: false, explanation: "Only the FIRST true branch runs; the rest are skipped." }),
  tf({ id: "tf-28", moduleId: "m4-conditionals", topics: ["conditionals"], statement: "`if (0 < t <= 2)` is a valid way to test a range in Java.", answer: false, explanation: "`0 < t` is a boolean, and a boolean can't be compared with `<= 2`. Write `t > 0 && t <= 2`." }),
  tf({ id: "tf-29", moduleId: "m4-conditionals", topics: ["conditionals"], code: java`
int x = 3;
if (x > 10);
    System.out.println("Big");`, statement: "The code above prints nothing.", answer: false, explanation: "The `;` after `if (x > 10)` is an empty statement that forms the if-body. The println is a separate statement and always runs → prints `Big`." }),
  tf({ id: "tf-30", moduleId: "m4-conditionals", topics: ["switch"], statement: "In a `switch`, if you forget `break`, execution continues into the next case.", answer: true, explanation: "This is called fall-through." }),
  tf({ id: "tf-31", moduleId: "m4-conditionals", topics: ["conditionals"], statement: "`x = 5` compares x with 5.", answer: false, explanation: "`=` assigns. `==` compares." }),
  tf({ id: "tf-32", moduleId: "m4-conditionals", topics: ["conditionals"], statement: "`!(x > 5)` is equivalent to `x <= 5`.", answer: true, explanation: "The opposite of `>` is `<=`." }),
  tf({ id: "tf-33", moduleId: "m4-conditionals", topics: ["conditionals"], code: java`
int x=5, y=6, z=7;
if(x>3)
    x=x+1;
else
    if(z>y)
        z=z+y;`, statement: "After this code (from Mistery.java), z is 13.", answer: false, explanation: "x>3 is true, so the else branch (with the nested if) is skipped. z stays 7." }),

  // ---------------- Module 5: loops
  tf({ id: "tf-34", moduleId: "m5-loops", topics: ["do-while"], statement: "The body of a `do-while` loop always executes at least once.", answer: true, explanation: "The condition is checked after the body." }),
  tf({ id: "tf-35", moduleId: "m5-loops", topics: ["loops"], statement: "The body of a `while` loop always executes at least once.", answer: false, explanation: "`while` checks first; if the condition is false initially, the body runs 0 times." }),
  tf({ id: "tf-36", moduleId: "m5-loops", topics: ["loops"], statement: "`for (int i = 0; i < 5; i++)` runs its body 5 times.", answer: true, explanation: "i = 0, 1, 2, 3, 4 → 5 times." }),
  tf({ id: "tf-37", moduleId: "m5-loops", topics: ["loops"], statement: "`break` skips only the current iteration and continues with the next one.", answer: false, explanation: "That's `continue`. `break` exits the loop entirely." }),
  tf({ id: "tf-38", moduleId: "m5-loops", topics: ["do-while"], statement: "A `do-while` loop must end with a semicolon after `while (condition)`.", answer: true, explanation: "`do { ... } while (cond);` — the semicolon is required." }),
  tf({ id: "tf-39", moduleId: "m5-loops", topics: ["loops"], statement: "For a positive int n, `n % 10` gives its last digit.", answer: true, explanation: "E.g. 472 % 10 = 2." }),

  // ---------------- Module 6: methods
  tf({ id: "tf-40", moduleId: "m6-methods", topics: ["void", "methods"], statement: "A `void` method returns no value.", answer: true, explanation: "`void` means the method gives nothing back; it can still use `return;` to exit early." }),
  tf({ id: "tf-41", moduleId: "m6-methods", topics: ["void"], statement: "`int x = printHello();` compiles if `printHello` is declared `void`.", answer: false, explanation: "A void method has no value to assign." }),
  tf({ id: "tf-42", moduleId: "m6-methods", topics: ["methods"], statement: "A `return` statement immediately ends the method.", answer: true, explanation: "Nothing after the executed `return` runs in that method." }),
  tf({ id: "tf-43", moduleId: "m6-methods", topics: ["methods"], statement: "If a method changes its int parameter, the caller's variable changes too.", answer: false, explanation: "Primitives are passed by value; the method works on a copy." }),
  tf({ id: "tf-44", moduleId: "m6-methods", topics: ["methods"], statement: "Two methods can have the same name if their parameter lists are different.", answer: true, explanation: "That's overloading, e.g. `max(int, int)` and `max(double, double)`." }),
  tf({ id: "tf-45", moduleId: "m6-methods", topics: ["methods"], statement: "Two methods that differ only in their return type are valid overloads.", answer: false, explanation: "The parameter list must differ; return type alone is not enough." }),
  tf({ id: "tf-46", moduleId: "m6-methods", topics: ["methods"], statement: "Returning a value from a method automatically prints it.", answer: false, explanation: "Returning sends the value back to the caller. Nothing is printed unless you print it." }),
];
