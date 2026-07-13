import { describe, it, expect } from "vitest";
import {
  overallScore,
  isLoved,
  toSlug,
  formatVisitDate,
  tagEmoji,
  tagHash,
  SITE,
} from "../config";
import type { Cafe, Scores } from "../types";

// A small helper to build a cafe with given scores for the tests.
function makeCafe(scores: Scores): Cafe {
  return {
    id: "test",
    slug: "test",
    name: "Test Café",
    area: "Test",
    date: "2026-01-01",
    scores,
    items: [],
    verdict: "",
    photos: [],
  };
}

describe("overallScore", () => {
  it("averages the five categories to one decimal place", () => {
    // (4 + 4 + 4 + 4 + 4) / 5 = 4.0
    expect(
      overallScore({ coffee: 4, food: 4, vibe: 4, service: 4, value: 4 }),
    ).toBe(4);
  });

  it("rounds to one decimal place", () => {
    // (5 + 4 + 4 + 4 + 4) / 5 = 4.2
    expect(
      overallScore({ coffee: 5, food: 4, vibe: 4, service: 4, value: 4 }),
    ).toBe(4.2);
    // (4.5*5) / 5 = 4.5
    expect(
      overallScore({
        coffee: 4.5,
        food: 4.5,
        vibe: 4.5,
        service: 4.5,
        value: 4.5,
      }),
    ).toBe(4.5);
  });

  it("handles the extremes (all 0, all 5)", () => {
    expect(
      overallScore({ coffee: 0, food: 0, vibe: 0, service: 0, value: 0 }),
    ).toBe(0);
    expect(
      overallScore({ coffee: 5, food: 5, vibe: 5, service: 5, value: 5 }),
    ).toBe(5);
  });
});

describe("isLoved", () => {
  it("is true when the overall score meets the badge threshold", () => {
    // Build a cafe whose average is exactly the threshold.
    const t = SITE.badgeThreshold;
    const cafe = makeCafe({
      coffee: t,
      food: t,
      vibe: t,
      service: t,
      value: t,
    });
    expect(isLoved(cafe)).toBe(true);
  });

  it("is false when the overall score is below the threshold", () => {
    const below = SITE.badgeThreshold - 0.2;
    const cafe = makeCafe({
      coffee: below,
      food: below,
      vibe: below,
      service: below,
      value: below,
    });
    expect(isLoved(cafe)).toBe(false);
  });
});

describe("toSlug", () => {
  it("lowercases and hyphenates spaces", () => {
    expect(toSlug("Idle Hands")).toBe("idle-hands");
  });

  it("strips punctuation and collapses separators", () => {
    expect(toSlug("Kith+Kin")).toBe("kith-kin");
    expect(toSlug("Foo & Bar!!")).toBe("foo-bar");
  });

  it("trims leading/trailing separators and whitespace", () => {
    expect(toSlug("  Pollen  ")).toBe("pollen");
    expect(toSlug("---Takk---")).toBe("takk");
  });
});

describe("tagHash", () => {
  it("lowercases and strips non-alphanumerics", () => {
    expect(tagHash("Aesthetic")).toBe("#aesthetic");
    expect(tagHash("Laptop-friendly")).toBe("#laptopfriendly");
    expect(tagHash("Outdoor seating")).toBe("#outdoorseating");
  });
});

describe("tagEmoji", () => {
  it("returns the emoji for a suggested tag, case-insensitively", () => {
    expect(tagEmoji("Aesthetic")).toBe("📸");
    expect(tagEmoji("  brunch ")).toBe("🥐");
  });

  it("returns undefined for a custom tag", () => {
    expect(tagEmoji("Canalside")).toBeUndefined();
  });
});

describe("formatVisitDate", () => {
  it("formats an ISO date as 'Month Year'", () => {
    expect(formatVisitDate("2026-05-15")).toBe("May 2026");
    expect(formatVisitDate("2026-01-01")).toBe("January 2026");
  });
});
