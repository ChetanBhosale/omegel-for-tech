import { ImageResponse } from "next/og";
import { SITE } from "@/lib/seo";

export const alt = `${SITE.name} — ${SITE.tagline}`;
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
          justifyContent: "center",
          padding: "80px",
          background: "#04293f",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            marginBottom: 40,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              border: "5px solid #ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: 999,
                background: "#34d399",
              }}
            />
          </div>
          <div style={{ fontSize: 36, opacity: 0.85 }}>OmegleForTech</div>
        </div>

        <div
          style={{
            fontSize: 76,
            lineHeight: 1.05,
            fontWeight: 600,
            maxWidth: 900,
            letterSpacing: "-2px",
          }}
        >
          Meet developers at random.
        </div>

        <div
          style={{
            fontSize: 32,
            marginTop: 28,
            color: "#9ca3af",
            maxWidth: 880,
          }}
        >
          1-on-1 video chat for developers. Sign in with GitHub, get matched in
          seconds.
        </div>
      </div>
    ),
    { ...size }
  );
}
