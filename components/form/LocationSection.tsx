"use client";

import { field, label } from "./shared";

/** Optional map pin: the geocoder button plus manual lat/lng inputs. */
export default function LocationSection({
  lat,
  lng,
  locating,
  message,
  onLat,
  onLng,
  onFind,
}: {
  lat: number | null;
  lng: number | null;
  locating: boolean;
  message: string | null;
  onLat: (v: number | null) => void;
  onLng: (v: number | null) => void;
  onFind: () => void;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label className={`${label} mb-0`}>Location (for the map view)</label>
        <button
          type="button"
          onClick={onFind}
          disabled={locating}
          className="rounded-pill border-[1.5px] border-amber px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide text-amber disabled:opacity-40"
        >
          {locating ? "Finding…" : "◎ Find location"}
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:max-w-[420px]">
        <input
          type="number"
          step="any"
          className={field}
          value={lat ?? ""}
          onChange={(e) =>
            onLat(e.target.value === "" ? null : Number(e.target.value))
          }
          placeholder="Latitude"
          aria-label="Latitude"
        />
        <input
          type="number"
          step="any"
          className={field}
          value={lng ?? ""}
          onChange={(e) =>
            onLng(e.target.value === "" ? null : Number(e.target.value))
          }
          placeholder="Longitude"
          aria-label="Longitude"
        />
      </div>
      {message && (
        <p className="mt-1.5 font-mono text-[10px] text-dim">{message}</p>
      )}
      <p className="mt-1.5 font-mono text-[10px] italic text-dim">
        Optional — pins the café on the map. Pasting from Google Maps is most
        accurate (right-click the café → click the numbers to copy) — paste,
        then save without pressing Find. Find looks it up by name and replaces
        whatever is in the boxes.
      </p>
    </div>
  );
}
