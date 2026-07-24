"use client";

import { useEffect } from "react";
import type { Cafe } from "@/lib/types";
import { useFocusTrap } from "@/lib/useFocusTrap";
import ReviewContent from "./ReviewContent";

/**
 * DESKTOP container for a review: a wide centered card over a dimmed backdrop.
 * Closes via the ✕, a backdrop click, or Escape. The review body itself is
 * <ReviewContent>, shared with the mobile <ReviewSheet>.
 */
export default function ReviewModal({
  cafe,
  onClose,
}: {
  cafe: Cafe | null;
  onClose: () => void;
}) {
  // Keep Tab inside the dialog while it's open; restore focus on close.
  const trapRef = useFocusTrap<HTMLDivElement>(Boolean(cafe));

  useEffect(() => {
    if (!cafe) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [cafe, onClose]);

  if (!cafe) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[rgba(20,14,7,0.55)] p-5"
    >
      <div
        ref={trapRef}
        role="dialog"
        aria-modal="true"
        aria-label={`${cafe.name} review`}
        tabIndex={-1}
        className="relative m-auto flex w-full max-w-[1240px] flex-col items-center gap-3.5 rounded-[22px] border-[1.5px] border-ink bg-bg px-6 py-6 text-center outline-none sm:px-14"
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 h-10 w-10 rounded-full border-[1.5px] border-ink font-mono text-base leading-none"
        >
          ✕
        </button>
        <ReviewContent cafe={cafe} />
      </div>
    </div>
  );
}
