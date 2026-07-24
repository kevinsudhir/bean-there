import type { MetadataRoute } from "next";

/** robots.txt — index the public pages, keep the private/utility ones out. */
export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/add", "/login", "/api/", "/cafe/*/edit", "/cafe/*/card"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
