"use client";

import { useEffect, useRef } from "react";

/**
 * Full-screen photo viewer with navigation. Move between photos with the
 * ‹ / › arrows, the ← / → keys, or a left/right swipe. Close with the ✕, a
 * tap on the backdrop, or Escape. `index` is null when closed.
 */
export default function Lightbox({
  photos,
  index,
  onClose,
  onIndex,
}: {
  photos: string[];
  index: number | null;
  onClose: () => void;
  onIndex: (i: number) => void;
}) {
  const startX = useRef<number | null>(null);
  const n = photos.length;
  const open = index !== null && index >= 0 && index < n;

  useEffect(() => {
    if (!open || index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") onIndex((index - 1 + n) % n);
      else if (e.key === "ArrowRight") onIndex((index + 1) % n);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, index, n, onClose, onIndex]);

  if (!open || index === null) return null;

  const go = (dir: number) => onIndex((index + dir + n) % n);

  const arrow =
    "absolute top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/40 text-2xl leading-none text-white";

  return (
    <div
      onClick={onClose}
      onTouchStart={(e) => {
        startX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (startX.current === null) return;
        const dx = e.changedTouches[0].clientX - startX.current;
        startX.current = null;
        if (Math.abs(dx) > 40 && n > 1) go(dx < 0 ? 1 : -1);
      }}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-[rgba(20,14,7,0.92)] p-4"
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        aria-label="Close"
        className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-black/40 font-mono text-sm text-white"
      >
        ✕
      </button>

      {n > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            go(-1);
          }}
          aria-label="Previous photo"
          className={`${arrow} left-3`}
        >
          ‹
        </button>
      )}

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photos[index]}
        alt={`Café photo ${index + 1} of ${n}`}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[86vh] max-w-[92vw] rounded-2xl"
      />

      {n > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            go(1);
          }}
          aria-label="Next photo"
          className={`${arrow} right-3`}
        >
          ›
        </button>
      )}

      {n > 1 && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-pill bg-black/40 px-3 py-1 font-mono text-xs text-white">
          {index + 1} / {n}
        </div>
      )}
    </div>
  );
}
