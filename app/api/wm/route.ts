import path from "path";
import sharp, { type OverlayOptions, type Sharp } from "sharp";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { getSettings } from "@/lib/db";

/*
 * Serves a shop photo with the watermark stamped on. The address carries a
 * fingerprint of the watermark settings (?v=...), so each version is made once
 * and then cached by Vercel's network; changing the settings makes new ones.
 */
export const runtime = "nodejs";

const FONT = path.join(process.cwd(), "assets/fonts/LiberationSans-Bold.ttf");
const MAX_IN = 15_000_000;

// Only photos from this site or its photo storage, never any address on the internet
function allowed(u: URL, self: URL) {
  if (u.origin === self.origin) return true;
  const sb = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (sb && u.origin === new URL(sb).origin && u.pathname.includes("/storage/v1/object/public/")) return true;
  return u.protocol === "https:" && u.hostname.endsWith(".public.blob.vercel-storage.com");
}

async function load(u: URL) {
  const r = await fetch(u, { cache: "force-cache" });
  if (!r.ok) throw new Error(`photo ${r.status}`);
  const buf = Buffer.from(await r.arrayBuffer());
  if (buf.length > MAX_IN) throw new Error("photo too big");
  return buf;
}

// Fade an RGBA image to the given opacity
const fade = (img: Sharp, opacity: number) => img.ensureAlpha().linear([1, 1, 1, opacity], [0, 0, 0, 0]);

export async function GET(req: Request) {
  const self = new URL(req.url);
  const raw = self.searchParams.get("u") ?? "";
  let src: URL;
  try {
    src = new URL(raw, self.origin);
  } catch {
    return new Response("Bad address", { status: 400 });
  }
  if (!allowed(src, self) || src.pathname.startsWith("/api/")) return new Response("Not allowed", { status: 403 });

  try {
    const s = await getSettings();
    let w = s.watermark;
    // live preview in the dashboard: unsaved settings, owner only, never cached
    const preview = self.searchParams.get("p");
    let live = false;
    if (preview) {
      const token = req.headers.get("cookie")?.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`))?.[1];
      if (await verifySessionToken(token)) {
        try {
          w = { ...w, ...JSON.parse(preview), on: true };
          live = true;
        } catch {}
      }
    }
    if (!w.on) return Response.redirect(src, 302);
    const input = await load(src);

    const base = sharp(input, { animated: false }).rotate();
    const meta = await base.metadata();
    const W0 = meta.width ?? 1200;
    const scale = Math.min(1, 1800 / Math.max(W0, meta.height ?? W0));
    const width = Math.round(W0 * scale);
    const height = Math.round((meta.height ?? W0) * scale);
    const photo = await base.resize(width, height).toBuffer();

    // the stamp: logo and/or text, white with a soft dark shadow so it reads on light and dark photos
    const markW = Math.max(80, Math.round((width * (w.position === "tiled" ? Math.min(w.size, 30) : w.size)) / 100));
    const text = (w.text || s.businessName).replace(/[<>&]/g, "");
    const parts: OverlayOptions[] = [];
    let markH = 0;
    let logoH = 0;
    if (w.useLogo && s.logo) {
      try {
        const logoUrl = new URL(s.logo, self.origin);
        if (allowed(logoUrl, self)) {
          const logo = await sharp(await load(logoUrl)).resize({ width: Math.round(markW * 0.42) }).png().toBuffer({ resolveWithObject: true });
          logoH = logo.info.height;
          parts.push({ input: logo.data, left: Math.round((markW - logo.info.width) / 2), top: 0 });
          markH = logoH + 4;
        }
      } catch {}
    }
    if (text) {
      const t = await sharp({ text: { text: `<span foreground="white">${text}</span>`, fontfile: FONT, font: "Liberation Sans Bold", width: markW, height: Math.round(markW / 6), rgba: true, align: "center" } })
        .png()
        .toBuffer({ resolveWithObject: true });
      const shadow = await sharp({ text: { text: `<span foreground="black">${text}</span>`, fontfile: FONT, font: "Liberation Sans Bold", width: markW, height: Math.round(markW / 6), rgba: true, align: "center" } })
        .blur(1.5)
        .png()
        .toBuffer();
      const left = Math.round((markW - t.info.width) / 2);
      parts.push({ input: shadow, left: left + 2, top: markH + 2 }, { input: t.data, left, top: markH });
      markH += t.info.height + 4;
    }
    if (!parts.length) return Response.redirect(src, 302);
    const stamp = await fade(sharp({ create: { width: markW + 4, height: markH + 4, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } }).composite(parts).png(), w.opacity / 100)
      .png()
      .toBuffer();

    const pad = Math.round(width * 0.03);
    const overlay: OverlayOptions =
      w.position === "tiled"
        ? {
            // a stamp with space around it, repeated across the photo
            input: await sharp({ create: { width: markW + Math.round(markW * 0.6), height: markH + Math.round(markW * 0.5), channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
              .composite([{ input: stamp, left: Math.round(markW * 0.3), top: Math.round(markW * 0.25) }])
              .png()
              .toBuffer(),
            tile: true,
          }
        : w.position === "center"
          ? { input: stamp, gravity: "center" }
          : { input: stamp, left: Math.max(0, width - markW - pad), top: Math.max(0, height - markH - pad) };

    const out = sharp(photo).composite([overlay]);
    const png = meta.hasAlpha || meta.format === "svg" || meta.format === "png";
    const body = png ? await out.png({ compressionLevel: 9 }).toBuffer() : await out.jpeg({ quality: 84, mozjpeg: true }).toBuffer();
    return new Response(new Uint8Array(body), {
      headers: {
        "content-type": png ? "image/png" : "image/jpeg",
        "cache-control": live ? "private, no-store" : "public, max-age=31536000, s-maxage=31536000, immutable",
      },
    });
  } catch (e) {
    console.error("watermark:", (e as Error).message);
    // never leave a broken image: fall back to the plain photo
    return Response.redirect(src, 302);
  }
}
