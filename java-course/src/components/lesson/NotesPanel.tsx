"use client";

import { useEffect, useRef, useState } from "react";
import { useStore } from "@/lib/store";
import { Markdown } from "@/components/Markdown";
import { Icon, cx } from "@/components/ui";

export function NotesPanel({ lessonId, className }: { lessonId: string; className?: string }) {
  const { state, ready, actions } = useStore();
  const saved = state.notes[lessonId];
  const [text, setText] = useState("");
  const [mode, setMode] = useState<"write" | "preview">("write");
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const loadedFor = useRef<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load the saved note once storage is ready (and when switching lessons)
  useEffect(() => {
    if (!ready || loadedFor.current === lessonId) return;
    loadedFor.current = lessonId;
    setText(saved?.markdown ?? "");
  }, [ready, lessonId, saved]);

  const onChange = (v: string) => {
    setText(v);
    setStatus("saving");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      actions.saveNote(lessonId, v);
      setStatus("saved");
    }, 500);
  };

  return (
    <div className={cx("flex flex-col rounded-xl border border-border bg-surface", className)}>
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Icon name="note" /> My notes
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted">
            {status === "saving" ? "Saving…" : status === "saved" ? "Saved" : saved ? "Saved locally" : ""}
          </span>
          <div className="flex rounded-lg bg-surface-2 p-0.5 text-xs">
            {(["write", "preview"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={cx("rounded-md px-2 py-0.5 capitalize", mode === m ? "bg-surface text-fg shadow-sm" : "text-muted")}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>
      {mode === "write" ? (
        <textarea
          value={text}
          onChange={(e) => onChange(e.target.value)}
          placeholder={"Write your own summary, questions for class, or tricky examples…\n\nSupports **bold**, `code` and - lists."}
          className="min-h-64 flex-1 resize-none bg-transparent p-4 text-[15px] leading-relaxed outline-none placeholder:text-muted/70"
        />
      ) : (
        <div className="min-h-64 flex-1 overflow-y-auto p-4">
          {text.trim() ? <Markdown text={text} /> : <p className="text-sm text-muted">Nothing written yet.</p>}
        </div>
      )}
    </div>
  );
}
