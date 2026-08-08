import { describe, it, expect } from "vitest";
import { cupSvg } from "../cupSvg";

describe("cupSvg", () => {
  it("fills the muffin through dome AND case (union clip)", () => {
    const svg = cupSvg("bake", 4.6);
    // Two paths inside the clip: the dome and the case.
    const clip = svg.match(/<clipPath id="c">(.*?)<\/clipPath>/)![1];
    expect(clip.match(/<path /g)).toHaveLength(2);
    // Fill level for 4.6/5 over the 52→20 range = 22.56 — inside the dome.
    expect(svg).toContain('y="22.560000000000002"');
    // The crema band rides at the fill surface.
    expect(svg).toContain('height="3.5" fill="#6b4227"');
  });

  it("scales the fill with the rating", () => {
    const low = cupSvg("bake", 1);
    const high = cupSvg("bake", 5);
    const yOf = (s: string) =>
      Number(s.match(/<rect x="0" y="([\d.]+)" width="60" height="[\d.]+" fill="#4a2c17"/)![1]);
    expect(yOf(low)).toBeGreaterThan(yOf(high)); // lower rating = lower fill
    expect(yOf(high)).toBe(20); // full muffin fills to the dome top
  });

  it("keeps a single-path clip for the cups", () => {
    const svg = cupSvg("cappuccino", 4);
    const clip = svg.match(/<clipPath id="c">(.*?)<\/clipPath>/)![1];
    expect(clip.match(/<path /g)).toHaveLength(1);
  });
});
