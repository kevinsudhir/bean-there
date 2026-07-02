"use client";

import { useState } from "react";
import { SITE } from "@/lib/config";
import type { FilterState, SortKey } from "./Controls";
import { useTheme } from "./ThemeProvider";

export type MobileView = "list" | "gallery";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "score", label: "Top rated" },
  { key: "recent", label: "Newest" },
  { key: "name", label: "A–Z" },
];

/**
 * Mobile filter bar: an always-visible search, a segmented All/Loved toggle,
 * a "More" button that expands a panel (Sort, Area, Theme), and a single button
 * that flips between list and gallery views.
 *
 * The filter values live in the parent (passed as `state`/`onChange`). The only
 * state OWNED here is `moreOpen` — a local UI detail, so it belongs here.
 */
export default function MobileControls({
  state,
  onChange,
  areas,
  view,
  onView,
}: {
  state: FilterState;
  onChange: (next: FilterState) => void;
  areas: string[];
  view: MobileView;
  onView: (v: MobileView) => void;
}) {
  const [moreOpen, setMoreOpen] = useState(false);
  const { theme, toggle } = useTheme();

  const set = (patch: Partial<FilterState>) => onChange({ ...state, ...patch });

  const chip = (active: boolean) =>
    `rounded-pill border-[1.5px] px-3 py-2 font-mono text-[10px] uppercase tracking-wide ${
      active ? "border-ink bg-ink text-bg" : "border-line text-ink"
    }`;

  return (
    <div className="sticky top-0 z-20 flex flex-col gap-2.5 bg-bg px-5 pb-2.5 pt-3.5">
      <input
        value={state.q}
        onChange={(e) => set({ q: e.target.value })}
        placeholder="Search cafés…"
        className="h-11 w-full rounded-pill border-[1.5px] border-line bg-transparent px-4 font-mono text-xs text-ink outline-none focus:border-ink placeholder:uppercase placeholder:tracking-wide placeholder:text-dim"
      />

      <div className="flex items-center gap-2">
        {/* Segmented All / Loved */}
        <div className="flex flex-1 overflow-hidden rounded-pill border-[1.5px] border-line">
          <button
            onClick={() => set({ lovedOnly: false })}
            className={`flex-1 py-2.5 font-mono text-[9px] uppercase tracking-wide ${!state.lovedOnly ? "bg-ink text-bg" : "text-ink"}`}
          >
            All cafés
          </button>
          <button
            onClick={() => set({ lovedOnly: true })}
            className={`flex-1 py-2.5 font-mono text-[9px] uppercase tracking-wide ${state.lovedOnly ? "bg-amber text-white" : "text-ink"}`}
          >
            ★ Loved
          </button>
        </div>

        {/* More toggle */}
        <button
          onClick={() => setMoreOpen((o) => !o)}
          className={`rounded-pill border-[1.5px] px-3 py-2.5 font-mono text-[9px] uppercase tracking-wide ${moreOpen ? "border-ink bg-ink text-bg" : "border-line text-ink"}`}
        >
          More {moreOpen ? "▴" : "▾"}
        </button>

        {/* List / gallery view toggle (single button that flips) */}
        <button
          onClick={() => onView(view === "list" ? "gallery" : "list")}
          aria-label="Toggle view"
          className="flex h-10 w-11 flex-none items-center justify-center rounded-pill border-[1.5px] border-line text-lg text-ink"
        >
          {view === "list" ? "▦" : "☰"}
        </button>
      </div>

      {/* Collapsible More panel */}
      {moreOpen && (
        <div className="flex flex-col gap-3 pt-1">
          <div>
            <div className="mb-2 font-mono text-[9px] uppercase tracking-widest text-dim">
              Sort
            </div>
            <div className="flex flex-wrap gap-2">
              {SORTS.map((s) => (
                <button
                  key={s.key}
                  onClick={() => set({ sort: s.key })}
                  className={chip(state.sort === s.key)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 font-mono text-[9px] uppercase tracking-widest text-dim">
              Area
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => set({ area: "all" })}
                className={chip(state.area === "all")}
              >
                All
              </button>
              {areas.map((a) => (
                <button
                  key={a}
                  onClick={() => set({ area: a })}
                  className={chip(state.area === a)}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 font-mono text-[9px] uppercase tracking-widest text-dim">
              Theme
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => theme === "dark" && toggle()}
                className={chip(theme === "light")}
              >
                ☀ Light
              </button>
              <button
                onClick={() => theme === "light" && toggle()}
                className={chip(theme === "dark")}
              >
                ☾ Dark
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
