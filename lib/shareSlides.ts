import type { Cafe, ItemType } from "./types";

/**
 * The slide model for a café's shareable Instagram carousel. Computed the same
 * way on the client (to know how many slides to fetch) and in the card route
 * (to render each one), so the two never disagree.
 *
 * - cover  → first photo, the branded hook (overall score + category pills)
 * - photo  → each further photo, stamped with its tagged item's score if any
 * - scores → the cream scorecard: every item's cup + rating, plus the verdict
 *
 * A café with no photos collapses to just the scorecard.
 */
export interface SlideItem {
  name: string;
  rating: number;
  type: ItemType;
  star: boolean;
}

export type Slide =
  | { kind: "cover"; photo: string; item: SlideItem | null }
  | { kind: "photo"; photo: string; item: SlideItem | null }
  | { kind: "scores" };

export function buildSlides(cafe: Cafe): Slide[] {
  const photos = cafe.photos ?? [];
  const tags = cafe.photoTags ?? [];

  const itemFor = (i: number): SlideItem | null => {
    const name = tags[i];
    if (!name) return null;
    const it = cafe.items.find((x) => x.name === name);
    return it
      ? { name: it.name, rating: it.rating, type: it.type, star: Boolean(it.star) }
      : null;
  };

  const slides: Slide[] = [];
  if (photos.length > 0) {
    slides.push({ kind: "cover", photo: photos[0], item: itemFor(0) });
    for (let i = 1; i < photos.length; i++) {
      slides.push({ kind: "photo", photo: photos[i], item: itemFor(i) });
    }
  }
  slides.push({ kind: "scores" });
  return slides;
}
