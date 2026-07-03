"use client";

import { useEffect, useRef, useState } from "react";
import type * as Leaflet from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Cafe } from "@/lib/types";
import { overallScore, isLoved } from "@/lib/config";
import { useTheme } from "./ThemeProvider";

/**
 * The map view of the wall. Each café with coordinates gets a custom pin —
 * a little cup + its overall score, amber when Loved — and clicking a pin
 * opens the same review modal/sheet as the cards. Cafés without coordinates
 * simply don't appear (a note below the map says how many).
 *
 * Leaflet only runs in the browser (it touches `window` on import), so it's
 * loaded dynamically on mount. Tiles are CARTO's free OSM styles, swapped to
 * the dark style when the theme is dark.
 */

const MANCHESTER: [number, number] = [53.4808, -2.2426];

const TILES = {
  light:
    "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
  dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
};
const ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

const CUP_SVG =
  '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 6h13v5a6.5 6.5 0 0 1-13 0V6z"/><path d="M17 7c3 .4 3 4.6 0 5"/></svg>';

interface LeafletContext {
  L: typeof Leaflet;
  map: Leaflet.Map;
  tiles: Leaflet.TileLayer | null;
  markers: Leaflet.LayerGroup;
  resize: ResizeObserver;
}

export default function CafeMap({
  cafes,
  onOpen,
}: {
  cafes: Cafe[];
  onOpen: (cafe: Cafe) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const ctxRef = useRef<LeafletContext | null>(null);
  const [ready, setReady] = useState(false);
  const { theme } = useTheme();

  const locatedCount = cafes.filter(
    (c) => typeof c.lat === "number" && typeof c.lng === "number",
  ).length;

  // Create the map once on mount, destroy it on unmount.
  useEffect(() => {
    let disposed = false;
    (async () => {
      const L = (await import("leaflet")).default;
      if (disposed || !containerRef.current || ctxRef.current) return;
      const map = L.map(containerRef.current, {
        center: MANCHESTER,
        zoom: 12,
      });
      // Leaflet sizes itself from the container ONCE, at creation — which can
      // happen before the layout/styles have settled, leaving tiles rendered
      // for a sliver of the real area (grey map). Re-measure on the next
      // frame and whenever the container resizes (rotation, view toggles).
      const resize = new ResizeObserver(() => map.invalidateSize());
      resize.observe(containerRef.current);
      requestAnimationFrame(() => map.invalidateSize());
      ctxRef.current = {
        L,
        map,
        tiles: null,
        markers: L.layerGroup().addTo(map),
        resize,
      };
      setReady(true);
    })();
    return () => {
      disposed = true;
      ctxRef.current?.resize.disconnect();
      ctxRef.current?.map.remove();
      ctxRef.current = null;
    };
  }, []);

  // Tile layer follows the light/dark theme.
  useEffect(() => {
    const ctx = ctxRef.current;
    if (!ready || !ctx) return;
    ctx.tiles?.remove();
    ctx.tiles = ctx.L.tileLayer(TILES[theme], {
      attribution: ATTRIBUTION,
      maxZoom: 19,
    }).addTo(ctx.map);
  }, [ready, theme]);

  // (Re)draw one pin per located café, and frame them all.
  useEffect(() => {
    const ctx = ctxRef.current;
    if (!ready || !ctx) return;

    const located = cafes.filter(
      (c) => typeof c.lat === "number" && typeof c.lng === "number",
    );

    ctx.markers.clearLayers();
    for (const cafe of located) {
      const icon = ctx.L.divIcon({
        className: "", // suppress Leaflet's default white-square styling
        html: `<div class="mappin${isLoved(cafe) ? " mappin-loved" : ""}">${CUP_SVG}${overallScore(cafe.scores).toFixed(1)}</div>`,
        iconSize: [64, 30],
        iconAnchor: [32, 30],
      });
      ctx.L.marker([cafe.lat as number, cafe.lng as number], {
        icon,
        title: cafe.name,
        alt: `${cafe.name}, rated ${overallScore(cafe.scores).toFixed(1)} out of 5`,
      })
        .addTo(ctx.markers)
        .on("click", () => onOpen(cafe));
    }

    if (located.length > 0) {
      const bounds = ctx.L.latLngBounds(
        located.map((c) => [c.lat as number, c.lng as number]),
      );
      ctx.map.fitBounds(bounds.pad(0.25), { maxZoom: 15 });
    }
  }, [ready, cafes, onOpen]);

  return (
    <div>
      {/* relative z-0 contains Leaflet's high pane z-indexes so the map can
          never paint over the review modal/sheet. */}
      <div className="relative z-0 overflow-hidden rounded-[22px] border-[1.5px] border-line">
        <div
          ref={containerRef}
          className="h-[62vh] min-h-[360px] w-full md:h-[calc(100vh-340px)] md:min-h-[440px]"
        />
      </div>
      {locatedCount < cafes.length && (
        <p className="mt-2.5 text-center font-mono text-[10px] uppercase tracking-widest text-dim">
          {cafes.length - locatedCount} café
          {cafes.length - locatedCount === 1 ? "" : "s"} without a pin yet — add
          a location via Edit
        </p>
      )}
    </div>
  );
}
