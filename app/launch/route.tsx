import { ImageResponse } from "next/og";
import { SITE } from "@/lib/config";
import { loadOgFonts } from "@/lib/ogFonts";

/**
 * A one-off 1080×1350 launch/announcement image for the first Instagram post.
 * Open /launch and save it. Edge runtime + embedded fonts, like the other
 * share images.
 */
export const runtime = "edge";

const CREAM = "#f1eadc";
const INK = "#241c14";
const AMBER = "#c77d18";
const W = 1080;
const H = 1350;

/** A ceramic cup on a saucer with steam, as an SVG data URI (fixed colours). */
function heroCupUri(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 320" width="440" height="306">
  <ellipse cx="230" cy="272" rx="120" ry="12" fill="#000" opacity="0.06"/>
  <path d="M112,268 H348 C342,282 300,288 230,288 C160,288 118,282 112,268 Z" fill="#f8f2e6" stroke="#241c14" stroke-width="4" stroke-linejoin="round"/>
  <g fill="none" stroke="#8a7a66" stroke-width="4" stroke-linecap="round" opacity="0.55">
    <path d="M204,72 C196,60 214,52 206,38 C200,29 210,21 206,14"/>
    <path d="M230,70 C222,58 240,50 232,36 C226,27 236,19 232,12"/>
    <path d="M256,72 C248,60 266,52 258,38 C252,29 262,21 258,14"/>
  </g>
  <path d="M310,118 C368,126 368,186 314,198" fill="none" stroke="#241c14" stroke-width="11" stroke-linecap="round"/>
  <path d="M150,94 H310 C305,182 283,218 230,218 C177,218 155,182 150,94 Z" fill="#f8f2e6" stroke="#241c14" stroke-width="5" stroke-linejoin="round"/>
  <defs><clipPath id="hc"><path d="M150,94 H310 C305,182 283,218 230,218 C177,218 155,182 150,94 Z"/></clipPath></defs>
  <g clip-path="url(#hc)">
    <rect x="142" y="80" width="176" height="150" fill="#e7dcc6"/>
    <rect x="142" y="108" width="176" height="122" fill="#4a2c17"/>
    <rect x="142" y="108" width="176" height="15" fill="#6b4227"/>
  </g>
  <path d="M150,94 C156,86 304,86 310,94" fill="none" stroke="#241c14" stroke-width="3.5"/>
</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export async function GET() {
  let fonts: ReturnType<typeof loadOgFonts> = [];
  try {
    fonts = loadOgFonts();
  } catch {
    fonts = [];
  }
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
          padding: "84px 72px 56px",
          textAlign: "center",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
          <div style={{ fontFamily: "SpaceMono", fontSize: 30, letterSpacing: 6, color: AMBER }}>
            MANCHESTER · EST. 2026
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{ fontFamily: "Bricolage", fontWeight: 800, fontSize: 132, lineHeight: 0.9, letterSpacing: -2 }}>
              BEAN THERE
            </div>
            <svg width="72" height="90" viewBox="0 0 40 50">
              <ellipse cx="20" cy="25" rx="15" ry="23" fill={AMBER} />
              <path d="M20,4 C12,16 12,34 20,46" fill="none" stroke={CREAM} strokeWidth="3.4" />
            </svg>
          </div>
          <div style={{ fontFamily: "SpaceMono", fontSize: 28, letterSpacing: 4, color: INK }}>
            {SITE.kickerRight.toUpperCase()}
          </div>
        </div>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={heroCupUri()} width={520} height={362} alt="" />

        <div style={{ display: "flex", fontFamily: "Newsreader", fontStyle: "italic", fontSize: 44, lineHeight: 1.4, maxWidth: 840 }}>
          {SITE.tagline}
        </div>

        <div
          style={{
            display: "flex",
            fontFamily: "SpaceMono",
            fontWeight: 700,
            fontSize: 30,
            letterSpacing: 3,
            color: "#fff",
            background: AMBER,
            borderRadius: 999,
            padding: "18px 40px",
          }}
        >
          BEANTHERE.BLOG
        </div>
      </div>
    ),
    { width: W, height: H, fonts },
  );
}
