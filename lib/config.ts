import type { Cafe, Scores } from "./types";
import { SCORE_CATEGORIES } from "./types";

/**
 * Site-wide configuration. These are the knobs you're most likely to change,
 * kept in one place on purpose.
 */
export const SITE = {
  title: "Bean There",
  kickerLeft: "Manchester · Est. 2026",
  kickerRight: "Two cups · One city · Zero mercy",
  tagline:
    "We drink our way round Manchester's cafés and score them so you don't have to gamble your flat white money.",
  /** The his/hers explainer shown in the "Our Order" tooltip. */
  ourOrder:
    "He's a mocha/latte man, she's cappuccino-only — so the coffee score leans on those. There's nearly always a bake or dessert in the mix, and the odd cold one when Manchester allows it.",
  /** Byline names. */
  reviewers: { him: "Him", her: "Her" },
  /** A cafe scoring at or above this overall earns the badge. */
  badgeThreshold: 4.5,
  badgeLabel: "Bean There, Loved That",
} as const;

/** Average of the five category scores, rounded to one decimal. */
export function overallScore(scores: Scores): number {
  const total = SCORE_CATEGORIES.reduce((sum, cat) => sum + scores[cat], 0);
  return Math.round((total / SCORE_CATEGORIES.length) * 10) / 10;
}

/** Whether a cafe qualifies for the "Loved" badge. */
export function isLoved(cafe: Cafe): boolean {
  return overallScore(cafe.scores) >= SITE.badgeThreshold;
}

/** Convert a cafe name into a URL-friendly slug, e.g. "Idle Hands" → "idle-hands". */
export function toSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Format an ISO date as e.g. "June 2026". */
export function formatVisitDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });
}
