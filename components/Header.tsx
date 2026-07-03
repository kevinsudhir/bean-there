"use client";

import { SITE } from "@/lib/config";

/**
 * Site header: the kicker lines, the big "Bean There" title with the amber bean
 * glyph (which reveals the "Our Order" note on hover/focus), and the tagline.
 */
export default function Header() {
  return (
    <header className="overflow-x-clip px-6 pt-9 sm:px-16">
      <div className="flex flex-col gap-1 font-mono text-[11px] uppercase tracking-[0.16em] text-amber sm:flex-row sm:justify-between">
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
