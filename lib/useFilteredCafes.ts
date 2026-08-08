import { useMemo } from "react";
import type { Cafe } from "@/lib/types";
import { overallScore, isLoved } from "@/lib/config";
import { cafeDistance, type LatLng } from "@/lib/geo";
import type { FilterState } from "@/components/Controls";

/**
 * Pure, memoised filtering + sorting. Both the desktop and mobile views use
 * this same hook, so the two layouts can never drift apart in behaviour.
 *
 * `here` is the visitor's position when they've asked to sort by distance;
 * without it the "nearest" sort falls back to score, so the list is never
 * left in an arbitrary order while we're waiting for a location.
 */
export function useFilteredCafes(
  cafes: Cafe[],
  state: FilterState,
  here: LatLng | null = null,
): Cafe[] {
  return useMemo(() => {
    let list = cafes.slice();

    // Trim so a trailing space (easy on mobile keyboards) doesn't hide matches.
    const query = state.q.trim().toLowerCase();
    if (query) {
      const q = query;
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.area.toLowerCase().includes(q),
      );
    }

    if (state.lovedOnly) list = list.filter(isLoved);

    if (state.area !== "all") list = list.filter((c) => c.area === state.area);

    // Vibe tags: keep cafés carrying ALL selected tags (case/space-insensitive).
    if (state.tags.length) {
      const want = state.tags.map((t) => t.trim().toLowerCase());
      list = list.filter((c) => {
        const have = (c.tags ?? []).map((t) => t.trim().toLowerCase());
        return want.every((t) => have.includes(t));
      });
    }

    if (state.sort === "nearest" && here) {
      // Closest first; cafés without a pin can't be ranked, so they go last
      // (ordered by score among themselves) rather than disappearing.
      list.sort((a, b) => {
        const da = cafeDistance(a, here);
        const db = cafeDistance(b, here);
        if (da === null && db === null) {
          return overallScore(b.scores) - overallScore(a.scores);
        }
        if (da === null) return 1;
        if (db === null) return -1;
        return da - db;
      });
    } else if (state.sort === "recent") {
      list.sort((a, b) => b.date.localeCompare(a.date));
    } else if (state.sort === "name") {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      // "score", and "nearest" while we're still waiting for a location.
      list.sort((a, b) => overallScore(b.scores) - overallScore(a.scores));
    }

    return list;
  }, [cafes, state, here]);
}
