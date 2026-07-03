"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A tiny "pour the perfect cup" mini-game for the empty/error states.
 * Coffee rises in the cup; tap STOP to stop the pour and try to land on the
 * target line. Closer = higher score. One tap to play, purely for fun while
 * there's nothing else on the wall.
 */
export default function PourGame() {
  const [fill, setFill] = useState(0); // 0–100, current coffee level
  const [pouring, setPouring] = useState(false);
  const [target] = useState(() => 55 + Math.random() * 35); // 55–90
  const [result, setResult] = useState<number | null>(null); // score 0–100
  const [best, setBest] = useState(0);
  const raf = useRef<number | null>(null);

  // Animate the fill upward while pouring.
  useEffect(() => {
    if (!pouring) return;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = now - last;
      last = now;
      setFill((f) => {
        const next = f + dt * 0.045; // pour speed
        if (next >= 100) {
          // Overflowed — a miss.
          setPouring(false);
          setResult(0);
          return 100;
        }
        return next;
      });
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [pouring]);

  function start() {
    setResult(null);
    setFill(0);
    setPouring(true);
  }

  function stop() {
    if (!pouring) return;
    setPouring(false);
    const diff = Math.abs(fill - target);
    const score = Math.max(0, Math.round(100 - diff * 3)); // closer = higher
    setResult(score);
    setBest((b) => Math.max(b, score));
  }

  const message =
    result === null
      ? null
      : result === 0
        ? "Overflowed! Steadier next time."
        : result >= 95
          ? "Barista-level pour. ☕"
          : result >= 75
            ? "Nice and smooth."
            : result >= 50
              ? "Drinkable."
              : "A bit off — try again.";

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative h-40 w-32">
        {/* Cup */}
        <svg viewBox="0 0 200 200" className="h-full w-full">
          <defs>
            <clipPath id="pourclip">
              <path d="M50,40 H150 C146,150 128,180 100,180 C72,180 54,150 50,40 Z" />
            </clipPath>
          </defs>
          {/* target line */}
          <line
            x1="46"
            x2="154"
            y1={40 + (140 * (100 - target)) / 100}
            y2={40 + (140 * (100 - target)) / 100}
            stroke="var(--amber)"
            strokeWidth="2"
            strokeDasharray="5 4"
          />
          {/* fill */}
          <g clipPath="url(#pourclip)">
            <rect x="40" y="40" width="120" height="150" fill="var(--empty)" />
            <rect
              x="40"
              y={40 + (140 * (100 - fill)) / 100}
              width="120"
              height="200"
              fill="var(--espresso)"
            />
            <rect
              x="40"
              y={40 + (140 * (100 - fill)) / 100}
              width="120"
              height="6"
              fill="var(--crema)"
            />
          </g>
          {/* handle + body outline */}
          <path
            d="M150,70 C185,78 185,130 152,142"
            fill="none"
            stroke="var(--ink)"
            strokeWidth="7"
            strokeLinecap="round"
          />
          <path
            d="M50,40 H150 C146,150 128,180 100,180 C72,180 54,150 50,40 Z"
            fill="none"
            stroke="var(--ink)"
            strokeWidth="4"
          />
        </svg>
      </div>

      <button
        onClick={pouring ? stop : start}
        className="h-11 w-32 rounded-pill bg-ink font-mono text-xs uppercase tracking-wide text-bg"
      >
        {pouring ? "Stop" : result === null ? "Pour" : "Again"}
      </button>

      {message && (
        <p className="font-voice text-base italic text-ink">
          {message}{" "}
          {result! > 0 && (
            <span className="font-mono text-xs not-italic text-amber">
              {result}/100
            </span>
          )}
        </p>
      )}
      {best > 0 && (
        <p className="font-mono text-[10px] uppercase tracking-widest text-dim">
          Best: {best}/100
        </p>
      )}
      <p className="font-mono text-[10px] uppercase tracking-widest text-dim">
        Stop the pour on the dotted line
      </p>
    </div>
  );
}
