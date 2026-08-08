"use client";

import { useState } from "react";
import type { Cafe } from "@/lib/types";
import { overallScore, formatVisitDate } from "@/lib/config";
import { visitsOf, formatDelta } from "@/lib/visits";

/**
 * "Our visits" — the history under a review. The newest visit IS the review
 * above, so this is a compact timeline: date, score, and how it moved. Past
 * visits expand to show what we said at the time.
 *
 * Renders nothing for a café we've only been to once.
 */
export default function VisitHistory({ cafe }: { cafe: Cafe }) {
  const visits = visitsOf(cafe);
  const [open, setOpen] = useState<number | null>(null);

  if (visits.length < 2) return null;

  return (
    <div className="w-full max-w-[560px] border-t-[1.5px] border-line pt-4">
      <div className="mb-2 text-left font-mono text-[10px] uppercase tracking-widest text-dim">
        Our visits
      </div>

      <div className="flex flex-col gap-1">
        {visits.map((visit, i) => {
          const score = overallScore(visit.scores);
          const previous = visits[i + 1];
          const delta = previous
            ? Math.round((score - overallScore(previous.scores)) * 10) / 10
            : null;
          const isCurrent = i === 0;
          const isOpen = open === i;

          return (
            <div key={`${visit.date}-${i}`}>
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                className={`flex w-full items-center gap-3 rounded-lg border-[1.5px] px-3 py-2.5 text-left transition-colors ${
                  isCurrent
                    ? "border-amber bg-amber/10"
                    : "border-transparent hover:border-line"
                }`}
              >
                <span
                  className={`h-2 w-2 flex-none rounded-full ${isCurrent ? "bg-amber" : "bg-line"}`}
                />
                <span className="flex-1 font-display text-sm font-extrabold">
                  {formatVisitDate(visit.date)}
                  {isCurrent && (
                    <span className="ml-2 font-mono text-[9px] uppercase tracking-wide text-amber">
                      current
                    </span>
                  )}
                </span>
                {delta !== null && delta !== 0 && (
                  <span
                    className={`font-mono text-[10px] uppercase tracking-wide ${delta > 0 ? "text-green-800" : "text-red-800"}`}
                  >
                    {formatDelta(delta)}
                  </span>
                )}
                <span
                  className={`font-display text-base font-extrabold ${isCurrent ? "text-amber" : "text-dim"}`}
                >
                  {score.toFixed(1)}
                </span>
              </button>

              {isOpen && (
                <div className="px-3 pb-3 pt-1 text-left">
                  {visit.items.length > 0 && (
                    <div className="mb-1.5 font-mono text-[10px] uppercase tracking-wide text-dim">
                      {visit.items
                        .map((it) => `${it.name} ${it.rating.toFixed(1)}`)
                        .join(" · ")}
                    </div>
                  )}
                  {visit.verdict && (
                    <p className="font-voice text-sm italic leading-snug text-ink">
                      {visit.verdict}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
