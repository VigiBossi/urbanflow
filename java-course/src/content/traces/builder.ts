import type { TraceProgram, TraceStep, VarValue } from "../../lib/types";

/** Authoring format: point at a line by (unique) source text instead of a line number. */
export interface StepSpec {
  at: string; // text that appears on the line (first match, or nth match)
  nth?: number; // 1-based occurrence when `at` appears on several lines
  set?: Record<string, VarValue>;
  unset?: string[];
  print?: string; // text appended to stdout (include "\n" for println)
  note?: string;
}

export function lineOf(code: string, needle: string, nth = 1): number {
  const lines = code.split("\n");
  let seen = 0;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(needle)) {
      seen++;
      if (seen === nth) return i + 1;
    }
  }
  throw new Error(`Trace line not found: "${needle}" (#${nth})`);
}

export function buildTrace(
  meta: Omit<TraceProgram, "steps" | "expectedOutput"> & { expectedOutput?: string },
  specs: StepSpec[],
): TraceProgram {
  let vars: Record<string, VarValue> = {};
  let output = "";
  const steps: TraceStep[] = specs.map((s) => {
    const changed: string[] = [];
    if (s.unset) {
      vars = { ...vars };
      for (const k of s.unset) delete vars[k];
    }
    if (s.set) {
      vars = { ...vars };
      for (const [k, v] of Object.entries(s.set)) {
        if (vars[k] !== v || !(k in vars)) changed.push(k);
        vars[k] = v;
      }
    }
    if (s.print) output += s.print;
    return {
      line: lineOf(meta.code, s.at, s.nth),
      vars: { ...vars },
      changed,
      output,
      note: s.note,
    };
  });
  return { ...meta, steps, expectedOutput: meta.expectedOutput ?? output.replace(/\n$/, "") };
}
