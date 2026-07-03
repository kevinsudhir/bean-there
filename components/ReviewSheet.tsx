"use client";

import { useEffect, useRef, useState } from "react";
import type { Cafe } from "@/lib/types";
import ReviewContent from "./ReviewContent";

/**
 * MOBILE container for a review: a bottom sheet sliding up from the bottom.
 * Dismiss by: the ✕ button, tapping the backdrop, Escape, or dragging the
 * sheet down. The drag works ANYWHERE on the sheet — if the content is
 * scrolled to the top and you pull down, the whole sheet follows your finger
 * and dismisses past a threshold (snapping back otherwise). If the content
 * isn't at the top, your touch scrolls the content as normal.
 */
export default function ReviewSheet({
  cafe,
  onClose,
}: {
  cafe: Cafe | null;
  onClose: () => void;
}) {
  const [shown, setShown] = useState(false);
  const [dragY, setDragY] = useState(0);
  const startY = useRef<number | null>(null);
  const dragging = useRef(false);
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

  // Record the touch start position. We only allow a dismiss-drag to begin
  // when the scroll area is already at the very top.
  function onTouchStart(e: React.TouchEvent) {
    startY.current = e.touches[0].clientY;
    dragging.current = false;
  }

  function onTouchMove(e: React.TouchEvent) {
    if (startY.current === null) return;
    const delta = e.touches[0].clientY - startY.current;
    const atTop = (scrollRef.current?.scrollTop ?? 0) <= 0;

    // Begin a dismiss-drag only when pulling down from the top of the content.
    if (!dragging.current && delta > 4 && atTop) {
      dragging.current = true;
    }

    if (dragging.current && delta > 0) {
      // Prevent the content from scrolling while we're dragging the sheet.
      e.preventDefault();
      setDragY(delta);
    }
  }

  function onTouchEnd() {
    if (dragging.current) {
      if (dragY > 120) close();
      else setDragY(0); // snap back
    }
    startY.current = null;
    dragging.current = false;
  }

  if (!cafe) return null;

  const isDragging = dragY > 0;
  // Backdrop fades a little as you drag the sheet away.
  const backdropOpacity = shown ? Math.max(0.15, 1 - dragY / 500) : 0;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div
        onClick={close}
        style={{ opacity: backdropOpacity }}
        className="absolute inset-0 bg-[rgba(20,14,7,0.5)] transition-opacity duration-300"
      />

      {/* Sheet — the whole thing is draggable */}
      <div
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={
          isDragging
            ? { transform: `translateY(${dragY}px)`, transition: "none" }
            : undefined
        }
        className={`absolute inset-x-0 bottom-0 max-h-[92%] touch-pan-y overflow-hidden rounded-t-[26px] bg-bg transition-transform duration-300 ${shown ? "translate-y-0" : "translate-y-full"}`}
      >
        {/* Drag handle + close button */}
        <div className="sticky top-0 z-10 flex items-center justify-center bg-bg pb-1 pt-3">
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
          <div className="flex w-full flex-col items-center gap-3.5 px-5 pb-[max(3rem,env(safe-area-inset-bottom))] pt-2 text-center">
            <ReviewContent cafe={cafe} />
          </div>
        </div>
      </div>
    </div>
  );
}
