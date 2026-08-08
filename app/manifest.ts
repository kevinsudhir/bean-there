import type { MetadataRoute } from "next";
import { SITE } from "@/lib/config";

/**
 * Web app manifest — lets the site be added to a phone's home screen and open
 * like an app (no browser chrome). Icons reuse the existing /logo route, which
 * already renders the bean mark as a 1080×1080 PNG.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE.title} — ${SITE.city} cafés, rated`,
    short_name: SITE.title,
    description: SITE.tagline,
    start_url: "/",
    display: "standalone",
    background_color: "#f1eadc",
    theme_color: "#c77d18",
    icons: [
      {
        src: "/logo",
        sizes: "1080x1080",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/logo",
        sizes: "1080x1080",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
