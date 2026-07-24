"use client";

import type { Scores } from "@/lib/types";
import { SCORE_CATEGORIES } from "@/lib/types";
import { label } from "./shared";

/** The five category scores, each as a number input + slider pair. */
export default function ScoresSection({
  scores,
  overall,
  loved,
  onScore,
}: {
  scores: Scores;
  overall: number;
  loved: boolean;
  onScore: (cat: keyof Scores, value: number) => void;
}) {
  return (
    <div>
      <label className={label}>Scores</label>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {SCORE_CATEGORIES.map((cat) => (
          <div
            key={cat}
            className="flex flex-col items-center rounded-lg bg-card p-3"
          >
            <span className="font-mono text-[10px] uppercase tracking-wide text-dim">
              {cat}
            </span>
            <input
              type="number"
              min={0}
              max={5}
              step={0.1}
              value={scores[cat]}
              onChange={(e) => onScore(cat, Number(e.target.value))}
              aria-label={`${cat} score`}
              className="my-1 w-16 rounded-md border-[1.5px] border-line bg-transparent text-center font-display text-xl font-extrabold text-ink outline-none focus:border-amber"
            />
            <input
              type="range"
              min={0}
              max={5}
              step={0.1}
              value={scores[cat]}
              onChange={(e) => onScore(cat, Number(e.target.value))}
              aria-label={`${cat} slider`}
              className="w-full accent-amber"
            />
          </div>
        ))}
      </div>
      <div className="mt-2 font-mono text-xs text-amber">
        Overall {overall.toFixed(1)} / 5{loved ? " — ★ Loved" : ""}
      </div>
    </div>
  );
}
