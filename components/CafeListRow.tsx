"use client";

import type { Cafe } from "@/lib/types";
import { overallScore, isLoved } from "@/lib/config";
import { visitCount } from "@/lib/visits";
import { cafeDistance, formatDistance, type LatLng } from "@/lib/geo";
import WallCup from "./WallCup";

/**
 * A compact list row for mobile: small cup, name + area, score, and the Loved
 * badge. Presentational — data in via `cafe`, click reported via `onOpen`.
 */
export default function CafeListRow({
  cafe,
  onOpen,
  here = null,
}: {
  cafe: Cafe;
  onOpen: (cafe: Cafe) => void;
  /** Visitor's position, when they've sorted by distance. */
  here?: LatLng | null;
}) {
  const overall = overallScore(cafe.scores);
  const loved = isLoved(cafe);
  const visits = visitCount(cafe);
  const distance = cafeDistance(cafe, here);

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
          {distance !== null && (
            <>
              <span className="mx-1 text-line">·</span>
              <span className="text-amber">{formatDistance(distance)}</span>
            </>
          )}
          {visits > 1 && (
            <>
              <span className="mx-1 text-line">·</span>
              <span className="text-amber">{visits} visits</span>
            </>
          )}
        </span>
      </span>

      <span className="ml-auto flex flex-none flex-col items-end gap-0.5">
        <span className="whitespace-nowrap font-display text-xl font-extrabold text-amber">
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
