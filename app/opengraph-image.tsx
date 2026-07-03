import { ImageResponse } from "next/og";
import { SITE } from "@/lib/config";

/**
 * The link-preview card (Open Graph image) shown when the site is shared on
 * WhatsApp, iMessage, Slack, etc. Rendered by Next at request time.
 */
// The node build of @vercel/og crashes on Windows paths (Invalid URL in
// fileURLToPath); the edge build doesn't, and runs fine on any host.
export const runtime = "edge";

export const alt = "Bean There — Manchester coffee, rated";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 28,
          background: "#f1eadc",
          color: "#241c14",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <svg width="90" height="112" viewBox="0 0 40 50">
            <ellipse cx="20" cy="25" rx="15" ry="23" fill="#c77d18" />
            <path
              d="M20,4 C12,16 12,34 20,46"
              fill="none"
              stroke="#f1eadc"
              strokeWidth="3.4"
            />
          </svg>
          <div style={{ fontSize: 110, fontWeight: 800 }}>BEAN THERE</div>
        </div>
        <div style={{ fontSize: 34, color: "#c77d18" }}>
          {SITE.kickerRight}
        </div>
      </div>
    ),
    size,
  );
}
