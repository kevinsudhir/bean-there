"use client";

import { useState } from "react";
import { SITE } from "@/lib/config";
import PourGame from "./PourGame";

/**
 * Page footer: the byline, and a quiet way into the pour game. The game used
 * to live only in the empty/error states, where almost nobody saw it — this
 * gives it a home without letting it compete with the wall.
 */
export default function SiteFooter() {
  const [playing, setPlaying] = useState(false);

  return (
    <footer className="mt-4 flex flex-col items-center gap-4 px-6 pb-28 pt-6 text-center sm:px-16">
      {playing && (
        <div className="flex flex-col items-center gap-3">
          <PourGame />
          <button
            onClick={() => setPlaying(false)}
            className="font-mono text-[10px] uppercase tracking-widest text-dim underline"
          >
            Close
          </button>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 font-mono text-[10px] uppercase tracking-widest text-dim">
        <span>
          {SITE.title} · {SITE.kickerLeft}
        </span>
        <span aria-hidden="true">·</span>
        <button
          onClick={() => setPlaying((p) => !p)}
          className="text-amber underline underline-offset-2"
        >
          ☕ Pour a cup
        </button>
      </div>
    </footer>
  );
}
