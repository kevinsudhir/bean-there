"use client";

import { useEffect, useRef, useState } from "react";
import type { Cafe } from "@/lib/types";
import ReviewContent from "./ReviewContent";

/**
 * MOBILE container for a review: a bottom sheet sliding up from the bottom.
 * Dismiss by: the ✕ button, tapping the backdrop, Escape, or swiping the sheet
 * down past a threshold (the sheet follows your finger, then either closes or
 * snaps back).
 *
 * Animation uses a `shown` flag: mount → next frame set shown=true → CSS
 * transitions it up. On close, shown=false slides it out, then after the
 * transition we unmount via onClose.
 */
export default function ReviewSheet({
  cafe,
  onClose,
}: {
  cafe: Cafe | null;
  onClose: () => void;
}) {
  const [shown, setShown] = useState(false);
  const [dragY, setDragY] = useState(0); // px the sheet is dragged down
  const startY = useRef<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cafe) return;
    const raf = requestAnimationFrame(() => setShown(true));
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      setShown(false);
      setDragY(0);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cafe]);

  function close() {
    setShown(false);
    setDragY(0);
    setTimeout(onClose, 280);
  }

  // --- swipe-to-dismiss ---
  // Only start a drag when the content is scrolled to the top, so dragging
  // down doesn't fight with scrolling the review.
  function onTouchStart(e: React.TouchEvent) {
    const atTop = (scrollRef.current?.scrollTop ?? 0) <= 0;
    startY.current = atTop ? e.touches[0].clientY : null;
  }
  function onTouchMove(e: React.TouchEvent) {
    if (startY.current === null) return;
    const delta = e.touches[0].clientY - startY.current;
    if (delta > 0) setDragY(delta); // only downward
  }
  function onTouchEnd() {
    if (dragY > 110) {
      close(); // dragged far enough → dismiss
    } else {
      setDragY(0); // snap back
    }
    startY.current = null;
  }

  if (!cafe) return null;

  const dragging = dragY > 0;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div
        onClick={close}
        className={`absolute inset-0 bg-[rgba(20,14,7,0.5)] transition-opacity duration-300 ${shown ? "opacity-100" : "opacity-0"}`}
      />

      {/* Sheet */}
      <div
        style={
          dragging
            ? { transform: `translateY(${dragY}px)`, transition: "none" }
            : undefined
        }
        className={`absolute inset-x-0 bottom-0 max-h-[92%] overflow-hidden rounded-t-[26px] bg-bg transition-transform duration-300 ${shown ? "translate-y-0" : "translate-y-full"}`}
      >
        {/* Drag handle + close button */}
        <div
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          className="sticky top-0 z-10 flex items-center justify-center bg-bg pb-1 pt-3"
        >
          <span className="h-1.5 w-11 rounded-full bg-line" />
          <button
            onClick={close}
            aria-label="Close"
            className="absolute right-4 top-2.5 flex h-9 w-9 items-center justify-center rounded-full border-[1.5px] border-line bg-bg font-mono text-sm text-ink"
          >
            ✕
          </button>
        </div>

        {/* Scrollable content */}
        <div
          ref={scrollRef}
          className="max-h-[calc(92vh-2.5rem)] overflow-y-auto overflow-x-hidden"
        >
          <div className="flex w-full flex-col items-center gap-3.5 px-5 pb-8 pt-2 text-center">
            <ReviewContent cafe={cafe} />
          </div>
        </div>
      </div>
    </div>
  );
}
