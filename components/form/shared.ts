/** Shared styling + input helpers for the café form sections. */

export const label =
  "mb-1.5 block font-mono text-xs uppercase tracking-wide text-dim";

export const field =
  "w-full min-w-0 max-w-full rounded-lg border-[1.5px] border-line bg-transparent px-3 py-2.5 text-sm text-ink outline-none focus:border-ink";

// min/max on a number input only constrain the spinner, not typed values, so
// every score/rating is clamped to 0–5 (and NaN from a cleared field becomes 0).
export const clampScore = (n: number): number =>
  Number.isFinite(n) ? Math.min(5, Math.max(0, Math.round(n * 10) / 10)) : 0;
