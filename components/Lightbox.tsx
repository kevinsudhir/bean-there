"use client";

import { useEffect, useRef } from "react";

/**
 * Full-screen photo carousel. The current photo sits centred with the
 * neighbouring photos peeking in at the edges — blurred and dimmed — so it
 * reads as a swipeable set. Move with the ‹/› arrows, the ← / → keys, a swipe,
 * or by tapping a peeking photo. Close with the ✕, the dark area, or Escape.
 * `index` is null when closed.
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
    "absolute top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/45 text-2xl leading-none text-white";

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
      className="fixed inset-0 z-[200] flex flex-col justify-center overflow-hidden bg-[rgba(20,14,7,0.94)]"
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        aria-label="Close"
        className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-black/45 font-mono text-sm text-white"
      >
        ✕
      </button>

      {/* Sliding track: each cell is 80vw so the neighbours peek ~10vw each side */}
      <div
        className="flex items-center transition-transform duration-300 ease-out"
        style={{ transform: `translateX(calc(10vw - ${index * 80}vw))` }}
      >
        {photos.map((src, i) => (
          <div
            key={i}
            className="flex h-[100vh] w-[80vw] flex-none items-center justify-center"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={`Café photo ${i + 1} of ${n}`}
              onClick={(e) => {
                e.stopPropagation();
                if (i !== index) onIndex(i);
              }}
              className={`max-h-[82vh] max-w-[76vw] rounded-2xl object-contain transition-all duration-300 ${
                i === index
                  ? ""
                  : "scale-90 cursor-pointer opacity-45 blur-[3px]"
              }`}
            />
          </div>
        ))}
      </div>

      {n > 1 && (
        <>
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
          <div className="absolute bottom-5 left-1/2 z-10 -translate-x-1/2 rounded-pill bg-black/45 px-3 py-1 font-mono text-xs text-white">
            {index + 1} / {n}
          </div>
        </>
      )}
    </div>
  );
}
