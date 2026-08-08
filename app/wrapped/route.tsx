import { ImageResponse } from "next/og";
import { getCafes } from "@/lib/cafes";
import { overallScore, SITE } from "@/lib/config";
import { siteStats, formatMoney } from "@/lib/stats";
import { loadOgFonts } from "@/lib/ogFonts";

/**
 * A shareable 1080×1350 "year in coffee" card — the running numbers plus the
 * top-rated cafés, in the launch poster's style. Open /wrapped and save it.
 *
 * ?year=2026 limits it to that year's visits; without it, everything so far.
 * Edge runtime + embedded fonts, like the other share images.
 */
export const runtime = "edge";
export const dynamic = "force-dynamic";

const CREAM = "#f1eadc";
const INK = "#241c14";
const AMBER = "#c77d18";
const DIM = "#8a7a66";
const W = 1080;
const H = 1350;

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        width: 240,
      }}
    >
      <div
        style={{
          display: "flex",
          fontFamily: "Bricolage",
          fontWeight: 800,
          fontSize: 82,
          lineHeight: 1,
          color: AMBER,
        }}
      >
        {value}
      </div>
      <div
        style={{
          display: "flex",
          fontFamily: "SpaceMono",
          fontSize: 24,
          letterSpacing: 3,
          color: DIM,
        }}
      >
        {label.toUpperCase()}
      </div>
    </div>
  );
}

export async function GET(req: Request) {
  const year = new URL(req.url).searchParams.get("year");

  let cafes = await getCafes();
  if (year) cafes = cafes.filter((c) => c.date?.startsWith(year));

  const s = siteStats(cafes);
  const top = [...cafes]
    .sort((a, b) => overallScore(b.scores) - overallScore(a.scores))
    .slice(0, 3);

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
          padding: "80px 72px 60px",
          textAlign: "center",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ display: "flex", fontFamily: "Bricolage", fontWeight: 800, fontSize: 40, letterSpacing: 2 }}>
              BEAN THERE
            </div>
            <svg width="30" height="38" viewBox="0 0 40 50">
              <ellipse cx="20" cy="25" rx="15" ry="23" fill={AMBER} />
              <path d="M20,4 C12,16 12,34 20,46" fill="none" stroke={CREAM} strokeWidth="3.4" />
            </svg>
          </div>
          <div style={{ display: "flex", fontFamily: "Bricolage", fontWeight: 800, fontSize: 96, lineHeight: 1 }}>
            {year ?? "SO FAR"}
          </div>
          <div style={{ display: "flex", fontFamily: "SpaceMono", fontSize: 28, letterSpacing: 4, color: AMBER }}>
            OUR YEAR IN COFFEE
          </div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 40 }}>
          <Stat value={String(s.cafes)} label={s.cafes === 1 ? "café" : "cafés"} />
          <Stat value={String(s.cups)} label={s.cups === 1 ? "cup" : "cups"} />
          {s.priced > 0 && <Stat value={formatMoney(s.spent)} label="spent" />}
          <Stat value={s.averageScore.toFixed(1)} label="avg score" />
        </div>

        {top.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18, width: "100%" }}>
            <div style={{ display: "flex", fontFamily: "SpaceMono", fontSize: 26, letterSpacing: 4, color: DIM }}>
              TOP OF THE WALL
            </div>
            {top.map((cafe, i) => (
              <div
                key={cafe.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 22,
                  width: "100%",
                  maxWidth: 780,
                }}
              >
                <div style={{ display: "flex", fontFamily: "Bricolage", fontWeight: 800, fontSize: 44, color: AMBER, width: 60 }}>
                  {i + 1}
                </div>
                <div
                  style={{
                    display: "flex",
                    fontFamily: "Bricolage",
                    fontWeight: 800,
                    fontSize: cafe.name.length > 20 ? 40 : 52,
                    lineHeight: 1.1,
                    flexGrow: 1,
                    minWidth: 0,
                    textAlign: "left",
                  }}
                >
                  {cafe.name}
                </div>
                <div style={{ display: "flex", fontFamily: "Bricolage", fontWeight: 800, fontSize: 46 }}>
                  {overallScore(cafe.scores).toFixed(1)}
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 22 }}>
          {s.topArea && (
            // display:flex is required by Satori on any element with more than
            // one child ("Most visited: " plus the value).
            <div style={{ display: "flex", fontFamily: "Newsreader", fontStyle: "italic", fontSize: 36, color: INK }}>
              {`Most visited: ${s.topArea}`}
            </div>
          )}
          <div
            style={{
              display: "flex",
              fontFamily: "SpaceMono",
              fontWeight: 700,
              fontSize: 28,
              letterSpacing: 3,
              color: "#fff",
              background: AMBER,
              borderRadius: 999,
              padding: "16px 36px",
            }}
          >
            BEANTHERE.BLOG
          </div>
        </div>
      </div>
    ),
    { width: W, height: H, fonts },
  );
}
