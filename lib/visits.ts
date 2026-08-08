import type { Cafe, Visit } from "./types";
import { overallScore } from "./config";

/**
 * Reading a cafe's visit history.
 *
 * A cafe stores every visit in `visits` (newest first), and mirrors the newest
 * one into its top-level fields so existing code keeps working. Cafes saved
 * before revisits existed have no `visits` array at all — for those, the
 * top-level fields ARE the single visit. `visitsOf` papers over that
 * difference, so callers never have to care which shape they got.
 */

/** Every visit, newest first. Never empty for a cafe with data. */
export function visitsOf(cafe: Cafe): Visit[] {
  if (cafe.visits && cafe.visits.length > 0) {
    return [...cafe.visits].sort((a, b) => (a.date < b.date ? 1 : -1));
  }
  return [
    {
      date: cafe.date,
      scores: cafe.scores,
      items: cafe.items ?? [],
      verdict: cafe.verdict ?? "",
      photos: cafe.photos ?? [],
      photoTags: cafe.photoTags,
    },
  ];
}

/** The current verdict — the most recent visit. */
export function currentVisit(cafe: Cafe): Visit {
  return visitsOf(cafe)[0];
}

/** How many times we've been. */
export function visitCount(cafe: Cafe): number {
  return visitsOf(cafe).length;
}

/** Whether we've been back at least once. */
export function isRevisited(cafe: Cafe): boolean {
  return visitCount(cafe) > 1;
}

/**
 * How the overall score moved since the previous visit, or null if this is
 * the only visit. Positive means it got better.
 */
export function scoreDelta(cafe: Cafe): number | null {
  const visits = visitsOf(cafe);
  if (visits.length < 2) return null;
  const delta =
    overallScore(visits[0].scores) - overallScore(visits[1].scores);
  return Math.round(delta * 10) / 10;
}

/** "↑ 0.4" / "↓ 0.2" / "no change" — for the badge on a revisited cafe. */
export function formatDelta(delta: number): string {
  if (delta === 0) return "no change";
  return `${delta > 0 ? "↑" : "↓"} ${Math.abs(delta).toFixed(1)}`;
}

/**
 * Rebuild a cafe's top-level fields from its newest visit, so the stored row
 * always agrees with its history. Used when saving.
 */
export function withCurrentVisit<T extends { visits: Visit[] }>(payload: T) {
  const sorted = [...payload.visits].sort((a, b) => (a.date < b.date ? 1 : -1));
  const current = sorted[0];
  return {
    ...payload,
    visits: sorted,
    date: current.date,
    scores: current.scores,
    items: current.items,
    verdict: current.verdict,
    photos: current.photos,
    photoTags: current.photoTags ?? [],
  };
}
