import {
  BRICOLAGE_800,
  NEWSREADER_ITALIC,
  SPACEMONO_400,
} from "./ogFontsData";

/**
 * The site's fonts for the server-rendered share card, decoded from embedded
 * base64. No fetch and no disk read, so it behaves the same on the edge dev
 * sandbox and on Railway — the HTTP self-fetch this replaced hung in prod.
 *
 * Bricolage Grotesque = display, Newsreader italic = the verdict "voice",
 * Space Mono = the little uppercase labels.
 */
type OgFont = {
  name: string;
  data: ArrayBuffer;
  weight: 400 | 800;
  style: "normal" | "italic";
};

function decode(b64: string): ArrayBuffer {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes.buffer;
}

let cache: OgFont[] | null = null;

export function loadOgFonts(): OgFont[] {
  if (cache) return cache;
  cache = [
    { name: "Bricolage", data: decode(BRICOLAGE_800), weight: 800, style: "normal" },
    { name: "Newsreader", data: decode(NEWSREADER_ITALIC), weight: 400, style: "italic" },
    { name: "SpaceMono", data: decode(SPACEMONO_400), weight: 400, style: "normal" },
  ];
  return cache;
}
