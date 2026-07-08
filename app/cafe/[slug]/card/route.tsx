import { ImageResponse } from "next/og";
import { getCafeBySlug } from "@/lib/cafes";
import { overallScore, isLoved, formatVisitDate, SITE } from "@/lib/config";
import { SCORE_CATEGORIES } from "@/lib/types";

/**
 * A square 1080×1080 branded review card for one café, for sharing to
 * Instagram/WhatsApp or downloading. Rendered with @vercel/og (Satori) so it
 * looks the same on every device without capturing the live DOM. Edge runtime
 * to match the other OG routes (node build crashes on Windows paths).
 */
export const runtime = "edge";

const CREAM = "#f1eadc";
const INK = "#241c14";
const AMBER = "#c77d18";
const DIM = "#8a7a66";

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max).replace(/\s+\S*$/, "") + "…";
}

export async function GET(
  _req: Request,
  { params }: { params: { slug: string } },
) {
  const cafe = await getCafeBySlug(params.slug);
  if (!cafe) return new Response("Not found", { status: 404 });

  const overall = overallScore(cafe.scores);
  const loved = isLoved(cafe);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: CREAM,
          color: INK,
          padding: 80,
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              fontSize: 34,
              fontWeight: 800,
              letterSpacing: 2,
            }}
          >
            BEAN THERE
            <svg
              width="26"
              height="34"
              viewBox="0 0 40 50"
              style={{ marginLeft: 12 }}
            >
              <ellipse cx="20" cy="25" rx="15" ry="23" fill={AMBER} />
              <path
                d="M20,4 C12,16 12,34 20,46"
                fill="none"
                stroke={CREAM}
                strokeWidth="3.4"
              />
            </svg>
          </div>
          <div style={{ display: "flex", fontSize: 26, color: AMBER, letterSpacing: 1 }}>
            {cafe.area.toUpperCase()} · {formatVisitDate(cafe.date).toUpperCase()}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 96,
              fontWeight: 800,
              lineHeight: 1,
              flex: 1,
              paddingRight: 40,
            }}
          >
            {cafe.name}
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              width: 220,
              height: 220,
              borderRadius: 110,
              border: `8px solid ${AMBER}`,
              background: loved ? AMBER : "transparent",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 88,
                fontWeight: 800,
                color: loved ? "#fff" : AMBER,
                lineHeight: 1,
              }}
            >
              {overall.toFixed(1)}
            </div>
            <div
              style={{ display: "flex", fontSize: 28, color: loved ? "#fff" : DIM }}
            >
              /5
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
          {SCORE_CATEGORIES.map((cat) => (
            <div
              key={cat}
              style={{
                display: "flex",
                alignItems: "center",
                border: `2px solid ${AMBER}`,
                borderRadius: 999,
                padding: "12px 26px",
                fontSize: 28,
              }}
            >
              <span style={{ color: DIM, marginRight: 12 }}>
                {cat.toUpperCase()}
              </span>
              <b style={{ fontWeight: 800 }}>{(cafe.scores[cat] ?? 0).toFixed(1)}</b>
            </div>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 38,
            fontStyle: "italic",
            lineHeight: 1.4,
          }}
        >
          {truncate(cafe.verdict || "", 180)}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
            fontSize: 24,
            color: DIM,
            letterSpacing: 1,
          }}
        >
          <div style={{ display: "flex" }}>BEANTHERE.BLOG</div>
          <div style={{ display: "flex" }}>{SITE.kickerRight.toUpperCase()}</div>
        </div>
      </div>
    ),
    { width: 1080, height: 1080 },
  );
}
