import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import sharp from "sharp";
import { inkOn } from "@/lib/link-page";
import { shopSettings } from "@/lib/shop-data";
import { getTheme } from "@/lib/themes";

export const runtime = "nodejs";
export const dynamic = "force-dynamic"; // follows the Link page settings, not frozen at build time
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Links";

// The picture that shows when the Socials page link is posted on Facebook, X, iMessage...
async function picture(src: string) {
  if (!src) return "";
  try {
    let buf: Buffer;
    if (/^https:\/\//.test(src)) {
      const r = await fetch(src, { signal: AbortSignal.timeout(4000) });
      if (!r.ok) return "";
      buf = Buffer.from(await r.arrayBuffer());
    } else if (src.startsWith("/") && !src.includes("..")) {
      buf = await readFile(path.join(process.cwd(), "public", src));
    } else return "";
    const png = await sharp(buf).resize(320, 320, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 1 } }).flatten({ background: "#ffffff" }).png().toBuffer();
    return `data:image/png;base64,${png.toString("base64")}`;
  } catch {
    return "";
  }
}

export default async function Image() {
  const s = await shopSettings();
  const p = s.linkPage;
  const t = getTheme(s.theme).colors;
  const title = p.title || s.businessName;
  const bio = (p.bio || s.tagline || "").slice(0, 140);
  const bg = p.bg === "color" ? p.color1 : p.bg === "gradient" ? `linear-gradient(160deg, ${p.color1}, ${p.color2})` : `linear-gradient(160deg, ${t.band}, ${t.band} 45%, ${t.accent})`;
  const ink = p.textColor || (p.bg === "color" || p.bg === "gradient" ? inkOn(p.color1) : inkOn(t.band));
  const pic = await picture(p.avatar || s.logo);
  const n = s.links.filter((l) => !l.hidden && l.url).length;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", padding: "0 90px", background: bg, color: ink, fontFamily: "sans-serif" }}>
        {pic ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={pic} width={260} height={260} style={{ borderRadius: 999, marginRight: 64, border: "8px solid rgba(255,255,255,.85)" }} alt="" />
        ) : null}
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <div style={{ fontSize: 72, fontWeight: 800, lineHeight: 1.05 }}>{title}</div>
          {p.handle ? <div style={{ fontSize: 36, marginTop: 14, opacity: 0.85 }}>{p.handle}</div> : null}
          {bio ? <div style={{ fontSize: 34, marginTop: 22, opacity: 0.9, lineHeight: 1.3 }}>{bio}</div> : null}
          <div style={{ display: "flex", marginTop: 40 }}>
            <div style={{ display: "flex", fontSize: 30, fontWeight: 700, padding: "16px 34px", borderRadius: 999, background: ink, color: ink === "#ffffff" ? "#111" : "#fff" }}>
              {n ? `${n} link${n === 1 ? "" : "s"} · Shop · Socials` : "Shop · Socials"}
            </div>
          </div>
        </div>
      </div>
    ),
    size
  );
}
