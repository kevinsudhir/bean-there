"use client";

import Link from "next/link";
import PourGame from "./PourGame";
import { useAuth } from "./AuthProvider";

/**
 * Empty state for when there are no cafés yet at all (not just filtered out).
 * The pour-the-perfect-cup mini-game is the centrepiece — something to do while
 * the wall's empty — with a clear (but secondary) route to add the first café.
 */
export default function WallEmpty() {
  const { session } = useAuth();

  return (
    <div className="flex flex-col items-center gap-5 px-6 py-20 text-center">
      <div>
        <h2 className="font-display text-3xl font-extrabold">
          Nothing brewing yet
        </h2>
        <p className="mx-auto mt-2 max-w-sm font-voice text-lg italic text-dim">
          No cafés on the wall so far. While we get the first one down, see if
          you can pour the perfect cup.
        </p>
      </div>

      <PourGame />

      {session ? (
        <Link
          href="/add"
          className="mt-2 rounded-pill border-[1.5px] border-ink bg-ink px-6 py-3 font-mono text-xs uppercase tracking-wide text-bg"
        >
          + Add the first café
        </Link>
      ) : (
        <p className="mt-2 font-mono text-[11px] uppercase tracking-widest text-dim">
          Check back soon — reviews are brewing.
        </p>
      )}
    </div>
  );
}
