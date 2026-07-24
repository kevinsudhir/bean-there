import { describe, it, expect } from "vitest";
import { buildSlides } from "../shareSlides";
import { tagEmoji, tagHash } from "../config";
import type { Cafe } from "../types";

function makeCafe(overrides: Partial<Cafe> = {}): Cafe {
  return {
    id: "t",
    slug: "t",
    name: "Test Café",
    area: "Test",
    date: "2026-01-01",
    scores: { coffee: 4, food: 4, vibe: 4, service: 4, value: 4 },
    items: [],
    verdict: "",
    photos: [],
    ...overrides,
  };
}

describe("buildSlides", () => {
  it("is just the scorecard when there are no photos", () => {
    expect(buildSlides(makeCafe())).toEqual([{ kind: "scores" }]);
  });

  it("orders cover, then photos, then the scorecard", () => {
    const slides = buildSlides(
      makeCafe({ photos: ["a.jpg", "b.jpg", "c.jpg"] }),
    );
    expect(slides.map((s) => s.kind)).toEqual([
      "cover",
      "photo",
      "photo",
      "scores",
    ]);
  });

  it("resolves photo tags to items even with stray whitespace", () => {
    const slides = buildSlides(
      makeCafe({
        photos: ["a.jpg", "b.jpg"],
        photoTags: [null, "Mocha"],
        items: [
          { type: "mocha", name: " Mocha ", who: "him", rating: 4.5 },
        ],
      }),
    );
    expect(slides[0]).toMatchObject({ kind: "cover", item: null });
    expect(slides[1]).toMatchObject({
      kind: "photo",
      item: { name: "Mocha", rating: 4.5 },
    });
  });

  it("returns a null item for tags that match no item", () => {
    const slides = buildSlides(
      makeCafe({
        photos: ["a.jpg"],
        photoTags: ["Gone"],
        items: [{ type: "latte", name: "Latte", who: "her", rating: 4 }],
      }),
    );
    expect(slides[0]).toMatchObject({ kind: "cover", item: null });
  });
});

describe("tag helpers", () => {
  it("hashes labels to lowercase hashtags", () => {
    expect(tagHash("Laptop-friendly")).toBe("#laptopfriendly");
    expect(tagHash("Outdoor seating")).toBe("#outdoorseating");
    expect(tagHash("Canalside")).toBe("#canalside");
  });

  it("finds emojis for suggested tags case-insensitively", () => {
    expect(tagEmoji("aesthetic")).toBe("📸");
    expect(tagEmoji(" Brunch ")).toBe("🥐");
    expect(tagEmoji("Canalside")).toBeUndefined();
  });
});
