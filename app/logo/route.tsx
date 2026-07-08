import { ImageResponse } from "next/og";

/**
 * A square 1080×1080 logo PNG — the amber bean mark on cream — sized and
 * centred so it survives Instagram's circular crop. Visit /logo and save the
 * image to use it as a profile picture. Edge runtime (the node build of
 * @vercel/og crashes on Windows paths).
 */
export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#c77d18",
        }}
      >
        <svg width="620" height="775" viewBox="0 0 40 50">
          <ellipse cx="20" cy="25" rx="15" ry="23" fill="#f1eadc" />
          <path
            d="M20,4 C12,16 12,34 20,46"
            fill="none"
            stroke="#c77d18"
            strokeWidth="3.4"
          />
        </svg>
      </div>
    ),
    { width: 1080, height: 1080 },
  );
}
