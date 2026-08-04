import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "CleanFlow — trust infrastructure for the programmable economy";

export default async function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 72,
          color: "#ffffff",
          background: "linear-gradient(180deg, #0a79d8, #18a6ff)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
              <path d="M12 2.8A9.2 9.2 0 1 0 21.2 12" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" opacity="0.45" />
              <path d="M6.8 12.6l3.4 3.4 7-7.9" stroke="#2563eb" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div style={{ fontSize: 38, fontWeight: 700, letterSpacing: -1 }}>CleanFlow</div>
        </div>
        <div style={{ marginTop: 36, fontSize: 64, fontWeight: 700, letterSpacing: -2, lineHeight: 1.05, maxWidth: 900 }}>
          Payments that verify before they settle.
        </div>
        <div style={{ marginTop: 24, fontSize: 26, color: "#ffffffcc", maxWidth: 820 }}>
          Trust infrastructure for the programmable economy.
        </div>
      </div>
    ),
    size,
  );
}