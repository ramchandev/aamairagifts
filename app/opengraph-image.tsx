import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Aamaira Gifts — return gifts for every Indian celebration";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const logo = await readFile(join(process.cwd(), "public/aamaira-mark.png"));
  const src = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background: "#0a2563",
        color: "#ffffff",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "72px 80px", width: "100%" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <img src={src} alt="" width={92} height={100} style={{ background: "#ffffff", borderRadius: 22 }} />
          <div style={{ display: "flex", flexDirection: "column", marginLeft: 22 }}>
            <div style={{ fontSize: 28, letterSpacing: 6, fontWeight: 800 }}>AAMAIRA</div>
            <div style={{ fontSize: 16, letterSpacing: 4, color: "#d3a445", marginTop: 4 }}>RETURN GIFTS</div>
          </div>
        </div>
        <div style={{ fontSize: 62, fontWeight: 800, lineHeight: 1.05, marginTop: 42, maxWidth: 920 }}>
          Return gifts for every Indian celebration
        </div>
        <div style={{ fontSize: 26, color: "#efddb2", marginTop: 28 }}>
          Diyas, brass, dabbas, flasks and pouches. Quote on WhatsApp.
        </div>
      </div>
    </div>,
    { ...size },
  );
}
