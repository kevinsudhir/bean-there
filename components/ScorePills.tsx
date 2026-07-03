import type { Scores } from "@/lib/types";
import { SCORE_CATEGORIES } from "@/lib/types";

/** Row of the five category scores as small labelled pills. */
export default function ScorePills({ scores }: { scores: Scores }) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {SCORE_CATEGORIES.map((cat) => (
        <span
          key={cat}
          className="rounded-pill border-[1.5px] border-line px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide text-dim"
        >
          {cat}
          <b className="ml-1.5 font-display font-extrabold text-ink">
            {(scores[cat] ?? 0).toFixed(1)}
          </b>
        </span>
      ))}
    </div>
  );
}
