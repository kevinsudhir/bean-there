"use client";

import { useState } from "react";
import WallCup from "@/components/WallCup";
import PourGame from "@/components/PourGame";

/**
 * Shown when the home page fails to load café data (e.g. the database is
 * unreachable). An honest error state with a retry — and a little pour game to
 * pass the time while things come back.
 */
export default function Error({ reset }: { reset: () => void }) {
  const [playing, setPlaying] = useState(false);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      {playing ? (
        <>
          <PourGame />
          <button
            onClick={() => setPlaying(false)}
            className="font-mono text-[11px] uppercase tracking-widest text-dim underline"
          >
            ← Back
          </button>
        </>
      ) : (
        <>
          <div className="w-32 opacity-60">
            <WallCup
              scores={{ coffee: 0, food: 0, vibe: 0, service: 0, value: 0 }}
              overall={0}
            />
          </div>
          <h1 className="font-display text-3xl font-extrabold">
            The pot&apos;s gone cold
          </h1>
          <p className="max-w-sm font-voice text-lg italic text-dim">
            We couldn&apos;t reach the café list just now. Give it a moment and
            try again.
          </p>
          <div className="flex flex-col items-center gap-3">
            <button
              onClick={reset}
              className="rounded-pill border-[1.5px] border-ink px-6 py-3 font-mono text-xs uppercase tracking-wide"
            >
              Try again
            </button>
            <button
              onClick={() => setPlaying(true)}
              className="font-mono text-[11px] uppercase tracking-widest text-amber underline"
            >
              ☕ Or pour a cup while you wait
            </button>
          </div>
        </>
      )}
    </main>
  );
}
