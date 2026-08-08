"use client";

import { useCallback, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Cafe } from "@/lib/types";
import type { FilterState, SortKey } from "./Controls";
import { useFilteredCafes } from "@/lib/useFilteredCafes";
import DesktopWall from "./DesktopWall";
import MobileWall from "./MobileWall";

const SORT_KEYS: SortKey[] = ["score", "recent", "name"];

/** Read the filters out of the URL, so a filtered view can be linked/shared. */
function filtersFromParams(params: URLSearchParams): FilterState {
  const sort = params.get("sort");
  return {
    q: params.get("q") ?? "",
    sort: SORT_KEYS.includes(sort as SortKey) ? (sort as SortKey) : "score",
    area: params.get("area") ?? "all",
    lovedOnly: params.get("loved") === "1",
    tags: (params.get("tags") ?? "").split(",").map((t) => t.trim()).filter(Boolean),
  };
}

/** The inverse: only non-default values go in, so a clean view has a clean URL. */
function paramsFromFilters(f: FilterState): URLSearchParams {
  const params = new URLSearchParams();
  if (f.q.trim()) params.set("q", f.q.trim());
  if (f.sort !== "score") params.set("sort", f.sort);
  if (f.area !== "all") params.set("area", f.area);
  if (f.lovedOnly) params.set("loved", "1");
  if (f.tags.length) params.set("tags", f.tags.join(","));
  return params;
}

/**
 * Container component. Owns the state shared by both layouts (which cafe is
 * open) and the derived data (areas, tags, the filtered list), then hands
 * everything to the two presentational views.
 *
 * The filters themselves live in the URL rather than in state, so any filtered
 * view — "all the brunch spots in Salford" — is a link you can share.
 *
 * We render BOTH views and let CSS breakpoints decide which is visible
 * (DesktopWall is `hidden` below md; MobileWall is `hidden` at md and up).
 * This avoids a hydration flash and keeps the page correct without JS
 * measuring the screen.
 */
export default function Wall({ cafes }: { cafes: Cafe[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters = useMemo(
    () => filtersFromParams(new URLSearchParams(searchParams.toString())),
    [searchParams],
  );

  const setFilters = useCallback(
    (next: FilterState) => {
      const params = paramsFromFilters(next);
      const query = params.toString();
      // replace, not push: filtering shouldn't fill up the back button.
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [router, pathname],
  );

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

  /** Open a random café from the ones currently showing. */
  const openRandom = useCallback(() => {
    if (visible.length === 0) return;
    setOpenCafe(visible[Math.floor(Math.random() * visible.length)]);
  }, [visible]);

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
    onRandom: openRandom,
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
  onRandom: () => void;
}
