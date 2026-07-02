"use client";

import { useTheme } from "./ThemeProvider";

/** Small pill button that flips between light and dark. */
export default function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      className={`inline-flex h-11 items-center gap-1.5 rounded-pill border-[1.5px] border-line px-4 font-mono text-[11px] uppercase tracking-wider text-ink transition-colors hover:border-ink ${className ?? ""}`}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      {theme === "dark" ? "☀ Light" : "☾ Dark"}
    </button>
  );
}
