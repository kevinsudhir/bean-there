"use client";

import Controls from "./Controls";
import CafeCard from "./CafeCard";
import ReviewModal from "./ReviewModal";
import WallEmpty from "./WallEmpty";
import type { WallViewProps } from "./Wall";

/**
 * Desktop presentation: the controls row, the responsive card grid, and the
 * centered review modal. Purely presentational — it holds no state, just
 * renders the props handed down by <Wall> and calls the callbacks on events.
 */
export default function DesktopWall({
  cafes,
  totalCafes,
  areas,
  filters,
  onFilters,
  openCafe,
  onOpen,
  onClose,
}: WallViewProps) {
  // No cafés at all → the friendly interactive empty state (no controls).
  if (totalCafes === 0) return <WallEmpty />;

  return (
    <>
      <Controls state={filters} onChange={onFilters} areas={areas} />

      <div className="mx-auto grid max-w-[1500px] grid-cols-2 gap-x-4 gap-y-6 px-16 pb-24 pt-6 lg:grid-cols-3">
        {cafes.length > 0 ? (
          cafes.map((cafe) => (
            <CafeCard key={cafe.id} cafe={cafe} onOpen={onOpen} />
          ))
        ) : (
          <p className="col-span-full py-12 text-center font-voice text-xl italic text-dim">
            No cafés match — try a different search.
          </p>
        )}
      </div>

      <ReviewModal cafe={openCafe} onClose={onClose} />
    </>
  );
}
