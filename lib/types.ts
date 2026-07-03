/**
 * Domain types — the shape of our data, used everywhere from the database layer
 * to the UI. If the data shape ever changes, update it here and TypeScript will
 * flag every place that needs attention.
 */

/** The five things we score every cafe on. */
export const SCORE_CATEGORIES = [
  "coffee",
  "food",
  "vibe",
  "service",
  "value",
] as const;

export type ScoreCategory = (typeof SCORE_CATEGORIES)[number];

/** A 1–5 score for each category. */
export type Scores = Record<ScoreCategory, number>;

/** Who had a given item. */
export type Who = "him" | "her" | "shared";

/**
 * The kind of item, which decides how it's drawn.
 * Drinks render as vessels; bakes/desserts render as a muffin.
 */
export type ItemType =
  | "mocha"
  | "latte"
  | "cappuccino"
  | "filter"
  | "cold"
  | "bake"
  | "dessert"
  | "food";

/** One thing we ordered — a drink or a bake — with its own rating. */
export interface CafeItem {
  type: ItemType;
  name: string;
  who: Who;
  rating: number;
  /** Marks the standout item of the visit. */
  star?: boolean;
  /** Optional price in GBP, e.g. 3.8 for £3.80. */
  price?: number;
}

/** A full cafe review. */
export interface Cafe {
  id: string;
  /** URL-friendly identifier, e.g. "pollen". */
  slug: string;
  name: string;
  area: string;
  /** ISO date of the visit, e.g. "2026-06-12". */
  date: string;
  scores: Scores;
  items: CafeItem[];
  verdict: string;
  /** Public URLs of uploaded photos. May be empty. */
  photos: string[];
  /** Optional map coordinates (WGS84). Null/absent = not pinned yet. */
  lat?: number | null;
  lng?: number | null;
}
