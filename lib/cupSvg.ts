import type { ItemType } from "./types";

/**
 * Builds a standalone SVG string for a cup/glass/muffin/cloche filled to a
 * fraction of its height — the same geometry as the on-screen <CupIcon>, but
 * as a self-contained SVG so it can be embedded as an <img> data URI inside a
 * server-rendered share card (Satori renders those reliably; inline clip-paths
 * it does not). Colours are the fixed light-theme palette, since the share
 * card is always cream.
 */
const STROKE = "#241c14";
const CARD = "#f8f2e6";
const ESPRESSO = "#4a2c17";
const CREMA = "#6b4227";

export function cupSvg(type: ItemType, rating: number, size = 150): string {
  const f = Math.max(0, Math.min(1, rating / 5));
  let body: string;
  let yBot: number;
  let yTop: number;
  let behind = "";
  let front = "";

  if (type === "latte" || type === "cold") {
    body = "M18,10 H42 L39,52 C39,54 21,54 21,52 Z";
    yBot = 52;
    yTop = 12;
  } else if (type === "bake" || type === "dessert") {
    body = "M16,30 L20,52 C20,54 40,54 40,52 L44,30 Z";
    yBot = 52;
    yTop = 22;
    behind = `<path d="M14,30 C14,18 46,18 46,30 Z" fill="${CREMA}"/>`;
    front = `<path d="M14,30 C14,18 46,18 46,30 Z" fill="none" stroke="${STROKE}" stroke-width="2" stroke-linejoin="round"/>`;
  } else if (type === "food") {
    body = "M14,40 C14,16 46,16 46,40 Z";
    yBot = 40;
    yTop = 21;
    front = `<circle cx="30" cy="19" r="2.5" fill="${CARD}" stroke="${STROKE}" stroke-width="2"/><path d="M8,42 C8,48 52,48 52,42" fill="none" stroke="${STROKE}" stroke-width="2" stroke-linecap="round"/><ellipse cx="30" cy="42" rx="24" ry="3.5" fill="none" stroke="${STROKE}" stroke-width="2"/>`;
  } else {
    body = "M12,15 H48 C46,39 40,49 30,49 C20,49 14,39 12,15 Z";
    yBot = 49;
    yTop = 16;
    front = `<path d="M48,19 C60,21 60,39 49,42" fill="none" stroke="${STROKE}" stroke-width="2"/>`;
  }

  const yF = yBot - (yBot - yTop) * f;
  const h = yBot - yF + 6;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60" width="${size}" height="${size}"><defs><clipPath id="c"><path d="${body}"/></clipPath></defs>${behind}<g clip-path="url(#c)"><rect width="60" height="60" fill="${CARD}"/><rect x="0" y="${yF}" width="60" height="${h}" fill="${ESPRESSO}"/><rect x="0" y="${yF}" width="60" height="3.5" fill="${CREMA}"/></g>${front}<path d="${body}" fill="none" stroke="${STROKE}" stroke-width="2" stroke-linejoin="round"/></svg>`;
}

/** The cup SVG as a data URI, ready for <img src={…}> inside a share card. */
export function cupDataUri(type: ItemType, rating: number, size = 150): string {
  return `data:image/svg+xml,${encodeURIComponent(cupSvg(type, rating, size))}`;
}
