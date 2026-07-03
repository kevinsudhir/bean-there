"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A "pour the perfect cup" mini-game for the empty/error states.
 * Coffee rises in the cup; tap STOP to land on the dotted target line.
 * Closer = higher score. A great pour (85+) sends steam curling off the cup.
 */
export default function PourGame() {
  const [fill, setFill] = useState(0); // 0–100, current coffee level
  const [pouring, setPouring] = useState(false);
  const [target, setTarget] = useState(() => 55 + Math.random() * 35); // 55–90
  const [result, setResult] = useState<number | null>(null); // score 0–100
  const [best, setBest] = useState(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    if (!pouring) return;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = now - last;
      last = now;
      setFill((f) => {
        const next = f + dt * 0.045;
        if (next >= 100) {
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
    setTarget(55 + Math.random() * 35);
    setPouring(true);
  }

  function stop() {
    if (!pouring) return;
    setPouring(false);
    const diff = Math.abs(fill - target);
    const score = Math.max(0, Math.round(100 - diff * 3));
    setResult(score);
    setBest((b) => Math.max(b, score));
  }

  const message =
    result === null
      ? null
      : result === 0
        ? "Overflowed! Steadier next time."
        : result >= 95
          ? "Barista-level pour."
          : result >= 75
            ? "Nice and smooth."
            : result >= 50
              ? "Drinkable."
              : "A bit off — try again.";

  const celebrate = result !== null && result >= 85;
  const targetY = 40 + (140 * (100 - target)) / 100;
  const fillY = 40 + (140 * (100 - fill)) / 100;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative h-44 w-36">
        <svg viewBox="0 0 200 210" className="h-full w-full">
          <defs>
            <clipPath id="pourclip">
              <path d="M50,40 H150 C146,150 128,180 100,180 C72,180 54,150 50,40 Z" />
            </clipPath>
          </defs>

          {/* Steam — only on a great pour */}
          {celebrate && (
            <g fill="none" stroke="var(--crema)" strokeWidth="5" strokeLinecap="round">
              <path className="steam-puff" style={{ animationDelay: "0s" }} d="M85,30 q-7,-10 0,-20" />
              <path className="steam-puff" style={{ animationDelay: "0.5s" }} d="M100,28 q7,-10 0,-20" />
              <path className="steam-puff" style={{ animationDelay: "1s" }} d="M115,30 q-7,-10 0,-20" />
            </g>
          )}

          {/* fill */}
          <g clipPath="url(#pourclip)">
            <rect x="40" y="40" width="120" height="150" fill="var(--empty)" />
            <rect x="40" y={fillY} width="120" height="200" fill="var(--espresso)" />
            <rect x="40" y={fillY} width="120" height="6" fill="var(--crema)" />
          </g>

          {/* body + handle outline */}
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

          {/* TARGET LINE — drawn last so it's always visible, with a halo */}
          <line
            x1="42"
            x2="158"
            y1={targetY}
            y2={targetY}
            stroke="var(--bg)"
            strokeWidth="6"
            strokeLinecap="round"
            opacity="0.6"
          />
          <line
            x1="44"
            x2="156"
            y1={targetY}
            y2={targetY}
            stroke="var(--amber)"
            strokeWidth="3"
            strokeDasharray="7 5"
            strokeLinecap="round"
          />
          {/* little target arrow on the right edge */}
          <path
            d={`M162,${targetY} l8,-5 v10 z`}
            fill="var(--amber)"
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
        <p className="font-voice text-xl italic text-ink">
          {message}{" "}
          {result! > 0 && (
            <span className="font-mono text-base not-italic font-bold text-amber">
              {result}/100
            </span>
          )}
        </p>
      )}
      {best > 0 && (
        <p className="font-mono text-[11px] uppercase tracking-widest text-dim">
          Best: {best}/100
        </p>
      )}
      <p className="font-mono text-[13px] font-bold uppercase tracking-widest text-ink">
        Stop the pour on the dotted line
      </p>
    </div>
  );
}
