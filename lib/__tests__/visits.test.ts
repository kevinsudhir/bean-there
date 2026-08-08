import { describe, it, expect } from "vitest";
import {
  visitsOf,
  currentVisit,
  visitCount,
  isRevisited,
  scoreDelta,
  formatDelta,
  withCurrentVisit,
} from "../visits";
import type { Cafe, Scores, Visit } from "../types";

const flat = (n: number): Scores => ({
  coffee: n,
  food: n,
  vibe: n,
  service: n,
  value: n,
});

function makeCafe(over: Partial<Cafe> = {}): Cafe {
  return {
    id: "t",
    slug: "t",
    name: "Test",
    area: "Salford",
    date: "2026-05-01",
    scores: flat(4.2),
    items: [{ type: "mocha", name: "Mocha", who: "him", rating: 4 }],
    verdict: "First time.",
    photos: ["a.jpg"],
    ...over,
  };
}

function makeVisit(date: string, score: number): Visit {
  return {
    date,
    scores: flat(score),
    items: [],
    verdict: `Visit ${date}`,
    photos: [],
  };
}

describe("visitsOf", () => {
  it("treats a pre-revisits cafe as one visit built from its fields", () => {
    const visits = visitsOf(makeCafe());
    expect(visits).toHaveLength(1);
    expect(visits[0]).toMatchObject({
      date: "2026-05-01",
      verdict: "First time.",
      photos: ["a.jpg"],
    });
  });

  it("returns stored visits newest first, whatever order they're in", () => {
    const cafe = makeCafe({
      visits: [makeVisit("2026-05-01", 4.2), makeVisit("2026-11-01", 4.6)],
    });
    expect(visitsOf(cafe).map((v) => v.date)).toEqual([
      "2026-11-01",
      "2026-05-01",
    ]);
  });

  it("falls back to the top-level fields when visits is empty", () => {
    expect(visitsOf(makeCafe({ visits: [] }))).toHaveLength(1);
  });
});

describe("currentVisit / visitCount / isRevisited", () => {
  it("reports a single visit correctly", () => {
    const cafe = makeCafe();
    expect(visitCount(cafe)).toBe(1);
    expect(isRevisited(cafe)).toBe(false);
    expect(currentVisit(cafe).verdict).toBe("First time.");
  });

  it("uses the newest visit as the current verdict", () => {
    const cafe = makeCafe({
      visits: [makeVisit("2026-05-01", 4.2), makeVisit("2026-11-01", 4.6)],
    });
    expect(visitCount(cafe)).toBe(2);
    expect(isRevisited(cafe)).toBe(true);
    expect(currentVisit(cafe).date).toBe("2026-11-01");
  });
});

describe("scoreDelta", () => {
  it("is null when there's nothing to compare", () => {
    expect(scoreDelta(makeCafe())).toBeNull();
  });

  it("measures the change since the previous visit", () => {
    const better = makeCafe({
      visits: [makeVisit("2026-11-01", 4.6), makeVisit("2026-05-01", 4.2)],
    });
    expect(scoreDelta(better)).toBe(0.4);

    const worse = makeCafe({
      visits: [makeVisit("2026-11-01", 3.8), makeVisit("2026-05-01", 4.2)],
    });
    expect(scoreDelta(worse)).toBe(-0.4);
  });

  it("compares only the two most recent visits", () => {
    const cafe = makeCafe({
      visits: [
        makeVisit("2026-11-01", 4.6),
        makeVisit("2026-08-01", 4.0),
        makeVisit("2026-05-01", 2.0),
      ],
    });
    expect(scoreDelta(cafe)).toBe(0.6);
  });
});

describe("formatDelta", () => {
  it("shows direction and magnitude", () => {
    expect(formatDelta(0.4)).toBe("↑ 0.4");
    expect(formatDelta(-0.4)).toBe("↓ 0.4");
    expect(formatDelta(0)).toBe("no change");
  });
});

describe("withCurrentVisit", () => {
  it("mirrors the newest visit into the top-level fields", () => {
    const out = withCurrentVisit({
      name: "Test",
      visits: [makeVisit("2026-05-01", 4.2), makeVisit("2026-11-01", 4.6)],
    });
    expect(out.visits[0].date).toBe("2026-11-01");
    expect(out.date).toBe("2026-11-01");
    expect(out.scores).toEqual(flat(4.6));
    expect(out.verdict).toBe("Visit 2026-11-01");
  });
});
