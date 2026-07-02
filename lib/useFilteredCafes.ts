import { useMemo } from "react";
import type { Cafe } from "@/lib/types";
import { overallScore, isLoved } from "@/lib/config";
import type { FilterState } from "@/components/Controls";

/**
 * Pure, memoised filtering + sorting. Both the desktop and mobile views use
 * this same hook, so the two layouts can never drift apart in behaviour.
 */
export function useFilteredCafes(
  cafes: Cafe[],
  state: FilterState,
): Cafe[] {
  return useMemo(() => {
    let list = cafes.slice();

    if (state.q) {
      const q = state.q.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.area.toLowerCase().includes(q),
      );
    }

    if (state.lovedOnly) list = list.filter(isLoved);

    if (state.area !== "all") list = list.filter((c) => c.area === state.area);

    if (state.sort === "score") {
      list.sort((a, b) => overallScore(b.scores) - overallScore(a.scores));
    } else if (state.sort === "recent") {
      list.sort((a, b) => b.date.localeCompare(a.date));
    } else if (state.sort === "name") {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }

    return list;
  }, [cafes, state]);
}
