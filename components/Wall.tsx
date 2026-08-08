"use client";

import { useCallback, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Cafe } from "@/lib/types";
import type { FilterState, SortKey } from "./Controls";
import { useFilteredCafes } from "@/lib/useFilteredCafes";
import { requestPosition, type LatLng } from "@/lib/geo";
import DesktopWall from "./DesktopWall";
import MobileWall from "./MobileWall";

const SORT_KEYS: SortKey[] = ["score", "recent", "name", "nearest"];

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
  const searchParams = useSearchParams();

  // Filters live in local state so tapping one is instant. Routing them
  // through the router instead would re-run this dynamic page on the server —
  // a Supabase round-trip per tap, which was very noticeable on a phone.
  const [filters, setFilters] = useState<FilterState>(() =>
    filtersFromParams(new URLSearchParams(searchParams.toString())),
  );

  // Where the visitor is, once they've asked to sort by distance. Null until
  // then — we never ask for a location unprompted.
  const [here, setHere] = useState<LatLng | null>(null);
  const [geoNotice, setGeoNotice] = useState<string | null>(null);

  const writeUrl = useCallback((next: FilterState) => {
    const query = paramsFromFilters(next).toString();
    // history.replaceState, not router.replace: this updates the URL without
    // asking Next.js to re-render or refetch anything.
    window.history.replaceState(
      null,
      "",
      query ? `${window.location.pathname}?${query}` : window.location.pathname,
    );
  }, []);

  /** Apply a filter change, and mirror it into the address bar for sharing. */
  const applyFilters = useCallback(
    (next: FilterState) => {
      setFilters(next);
      writeUrl(next);
      if (next.sort !== "nearest") setGeoNotice(null);

      // Sorting by distance needs a location. Ask once, and if we can't get
      // one, say why and fall back to Top rated rather than leaving the list
      // in an order that doesn't match the selected sort.
      if (next.sort === "nearest" && !here) {
        setGeoNotice("Finding you…");
        requestPosition()
          .then((pos) => {
            setHere(pos);
            setGeoNotice(null);
          })
          .catch((err: Error) => {
            setGeoNotice(err.message);
            const fallback: FilterState = { ...next, sort: "score" };
            setFilters(fallback);
            writeUrl(fallback);
          });
      }
    },
    [here, writeUrl],
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
  const visible = useFilteredCafes(cafes, filters, here);

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
    onFilters: applyFilters,
    openCafe,
    onOpen: setOpenCafe,
    onClose: () => setOpenCafe(null),
    onRandom: openRandom,
    // Distances belong to the "nearest" view — keep the position in state so
    // switching back doesn't re-prompt, but stop labelling cards once the
    // list is ordered by something else.
    here: filters.sort === "nearest" ? here : null,
    geoNotice,
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
  /** The visitor's position, once they've sorted by distance. */
  here: LatLng | null;
  /** Progress or failure message from the location request. */
  geoNotice: string | null;
}
