"use client";

import type { Cafe } from "@/lib/types";
import { overallScore, isLoved } from "@/lib/config";
import WallCup from "./WallCup";

/**
 * A single cafe on the wall, as a bordered card: the ceramic cup filled to its
 * overall score, name, area, score, and the "Loved" badge. On hover the cup
 * lifts slightly (see the .wallcup rules in globals.css). Clicking opens the
 * review via onOpen.
 */
export default function CafeCard({
  cafe,
  onOpen,
}: {
  cafe: Cafe;
  onOpen: (cafe: Cafe) => void;
}) {
  const overall = overallScore(cafe.scores);
  const loved = isLoved(cafe);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen(cafe)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(cafe);
        }
      }}
      aria-label={`${cafe.name}, ${overall.toFixed(1)} out of 5. Open review.`}
      className="wallcup relative flex cursor-pointer flex-col items-center rounded-[22px] border-[1.5px] border-line bg-card p-5 pb-6 outline-none transition-colors hover:border-ink focus-visible:border-ink"
    >
      {loved && (
        <span className="absolute right-4 top-4 z-10 flex items-center gap-1 font-display text-[11px] font-extrabold uppercase tracking-wide text-amber">
          ★ Loved
        </span>
      )}

      <WallCup scores={cafe.scores} overall={overall} />

      <div className="text-center">
        <div className="font-display text-3xl font-extrabold leading-none">
          {cafe.name}
        </div>
        <div className="mt-1.5 font-mono text-[10px] uppercase tracking-widest text-dim">
          {cafe.area}
        </div>
        <div className="mt-1.5 font-display text-xl font-extrabold text-amber">
          {overall.toFixed(1)}
          <small className="text-[0.5em] font-normal text-dim"> / 5</small>
        </div>
      </div>
    </div>
  );
}
