import { ImageResponse } from "next/og";

export const alt =
  "PetroHub - Engineering Knowledge Platform";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType =
  "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background:
            "linear-gradient(135deg, #020617 0%, #0f172a 55%, #1e293b 100%)",
          color: "white",
          fontFamily:
            "Arial, Helvetica, sans-serif",
          overflow: "hidden",
        }}
      >
        {/* Orange glow */}

        <div
          style={{
            position: "absolute",
            width: 520,
            height: 520,
            borderRadius: "50%",
            background:
              "rgba(249, 115, 22, 0.16)",
            top: -210,
            right: -120,
          }}
        />

        <div
          style={{
            position: "absolute",
            width: 340,
            height: 340,
            borderRadius: "50%",
            background:
              "rgba(249, 115, 22, 0.08)",
            bottom: -180,
            left: -80,
          }}
        />

        {/* Main content */}

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "72px 82px",
            width: "100%",
          }}
        >
          {/* Logo */}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: 45,
            }}
          >
            <div
              style={{
                width: 76,
                height: 76,
                borderRadius: 18,
                background: "#f97316",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 42,
                fontWeight: 900,
                marginRight: 22,
              }}
            >
              P
            </div>

            <div
              style={{
                display: "flex",
                fontSize: 44,
                fontWeight: 900,
                letterSpacing: -1,
              }}
            >
              Petro
              <span
                style={{
                  color: "#f97316",
                }}
              >
                Hub
              </span>
            </div>
          </div>

          {/* Heading */}

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              maxWidth: 930,
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 67,
                lineHeight: 1.05,
                fontWeight: 900,
                letterSpacing: -2,
              }}
            >
              Engineering Knowledge
            </div>

            <div
              style={{
                display: "flex",
                fontSize: 67,
                lineHeight: 1.05,
                fontWeight: 900,
                letterSpacing: -2,
                color: "#f97316",
              }}
            >
              Built for Practical Learning.
            </div>
          </div>

          {/* Description */}

          <div
            style={{
              display: "flex",
              marginTop: 32,
              maxWidth: 900,
              fontSize: 27,
              lineHeight: 1.45,
              color: "#cbd5e1",
            }}
          >
            Oil & Gas • HSE • Mechanical •
            Electrical • Instrumentation •
            Process • Civil • Geology
          </div>

          {/* Bottom */}

          <div
            style={{
              position: "absolute",
              bottom: 55,
              left: 82,
              right: 82,
              display: "flex",
              alignItems: "center",
              justifyContent:
                "space-between",
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 20,
                color: "#94a3b8",
              }}
            >
              Articles • Engineering Library •
              Technical Resources
            </div>

            <div
              style={{
                display: "flex",
                fontSize: 21,
                fontWeight: 700,
                color: "#fb923c",
              }}
            >
              petrohub-dlor.vercel.app
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}