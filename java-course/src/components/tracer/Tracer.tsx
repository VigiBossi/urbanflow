"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { TraceProgram, VarValue } from "@/lib/types";
import { useStore } from "@/lib/store";
import { CodeBlock } from "@/components/code/CodeBlock";
import { Button, Icon, cx } from "@/components/ui";

const fmt = (v: VarValue) => (typeof v === "boolean" ? String(v) : String(v));
const normOut = (s: string) =>
  s
    .replace(/\r/g, "")
    .split("\n")
    .map((l) => l.replace(/\s+$/, ""))
    .join("\n")
    .trim();

export function Tracer({ trace }: { trace: TraceProgram }) {
  const { actions } = useStore();
  const [mode, setMode] = useState<"step" | "predict">("step");
  const [idx, setIdx] = useState(-1); // -1 = not started
  const [playing, setPlaying] = useState(false);
  const [prediction, setPrediction] = useState("");
  const [checked, setChecked] = useState<null | boolean>(null);
  const recorded = useRef(false);

  const total = trace.steps.length;
  const step = idx >= 0 ? trace.steps[idx] : null;
  const prevVars = idx > 0 ? trace.steps[idx - 1].vars : {};
  const varNames = useMemo(() => {
    const seen: string[] = [];
    for (const s of trace.steps) for (const k of Object.keys(s.vars)) if (!seen.includes(k)) seen.push(k);
    return seen;
  }, [trace]);

  const next = useCallback(() => setIdx((i) => Math.min(total - 1, i + 1)), [total]);
  const back = useCallback(() => setIdx((i) => Math.max(-1, i - 1)), []);
  const reset = () => {
    setIdx(-1);
    setPlaying(false);
  };

  // finish → record progress once
  useEffect(() => {
    if (idx === total - 1 && !recorded.current) {
      recorded.current = true;
      actions.recordTrace(trace.id);
    }
  }, [idx, total, trace.id, actions]);

  // autoplay
  useEffect(() => {
    if (!playing) return;
    if (idx >= total - 1) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- stop autoplay at the end
      setPlaying(false);
      return;
    }
    const t = setTimeout(next, 1100);
    return () => clearTimeout(t);
  }, [playing, idx, total, next]);

  // keyboard
  useEffect(() => {
    if (mode !== "step") return;
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "TEXTAREA" || tag === "INPUT") return;
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") back();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode, next, back]);

  const checkPrediction = () => {
    const ok = normOut(prediction) === normOut(trace.expectedOutput);
    setChecked(ok);
    actions.recordTrace(trace.id, ok);
  };

  return (
    <div>
      <div className="mb-4 inline-flex rounded-xl border border-border bg-surface p-1 text-sm">
        {(
          [
            ["step", "Step through", "step"],
            ["predict", "Predict the output", "target"],
          ] as const
        ).map(([m, label, icon]) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={cx(
              "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5",
              mode === m ? "bg-accent text-accent-fg" : "text-fg-2 hover:text-fg",
            )}
          >
            <Icon name={icon} /> {label}
          </button>
        ))}
      </div>

      {mode === "predict" ? (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <CodeBlock code={trace.code} filename={trace.filename} />
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-surface p-4">
              <label className="mb-2 block text-sm font-semibold" htmlFor="prediction">
                What will this program print?
              </label>
              <p className="mb-3 text-sm text-muted">
                Work it out on paper first, then type the exact output (one line per printed line).
              </p>
              <textarea
                id="prediction"
                value={prediction}
                onChange={(e) => {
                  setPrediction(e.target.value);
                  setChecked(null);
                }}
                rows={5}
                spellCheck={false}
                className="w-full rounded-lg border border-border bg-code p-3 font-mono text-sm outline-none focus:border-accent"
                placeholder="e.g. 6 8 7"
              />
              <div className="mt-3 flex flex-wrap gap-2">
                <Button variant="primary" onClick={checkPrediction} disabled={!prediction.trim()}>
                  <Icon name="check" /> Check my prediction
                </Button>
                <Button onClick={() => setChecked(false)}>
                  <Icon name="eye" /> Just reveal
                </Button>
              </div>
            </div>
            {checked !== null && (
              <div
                className={cx(
                  "rounded-xl border p-4",
                  checked ? "border-good/30 bg-good-soft" : "border-bad/30 bg-bad-soft",
                )}
              >
                <p className={cx("mb-2 font-semibold", checked ? "text-good" : "text-bad")}>
                  {checked ? "Correct — nicely traced!" : prediction.trim() ? "Not quite. Here's the real output:" : "The real output:"}
                </p>
                <pre className="rounded-lg bg-surface p-3 font-mono text-sm whitespace-pre-wrap">{trace.expectedOutput}</pre>
                <Button
                  className="mt-3"
                  onClick={() => {
                    setMode("step");
                    reset();
                  }}
                >
                  <Icon name="step" /> Step through to see why
                </Button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
          <div className="space-y-3">
            <CodeBlock code={trace.code} filename={trace.filename} highlightLine={step?.line} />
            <div className="flex flex-wrap items-center gap-2">
              <Button onClick={reset} aria-label="Reset">
                <Icon name="reset" />
              </Button>
              <Button onClick={back} disabled={idx < 0} aria-label="Previous step">
                <Icon name="back" /> Back
              </Button>
              <Button variant="primary" onClick={next} disabled={idx >= total - 1}>
                {idx < 0 ? "Start" : "Next line"} <Icon name="step" />
              </Button>
              <Button onClick={() => setPlaying((p) => !p)} disabled={idx >= total - 1}>
                <Icon name="play" /> {playing ? "Pause" : "Auto-play"}
              </Button>
              <span className="ml-auto font-mono text-xs text-muted">
                step {Math.max(0, idx + 1)} / {total}
              </span>
            </div>
            <input
              type="range"
              min={-1}
              max={total - 1}
              value={idx}
              onChange={(e) => setIdx(Number(e.target.value))}
              className="w-full accent-[var(--accent)]"
              aria-label="Jump to step"
            />
            <p className="hidden text-xs text-muted sm:block">Tip: use the ← → arrow keys to step.</p>
          </div>

          <div className="space-y-4">
            <div className="min-h-20 rounded-xl border border-accent/30 bg-accent-soft p-4">
              <div className="mb-1 text-xs font-semibold tracking-wide text-accent uppercase">
                {step ? `Line ${step.line}` : "Ready"}
              </div>
              <p className="text-[15px] leading-relaxed text-fg">
                {step
                  ? step.note ?? "Execute this line."
                  : "Press Start (or →) to execute the program one line at a time and watch the variables change."}
              </p>
            </div>

            <div className="overflow-hidden rounded-xl border border-border bg-surface">
              <div className="border-b border-border px-4 py-2 text-xs font-semibold tracking-wide text-muted uppercase">
                Variables
              </div>
              {varNames.length === 0 ? (
                <p className="px-4 py-3 text-sm text-muted">This program has no variables.</p>
              ) : (
                <table className="w-full font-mono text-sm">
                  <tbody className="divide-y divide-border">
                    {varNames.map((name) => {
                      const has = step && name in step.vars;
                      const changed = step?.changed?.includes(name);
                      return (
                        <tr key={`${name}-${idx}`} className={cx(changed && "flash")}>
                          <td className="w-1/2 px-4 py-2 text-fg-2">{name}</td>
                          <td className={cx("px-4 py-2", has ? "text-fg" : "text-muted/50")}>
                            {has ? (
                              <span className="inline-flex items-center gap-2">
                                {fmt(step!.vars[name])}
                                {changed && name in prevVars && (
                                  <span className="text-xs text-muted line-through">{fmt(prevVars[name])}</span>
                                )}
                              </span>
                            ) : (
                              "—"
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            <div className="overflow-hidden rounded-xl border border-border bg-surface">
              <div className="border-b border-border px-4 py-2 text-xs font-semibold tracking-wide text-muted uppercase">
                Console output
              </div>
              <pre className="min-h-16 overflow-x-auto bg-code px-4 py-3 font-mono text-sm whitespace-pre text-fg">
                {step?.output || <span className="text-muted/60">(nothing printed yet)</span>}
              </pre>
            </div>

            {idx === total - 1 && (
              <div className="rounded-xl border border-good/30 bg-good-soft p-4 text-sm">
                <p className="font-semibold text-good">Program finished.</p>
                <p className="mt-1 text-fg-2">
                  Final output: <code className="inline-code">{trace.expectedOutput.split("\n").join(" ⏎ ")}</code>
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
