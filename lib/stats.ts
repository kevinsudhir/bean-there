import type { Cafe, Who } from "./types";
import { overallScore, isLoved } from "./config";
import { visitsOf } from "./visits";

/**
 * Aggregates across every café — the numbers behind the stats strip and the
 * /wrapped card. Pure and data-driven: everything here comes from what's
 * already recorded per visit (scores, items, prices, who had what), so the
 * figures grow on their own as reviews are added.
 */
export interface SiteStats {
  cafes: number;
  /** Total visits — more than `cafes` once we've been back somewhere. */
  visits: number;
  /** Total items ordered across all visits (drinks + bakes + bites). */
  cups: number;
  /** Sum of every recorded item price. Items without a price count as 0. */
  spent: number;
  /** How many items actually carried a price (so we can be honest about it). */
  priced: number;
  /** Mean of each café's overall score, to one decimal. */
  averageScore: number;
  loved: number;
  /** The area with the most cafés, or null when there's no data. */
  topArea: string | null;
  /** The highest-scoring café, or null. */
  bestCafe: Cafe | null;
  /** Average item rating by reviewer — the "who scores harder" stat. */
  byWho: Record<Who, { items: number; average: number }>;
}

const round1 = (n: number) => Math.round(n * 10) / 10;

export function siteStats(cafes: Cafe[]): SiteStats {
  // Count every visit, not just the latest — going back to a café means more
  // cups drunk and more money spent, and the numbers should say so.
  const allVisits = cafes.flatMap((c) => visitsOf(c));
  const items = allVisits.flatMap((v) => v.items ?? []);
  const pricedItems = items.filter((it) => typeof it.price === "number");

  // Most common area. Ties resolve alphabetically so the result is stable.
  const areaCounts = new Map<string, number>();
  for (const c of cafes) {
    const area = c.area.trim();
    if (area) areaCounts.set(area, (areaCounts.get(area) ?? 0) + 1);
  }
  const topArea =
    [...areaCounts.entries()].sort(
      (a, b) => b[1] - a[1] || a[0].localeCompare(b[0]),
    )[0]?.[0] ?? null;

  const bestCafe =
    cafes.length > 0
      ? cafes.reduce((best, c) =>
          overallScore(c.scores) > overallScore(best.scores) ? c : best,
        )
      : null;

  const byWho = { him: 0, her: 0, shared: 0 } as Record<Who, number>;
  const whoTotals = { him: 0, her: 0, shared: 0 } as Record<Who, number>;
  for (const it of items) {
    byWho[it.who] = (byWho[it.who] ?? 0) + 1;
    whoTotals[it.who] = (whoTotals[it.who] ?? 0) + it.rating;
  }

  return {
    cafes: cafes.length,
    visits: allVisits.length,
    cups: items.length,
    spent: round1(pricedItems.reduce((sum, it) => sum + (it.price ?? 0), 0)),
    priced: pricedItems.length,
    averageScore: cafes.length
      ? round1(
          cafes.reduce((sum, c) => sum + overallScore(c.scores), 0) /
            cafes.length,
        )
      : 0,
    loved: cafes.filter(isLoved).length,
    topArea,
    bestCafe,
    byWho: {
      him: {
        items: byWho.him,
        average: byWho.him ? round1(whoTotals.him / byWho.him) : 0,
      },
      her: {
        items: byWho.her,
        average: byWho.her ? round1(whoTotals.her / byWho.her) : 0,
      },
      shared: {
        items: byWho.shared,
        average: byWho.shared ? round1(whoTotals.shared / byWho.shared) : 0,
      },
    },
  };
}

/** Money as "£147" (or "£147.50" when there are pennies). */
export function formatMoney(amount: number): string {
  return amount % 1 === 0 ? `£${amount}` : `£${amount.toFixed(2)}`;
}
