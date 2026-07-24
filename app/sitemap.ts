import type { MetadataRoute } from "next";
import { getCafes } from "@/lib/cafes";

/**
 * sitemap.xml — the wall plus every café page, so search engines can find
 * each review. Regenerated per request (the café list changes with each
 * review added).
 */
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  let cafes: Awaited<ReturnType<typeof getCafes>> = [];
  try {
    cafes = await getCafes();
  } catch {
    cafes = []; // DB hiccup: still serve the home page entry
  }

  return [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    ...cafes.map((cafe) => ({
      url: `${base}/cafe/${cafe.slug}`,
      lastModified: new Date(cafe.date),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
