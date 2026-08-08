import { describe, it, expect } from "vitest";
import {
  distanceMeters,
  cafeDistance,
  cafePosition,
  formatDistance,
} from "../geo";
import type { Cafe } from "../types";

// Two real Manchester points, ~1.1 km apart.
const DEANSGATE = { lat: 53.4773, lng: -2.2503 };
const SALFORD = { lat: 53.4842, lng: -2.2626 };

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

describe("distanceMeters", () => {
  it("is zero for the same point", () => {
    expect(distanceMeters(DEANSGATE, DEANSGATE)).toBe(0);
  });

  it("measures a known short hop across the city", () => {
    const d = distanceMeters(DEANSGATE, SALFORD);
    expect(d).toBeGreaterThan(1000);
    expect(d).toBeLessThan(1300);
  });

  it("is symmetric", () => {
    expect(distanceMeters(DEANSGATE, SALFORD)).toBeCloseTo(
      distanceMeters(SALFORD, DEANSGATE),
      6,
    );
  });
});

describe("cafePosition / cafeDistance", () => {
  it("returns null for a café with no pin", () => {
    const cafe = makeCafe();
    expect(cafePosition(cafe)).toBeNull();
    expect(cafeDistance(cafe, DEANSGATE)).toBeNull();
  });

  it("returns null when we don't know where the visitor is", () => {
    const cafe = makeCafe({ lat: SALFORD.lat, lng: SALFORD.lng });
    expect(cafeDistance(cafe, null)).toBeNull();
  });

  it("measures from the visitor to a pinned café", () => {
    const cafe = makeCafe({ lat: SALFORD.lat, lng: SALFORD.lng });
    expect(cafeDistance(cafe, DEANSGATE)).toBeGreaterThan(1000);
  });
});

describe("formatDistance", () => {
  it("uses metres up close and kilometres further out", () => {
    expect(formatDistance(120)).toBe("120 m");
    expect(formatDistance(999)).toBe("999 m");
    expect(formatDistance(1000)).toBe("1.0 km");
    expect(formatDistance(2540)).toBe("2.5 km");
  });
});
