"use client";

import { useState } from "react";
import { SITE } from "@/lib/config";
import type { FilterState, SortKey } from "./Controls";

export type MobileView = "list" | "gallery" | "map";

/** Tap order for the view button; its icon previews the NEXT view. */
const NEXT_VIEW: Record<MobileView, MobileView> = {
  list: "gallery",
  gallery: "map",
  map: "list",
};

const VIEW_ICON: Record<MobileView, React.ReactNode> = {
  list: <span className="text-lg">☰</span>,
  gallery: <span className="text-lg">▦</span>,
  map: (
    <svg
      viewBox="0 0 24 24"
      className="h-[18px] w-[18px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 21c-4.5-4.5-7-8-7-11a7 7 0 1 1 14 0c0 3-2.5 6.5-7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  ),
};

const SORTS: { key: SortKey; label: string }[] = [
  { key: "score", label: "Top rated" },
  { key: "recent", label: "Newest" },
  { key: "name", label: "A–Z" },
];

/**
 * Mobile filter bar: an always-visible search, a segmented All/Loved toggle,
 * a "More" button that expands a panel (Sort, Area), and a single button
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

        {/* Filter toggle (opens the Sort/Area/Theme panel) */}
        <button
          onClick={() => setMoreOpen((o) => !o)}
          aria-label="Filters"
          aria-expanded={moreOpen}
          className={`flex h-10 w-11 flex-none items-center justify-center rounded-pill border-[1.5px] ${moreOpen ? "border-ink bg-ink text-bg" : "border-line text-ink"}`}
        >
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <line x1="4" y1="7" x2="20" y2="7" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="17" x2="20" y2="17" />
            <circle cx="9" cy="7" r="2.4" fill="var(--bg)" />
            <circle cx="15" cy="12" r="2.4" fill="var(--bg)" />
            <circle cx="8" cy="17" r="2.4" fill="var(--bg)" />
          </svg>
        </button>

        {/* View button cycles list → gallery → map; shows the NEXT view's icon */}
        <button
          onClick={() => onView(NEXT_VIEW[view])}
          aria-label={`Switch to ${NEXT_VIEW[view]} view`}
          className="flex h-10 w-11 flex-none items-center justify-center rounded-pill border-[1.5px] border-line text-ink"
        >
          {VIEW_ICON[NEXT_VIEW[view]]}
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
        </div>
      )}
    </div>
  );
}
