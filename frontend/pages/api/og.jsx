import { ImageResponse } from "next/og";

export const config = { runtime: "edge" };

export default function handler(req) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get("title") || "SOL Prep";
  const subtitle = searchParams.get("subtitle") || "AI study assistant for Virginia SOL exams";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          backgroundColor: "#0b0b12",
          backgroundImage:
            "radial-gradient(circle at 25% 15%, rgba(124,58,237,0.35), transparent 45%), radial-gradient(circle at 80% 85%, rgba(37,54,161,0.35), transparent 45%)",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 28,
            fontWeight: 600,
            color: "#a78bfa",
            letterSpacing: 2,
            textTransform: "uppercase",
          }}
        >
          SOL Prep
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 24,
            fontSize: 60,
            fontWeight: 700,
            color: "#ffffff",
            lineHeight: 1.15,
            maxWidth: 950,
          }}
        >
          {title}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 28,
            fontSize: 30,
            color: "#c4c4d4",
            maxWidth: 900,
          }}
        >
          {subtitle}
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
