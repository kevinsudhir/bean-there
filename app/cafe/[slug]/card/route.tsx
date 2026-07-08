import { ImageResponse } from "next/og";
import { getCafeBySlug } from "@/lib/cafes";
import { overallScore, SITE } from "@/lib/config";
import { SCORE_CATEGORIES } from "@/lib/types";
import type { Who } from "@/lib/types";
import { buildSlides } from "@/lib/shareSlides";
import { cupDataUri } from "@/lib/cupSvg";
import { loadOgFonts } from "@/lib/ogFonts";

/**
 * One slide of a café's shareable Instagram carousel, as a 1080×1350 (4:5) PNG.
 * The slide index comes in as ?i=N; the slide list is built by buildSlides so
 * the client and this route always agree on order and count. Rendered with the
 * site's own fonts. Edge runtime (the node build of @vercel/og crashes on
 * Windows paths, and edge is what the other OG routes use).
 */
export const runtime = "edge";

const CREAM = "#f1eadc";
const INK = "#241c14";
const AMBER = "#c77d18";
const DIM = "#8a7a66";
const LINE = "#dccbb0";
const W = 1080;
const H = 1350;

const whoLabel = (who: Who): string =>
  who === "him" ? SITE.reviewers.him : who === "her" ? SITE.reviewers.her : "Shared";

function Star({ color = AMBER, size = 26 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path
        d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.783 1.401 8.172L12 18.896l-7.335 3.869 1.401-8.172L.132 9.21l8.2-1.192z"
        fill={color}
      />
    </svg>
  );
}

function Bean({ stroke }: { stroke: string }) {
  return (
    <svg width="30" height="38" viewBox="0 0 40 50">
      <ellipse cx="20" cy="25" rx="15" ry="23" fill={AMBER} />
      <path d="M20,4 C12,16 12,34 20,46" fill="none" stroke={stroke} strokeWidth="3.4" />
    </svg>
  );
}

function Wordmark({ color }: { color: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        fontFamily: "Bricolage",
        fontWeight: 800,
        fontSize: 34,
        letterSpacing: 2,
        color,
      }}
    >
      BEAN THERE
      <Bean stroke={color === "#fff" ? "#fff" : CREAM} />
    </div>
  );
}

function Badge({ overall, size }: { overall: number; size: number }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        borderRadius: size,
        background: AMBER,
        flexShrink: 0,
      }}
    >
      <div
        style={{
          fontFamily: "Bricolage",
          fontWeight: 800,
          fontSize: size * 0.4,
          color: "#fff",
          lineHeight: 1,
        }}
      >
        {overall.toFixed(1)}
      </div>
      <div
        style={{
          fontFamily: "SpaceMono",
          fontSize: size * 0.16,
          color: "rgba(255,255,255,0.85)",
        }}
      >
        /5
      </div>
    </div>
  );
}

/**
 * Fetch a photo and return it as a data URI — but only if it's a format Satori
 * can actually decode (JPEG/PNG/WebP) and isn't enormous. iPhone HEIC uploads
 * and huge files would otherwise make ImageResponse throw a 500 mid-render, so
 * anything unsupported returns null and the caller renders a photo-less slide.
 */
async function safeImage(url: string): Promise<string | null> {
  try {
    const r = await fetch(url);
    const ct = (r.headers.get("content-type") || "").toLowerCase();
    if (!r.ok || !/image\/(jpeg|jpg|png|webp)/.test(ct)) return null;
    const buf = await r.arrayBuffer();
    if (buf.byteLength > 6_000_000) return null;
    const bytes = new Uint8Array(buf);
    let bin = "";
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) {
      bin += String.fromCharCode(...bytes.subarray(i, i + chunk));
    }
    return `data:${ct};base64,${btoa(bin)}`;
  } catch {
    return null;
  }
}

function chip(text: string, dark: boolean) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        border: `2px solid ${dark ? "rgba(255,255,255,0.55)" : AMBER}`,
        borderRadius: 999,
        padding: "10px 22px",
        fontFamily: "SpaceMono",
        fontSize: 30,
        color: dark ? "#fff" : INK,
        background: dark ? "rgba(0,0,0,0.28)" : "transparent",
      }}
    >
      {text}
    </div>
  );
}

export async function GET(
  req: Request,
  { params }: { params: { slug: string } },
) {
  const cafe = await getCafeBySlug(params.slug);
  if (!cafe) return new Response("Not found", { status: 404 });

  const slides = buildSlides(cafe);
  const i = Number(new URL(req.url).searchParams.get("i") ?? "0");
  const slide = slides[i];
  if (!slide) return new Response("No such slide", { status: 404 });

  const overall = overallScore(cafe.scores);
  // Fonts are a nice-to-have — never let a font hiccup 500 the whole card.
  let fonts: Awaited<ReturnType<typeof loadOgFonts>> = [];
  try {
    fonts = await loadOgFonts(new URL(req.url).origin);
  } catch {
    fonts = [];
  }
  const opts = { width: W, height: H, fonts };

  // ---- photo-backed slides (cover + extra photos) ----
  if (slide.kind === "cover" || slide.kind === "photo") {
    const isCover = slide.kind === "cover";
    const imgSrc = await safeImage(slide.photo);

    // Photo couldn't be decoded (HEIC, too big, fetch failed): render a clean
    // cream fallback so the carousel still completes instead of erroring.
    if (!imgSrc) {
      return new ImageResponse(
        (
          <div
            style={{
              width: W,
              height: H,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 24,
              background: CREAM,
              color: INK,
              padding: 72,
              textAlign: "center",
            }}
          >
            <Wordmark color={INK} />
            <div style={{ fontFamily: "SpaceMono", fontSize: 28, letterSpacing: 3, color: AMBER }}>
              {cafe.area.toUpperCase()}
            </div>
            <div style={{ fontFamily: "Bricolage", fontWeight: 800, fontSize: 96, lineHeight: 1 }}>
              {cafe.name}
            </div>
            <Badge overall={overall} size={170} />
            {slide.item && (
              <div style={{ display: "flex" }}>
                {chip(`${slide.item.name} · ${slide.item.rating.toFixed(1)}`, false)}
              </div>
            )}
          </div>
        ),
        opts,
      );
    }

    return new ImageResponse(
      (
        <div style={{ position: "relative", display: "flex", width: W, height: H }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imgSrc}
            width={W}
            height={H}
            style={{ position: "absolute", top: 0, left: 0, width: W, height: H, objectFit: "cover" }}
            alt=""
          />
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: W,
              height: H,
              display: "flex",
              background:
                "linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 28%, rgba(0,0,0,0.12) 55%, rgba(0,0,0,0.85) 100%)",
            }}
          />
          <div style={{ position: "absolute", top: 56, left: 72, display: "flex" }}>
            <Wordmark color="#fff" />
          </div>
          <div style={{ position: "absolute", top: 52, right: 72, display: "flex" }}>
            <Badge overall={overall} size={isCover ? 150 : 120} />
          </div>
          <div
            style={{
              position: "absolute",
              left: 72,
              right: 72,
              bottom: 72,
              display: "flex",
              flexDirection: "column",
            }}
          >
            {isCover && (
              <div
                style={{
                  fontFamily: "SpaceMono",
                  fontSize: 30,
                  letterSpacing: 3,
                  color: AMBER,
                  marginBottom: 10,
                }}
              >
                {cafe.area.toUpperCase()}
              </div>
            )}
            {isCover && (
              <div
                style={{
                  fontFamily: "Bricolage",
                  fontWeight: 800,
                  fontSize: 108,
                  lineHeight: 1,
                  color: "#fff",
                  marginBottom: 20,
                }}
              >
                {cafe.name}
              </div>
            )}
            {slide.item && (
              <div style={{ display: "flex", marginBottom: isCover ? 20 : 0 }}>
                {chip(
                  `${slide.item.name} · ${slide.item.rating.toFixed(1)}`,
                  true,
                )}
              </div>
            )}
            {isCover && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
                {SCORE_CATEGORIES.map((cat) => (
                  <div
                    key={cat}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      border: "2px solid rgba(255,255,255,0.5)",
                      borderRadius: 999,
                      padding: "8px 18px",
                      background: "rgba(0,0,0,0.25)",
                    }}
                  >
                    <span style={{ fontFamily: "SpaceMono", fontSize: 26, color: "rgba(255,255,255,0.85)" }}>
                      {cat.toUpperCase()}
                    </span>
                    <span style={{ fontFamily: "Bricolage", fontWeight: 800, fontSize: 26, color: "#fff" }}>
                      {(cafe.scores[cat] ?? 0).toFixed(1)}
                    </span>
                  </div>
                ))}
              </div>
            )}
            {!isCover && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginTop: 14,
                  fontFamily: "SpaceMono",
                  fontSize: 24,
                  letterSpacing: 2,
                  color: "rgba(255,255,255,0.9)",
                }}
              >
                {cafe.name.toUpperCase()}
              </div>
            )}
          </div>
        </div>
      ),
      opts,
    );
  }

  // ---- scorecard slide ----
  const items = cafe.items.filter((it) => it.name.trim()).slice(0, 4);
  return new ImageResponse(
    (
      <div
        style={{
          width: W,
          height: H,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          background: CREAM,
          color: INK,
          padding: 72,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <Wordmark color={INK} />
          <div style={{ fontFamily: "SpaceMono", fontSize: 28, letterSpacing: 3, color: AMBER }}>
            {cafe.area.toUpperCase()}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
          <div style={{ fontFamily: "Bricolage", fontWeight: 800, fontSize: 88, lineHeight: 1 }}>
            {cafe.name}
          </div>
          <Badge overall={overall} size={150} />
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 44 }}>
          {items.map((it, k) => (
            <div key={k} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, width: 210 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={cupDataUri(it.type, it.rating)} width={150} height={150} alt="" />
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "Bricolage", fontWeight: 800, fontSize: 34, textAlign: "center" }}>
                {it.name}
                {it.star ? <Star size={24} /> : null}
              </div>
              <div style={{ fontFamily: "SpaceMono", fontSize: 24, color: DIM }}>
                {whoLabel(it.who).toUpperCase()}
              </div>
              <div style={{ display: "flex", alignItems: "baseline", fontFamily: "Bricolage", fontWeight: 800, fontSize: 46 }}>
                {it.rating.toFixed(1)}
                <span style={{ fontFamily: "SpaceMono", fontWeight: 400, fontSize: 22, color: DIM, marginLeft: 4 }}>/5</span>
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            fontFamily: "Newsreader",
            fontStyle: "italic",
            fontSize: 40,
            lineHeight: 1.4,
            textAlign: "center",
            maxWidth: 900,
          }}
        >
          {cafe.verdict || ""}
        </div>

        <div style={{ display: "flex", fontFamily: "SpaceMono", fontSize: 22, letterSpacing: 2, color: DIM }}>
          {`REVIEWED BY ${SITE.reviewers.him.toUpperCase()} & ${SITE.reviewers.her.toUpperCase()} · BEANTHERE.BLOG`}
        </div>
      </div>
    ),
    opts,
  );
}
