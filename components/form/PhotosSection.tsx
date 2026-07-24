"use client";

import { label } from "./shared";

/**
 * A photo in the form: either one already saved (URL) or a newly picked file.
 * `url` is the src to preview (public URL, or an object URL for new files).
 */
export type PhotoEntry =
  | { kind: "existing"; url: string; tag: string | null }
  | { kind: "new"; file: File; url: string; tag: string | null };

/**
 * The photo thumbnails: cover badge on the first, "make cover" on the rest,
 * an item-tag dropdown per photo, and ✕ to remove. Previews stay plain <img>
 * because new files use blob: URLs, which next/image can't optimise.
 */
export default function PhotosSection({
  photos,
  itemNames,
  onRemove,
  onMakeCover,
  onTag,
}: {
  photos: PhotoEntry[];
  itemNames: string[];
  onRemove: (i: number) => void;
  onMakeCover: (i: number) => void;
  onTag: (i: number, tag: string | null) => void;
}) {
  if (photos.length === 0) return null;

  return (
    <div>
      <label className={label}>
        Photos — pick the cover and tag each with the item it shows
      </label>
      <div className="flex flex-wrap gap-3">
        {photos.map((p, i) => (
          <div key={p.url} className="flex flex-col items-center gap-1">
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.url}
                alt={p.kind === "new" ? "New photo" : "Review photo"}
                className={`h-24 w-[76px] rounded-lg border-[1.5px] object-cover ${p.kind === "new" ? "border-amber" : "border-line"}`}
              />
              {i === 0 && (
                <span className="absolute left-1 top-1 rounded bg-amber px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-wide text-white">
                  Cover
                </span>
              )}
              <button
                type="button"
                onClick={() => onRemove(i)}
                aria-label="Remove photo"
                className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border-[1.5px] border-line bg-bg text-[10px] text-ink"
              >
                ✕
              </button>
            </div>
            {i !== 0 && (
              <button
                type="button"
                onClick={() => onMakeCover(i)}
                className="font-mono text-[8px] uppercase tracking-wide text-amber"
              >
                Make cover
              </button>
            )}
            <select
              value={p.tag ?? ""}
              onChange={(e) => onTag(i, e.target.value || null)}
              aria-label="Tag photo with an item"
              className="mt-1 w-[76px] rounded border-[1.5px] border-line bg-card px-1 py-1 font-mono text-[9px] text-ink outline-none"
            >
              <option value="">— tag —</option>
              {itemNames.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
      <p className="mt-1.5 font-mono text-[10px] italic text-dim">
        The cover is the carousel&apos;s first slide. Tagged photos get that
        item&apos;s score on their slide; untagged ones show the overall score.
      </p>
    </div>
  );
}
