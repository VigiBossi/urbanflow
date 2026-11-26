import type { LessonSection } from "@/lib/types";
import { Markdown, Inline } from "@/components/Markdown";
import { CodeBlock } from "@/components/code/CodeBlock";
import { Icon } from "@/components/ui";

export function TrapCallout({ title, markdown, code }: { title: string; markdown: string; code?: string }) {
  return (
    <aside className="rounded-xl border border-warn/30 bg-warn-soft/60 p-4">
      <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-warn">
        <Icon name="alert" className="h-4 w-4" />
        Common Trap: <span className="font-semibold text-fg"><Inline text={title} /></span>
      </div>
      <Markdown text={markdown} className="text-[15px]" />
      {code && <CodeBlock code={code} className="mt-3" compact />}
    </aside>
  );
}

export function LessonSections({ sections }: { sections: LessonSection[] }) {
  return (
    <div className="space-y-6">
      {sections.map((s, i) => {
        switch (s.kind) {
          case "text":
            return (
              <section key={i}>
                {s.heading && <h2 className="mb-1 text-lg font-semibold text-fg">{s.heading}</h2>}
                <Markdown text={s.markdown} />
              </section>
            );
          case "keypoints":
            return (
              <section key={i} className="rounded-xl border border-border bg-surface p-4 sm:p-5">
                {s.heading && <h2 className="mb-2 text-sm font-semibold tracking-wide text-muted uppercase">{s.heading}</h2>}
                <ul className="space-y-2">
                  {s.items.map((it, j) => (
                    <li key={j} className="flex gap-2.5 leading-relaxed text-fg-2">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                      <span>
                        <Inline text={it} />
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            );
          case "code":
            return (
              <section key={i}>
                {s.caption && <p className="mb-2 text-sm text-muted"><Inline text={s.caption} /></p>}
                <CodeBlock code={s.code} filename={s.filename} output={s.output} traceId={s.traceId} />
              </section>
            );
          case "trap":
            return <TrapCallout key={i} title={s.title} markdown={s.markdown} code={s.code} />;
          case "table":
            return (
              <section key={i}>
                {s.heading && <h2 className="mb-2 text-lg font-semibold text-fg">{s.heading}</h2>}
                <div className="overflow-x-auto rounded-xl border border-border">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-surface-2 text-xs tracking-wide text-muted uppercase">
                      <tr>
                        {s.headers.map((h, j) => (
                          <th key={j} className="px-3 py-2 font-medium">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border bg-surface">
                      {s.rows.map((r, j) => (
                        <tr key={j}>
                          {r.map((c, k) => (
                            <td key={k} className="px-3 py-2 align-top text-fg-2">
                              <Inline text={c} />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            );
        }
      })}
    </div>
  );
}
