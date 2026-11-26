"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { tokenizeLines, type Token } from "@/lib/highlight";
import { Icon, cx } from "@/components/ui";

export function Tokens({ tokens }: { tokens: Token[] }) {
  return (
    <>
      {tokens.map((t, i) =>
        t.type === "plain" ? <span key={i}>{t.text}</span> : <span key={i} className={`tok-${t.type}`}>{t.text}</span>,
      )}
    </>
  );
}

export function CopyButton({ text, className }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
        } catch {
          const ta = document.createElement("textarea");
          ta.value = text;
          document.body.appendChild(ta);
          ta.select();
          document.execCommand("copy");
          ta.remove();
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 1400);
      }}
      className={cx(
        "inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted transition hover:bg-surface-2 hover:text-fg",
        className,
      )}
      aria-label="Copy code"
    >
      <Icon name={copied ? "check" : "copy"} className="h-3.5 w-3.5" />
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

export function CodeBlock({
  code,
  filename,
  output,
  traceId,
  highlightLine,
  showLineNumbers = true,
  className,
  compact,
}: {
  code: string;
  filename?: string;
  output?: string;
  traceId?: string;
  highlightLine?: number;
  showLineNumbers?: boolean;
  className?: string;
  compact?: boolean;
}) {
  const lines = useMemo(() => tokenizeLines(code), [code]);
  const [showOutput, setShowOutput] = useState(false);
  return (
    <div className={cx("overflow-hidden rounded-xl border border-border bg-code", className)}>
      <div className="flex items-center justify-between gap-2 border-b border-border bg-surface px-3 py-1.5">
        <div className="flex min-w-0 items-center gap-2 font-mono text-xs text-muted">
          <Icon name="code" className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{filename ?? "Java"}</span>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {traceId && (
            <Link
              href={`/tracer/${traceId}`}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-accent hover:bg-accent-soft"
            >
              <Icon name="step" className="h-3.5 w-3.5" /> Trace it
            </Link>
          )}
          <CopyButton text={code} />
        </div>
      </div>
      <pre className={cx("overflow-x-auto font-mono text-[13px] leading-[1.65]", compact ? "py-2" : "py-3")}>
        <code className="block min-w-max">
          {lines.map((toks, i) => (
            <div
              key={i}
              className={cx(
                "flex pr-4",
                highlightLine === i + 1 && "bg-accent-soft shadow-[inset_3px_0_0_var(--accent)]",
              )}
            >
              {showLineNumbers && (
                <span className="w-10 shrink-0 pr-3 text-right text-muted/60 select-none">{i + 1}</span>
              )}
              <span className={cx(!showLineNumbers && "pl-4")}>
                <Tokens tokens={toks} />
                {toks.length === 0 && "​"}
              </span>
            </div>
          ))}
        </code>
      </pre>
      {output !== undefined && (
        <div className="border-t border-border">
          <button
            onClick={() => setShowOutput((s) => !s)}
            className="flex w-full items-center gap-1.5 px-3 py-2 text-left text-xs font-medium text-muted hover:text-fg"
          >
            <Icon name={showOutput ? "chevronDown" : "chevron"} className="h-3.5 w-3.5" />
            {showOutput ? "Output" : "Predict the output, then click to reveal"}
          </button>
          {showOutput && (
            <pre className="overflow-x-auto bg-surface px-4 pb-3 font-mono text-[13px] whitespace-pre text-fg">{output}</pre>
          )}
        </div>
      )}
    </div>
  );
}
