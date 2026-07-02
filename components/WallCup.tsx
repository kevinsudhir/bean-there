import type { Scores } from "@/lib/types";

/**
 * The ceramic cup-and-saucer illustration for a cafe card. The cup fills with
 * coffee to the overall score; wavy steam rises at rest. On hover the cup
 * lifts slightly off its saucer (see the .wallcup rules in globals.css).
 *
 * Geometry is a fixed 460×320 viewBox with hand-tuned numbers from the design
 * mockup, kept as-is so it looks identical.
 */
export default function WallCup({
  scores,
  overall,
}: {
  scores: Scores;
  overall: number;
}) {
  // `scores` is accepted for future use (e.g. per-category detail) but the card
  // shows only the overall fill now.
  void scores;

  const f = Math.max(0.08, Math.min(1, overall / 5));
  const yTop = 94;
  const yBot = 214;
  const yF = yBot - (yBot - yTop) * f;
  const id = Math.random().toString(36).slice(2, 8);

  return (
    <svg viewBox="0 0 460 320" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* soft shadow under the saucer */}
      <ellipse cx="230" cy="270" rx="118" ry="12" fill="#000" opacity="0.07" />
      {/* saucer */}
      <path
        d="M112,268 H348 C342,282 300,288 230,288 C160,288 118,282 112,268 Z"
        fill="var(--saucer)"
        stroke="var(--ink)"
        strokeWidth="4"
      />

      {/* the cup (lifts on hover via CSS) */}
      <g className="cupg">
        <defs>
          <clipPath id={`rc${id}`}>
            <path d="M150,94 H310 C305,182 283,218 230,218 C177,218 155,182 150,94 Z" />
          </clipPath>
        </defs>

        <g className="steam">
          <path d="M204,72 C196,60 214,52 206,38 C200,29 210,21 206,14" />
          <path d="M230,70 C222,58 240,50 232,36 C226,27 236,19 232,12" />
          <path d="M256,72 C248,60 266,52 258,38 C252,29 262,21 258,14" />
        </g>

        {/* handle */}
        <path
          d="M310,118 C368,126 368,186 314,198"
          fill="none"
          stroke="var(--ink)"
          strokeWidth="11"
          strokeLinecap="round"
        />
        {/* cup body */}
        <path
          d="M150,94 H310 C305,182 283,218 230,218 C177,218 155,182 150,94 Z"
          fill="var(--card)"
          stroke="var(--ink)"
          strokeWidth="5"
        />
        {/* coffee fill, clipped to the cup shape */}
        <g clipPath={`url(#rc${id})`}>
          <rect x="142" y="80" width="176" height="150" fill="var(--empty)" />
          <rect
            x="142"
            y={yF.toFixed(1)}
            width="176"
            height={(yBot - yF + 12).toFixed(1)}
            fill="var(--espresso)"
          />
          <rect x="142" y={yF.toFixed(1)} width="176" height="15" fill="var(--crema)" />
          <path
            d="M150,94 C155,174 174,214 200,218 L164,218 C154,174 149,124 150,94 Z"
            fill="#000"
            opacity="0.07"
          />
        </g>
        {/* rim highlight */}
        <path
          d="M150,94 C156,86 304,86 310,94"
          fill="none"
          stroke="var(--ink)"
          strokeWidth="3.5"
        />
      </g>
    </svg>
  );
}
