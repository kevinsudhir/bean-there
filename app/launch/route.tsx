import { ImageResponse } from "next/og";
import { SITE } from "@/lib/config";
import { cupDataUri } from "@/lib/cupSvg";
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
          padding: "96px 72px",
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
        <img src={cupDataUri("cappuccino", 4.7, 460)} width={460} height={460} alt="" />

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 40 }}>
          <div style={{ fontFamily: "Newsreader", fontStyle: "italic", fontSize: 44, lineHeight: 1.4, maxWidth: 840 }}>
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
            NOW POURING · BEANTHERE.BLOG
          </div>
        </div>
      </div>
    ),
    { width: W, height: H, fonts },
  );
}
