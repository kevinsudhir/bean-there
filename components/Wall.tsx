"use client";

import { useMemo, useState } from "react";
import type { Cafe } from "@/lib/types";
import type { FilterState } from "./Controls";
import { useFilteredCafes } from "@/lib/useFilteredCafes";
import DesktopWall from "./DesktopWall";
import MobileWall from "./MobileWall";

/**
 * Container component. Owns the state shared by both layouts (the filters and
 * which cafe is open) and the derived data (areas, the filtered list), then
 * hands everything to the two presentational views.
 *
 * We render BOTH views and let CSS breakpoints decide which is visible
 * (DesktopWall is `hidden` below md; MobileWall is `hidden` at md and up).
 * This avoids a hydration flash and keeps the page correct without JS
 * measuring the screen.
 */
export default function Wall({ cafes }: { cafes: Cafe[] }) {
  const [filters, setFilters] = useState<FilterState>({
    q: "",
    sort: "score",
    area: "all",
    lovedOnly: false,
    tags: [],
  });
  const [openCafe, setOpenCafe] = useState<Cafe | null>(null);

  // Unique area names for the Area filter, derived from the data.
  const areas = useMemo(
    () => Array.from(new Set(cafes.map((c) => c.area))).sort(),
    [cafes],
  );
  // Unique vibe tags present across the data, for the Vibe filter.
  const allTags = useMemo(
    () =>
      Array.from(new Set(cafes.flatMap((c) => c.tags ?? []).map((t) => t.trim())))
        .filter(Boolean)
        .sort(),
    [cafes],
  );
  const visible = useFilteredCafes(cafes, filters);

  // Props shared by both layouts.
  const viewProps = {
    cafes: visible,
    totalCafes: cafes.length,
    areas,
    allTags,
    filters,
    onFilters: setFilters,
    openCafe,
    onOpen: setOpenCafe,
    onClose: () => setOpenCafe(null),
  };

  return (
    <>
      <div className="hidden md:block">
        <DesktopWall {...viewProps} />
      </div>
      <div className="md:hidden">
        <MobileWall {...viewProps} />
      </div>
    </>
  );
}

/** The shared prop shape both layouts receive. Exported so each view imports it. */
export interface WallViewProps {
  cafes: Cafe[];
  totalCafes: number;
  areas: string[];
  allTags: string[];
  filters: FilterState;
  onFilters: (next: FilterState) => void;
  openCafe: Cafe | null;
  onOpen: (cafe: Cafe) => void;
  onClose: () => void;
}
