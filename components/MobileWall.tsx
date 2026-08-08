"use client";

import { useState } from "react";
import CafeCard from "./CafeCard";
import CafeListRow from "./CafeListRow";
import CafeMap from "./CafeMap";
import MobileControls, { type MobileView } from "./MobileControls";
import ReviewSheet from "./ReviewSheet";
import WallEmpty from "./WallEmpty";
import type { WallViewProps } from "./Wall";

/**
 * Mobile presentation: the segmented filter bar, then either a compact list or
 * a single-column gallery of cards, depending on the local `view` toggle.
 *
 * `view` is state OWNED here because it's mobile-only (desktop has no such
 * toggle). The shared filters/openCafe still come from <Wall> via props.
 */
export default function MobileWall({
  cafes,
  totalCafes,
  areas,
  allTags,
  filters,
  onFilters,
  openCafe,
  onOpen,
  onClose,
  onRandom,
  here,
  geoNotice,
}: WallViewProps) {
  const [view, setView] = useState<MobileView>("list");

  // No cafés at all → the friendly interactive empty state (no controls).
  if (totalCafes === 0) return <WallEmpty />;

  return (
    <>
      <MobileControls
        state={filters}
        onChange={onFilters}
        areas={areas}
        allTags={allTags}
        view={view}
        onView={setView}
        shown={cafes.length}
        total={totalCafes}
        onRandom={onRandom}
      />

      {geoNotice && (
        <p className="px-5 pt-1 font-mono text-[9px] uppercase tracking-widest text-amber">
          {geoNotice}
        </p>
      )}

      <div className="px-5 pb-24 pt-3">
        {cafes.length === 0 ? (
          <p className="py-12 text-center font-voice text-lg italic text-dim">
            No cafés match — try a different search.
          </p>
        ) : view === "map" ? (
          <CafeMap cafes={cafes} onOpen={onOpen} />
        ) : view === "list" ? (
          <div className="flex flex-col gap-2.5">
            {cafes.map((cafe) => (
              <CafeListRow key={cafe.id} cafe={cafe} onOpen={onOpen} here={here} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {cafes.map((cafe) => (
              <CafeCard key={cafe.id} cafe={cafe} onOpen={onOpen} here={here} />
            ))}
          </div>
        )}
      </div>

      <ReviewSheet cafe={openCafe} onClose={onClose} />
    </>
  );
}
