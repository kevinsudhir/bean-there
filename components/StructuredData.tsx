import type { Cafe } from "@/lib/types";
import { overallScore, SITE } from "@/lib/config";

/**
 * JSON-LD structured data. Invisible on the page, but it's what lets search
 * engines show a star rating next to our results and understand that each
 * café page is a review of a specific place.
 *
 * Schema.org `Review` with a `CafeOrCoffeeShop` subject; the home page gets an
 * `ItemList` pointing at every review.
 */
const siteUrl = () =>
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

function Json({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      // The payload is our own data, not user-supplied HTML; angle brackets are
      // escaped so a café name can never break out of the script tag.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}

/** Review + rating markup for a single café page. */
export function CafeJsonLd({ cafe }: { cafe: Cafe }) {
  const base = siteUrl();
  const score = overallScore(cafe.scores);
  return (
    <Json
      data={{
        "@context": "https://schema.org",
        "@type": "Review",
        url: `${base}/cafe/${cafe.slug}`,
        datePublished: cafe.date,
        reviewBody: cafe.verdict || undefined,
        author: {
          "@type": "Organization",
          name: SITE.title,
          url: base,
        },
        reviewRating: {
          "@type": "Rating",
          ratingValue: score,
          bestRating: 5,
          worstRating: 0,
        },
        itemReviewed: {
          "@type": "CafeOrCoffeeShop",
          name: cafe.name,
          image: cafe.photos?.[0] || undefined,
          address: {
            "@type": "PostalAddress",
            addressLocality: cafe.area,
            addressRegion: SITE.city,
            addressCountry: "GB",
          },
          ...(typeof cafe.lat === "number" && typeof cafe.lng === "number"
            ? {
                geo: {
                  "@type": "GeoCoordinates",
                  latitude: cafe.lat,
                  longitude: cafe.lng,
                },
              }
            : {}),
        },
      }}
    />
  );
}

/** A list of every review, for the home page. */
export function WallJsonLd({ cafes }: { cafes: Cafe[] }) {
  const base = siteUrl();
  return (
    <Json
      data={{
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: `${SITE.title} — ${SITE.city} café reviews`,
        numberOfItems: cafes.length,
        itemListElement: cafes.map((cafe, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: `${base}/cafe/${cafe.slug}`,
          name: cafe.name,
        })),
      }}
    />
  );
}
