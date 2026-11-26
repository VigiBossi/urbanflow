"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useContext, useState, type ReactNode } from "react";
import { useStore } from "@/lib/store";
import { AddLessonModal } from "@/components/AddLessonModal";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Icon, cx } from "@/components/ui";

const NAV = [
  { href: "/", label: "Dashboard", icon: "home", match: (p: string) => p === "/" || p.startsWith("/modules") },
  { href: "/tracer", label: "Tracer", icon: "step", match: (p: string) => p.startsWith("/tracer") },
  { href: "/practice", label: "Practice", icon: "target", match: (p: string) => p.startsWith("/practice") },
  { href: "/review", label: "Review", icon: "flag", match: (p: string) => p.startsWith("/review") },
];

const AddLessonContext = createContext<() => void>(() => {});
export const useOpenAddLesson = () => useContext(AddLessonContext);

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { state, ready } = useStore();
  const [addOpen, setAddOpen] = useState(false);
  const reviewCount = ready ? state.reviewQueue.length : 0;

  return (
    <AddLessonContext.Provider value={() => setAddOpen(true)}>
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-30 border-b border-border bg-bg/85 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4 sm:px-6">
          <Link href="/" className="flex shrink-0 items-center gap-2 font-semibold tracking-tight">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-accent font-mono text-xs text-accent-fg">{"{}"}</span>
            <span className="hidden sm:inline">Intro to Programming</span>
            <span className="sm:hidden">Java</span>
          </Link>
          <nav className="hidden flex-1 items-center gap-1 md:flex">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={cx(
                  "relative rounded-lg px-3 py-1.5 text-sm transition",
                  n.match(pathname) ? "bg-surface-2 font-medium text-fg" : "text-muted hover:text-fg",
                )}
              >
                {n.label}
                {n.href === "/review" && reviewCount > 0 && (
                  <span className="ml-1.5 rounded-full bg-bad-soft px-1.5 text-xs text-bad">{reviewCount}</span>
                )}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-1">
            <button
              onClick={() => setAddOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-fg-2 hover:bg-surface-2 hover:text-fg"
            >
              <Icon name="plus" />
              <span className="hidden sm:inline">Add lesson</span>
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 pt-6 pb-28 sm:px-6 md:pb-12">{children}</main>

      {/* Mobile bottom navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-bg/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
        <div className="grid grid-cols-4">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={cx(
                "relative flex flex-col items-center gap-0.5 py-2 text-[11px]",
                n.match(pathname) ? "text-accent" : "text-muted",
              )}
            >
              <Icon name={n.icon} className="h-5 w-5" />
              {n.label}
              {n.href === "/review" && reviewCount > 0 && (
                <span className="absolute top-1 right-[calc(50%-18px)] rounded-full bg-bad px-1 text-[10px] leading-4 text-white">
                  {reviewCount}
                </span>
              )}
            </Link>
          ))}
        </div>
      </nav>

      <AddLessonModal open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
    </AddLessonContext.Provider>
  );
}
