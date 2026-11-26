"use client";

import { Fragment, useLayoutEffect, useMemo, useRef, type KeyboardEvent } from "react";
import { tokenizeLines } from "@/lib/highlight";
import { Tokens } from "./CodeBlock";

/**
 * Lightweight Java editor: a transparent <textarea> layered over a highlighted <pre>.
 * Tab inserts 4 spaces, Enter keeps indentation (and indents after "{").
 */
export function CodeEditor({
  value,
  onChange,
  minHeight = 360,
  label = "Java code editor",
}: {
  value: string;
  onChange: (v: string) => void;
  minHeight?: number;
  label?: string;
}) {
  const taRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const gutterRef = useRef<HTMLPreElement>(null);
  const pendingCaret = useRef<number | null>(null);

  // Restore the caret synchronously after a programmatic edit (before the next keystroke can land).
  useLayoutEffect(() => {
    const ta = taRef.current;
    if (ta && pendingCaret.current !== null) {
      ta.selectionStart = ta.selectionEnd = pendingCaret.current;
      pendingCaret.current = null;
    }
  }, [value]);
  const lines = useMemo(() => tokenizeLines(value), [value]);

  const syncScroll = () => {
    if (taRef.current && preRef.current) {
      preRef.current.scrollTop = taRef.current.scrollTop;
      preRef.current.scrollLeft = taRef.current.scrollLeft;
      if (gutterRef.current) gutterRef.current.scrollTop = taRef.current.scrollTop;
    }
  };

  const insert = (text: string, selStart: number, selEnd: number, caretOffset = text.length) => {
    pendingCaret.current = selStart + caretOffset;
    onChange(value.slice(0, selStart) + text + value.slice(selEnd));
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    const ta = e.currentTarget;
    const { selectionStart: s, selectionEnd: en } = ta;
    if (e.key === "Tab" && !e.shiftKey) {
      e.preventDefault();
      insert("    ", s, en);
    } else if (e.key === "Enter" && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      const lineStart = value.lastIndexOf("\n", s - 1) + 1;
      const indent = /^[ \t]*/.exec(value.slice(lineStart, s))?.[0] ?? "";
      const before = value.slice(0, s).trimEnd();
      const extra = before.endsWith("{") ? "    " : "";
      const after = value.slice(en);
      if (extra && /^[ \t]*\}/.test(after)) {
        // put closing brace on its own line
        const text = "\n" + indent + extra + "\n" + indent;
        insert(text, s, en, 1 + indent.length + extra.length);
      } else {
        insert("\n" + indent + extra, s, en);
      }
    } else if (e.key === "}") {
      // auto-dedent a line that only has whitespace
      const lineStart = value.lastIndexOf("\n", s - 1) + 1;
      const linePrefix = value.slice(lineStart, s);
      if (/^ {4,}$/.test(linePrefix)) {
        e.preventDefault();
        pendingCaret.current = s - 3;
        onChange(value.slice(0, s - 4) + "}" + value.slice(en));
      }
    }
  };

  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-code" style={{ height: minHeight }}>
      <pre
        ref={gutterRef}
        aria-hidden
        className="editor-layer pointer-events-none absolute inset-y-0 left-0 w-11 overflow-hidden border-r border-border bg-surface/60 text-right text-muted/60 select-none"
        style={{ paddingLeft: 0, paddingRight: 10 }}
      >
        {lines.map((_, i) => i + 1).join("\n")}
      </pre>
      <pre
        ref={preRef}
        aria-hidden
        className="editor-layer pointer-events-none absolute inset-0 overflow-hidden text-fg"
        style={{ paddingLeft: 56 }}
      >
        {lines.map((toks, i) => (
          <Fragment key={i}>
            <Tokens tokens={toks} />
            {i < lines.length - 1 ? "\n" : " "}
          </Fragment>
        ))}
      </pre>
      <textarea
        ref={taRef}
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        onScroll={syncScroll}
        spellCheck={false}
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
        wrap="off"
        className="editor-layer absolute inset-0 h-full w-full resize-none overflow-auto bg-transparent text-transparent caret-[var(--fg)] outline-none"
        style={{ paddingLeft: 56 }}
      />
    </div>
  );
}
