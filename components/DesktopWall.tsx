"use client";

import { useState } from "react";
import Controls, { type DesktopView } from "./Controls";
import CafeCard from "./CafeCard";
import CafeMap from "./CafeMap";
import ReviewModal from "./ReviewModal";
import WallEmpty from "./WallEmpty";
import type { WallViewProps } from "./Wall";

/**
 * Desktop presentation: the controls row, then either the responsive card
 * grid or the map, plus the centered review modal. The grid/map `view` is
 * desktop-only state, so it's owned here; everything else comes from <Wall>.
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
  const [view, setView] = useState<DesktopView>("grid");

  // No cafés at all → the friendly interactive empty state (no controls).
  if (totalCafes === 0) return <WallEmpty />;

  return (
    <>
      <Controls
        state={filters}
        onChange={onFilters}
        areas={areas}
        view={view}
        onView={setView}
      />

      {view === "map" ? (
        <div className="mx-auto max-w-[1500px] px-16 pb-24 pt-6">
          <CafeMap cafes={cafes} onOpen={onOpen} />
        </div>
      ) : (
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
      )}

      <ReviewModal cafe={openCafe} onClose={onClose} />
    </>
  );
}
