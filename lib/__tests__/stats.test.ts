import { describe, it, expect } from "vitest";
import { siteStats, formatMoney } from "../stats";
import type { Cafe } from "../types";

function makeCafe(over: Partial<Cafe> = {}): Cafe {
  return {
    id: "t",
    slug: "t",
    name: "Test",
    area: "Salford",
    date: "2026-01-01",
    scores: { coffee: 4, food: 4, vibe: 4, service: 4, value: 4 },
    items: [],
    verdict: "",
    photos: [],
    ...over,
  };
}

describe("siteStats", () => {
  it("returns zeroes for no cafés", () => {
    const s = siteStats([]);
    expect(s).toMatchObject({
      cafes: 0,
      visits: 0,
      cups: 0,
      spent: 0,
      averageScore: 0,
      topArea: null,
      bestCafe: null,
    });
  });

  it("counts cups and spend across every visit, not just the latest", () => {
    const s = siteStats([
      makeCafe({
        date: "2026-11-01",
        items: [{ type: "mocha", name: "Mocha", who: "him", rating: 5, price: 4 }],
        visits: [
          {
            date: "2026-11-01",
            scores: { coffee: 4, food: 4, vibe: 4, service: 4, value: 4 },
            items: [
              { type: "mocha", name: "Mocha", who: "him", rating: 5, price: 4 },
            ],
            verdict: "",
            photos: [],
          },
          {
            date: "2026-05-01",
            scores: { coffee: 4, food: 4, vibe: 4, service: 4, value: 4 },
            items: [
              { type: "latte", name: "Latte", who: "her", rating: 4, price: 3 },
            ],
            verdict: "",
            photos: [],
          },
        ],
      }),
    ]);
    expect(s.cafes).toBe(1);
    expect(s.visits).toBe(2);
    expect(s.cups).toBe(2);
    expect(s.spent).toBe(7);
  });

  it("counts cafés, cups and money spent", () => {
    const s = siteStats([
      makeCafe({
        items: [
          { type: "mocha", name: "Mocha", who: "him", rating: 4, price: 3.5 },
          { type: "bake", name: "Bun", who: "shared", rating: 5, price: 4.25 },
        ],
      }),
      makeCafe({
        id: "b",
        slug: "b",
        items: [
          // No price on this one — counted as a cup, not as spend.
          { type: "latte", name: "Latte", who: "her", rating: 3 },
        ],
      }),
    ]);
    expect(s.cafes).toBe(2);
    expect(s.cups).toBe(3);
    expect(s.spent).toBe(7.8); // 3.50 + 4.25 = 7.75 → rounded to one decimal
    expect(s.priced).toBe(2);
  });

  it("averages café scores and finds the best café", () => {
    const s = siteStats([
      makeCafe({ scores: { coffee: 5, food: 5, vibe: 5, service: 5, value: 5 } }),
      makeCafe({
        id: "b",
        slug: "b",
        name: "Lower",
        scores: { coffee: 3, food: 3, vibe: 3, service: 3, value: 3 },
      }),
    ]);
    expect(s.averageScore).toBe(4);
    expect(s.bestCafe?.name).toBe("Test");
    expect(s.loved).toBe(1);
  });

  it("picks the most common area, ties alphabetically", () => {
    const s = siteStats([
      makeCafe({ area: "Salford" }),
      makeCafe({ id: "b", slug: "b", area: "Ancoats" }),
      makeCafe({ id: "c", slug: "c", area: "Ancoats" }),
    ]);
    expect(s.topArea).toBe("Ancoats");
  });

  it("averages item ratings per reviewer", () => {
    const s = siteStats([
      makeCafe({
        items: [
          { type: "mocha", name: "A", who: "him", rating: 4 },
          { type: "mocha", name: "B", who: "him", rating: 5 },
          { type: "cappuccino", name: "C", who: "her", rating: 3 },
        ],
      }),
    ]);
    expect(s.byWho.him).toEqual({ items: 2, average: 4.5 });
    expect(s.byWho.her).toEqual({ items: 1, average: 3 });
    expect(s.byWho.shared).toEqual({ items: 0, average: 0 });
  });
});

describe("formatMoney", () => {
  it("drops pennies when the total is whole", () => {
    expect(formatMoney(147)).toBe("£147");
    expect(formatMoney(147.5)).toBe("£147.50");
  });
});
