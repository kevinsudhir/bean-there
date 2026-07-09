import type { Cafe, Scores } from "./types";
import { SCORE_CATEGORIES } from "./types";

/**
 * Site-wide configuration. These are the knobs you're most likely to change,
 * kept in one place on purpose.
 */
export const SITE = {
  title: "Bean There",
  /** Home city — appended to map searches so "Pollen, Ancoats" finds the right one. */
  city: "Manchester",
  kickerLeft: "Manchester · Est. 2026",
  kickerRight: "Two cups · One city",
  tagline:
    "We drink our way round Manchester's cafés and score every cup, so your next one isn't a gamble.",
  /** The his/hers explainer shown in the "Our Order" tooltip. */
  ourOrder:
    "He's a mocha/latte man, she's cappuccino-only — so the coffee score leans on those. There's nearly always a bake or dessert in the mix, and the odd cold one when Manchester allows it.",
  /** Byline names. */
  reviewers: { him: "Him", her: "Her" },
  /** A cafe scoring at or above this overall earns the badge. */
  badgeThreshold: 4.5,
  badgeLabel: "Bean There, Loved That",
} as const;

/**
 * Average of the five category scores, rounded to one decimal. Tolerates rows
 * whose JSON is missing a category (treated as 0) rather than returning NaN.
 */
export function overallScore(scores: Scores): number {
  const total = SCORE_CATEGORIES.reduce(
    (sum, cat) => sum + (scores[cat] ?? 0),
    0,
  );
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

/**
 * Google Maps link for a cafe. Always searches by name + area + city: that
 * opens the café's real Maps listing (reviews, hours, photos), whereas raw
 * coordinates open an anonymous dropped pin. The stored lat/lng are used
 * only for our own map view's pins.
 */
export function mapsSearchUrl(cafe: Cafe): string {
  const query = `${cafe.name} ${cafe.area} ${SITE.city}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

/** Format an ISO date as e.g. "June 2026". Invalid/empty dates render as "—". */
export function formatVisitDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });
}
