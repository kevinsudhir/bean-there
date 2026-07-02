"use client";

import { useEffect, useState } from "react";
import type { Cafe } from "@/lib/types";
import ReviewContent from "./ReviewContent";

/**
 * MOBILE container for a review: a bottom sheet that slides up from the bottom
 * with a drag handle, over a dimmed backdrop. Dismiss via backdrop tap or
 * Escape. Renders the same <ReviewContent> as the desktop modal.
 *
 * We animate with a small `shown` flag: mount → next tick set shown=true →
 * CSS transitions the transform from off-screen to in-place. On close we set
 * shown=false, wait for the transition, then tell the parent to unmount.
 */
export default function ReviewSheet({
  cafe,
  onClose,
}: {
  cafe: Cafe | null;
  onClose: () => void;
}) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (!cafe) return;
    // Trigger the slide-in on the next frame so the transition runs.
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
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cafe]);

  function close() {
    setShown(false);
    setTimeout(onClose, 280); // match the transition duration
  }

  if (!cafe) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div
        onClick={close}
        className={`absolute inset-0 bg-[rgba(20,14,7,0.5)] transition-opacity duration-300 ${shown ? "opacity-100" : "opacity-0"}`}
      />

      {/* Sheet */}
      <div
        className={`absolute inset-x-0 bottom-0 max-h-[92%] overflow-y-auto rounded-t-[26px] bg-bg transition-transform duration-300 ${shown ? "translate-y-0" : "translate-y-full"}`}
      >
        <div className="sticky top-0 z-10 flex justify-center bg-bg pb-1 pt-3">
          <span className="h-1.5 w-11 rounded-full bg-line" />
        </div>
        <div className="flex flex-col items-center gap-3.5 px-5 pb-8 pt-2 text-center">
          <ReviewContent cafe={cafe} />
        </div>
      </div>
    </div>
  );
}
