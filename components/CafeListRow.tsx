"use client";

import type { Cafe } from "@/lib/types";
import { overallScore, isLoved } from "@/lib/config";
import WallCup from "./WallCup";

/**
 * A compact list row for mobile: small cup, name + area, score, and the Loved
 * badge. Presentational — data in via `cafe`, click reported via `onOpen`.
 */
export default function CafeListRow({
  cafe,
  onOpen,
}: {
  cafe: Cafe;
  onOpen: (cafe: Cafe) => void;
}) {
  const overall = overallScore(cafe.scores);
  const loved = isLoved(cafe);

  return (
    <button
      onClick={() => onOpen(cafe)}
      className="flex w-full items-center gap-3 rounded-2xl border-[1.5px] border-line bg-card p-3.5 text-left"
    >
      <span className="block h-10 w-[68px] flex-none">
        <WallCup scores={cafe.scores} overall={overall} compact />
      </span>

      <span className="min-w-0">
        <span className="block truncate font-display text-lg font-extrabold leading-none">
          {cafe.name}
        </span>
        <span className="mt-1 block font-mono text-[9px] uppercase tracking-widest text-dim">
          {cafe.area}
        </span>
      </span>

      <span className="ml-auto flex flex-col items-end gap-0.5">
        <span className="font-display text-xl font-extrabold text-amber">
          {overall.toFixed(1)}
          <small className="text-[0.5em] font-normal text-dim"> / 5</small>
        </span>
        {loved && (
          <span className="font-mono text-[8px] uppercase tracking-wide text-amber">
            ★ Loved
          </span>
        )}
      </span>
    </button>
  );
}
