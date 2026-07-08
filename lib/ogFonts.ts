/**
 * Loads the site's real fonts for server-rendered share images (@vercel/og).
 * The .woff files live in /public/og-fonts and are fetched over HTTP from the
 * same origin — which works in both the edge dev sandbox and production, unlike
 * import.meta.url file reads (which the edge sandbox can't open).
 *
 * Bricolage Grotesque = display, Newsreader italic = the verdict "voice",
 * Space Mono = the little uppercase labels. Cached after the first load.
 */
type OgFont = {
  name: string;
  data: ArrayBuffer;
  weight: 400 | 700 | 800;
  style: "normal" | "italic";
};

let cache: OgFont[] | null = null;

export async function loadOgFonts(origin: string): Promise<OgFont[]> {
  if (cache) return cache;
  const grab = (file: string) =>
    fetch(`${origin}/og-fonts/${file}`).then((r) => {
      if (!r.ok) throw new Error(`Failed to load font ${file}`);
      return r.arrayBuffer();
    });
  const [b8, b7, ni, s4, s7] = await Promise.all([
    grab("bricolage-800.woff"),
    grab("bricolage-700.woff"),
    grab("newsreader-italic.woff"),
    grab("spacemono-400.woff"),
    grab("spacemono-700.woff"),
  ]);
  cache = [
    { name: "Bricolage", data: b8, weight: 800, style: "normal" },
    { name: "Bricolage", data: b7, weight: 700, style: "normal" },
    { name: "Newsreader", data: ni, weight: 400, style: "italic" },
    { name: "SpaceMono", data: s4, weight: 400, style: "normal" },
    { name: "SpaceMono", data: s7, weight: 700, style: "normal" },
  ];
  return cache;
}
