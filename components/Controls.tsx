"use client";

import { tagEmoji, tagHash } from "@/lib/config";
import ThemeToggle from "./ThemeToggle";

export type SortKey = "score" | "recent" | "name" | "nearest";

export interface FilterState {
  q: string;
  sort: SortKey;
  area: string; // "all" or an area name
  lovedOnly: boolean;
  tags: string[]; // selected vibe tags (AND)
}

const SORTS: { key: SortKey; label: string }[] = [
  { key: "score", label: "Top rated" },
  { key: "recent", label: "Newest" },
  { key: "name", label: "A–Z" },
  { key: "nearest", label: "Nearest" },
];

export type DesktopView = "grid" | "map";

/** The desktop controls row: search, sort, area, the Loved badge, view, theme. */
export default function Controls({
  state,
  onChange,
  areas,
  allTags,
  view,
  onView,
  shown,
  total,
  onRandom,
}: {
  state: FilterState;
  onChange: (next: FilterState) => void;
  areas: string[];
  allTags: string[];
  view: DesktopView;
  onView: (v: DesktopView) => void;
  shown: number;
  total: number;
  onRandom: () => void;
}) {
  const set = (patch: Partial<FilterState>) => onChange({ ...state, ...patch });
  const toggleTag = (t: string) =>
    set({
      tags: state.tags.includes(t)
        ? state.tags.filter((x) => x !== t)
        : [...state.tags, t],
    });

  const chip = (active: boolean) =>
    `rounded-pill border-[1.5px] px-3 py-1.5 font-mono text-[10px] uppercase tracking-wide leading-none transition-colors cursor-pointer ${
      active ? "border-ink bg-ink text-bg" : "border-line text-ink"
    }`;

  return (
    <div className="flex flex-wrap items-center gap-x-[22px] gap-y-3.5 px-6 pt-6 sm:px-16">
      <input
        value={state.q}
        onChange={(e) => set({ q: e.target.value })}
        placeholder="Search cafés…"
        className="h-11 w-[190px] rounded-pill border-[1.5px] border-line bg-transparent px-4 font-mono text-xs text-ink outline-none focus:border-ink placeholder:uppercase placeholder:tracking-wide placeholder:text-dim"
      />

      <div className="flex h-11 items-center gap-2 rounded-pill border-[1.5px] border-line pl-4 pr-2">
        <span className="font-mono text-xs uppercase tracking-wide text-dim">
          Sort
        </span>
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

      <div className="flex h-11 items-center gap-2 rounded-pill border-[1.5px] border-line pl-4 pr-2">
        <span className="font-mono text-xs uppercase tracking-wide text-dim">
          Area
        </span>
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

      <button
        onClick={() => set({ lovedOnly: !state.lovedOnly })}
        className={`h-11 rounded-pill border-[1.5px] px-4 font-mono text-[10px] uppercase tracking-wide ${
          state.lovedOnly
            ? "border-amber bg-amber text-white"
            : "border-line text-ink"
        }`}
      >
        ★ Loved
      </button>

      {allTags.length > 0 && (
        <div className="flex items-center gap-2 rounded-pill border-[1.5px] border-line py-1.5 pl-4 pr-2">
          <span className="font-mono text-xs uppercase tracking-wide text-dim">
            Vibe
          </span>
          {allTags.map((t) => (
            <button
              key={t}
              onClick={() => toggleTag(t)}
              className={chip(state.tags.includes(t))}
            >
              {tagEmoji(t) ? `${tagEmoji(t)} ` : ""}
              {tagHash(t)}
            </button>
          ))}
        </div>
      )}

      <div className="ml-auto flex flex-wrap items-center gap-x-[22px] gap-y-3.5">
        <span className="font-mono text-[10px] uppercase tracking-widest text-dim">
          {shown === total ? `${total} cafés` : `${shown} of ${total}`}
        </span>

        <button
          onClick={onRandom}
          disabled={shown === 0}
          className="h-11 rounded-pill border-[1.5px] border-line px-4 font-mono text-[10px] uppercase tracking-wide text-ink hover:border-ink disabled:opacity-40"
        >
          ☕ Surprise me
        </button>

        <div className="flex h-11 items-center gap-2 rounded-pill border-[1.5px] border-line px-2">
          <button
            onClick={() => onView("grid")}
            className={chip(view === "grid")}
          >
            Grid
          </button>
          <button onClick={() => onView("map")} className={chip(view === "map")}>
            Map
          </button>
        </div>

        <ThemeToggle />
      </div>
    </div>
  );
}
