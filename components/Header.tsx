"use client";

import { SITE } from "@/lib/config";
import { useTheme } from "./ThemeProvider";

/**
 * Site header: the kicker lines, the big "Bean There" title with the amber bean
 * glyph (which reveals the "Our Order" note on hover/focus), and the tagline.
 * On mobile the theme toggle sits top-right here (desktop has it in Controls);
 * the kicker stays stacked until md so it never collides with that toggle.
 */
export default function Header() {
  const { theme, toggle } = useTheme();
  return (
    <header className="relative overflow-x-clip px-6 pt-9 sm:px-16">
      <button
        onClick={toggle}
        aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        className="absolute right-4 top-4 flex h-7 items-center rounded-pill border-[1.5px] border-line px-2.5 font-mono text-[9px] uppercase tracking-wide text-ink md:hidden"
      >
        {theme === "dark" ? "☀ Light" : "☾ Dark"}
      </button>
      <div className="flex flex-col gap-1 font-mono text-[11px] uppercase tracking-[0.16em] text-amber md:flex-row md:justify-between">
        <span>{SITE.kickerLeft}</span>
        <span>{SITE.kickerRight}</span>
      </div>

      <h1 className="mb-3 mt-1.5 flex flex-wrap items-center font-display text-[clamp(40px,7vw,104px)] font-extrabold uppercase leading-[0.84] tracking-tight">
        Bean&nbsp;There
        <span
          tabIndex={0}
          aria-label="Our order"
          className="group relative ml-1.5 inline-flex cursor-help outline-none"
        >
          <svg viewBox="0 0 40 50" className="h-[0.62em] w-[0.5em]">
            <ellipse cx="20" cy="25" rx="15" ry="23" fill="var(--amber)" />
            <path
              d="M20,4 C12,16 12,34 20,46"
              fill="none"
              stroke="var(--bg)"
              strokeWidth="3.4"
            />
          </svg>
          <span className="pointer-events-none invisible absolute left-1/2 top-[calc(100%+10px)] z-30 w-[min(420px,calc(100vw-3rem))] -translate-x-1/2 rounded-2xl border-[1.5px] border-line bg-card px-5 py-4 text-left font-voice text-base normal-case italic leading-relaxed tracking-normal text-ink opacity-0 transition-opacity group-hover:visible group-hover:opacity-100 group-focus:visible group-focus:opacity-100">
            <b className="mb-2 block font-display text-[13px] font-extrabold not-italic uppercase tracking-wider text-amber">
              Our Order
            </b>
            {SITE.ourOrder}
          </span>
        </span>
      </h1>

      <p className="max-w-[600px] font-voice text-[clamp(16px,2vw,21px)] italic text-dim">
        {SITE.tagline}
      </p>
    </header>
  );
}
