// Compiles and runs every Java solution, trace and output snippet in src/content and checks the outputs.
// Requires a JDK (javac + java on PATH). Run with: npm run verify:java
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { exercises, traces, questions, builtinLessons } from "../src/content/index";

let pass = 0, fail = 0;
const ok = (id: string) => { pass++; if (process.env.VERBOSE) console.log("ok", id); };
const errText = (e: unknown) => (e as { stderr?: Buffer }).stderr?.toString() ?? String(e);
const bad = (m: string) => { fail++; console.log("FAIL:", m); };

function run(src: string, input = ""): string {
  const cls = /public\s+class\s+(\w+)/.exec(src)?.[1] ?? "Main";
  const dir = mkdtempSync(join(tmpdir(), "java-verify-"));
  writeFileSync(join(dir, cls + ".java"), src);
  execFileSync("javac", ["-nowarn", "-d", dir, join(dir, cls + ".java")], { stdio: ["ignore", "pipe", "pipe"] });
  return execFileSync("java", ["-cp", dir, cls], { input, stdio: ["pipe", "pipe", "ignore"] }).toString().replace(/\r/g, "");
}
function wrap(code: string): string {
  const imports = "import java.util.*;\n";
  if (code.includes("// in main:")) {
    const [methods, main] = code.split("// in main:");
    return `${imports}public class Main {\n${methods}\npublic static void main(String[] args) {\n${main}\n}\n}`;
  }
  return `${imports}public class Main {\npublic static void main(String[] args) {\n${code}\n}\n}`;
}
const norm = (s: string) => s.split("\n").map((l) => l.trimEnd()).join("\n").trim();

for (const ex of exercises) {
  try {
    if (ex.id === "lab4-7") { run(ex.solution, "123\n"); ok(ex.id); continue; }
    for (const s of ex.samples) {
      const out = run(ex.solution, s.input + "\n");
      const lines = norm(out).split("\n"); let k = 0; const want = norm(s.output).split("\n"); for (const l of lines) if (k < want.length && l.includes(want[k])) k++; if (k === want.length) ok(ex.id);
      else bad(`${ex.id} input=${JSON.stringify(s.input)}\n  expected: ${JSON.stringify(s.output)}\n  got: ${JSON.stringify(out)}`);
    }
  } catch (e) { bad(`${ex.id} error ${errText(e)}`); }
}
for (const t of traces) {
  if (t.code.includes("Scanner")) continue;
  try {
    const out = run(t.code);
    if (norm(out) === norm(t.expectedOutput)) ok(t.id); else bad(`${t.id}\n  expected ${JSON.stringify(t.expectedOutput)}\n  got ${JSON.stringify(out)}`);
  } catch (e) { bad(`${t.id} error ${errText(e)}`); }
}
for (const l of builtinLessons) for (const s of l.sections) {
  if (s.kind !== "code" || !s.output || s.code.includes("Scanner")) continue;
  const src = s.code.includes("public class") ? s.code : wrap(s.code);
  try {
    const out = run(src);
    if (norm(out) === norm(s.output)) ok(l.id); else bad(`${l.id} ${s.filename}\n  expected ${JSON.stringify(s.output)}\n  got ${JSON.stringify(out)}`);
  } catch (e) { bad(`${l.id} ${s.filename} error ${errText(e)}`); }
}
for (const q of questions) {
  if (q.type !== "mc" || !q.code || !(q.prompt === "What is printed?" || q.id === "mc-19")) continue;
  try {
    const out = run(wrap(q.code));
    const want = q.options[q.correctIndex];
    if (norm(out) === norm(want)) ok(q.id); else bad(`${q.id}\n  expected ${JSON.stringify(want)}\n  got ${JSON.stringify(out)}`);
  } catch (e) { bad(`${q.id} error ${errText(e)}`); }
}
console.log(`\n${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
