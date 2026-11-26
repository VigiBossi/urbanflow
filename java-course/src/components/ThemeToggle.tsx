"use client";

import { Icon } from "@/components/ui";

export function ThemeToggle() {
  const toggle = () => {
    const isDark = document.documentElement.classList.toggle("dark");
    try {
      localStorage.setItem("theme", isDark ? "dark" : "light");
    } catch {
      /* ignore */
    }
  };
  return (
    <button
      onClick={toggle}
      className="rounded-lg p-2 text-fg-2 hover:bg-surface-2 hover:text-fg"
      aria-label="Toggle light / dark mode"
      title="Toggle light / dark mode"
    >
      <span className="dark:hidden">
        <Icon name="moon" />
      </span>
      <span className="hidden dark:inline">
        <Icon name="sun" />
      </span>
    </button>
  );
}
