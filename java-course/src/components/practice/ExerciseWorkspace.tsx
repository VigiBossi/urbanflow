"use client";

import { useEffect, useRef, useState } from "react";
import type { CodingExercise } from "@/lib/types";
import { useStore } from "@/lib/store";
import { Markdown, Inline } from "@/components/Markdown";
import { CodeBlock, CopyButton } from "@/components/code/CodeBlock";
import { CodeEditor } from "@/components/code/CodeEditor";
import { Badge, Button, Icon, cx } from "@/components/ui";

function download(filename: string, text: string) {
  const blob = new Blob([text], { type: "text/x-java-source" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function ExerciseWorkspace({ exercise: ex }: { exercise: CodingExercise }) {
  const { state, ready, actions } = useStore();
  const prog = state.progress.exercises[ex.id];
  const [code, setCode] = useState(ex.starterCode);
  const [hintsShown, setHintsShown] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [checks, setChecks] = useState<boolean[]>([]);
  const loaded = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flagged = state.reviewQueue.some((r) => r.id === `exercise:${ex.id}`);
  const className = /public\s+class\s+(\w+)/.exec(ex.starterCode)?.[1] ?? "Main";

  useEffect(() => {
    if (!ready || loaded.current) return;
    loaded.current = true;
    /* eslint-disable react-hooks/set-state-in-effect -- hydrate from async storage */
    if (prog?.code) setCode(prog.code);
    if (prog?.hintsUsed) setHintsShown(prog.hintsUsed);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [ready, prog]);

  const onCode = (v: string) => {
    setCode(v);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      actions.updateExercise(ex.id, {
        code: v,
        status: prog?.status === "solved" ? "solved" : "attempted",
      });
    }, 600);
  };

  const revealHint = () => {
    const n = Math.min(ex.hints.length, hintsShown + 1);
    setHintsShown(n);
    actions.updateExercise(ex.id, { hintsUsed: n, status: prog?.status === "solved" ? "solved" : "attempted" });
  };

  const checklist = [
    "My code compiles (class name matches the file name, every `{` has a `}`, every statement ends with `;`).",
    ...(ex.checklist ?? []),
    "I traced at least one sample input by hand and got the expected output.",
  ];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      {/* Left: the problem */}
      <div className="space-y-5">
        <div className="rounded-xl border border-border bg-surface p-4 sm:p-5">
          <Markdown text={ex.prompt} />
        </div>

        <div>
          <h3 className="mb-2 text-sm font-semibold tracking-wide text-muted uppercase">Sample input / output</h3>
          <div className="space-y-2">
            {ex.samples.map((s, i) => (
              <div key={i} className="grid grid-cols-2 overflow-hidden rounded-lg border border-border text-sm">
                <div className="border-r border-border bg-surface-2">
                  <div className="px-3 pt-2 text-[11px] font-medium tracking-wide text-muted uppercase">Input</div>
                  <pre className="overflow-x-auto px-3 pb-2 font-mono whitespace-pre">{s.input}</pre>
                </div>
                <div className="bg-code">
                  <div className="px-3 pt-2 text-[11px] font-medium tracking-wide text-muted uppercase">Output</div>
                  <pre className="overflow-x-auto px-3 pb-2 font-mono whitespace-pre">{s.output}</pre>
                </div>
              </div>
            ))}
          </div>
        </div>

        {ex.traps && ex.traps.length > 0 && (
          <div className="rounded-xl border border-warn/30 bg-warn-soft/60 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-warn">
              <Icon name="alert" /> Common traps
            </div>
            <ul className="space-y-1.5 text-[15px] text-fg-2">
              {ex.traps.map((t, i) => (
                <li key={i} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-warn" />
                  <span>
                    <Markdown text={t} className="[&>p]:my-0" />
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="rounded-xl border border-border bg-surface p-4">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Icon name="bulb" /> Hints
              <span className="font-normal text-muted">
                {hintsShown}/{ex.hints.length}
              </span>
            </div>
            <Button onClick={revealHint} disabled={hintsShown >= ex.hints.length} className="py-1.5 text-xs">
              {hintsShown === 0 ? "Show a hint" : "Next hint"}
            </Button>
          </div>
          {hintsShown === 0 ? (
            <p className="text-sm text-muted">Stuck? Reveal hints one at a time — try each before taking the next.</p>
          ) : (
            <ol className="space-y-2 text-[15px] text-fg-2">
              {ex.hints.slice(0, hintsShown).map((h, i) => (
                <li key={i} className="flex gap-2">
                  <span className="font-mono text-xs text-muted">{i + 1}.</span>
                  <span>
                    <Inline text={h} />
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>

      {/* Right: editor + self-check + solution */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-mono text-xs text-muted">
            <Icon name="code" /> {className}.java
            {prog?.status === "solved" && <Badge tone="good">Solved</Badge>}
            {prog?.status === "attempted" && <Badge tone="warn">In progress</Badge>}
          </div>
          <div className="flex items-center gap-1">
            <CopyButton text={code} />
            <button
              onClick={() => download(`${className}.java`, code)}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted hover:bg-surface-2 hover:text-fg"
            >
              <Icon name="upload" className="h-3.5 w-3.5 rotate-180" /> .java
            </button>
            <button
              onClick={() => {
                if (confirm("Replace your code with the starter template?")) onCode(ex.starterCode);
              }}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted hover:bg-surface-2 hover:text-fg"
            >
              <Icon name="reset" className="h-3.5 w-3.5" /> Reset
            </button>
          </div>
        </div>
        <CodeEditor value={code} onChange={onCode} minHeight={420} />
        <p className="text-xs text-muted">
          Your code is saved automatically. To run it, download the <code className="inline-code">.java</code> file and use{" "}
          <code className="inline-code">javac {className}.java</code> then <code className="inline-code">java {className}</code>{" "}
          (or paste it into your IDE).
        </p>

        <div className="rounded-xl border border-border bg-surface p-4">
          <div className="mb-2 text-sm font-semibold">Self-check before you peek</div>
          <ul className="space-y-1.5">
            {checklist.map((c, i) => (
              <li key={i}>
                <label className="flex cursor-pointer gap-2.5 text-[15px] text-fg-2">
                  <input
                    type="checkbox"
                    checked={!!checks[i]}
                    onChange={(e) => setChecks((arr) => Object.assign([...arr], { [i]: e.target.checked }))}
                    className="mt-1 accent-[var(--accent)]"
                  />
                  <span>
                    <Inline text={c} />
                  </span>
                </label>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              variant={prog?.status === "solved" ? "secondary" : "primary"}
              onClick={() =>
                actions.updateExercise(ex.id, { status: prog?.status === "solved" ? "attempted" : "solved", code })
              }
            >
              <Icon name="check" /> {prog?.status === "solved" ? "Marked as solved (undo)" : "Mark as solved"}
            </Button>
            <Button onClick={() => actions.setExerciseWeak(ex.id, !flagged)} className={cx(flagged && "text-bad")}>
              <Icon name="flag" /> {flagged ? "Flagged for review" : "Flag for review"}
            </Button>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface">
          <button
            onClick={() => {
              setShowSolution((s) => !s);
              if (!showSolution) actions.updateExercise(ex.id, { solutionViewed: true });
            }}
            className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold"
          >
            <span className="flex items-center gap-2">
              <Icon name="eye" /> Reference solution (Java)
            </span>
            <Icon name={showSolution ? "chevronDown" : "chevron"} />
          </button>
          {showSolution && (
            <div className="space-y-3 border-t border-border p-4">
              <p className="text-sm text-muted">
                Compare line by line with your version. There is more than one correct answer — if yours produces the
                sample outputs, it&apos;s right.
              </p>
              <CodeBlock code={ex.solution} filename={`${className}.java (solution)`} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
