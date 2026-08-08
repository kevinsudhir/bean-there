import type { Cafe } from "@/lib/types";
import { siteStats, formatMoney } from "@/lib/stats";

/**
 * The running numbers, shown under the header. Everything is derived from the
 * reviews themselves, so it grows on its own.
 *
 * Phones get just the totals — a swipeable line that doesn't eat the screen
 * before the first café. Laptops, where there's room, also get the averages,
 * the Loved count, the top area and the him-vs-her comparison.
 *
 * A server component — pure presentation over data the page already has.
 */
export default function StatsStrip({ cafes }: { cafes: Cafe[] }) {
  if (cafes.length === 0) return null;
  const s = siteStats(cafes);

  /** Always shown, on every screen. */
  const core: { value: string; label: string }[] = [
    { value: String(s.cafes), label: s.cafes === 1 ? "café" : "cafés" },
    { value: String(s.cups), label: s.cups === 1 ? "cup" : "cups" },
  ];
  // Only claim a spend when prices were actually recorded.
  if (s.priced > 0) {
    core.push({ value: formatMoney(s.spent), label: "spent" });
  }
  // Once we've been back somewhere, visits and cafés differ — worth saying.
  if (s.visits > s.cafes) {
    core.push({ value: String(s.visits), label: "visits" });
  }

  /** Desktop only — the richer detail. */
  const extra: { value: string; label: string }[] = [
    { value: s.averageScore.toFixed(1), label: "avg score" },
  ];
  if (s.loved > 0) extra.push({ value: String(s.loved), label: "loved" });
  if (s.topArea) extra.push({ value: s.topArea, label: "top area" });

  const stat = (value: string, label: string, key: string, desktopOnly = false) => (
    <div
      key={key}
      className={`flex-none items-baseline gap-1.5 ${desktopOnly ? "hidden md:flex" : "flex"}`}
    >
      <span className="font-display text-lg font-extrabold leading-none text-amber sm:text-xl">
        {value}
      </span>
      <span className="whitespace-nowrap font-mono text-[9px] uppercase tracking-widest text-dim sm:text-[10px]">
        {label}
      </span>
    </div>
  );

  return (
    <section aria-label="The numbers so far" className="px-5 pt-4 sm:px-16 sm:pt-5">
      {/* Phones: one line spread edge to edge, so it fills the card. From sm
          up: a wrapped row reading left to right. */}
      <div className="no-scrollbar flex items-baseline justify-between gap-x-4 overflow-x-auto rounded-2xl border-[1.5px] border-line bg-card px-4 py-3 sm:flex-wrap sm:justify-start sm:gap-x-7 sm:gap-y-3 sm:overflow-visible sm:px-5 sm:py-4">
        {core.map((st) => stat(st.value, st.label, st.label))}
        {extra.map((st) => stat(st.value, st.label, st.label, true))}
      </div>
    </section>
  );
}
