import type { Cafe } from "@/lib/types";
import { siteStats, formatMoney } from "@/lib/stats";

/**
 * The running numbers, shown under the header: how many cafés and cups, what
 * we've spent, the average score, and who rates harder. Everything is derived
 * from the reviews themselves, so it grows on its own.
 *
 * A server component — it's pure presentation over data the page already has.
 */
export default function StatsStrip({ cafes }: { cafes: Cafe[] }) {
  if (cafes.length === 0) return null;
  const s = siteStats(cafes);

  // Deliberately just the running totals — the scores live on the cafés
  // themselves, so repeating averages here only crowded the header.
  const stats: { value: string; label: string }[] = [
    { value: String(s.cafes), label: s.cafes === 1 ? "café" : "cafés" },
    { value: String(s.cups), label: s.cups === 1 ? "cup" : "cups" },
  ];
  // Only claim a spend when prices were actually recorded.
  if (s.priced > 0) {
    stats.push({ value: formatMoney(s.spent), label: "spent" });
  }

  return (
    <section aria-label="The numbers so far" className="px-5 pt-4 sm:px-16 sm:pt-5">
      {/* One swipeable line on phones (a wrapped block ate a third of the
          screen before the first café); a wrapped row from sm up. */}
      <div className="no-scrollbar flex items-baseline gap-x-5 overflow-x-auto rounded-2xl border-[1.5px] border-line bg-card px-4 py-3 sm:flex-wrap sm:gap-x-7 sm:gap-y-3 sm:overflow-visible sm:px-5 sm:py-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex flex-none items-baseline gap-1.5"
          >
            <span className="font-display text-lg font-extrabold leading-none text-amber sm:text-xl">
              {stat.value}
            </span>
            <span className="whitespace-nowrap font-mono text-[9px] uppercase tracking-widest text-dim sm:text-[10px]">
              {stat.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
