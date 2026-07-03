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
  // Fixed initial target so the server render matches hydration (Math.random
  // in the initializer differs between the two); randomised on mount below.
  const [target, setTarget] = useState(72.5); // 55–90 once randomised
  const [result, setResult] = useState<number | null>(null); // score 0–100
  const [best, setBest] = useState(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    setTarget(55 + Math.random() * 35);
  }, []);

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
  const targetY = 55 + (125 * (100 - target)) / 100;
  const fillY = 55 + (125 * (100 - fill)) / 100;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-52">
        <svg viewBox="0 0 240 220" className="h-auto w-full">
          <defs>
            <clipPath id="pourclip">
              <path d="M50,55 H190 C185,130 165,180 120,180 C75,180 55,130 50,55 Z" />
            </clipPath>
          </defs>

          {/* Steam — only on a great pour */}
          {celebrate && (
            <g fill="none" stroke="var(--crema)" strokeWidth="5" strokeLinecap="round">
              <path className="steam-puff" style={{ animationDelay: "0s" }} d="M104,45 q-8,-11 0,-22" />
              <path className="steam-puff" style={{ animationDelay: "0.5s" }} d="M120,43 q8,-11 0,-22" />
              <path className="steam-puff" style={{ animationDelay: "1s" }} d="M136,45 q-8,-11 0,-22" />
            </g>
          )}

          {/* saucer (drawn first, sits below the cup) */}
          <ellipse cx="120" cy="198" rx="78" ry="10" fill="none" stroke="var(--ink)" strokeWidth="4" />

          {/* coffee fill — clipped to the cup so nothing spills out.
              Only rendered once there's something in the cup, so on load
              (fill 0) the cup is genuinely empty. Height is capped to the cup
              bottom (y=180) as a belt-and-braces guard against overflow. */}
          {fill > 0.5 && (
            <g clipPath="url(#pourclip)">
              <rect
                x="48"
                y={fillY}
                width="144"
                height={Math.max(0, 180 - fillY)}
                fill="var(--espresso)"
              />
              <rect x="48" y={fillY} width="144" height="6" fill="var(--crema)" />
            </g>
          )}

          {/* handle */}
          <path
            d="M190,80 C226,88 226,140 192,156"
            fill="none"
            stroke="var(--ink)"
            strokeWidth="7"
            strokeLinecap="round"
          />
          {/* cup outline */}
          <path
            d="M50,55 H190 C185,130 165,180 120,180 C75,180 55,130 50,55 Z"
            fill="none"
            stroke="var(--ink)"
            strokeWidth="4"
          />

          {/* TARGET LINE — drawn last so it's always visible, with a halo */}
          <line
            x1="48"
            x2="192"
            y1={targetY}
            y2={targetY}
            stroke="var(--bg)"
            strokeWidth="7"
            strokeLinecap="round"
            opacity="0.8"
          />
          <line
            x1="50"
            x2="190"
            y1={targetY}
            y2={targetY}
            stroke="var(--amber)"
            strokeWidth="3.5"
            strokeDasharray="8 5"
            strokeLinecap="round"
          />
          {/* little target arrow on the right edge */}
          <path
            d={`M196,${targetY} l9,-6 v12 z`}
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
