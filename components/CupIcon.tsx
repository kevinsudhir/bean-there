import type { ItemType } from "@/lib/types";

/**
 * Draws an illustrated cup, glass, or muffin filled with coffee to a given
 * fraction (0–1) of its height. Used both for the big cup on a cafe card
 * (the overall score) and for each item in a review (its own rating).
 *
 * The fill is a clipped rectangle rising from the bottom; the outline is a
 * single non-scaling stroke so it looks equally fine at any render size.
 */

interface CupIconProps {
  /** What to draw. Drinks pick a vessel shape; bake/dessert draw a muffin. */
  type?: ItemType;
  /** Fill fraction, 0–1 (e.g. rating / 5). */
  fill: number;
  /** Pixel size (width and height). */
  size?: number;
  className?: string;
}

// Clip-path ids are static per shape. Multiple icons on a page share an id,
// which is fine: the geometry is identical, so url(#…) always resolves to the
// right shape. (Random/counter ids differ between server render and client
// hydration, which is worse — mismatches and cross-icon clip collisions.)
const STROKE = "var(--itemstroke)";
const CARD = "var(--card)";
const ESPRESSO = "var(--espresso)";
const CREMA = "var(--crema)";

export default function CupIcon({
  type = "latte",
  fill,
  size = 120,
  className,
}: CupIconProps) {
  const f = Math.max(0, Math.min(1, fill));
  const clipId = `cupclip-${type === "food" ? "food" : type === "bake" || type === "dessert" ? "muffin" : type === "latte" || type === "cold" ? "glass" : "cup"}`;

  // Plate of food (sandwiches, fries, halloumi, savoury dishes).
  if (type === "food") {
    // A tall serving cloche with a knob, on a plate; fills with colour to the
    // score. The body is deep so mid scores read as clearly partial.
    const body = "M14,40 C14,16 46,16 46,40 Z";
    const yF = 40 - (40 - 21) * f;
    return (
      <svg
        viewBox="0 0 60 60"
        width={size}
        height={size}
        className={className}
        aria-hidden="true"
      >
        <defs>
          <clipPath id={clipId}>
            <path d={body} />
          </clipPath>
        </defs>
        <g clipPath={`url(#${clipId})`}>
          <rect x="0" y="0" width="60" height="60" fill={CARD} />
          <rect x="0" y={yF} width="60" height={40 - yF + 6} fill={ESPRESSO} />
        </g>
        {/* cloche dome */}
        <path
          d={body}
          fill="none"
          stroke={STROKE}
          strokeWidth="2"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        {/* knob */}
        <circle
          cx="30"
          cy="19"
          r="2.5"
          fill={CARD}
          stroke={STROKE}
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
        {/* plate */}
        <path
          d="M8,42 C8,48 52,48 52,42"
          fill="none"
          stroke={STROKE}
          strokeWidth="2"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
        <ellipse
          cx="30"
          cy="42"
          rx="24"
          ry="3.5"
          fill="none"
          stroke={STROKE}
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    );
  }

  // Muffin (bakes and desserts).
  if (type === "bake" || type === "dessert") {
    const body = "M16,30 L20,52 C20,54 40,54 40,52 L44,30 Z";
    const yF = 52 - (52 - 22) * f;
    return (
      <svg
        viewBox="0 0 60 60"
        width={size}
        height={size}
        className={className}
        aria-hidden="true"
      >
        <defs>
          <clipPath id={clipId}>
            <path d={body} />
          </clipPath>
        </defs>
        <path d="M14,30 C14,18 46,18 46,30 Z" fill={CREMA} />
        <g clipPath={`url(#${clipId})`}>
          <rect x="0" y="0" width="60" height="60" fill={CARD} />
          <rect x="0" y={yF} width="60" height={52 - yF + 6} fill={ESPRESSO} />
        </g>
        <path
          d="M14,30 C14,18 46,18 46,30 Z"
          fill="none"
          stroke={STROKE}
          strokeWidth="2"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d={body}
          fill="none"
          stroke={STROKE}
          strokeWidth="2"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d="M22,30 L24,52 M30,30 L30,53 M38,30 L36,52"
          fill="none"
          stroke={STROKE}
          strokeWidth="1"
          opacity="0.3"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    );
  }

  // Tall glass (latte, cold drink).
  if (type === "latte" || type === "cold") {
    const body = "M18,10 H42 L39,52 C39,54 21,54 21,52 Z";
    const yF = 52 - (52 - 12) * f;
    return (
      <svg
        viewBox="0 0 60 60"
        width={size}
        height={size}
        className={className}
        aria-hidden="true"
      >
        <defs>
          <clipPath id={clipId}>
            <path d={body} />
          </clipPath>
        </defs>
        <g clipPath={`url(#${clipId})`}>
          <rect x="0" y="0" width="60" height="60" fill={CARD} />
          <rect x="0" y={yF} width="60" height={52 - yF + 6} fill={ESPRESSO} />
          <rect x="0" y={yF} width="60" height="3.5" fill={CREMA} />
        </g>
        <path
          d={body}
          fill="none"
          stroke={STROKE}
          strokeWidth="2"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        {type === "cold" && (
          <line
            x1="34"
            y1="6"
            x2="38"
            y2="26"
            stroke={STROKE}
            strokeWidth="2.5"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        )}
      </svg>
    );
  }

  // Default: cup + handle (mocha, cappuccino, filter).
  const body = "M12,15 H48 C46,39 40,49 30,49 C20,49 14,39 12,15 Z";
  const yF = 49 - (49 - 16) * f;
  return (
    <svg
      viewBox="0 0 60 60"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      <defs>
        <clipPath id={clipId}>
          <path d={body} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <rect x="0" y="0" width="60" height="60" fill={CARD} />
        <rect x="0" y={yF} width="60" height={49 - yF + 6} fill={ESPRESSO} />
        <rect x="0" y={yF} width="60" height="4" fill={CREMA} />
      </g>
      <path
        d="M48,19 C60,21 60,39 49,42"
        fill="none"
        stroke={STROKE}
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d={body}
        fill="none"
        stroke={STROKE}
        strokeWidth="2"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
