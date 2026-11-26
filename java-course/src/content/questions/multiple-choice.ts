import type { MultipleChoiceQuestion } from "../../lib/types";
import { java } from "../helpers";

type MC = Omit<MultipleChoiceQuestion, "type">;
const mc = (q: MC): MultipleChoiceQuestion => ({ type: "mc", ...q });
const OUT = "What is printed?";

export const multipleChoice: MultipleChoiceQuestion[] = [
  // ---------------- Module 1
  mc({ id: "mc-01", moduleId: "m1-structure", topics: ["structure"], prompt: OUT, code: java`
System.out.print("A");
System.out.println("B");
System.out.print("C");`, options: ["A\nB\nC", "AB\nC", "ABC", "A B C"], correctIndex: 1, explanation: "`print` stays on the line → `AB`, then `println` ends the line; `C` goes on the next line." }),
  mc({ id: "mc-02", moduleId: "m1-structure", topics: ["structure"], prompt: "A file is named `Hello.java`. Which class declaration compiles in it?", options: ["public class hello", "public class Hello", "public class HelloWorld", "public Hello class"], correctIndex: 1, explanation: "The public class name must match the file name exactly: `Hello`." }),
  mc({ id: "mc-03", moduleId: "m1-structure", topics: ["structure"], prompt: "Which is the correct main method header?", options: ["public void main(String[] args)", "public static void Main(String[] args)", "public static void main(String[] args)", "static public int main(String args)"], correctIndex: 2, explanation: "`public static void main(String[] args)` — lowercase main, void, String array." }),
  mc({ id: "mc-04", moduleId: "m1-structure", topics: ["structure"], prompt: "Which of these is a multi-line comment?", options: ["// comment", "<!-- comment -->", "/* comment */", "# comment"], correctIndex: 2, explanation: "`/* ... */` can span multiple lines." }),

  // ---------------- Module 2
  mc({ id: "mc-05", moduleId: "m2-variables", topics: ["integer-division"], prompt: OUT, code: java`
int a = 7, b = 2;
System.out.println(a / b + " " + a % b);`, options: ["3.5 1", "3 1", "3 0", "3.5 0"], correctIndex: 1, explanation: "7 / 2 = 3 (int division), 7 % 2 = 1." }),
  mc({ id: "mc-06", moduleId: "m2-variables", topics: ["strings"], prompt: OUT, code: java`
System.out.println("Sum: " + 2 + 3);`, options: ["Sum: 5", "Sum: 23", "Sum: 2 3", "Compile error"], correctIndex: 1, explanation: "Left to right: String + 2 → \"Sum: 2\", then + 3 → \"Sum: 23\"." }),
  mc({ id: "mc-07", moduleId: "m2-variables", topics: ["strings"], prompt: OUT, code: java`
System.out.println(1 + 2 + "3" + 4 + 5);`, options: ["15", "3345", "12345", "339"], correctIndex: 1, explanation: "1 + 2 = 3 (int), then \"3\" → \"33\", + 4 → \"334\", + 5 → \"3345\"." }),
  mc({ id: "mc-08", moduleId: "m2-variables", topics: ["integer-division", "casting"], prompt: OUT, code: java`
double d = 7 / 2;
System.out.println(d);`, options: ["3.5", "3", "3.0", "4.0"], correctIndex: 2, explanation: "7 / 2 is int division → 3, then stored in a double → 3.0." }),
  mc({ id: "mc-09", moduleId: "m2-variables", topics: ["casting"], prompt: OUT, code: java`
int x = (int) 9.99;
System.out.println(x);`, options: ["10", "9", "9.99", "Compile error"], correctIndex: 1, explanation: "Casting to int truncates: 9.99 → 9." }),
  mc({ id: "mc-10", moduleId: "m2-variables", topics: ["operators"], prompt: OUT, code: java`
int x = 10;
x += 5;
x /= 4;
x++;
System.out.println(x);`, options: ["3", "4", "4.75", "5"], correctIndex: 1, explanation: "10 + 5 = 15; 15 / 4 = 3 (int); 3 + 1 = 4." }),
  mc({ id: "mc-11", moduleId: "m2-variables", topics: ["operators"], prompt: OUT, code: java`
System.out.println(2 + 3 * 4 - 6 / 2);`, options: ["7", "11", "17", "14"], correctIndex: 1, explanation: "3*4 = 12, 6/2 = 3 → 2 + 12 - 3 = 11." }),
  mc({ id: "mc-12", moduleId: "m2-variables", topics: ["types"], prompt: "Which declaration is valid?", options: ["char c = \"B\";", "String s = 'Hi';", "boolean b = 1;", "double d = 5;"], correctIndex: 3, explanation: "An int literal widens to double automatically: d = 5.0. The others mix up quote types or use 1 for a boolean." }),
  mc({ id: "mc-13", moduleId: "m2-variables", topics: ["integer-division"], prompt: OUT, code: java`
System.out.println(17 % 5 + 4 % 7);`, options: ["2", "6", "3", "9"], correctIndex: 1, explanation: "17 % 5 = 2, 4 % 7 = 4 → 6." }),
  mc({ id: "mc-14", moduleId: "m2-variables", topics: ["strings"], prompt: OUT, code: java`
int a = 4, b = 5;
System.out.println("Total: " + (a + b) + a + b);`, options: ["Total: 945", "Total: 18", "Total: 99", "Total: 4545"], correctIndex: 0, explanation: "(a + b) = 9 first, then \"Total: 9\" + 4 + 5 → \"Total: 945\"." }),

  // ---------------- Module 3
  mc({ id: "mc-15", moduleId: "m3-scanner", topics: ["scanner"], prompt: "The user types `Loren Nebiaj` and presses Enter. What does `input.next()` return?", options: ["\"Loren Nebiaj\"", "\"Loren\"", "\"Nebiaj\"", "\"L\""], correctIndex: 1, explanation: "`next()` reads one token, stopping at whitespace." }),
  mc({ id: "mc-16", moduleId: "m3-scanner", topics: ["scanner"], prompt: "How do you read a single character `'C'` or `'F'`?", options: ["input.nextChar()", "input.next().charAt(0)", "input.nextLine().charAt(1)", "(char) input.nextInt()"], correctIndex: 1, explanation: "Scanner has no nextChar(); read a word and take index 0." }),
  mc({ id: "mc-17", moduleId: "m3-scanner", topics: ["scanner"], prompt: "The user enters `20` then `Ana Smith`. What is stored in `name`?", code: java`
int age = input.nextInt();
String name = input.nextLine();`, options: ["\"Ana Smith\"", "\"Ana\"", "\"\" (an empty String)", "It throws an exception"], correctIndex: 2, explanation: "`nextInt()` leaves the newline behind; `nextLine()` reads it and returns \"\". Fix: call `input.nextLine();` before." }),
  mc({ id: "mc-18", moduleId: "m3-scanner", topics: ["scanner"], prompt: "What happens if the user types `3.5` when the program calls `nextInt()`?", options: ["It stores 3", "It stores 4", "It throws InputMismatchException", "It stores 3.5"], correctIndex: 2, explanation: "3.5 is not a valid int token → InputMismatchException." }),

  // ---------------- Module 4
  mc({ id: "mc-19", moduleId: "m4-conditionals", topics: ["conditionals"], prompt: "What does Mistery.java print?", code: java`
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
System.out.println(x+ " " + y + " " + z);`, options: ["6 8 13", "6 8 7", "5 8 7", "6 4 7"], correctIndex: 1, explanation: "x>3 → x = 6 and the whole else (nested if) is skipped, so z stays 7. y>0 → y = 8." }),
  mc({ id: "mc-20", moduleId: "m4-conditionals", topics: ["conditionals"], prompt: OUT, code: java`
int score = 85;
if (score >= 70) System.out.println("C");
else if (score >= 80) System.out.println("B");
else System.out.println("F");`, options: ["B", "C", "C\nB", "F"], correctIndex: 1, explanation: "The first true condition wins: 85 >= 70 → C. The order of the conditions is wrong for grading!" }),
  mc({ id: "mc-21", moduleId: "m4-conditionals", topics: ["conditionals"], prompt: OUT, code: java`
int age = 15;
if (age >= 18)
    System.out.println("Adult");
    System.out.println("Can vote");`, options: ["Nothing", "Adult", "Can vote", "Adult\nCan vote"], correctIndex: 2, explanation: "Without braces only the first statement belongs to the if. \"Can vote\" always prints." }),
  mc({ id: "mc-22", moduleId: "m4-conditionals", topics: ["switch"], prompt: OUT, code: java`
int n = 2;
switch (n) {
    case 1: System.out.print("one ");
    case 2: System.out.print("two ");
    case 3: System.out.print("three ");
            break;
    default: System.out.print("other");
}`, options: ["two ", "two three ", "two three other", "one two three "], correctIndex: 1, explanation: "Starts at case 2, falls through to case 3 (no break), then hits break." }),
  mc({ id: "mc-23", moduleId: "m4-conditionals", topics: ["conditionals"], prompt: "Which condition correctly checks that `t` is in the range (2, 4]?", options: ["2 < t <= 4", "t > 2 || t <= 4", "t > 2 && t <= 4", "t >= 2 && t < 4"], correctIndex: 2, explanation: "Two comparisons joined with &&: greater than 2 AND at most 4." }),
  mc({ id: "mc-24", moduleId: "m4-conditionals", topics: ["equals"], prompt: "Which expression correctly checks whether String `s` contains the text \"yes\"?", options: ["s == \"yes\"", "s.equals(\"yes\")", "s = \"yes\"", "equals(s, \"yes\")"], correctIndex: 1, explanation: "Compare String contents with `.equals()`." }),
  mc({ id: "mc-25", moduleId: "m4-conditionals", topics: ["conditionals"], prompt: OUT, code: java`
int a = 5, b = 10;
if (a > 3 && b < 5)
    System.out.println("X");
else if (a > 3 || b < 5)
    System.out.println("Y");
else
    System.out.println("Z");`, options: ["X", "Y", "Z", "X\nY"], correctIndex: 1, explanation: "a > 3 is true but b < 5 is false → && false. With || one true side is enough → Y." }),
  mc({ id: "mc-26", moduleId: "m4-conditionals", topics: ["integer-division"], prompt: "Why does `double c = (5 / 9) * (f - 32);` always give 0.0?", options: ["f - 32 is negative", "5 / 9 is integer division and equals 0", "double can't store fractions", "Missing a cast to int"], correctIndex: 1, explanation: "5 / 9 = 0 in int division, and 0 times anything is 0. Use 5.0 / 9." }),

  // ---------------- Module 5
  mc({ id: "mc-27", moduleId: "m5-loops", topics: ["loops"], prompt: OUT, code: java`
int sum = 0;
for (int i = 1; i <= 4; i++) {
    sum += i;
}
System.out.println(sum);`, options: ["6", "10", "4", "15"], correctIndex: 1, explanation: "1 + 2 + 3 + 4 = 10." }),
  mc({ id: "mc-28", moduleId: "m5-loops", topics: ["loops"], prompt: "How many times does this loop print?", code: java`
for (int i = 0; i <= 5; i++) {
    System.out.println(i);
}`, options: ["4", "5", "6", "Infinite"], correctIndex: 2, explanation: "i = 0, 1, 2, 3, 4, 5 → 6 times (off-by-one trap)." }),
  mc({ id: "mc-29", moduleId: "m5-loops", topics: ["do-while"], prompt: OUT, code: java`
int n = 10;
do {
    System.out.print(n + " ");
    n++;
} while (n < 5);`, options: ["Nothing", "10 ", "10 11 12 13 14 ", "Infinite loop"], correctIndex: 1, explanation: "do-while runs the body once before checking 11 < 5." }),
  mc({ id: "mc-30", moduleId: "m5-loops", topics: ["loops"], prompt: OUT, code: java`
for (int i = 1; i <= 10; i++) {
    if (i % 3 == 0) continue;
    if (i > 7) break;
    System.out.print(i + " ");
}`, options: ["1 2 4 5 7 ", "1 2 4 5 7 8 ", "3 6 9 ", "1 2 3 4 5 6 7 "], correctIndex: 0, explanation: "Multiples of 3 are skipped; at i = 8 the loop breaks." }),
  mc({ id: "mc-31", moduleId: "m5-loops", topics: ["loops"], prompt: OUT, code: java`
int i = 0;
for (i = 0; i < 3; i++);
{
    System.out.print(i);
}`, options: ["012", "3", "0", "Nothing"], correctIndex: 1, explanation: "The `;` is the empty loop body. After the loop i is 3; the block runs once → 3." }),
  mc({ id: "mc-32", moduleId: "m5-loops", topics: ["loops"], prompt: OUT, code: java`
int n = 1234, r = 0;
while (n > 0) {
    r = r * 10 + n % 10;
    n /= 10;
}
System.out.println(r);`, options: ["1234", "4321", "10", "0"], correctIndex: 1, explanation: "This builds the reversed number digit by digit." }),
  mc({ id: "mc-33", moduleId: "m5-loops", topics: ["loops"], prompt: "How many stars are printed?", code: java`
for (int r = 1; r <= 3; r++)
    for (int c = 1; c <= r; c++)
        System.out.print("*");`, options: ["3", "6", "9", "4"], correctIndex: 1, explanation: "Row 1: 1, row 2: 2, row 3: 3 → 6 stars." }),
  mc({ id: "mc-34", moduleId: "m5-loops", topics: ["loops"], prompt: OUT, code: java`
int x = 1;
while (x < 50) {
    x *= 3;
}
System.out.println(x);`, options: ["27", "81", "50", "243"], correctIndex: 1, explanation: "1 → 3 → 9 → 27 → 81. 81 < 50 is false → stop." }),

  // ---------------- Module 6
  mc({ id: "mc-35", moduleId: "m6-methods", topics: ["methods"], prompt: OUT, code: java`
public static int triple(int n) {
    return n * 3;
}
// in main:
System.out.println(triple(2) + triple(3));`, options: ["15", "69", "6 9", "Compile error"], correctIndex: 0, explanation: "6 + 9 = 15 — both are ints, so + is addition." }),
  mc({ id: "mc-36", moduleId: "m6-methods", topics: ["methods"], prompt: OUT, code: java`
public static void change(int x) {
    x = 100;
}
// in main:
int a = 5;
change(a);
System.out.println(a);`, options: ["100", "5", "0", "Compile error"], correctIndex: 1, explanation: "Pass-by-value: the method changes its own copy, not `a`." }),
  mc({ id: "mc-37", moduleId: "m6-methods", topics: ["void", "methods"], prompt: "Which method header fits a method that prints a greeting and returns nothing?", options: ["public static String greet(String name)", "public static void greet(String name)", "public static greet(String name)", "public void static greet(name)"], correctIndex: 1, explanation: "`void` = no return value." }),
  mc({ id: "mc-38", moduleId: "m6-methods", topics: ["methods"], prompt: OUT, code: java`
public static int f(int n) {
    if (n > 5) return 1;
    return 2;
}
// in main:
System.out.println(f(10) + "" + f(3));`, options: ["3", "12", "21", "11"], correctIndex: 1, explanation: "f(10) returns 1 (return ends the method), f(3) returns 2, \"\" makes it concatenation → 12." }),
  mc({ id: "mc-39", moduleId: "m6-methods", topics: ["methods"], prompt: "Which pair is a valid overload?", options: ["int sum(int a, int b) / double sum(int a, int b)", "int sum(int a, int b) / int sum(int x, int y)", "int sum(int a, int b) / int sum(int a, int b, int c)", "void sum() / int sum()"], correctIndex: 2, explanation: "Overloads must differ in the parameter list (number or types)." }),
  mc({ id: "mc-40", moduleId: "m6-methods", topics: ["methods"], prompt: "Where should helper methods like `isEven` be defined?", options: ["Inside main", "Inside the class, outside main", "Outside the class", "In a comment"], correctIndex: 1, explanation: "Methods are members of the class; they can't be nested inside other methods." }),
];
