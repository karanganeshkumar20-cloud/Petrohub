import { ImageResponse } from "next/og";

export const size = {
  width: 512,
  height: 512,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, #020617 0%, #0f172a 100%)",
        }}
      >
        <div
          style={{
            width: 360,
            height: 360,
            borderRadius: 90,
            background: "#f97316",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow:
              "0 25px 70px rgba(249, 115, 22, 0.30)",
          }}
        >
          <span
            style={{
              fontSize: 230,
              fontWeight: 900,
              color: "white",
              fontFamily:
                "Arial, Helvetica, sans-serif",
              lineHeight: 1,
            }}
          >
            P
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}