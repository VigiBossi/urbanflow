"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useStore } from "@/lib/store";
import { getAllModules } from "@/lib/progress";
import { readImportedFile, type ImportedFile } from "@/lib/fileImport";
import type { Lesson, LessonSection, Module } from "@/lib/types";
import { newTimestamp } from "@/lib/ids";
import { Button, Icon, Modal } from "@/components/ui";

const NEW = "__new__";

/** Split pasted notes into text sections and ```java fenced code sections. */
function notesToSections(notes: string): LessonSection[] {
  const sections: LessonSection[] = [];
  const re = /```[a-zA-Z]*\n([\s\S]*?)```/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(notes))) {
    const before = notes.slice(last, m.index).trim();
    if (before) sections.push({ kind: "text", markdown: before });
    sections.push({ kind: "code", code: m[1].replace(/\s+$/, "") });
    last = m.index + m[0].length;
  }
  const rest = notes.slice(last).trim();
  if (rest) sections.push({ kind: "text", markdown: rest });
  return sections;
}

export function AddLessonModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const { state, actions } = useStore();
  const modules = getAllModules(state);
  const [title, setTitle] = useState("");
  const [moduleId, setModuleId] = useState<string>(NEW);
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [files, setFiles] = useState<ImportedFile[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const reset = () => {
    setTitle("");
    setModuleId(NEW);
    setNewModuleTitle("");
    setNotes("");
    setFiles([]);
    setError(null);
  };

  const onFiles = async (list: FileList | null) => {
    if (!list?.length) return;
    setBusy(true);
    setError(null);
    try {
      const read: ImportedFile[] = [];
      for (const f of Array.from(list)) {
        if (!/\.(java|pdf|txt|md)$/i.test(f.name)) {
          setError(`Skipped ${f.name}: only .java, .pdf, .txt and .md files are supported.`);
          continue;
        }
        read.push(await readImportedFile(f));
      }
      setFiles((prev) => [...prev, ...read]);
      if (!title && read[0]) setTitle(read[0].name.replace(/\.(java|pdf|txt|md)$/i, ""));
    } catch (e) {
      setError(`Could not read file: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setBusy(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  };

  const canSave = title.trim() && (notes.trim() || files.length) && (moduleId !== NEW || newModuleTitle.trim());

  const save = () => {
    if (!canSave) return;
    const ts = newTimestamp();
    let newModule: Module | undefined;
    let targetModuleId = moduleId;
    if (moduleId === NEW) {
      const order = Math.max(...modules.map((m) => m.order)) + 1;
      newModule = {
        id: `user-mod-${ts}`,
        order,
        title: newModuleTitle.trim(),
        shortTitle: newModuleTitle.trim(),
        summary: "Added by you.",
        lessonIds: [],
        exerciseIds: [],
        traceIds: [],
        source: "user",
      };
      targetModuleId = newModule.id;
    }
    const sections: LessonSection[] = [...notesToSections(notes)];
    for (const f of files) {
      if (f.kind === "java") sections.push({ kind: "code", filename: f.name, code: f.text.trimEnd() });
      else sections.push({ kind: "text", heading: f.name, markdown: f.text });
    }
    const words = sections.reduce((n, s) => n + ("markdown" in s ? s.markdown.split(/\s+/).length : 0), 0);
    const lesson: Lesson = {
      id: `user-${ts}`,
      moduleId: targetModuleId,
      title: title.trim(),
      minutes: Math.max(3, Math.round(words / 180) + sections.filter((s) => s.kind === "code").length * 2),
      sections,
      source: "user",
      createdAt: new Date().toISOString(),
    };
    actions.addUserLesson(lesson, newModule);
    reset();
    onClose();
    router.push(`/modules/${targetModuleId}/${lesson.id}`);
  };

  const field = "w-full rounded-lg border border-border bg-bg px-3 py-2 text-[15px] outline-none focus:border-accent";

  return (
    <Modal open={open} onClose={onClose} title="Add a new lesson" wide>
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="al-title">
            Lesson title
          </label>
          <input id="al-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Arrays — declaring and looping" className={field} />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="al-module">
              Module
            </label>
            <select id="al-module" value={moduleId} onChange={(e) => setModuleId(e.target.value)} className={field}>
              <option value={NEW}>+ New module…</option>
              {modules.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.order}. {m.shortTitle}
                </option>
              ))}
            </select>
          </div>
          {moduleId === NEW && (
            <div>
              <label className="mb-1 block text-sm font-medium" htmlFor="al-newmod">
                New module name
              </label>
              <input id="al-newmod" value={newModuleTitle} onChange={(e) => setNewModuleTitle(e.target.value)} placeholder="e.g. Arrays, OOP" className={field} />
            </div>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="al-notes">
            Paste your notes
          </label>
          <textarea
            id="al-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={8}
            placeholder={"Paste lecture notes here. Markdown works: **bold**, `code`, - lists.\n\nWrap Java code in ```java ... ``` to get a highlighted code block with a copy button."}
            className={`${field} font-mono text-sm`}
          />
        </div>

        <div>
          <div className="mb-1 text-sm font-medium">…or upload files</div>
          <button
            onClick={() => fileInput.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              void onFiles(e.dataTransfer.files);
            }}
            className="flex w-full flex-col items-center gap-1 rounded-xl border border-dashed border-border px-4 py-6 text-sm text-muted hover:border-accent hover:text-fg"
          >
            <Icon name="upload" className="h-5 w-5" />
            {busy ? "Reading…" : "Click or drop .java, .pdf, .txt, .md files"}
          </button>
          <input
            ref={fileInput}
            type="file"
            multiple
            accept=".java,.pdf,.txt,.md,text/plain,application/pdf"
            className="hidden"
            onChange={(e) => void onFiles(e.target.files)}
          />
          {files.length > 0 && (
            <ul className="mt-2 space-y-1">
              {files.map((f, i) => (
                <li key={i} className="flex items-center justify-between rounded-lg bg-surface-2 px-3 py-1.5 text-sm">
                  <span className="truncate font-mono">
                    {f.name} <span className="text-muted">· {f.kind === "java" ? "code block" : `${f.text.length.toLocaleString()} chars of text`}</span>
                  </span>
                  <button onClick={() => setFiles((arr) => arr.filter((_, j) => j !== i))} className="text-muted hover:text-bad" aria-label={`Remove ${f.name}`}>
                    <Icon name="x" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          {error && <p className="mt-2 text-sm text-bad">{error}</p>}
        </div>

        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={save} disabled={!canSave || busy}>
            Create lesson
          </Button>
        </div>
      </div>
    </Modal>
  );
}
