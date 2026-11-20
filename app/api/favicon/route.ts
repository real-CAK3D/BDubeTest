import { readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { getSettings } from "@/lib/db";

/*
 * EDIT-POINT: TAB-ICON
 * The shop's browser tab and phone home-screen icon, made sharp at each size
 * from the uploaded tab icon (if it's big enough) or else the main logo,
 * cropped to the middle so it fills the square. Change it by uploading a new
 * logo or tab icon under Words & logos > Logos & photos.
 */
const SIZES = [16, 32, 48, 180, 192, 512];
const cache = new Map<string, Buffer>();

async function load(src: string) {
  if (/^https:\/\//.test(src)) {
    const r = await fetch(src, { signal: AbortSignal.timeout(5000) });
    return r.ok ? Buffer.from(await r.arrayBuffer()) : null;
  }
  if (src.startsWith("/") && !src.includes("..")) return readFile(path.join(process.cwd(), "public", src)).catch(() => null);
  return null;
}

export async function GET(req: Request) {
  const want = Number(new URL(req.url).searchParams.get("s")) || 32;
  const size = SIZES.includes(want) ? want : 32;
  const s = await getSettings();
  const key = `${s.favicon}|${s.logo}|${size}`;
  let png = cache.get(key);
  if (!png) {
    const fav = s.favicon ? await load(s.favicon) : null;
    const favBig = fav ? ((await sharp(fav).metadata()).width ?? 0) >= Math.max(size, 128) : false;
    const src = favBig ? fav : (s.logo ? await load(s.logo) : null) ?? fav;
    if (!src) return new Response(null, { status: 404 });
    let img = sharp(src).trim({ threshold: 8 });
    const { data, info } = await img.toBuffer({ resolveWithObject: true });
    // wide logos: keep the middle, a little wider than tall, so the main mark fills the icon
    const w = Math.min(info.width, Math.round(info.height * 1.12));
    img = sharp(data).extract({ left: Math.round((info.width - w) / 2), top: 0, width: w, height: info.height });
    const apple = size === 180; // iPhone needs a solid background
    png = await img
      .resize(size, size, { fit: "contain", kernel: "lanczos3", background: apple ? { r: 16, g: 16, b: 16, alpha: 1 } : { r: 0, g: 0, b: 0, alpha: 0 } })
      .sharpen(size <= 48 ? { sigma: 0.6 } : undefined)
      .png({ compressionLevel: 9 })
      .toBuffer();
    if (cache.size > 40) cache.clear();
    cache.set(key, png);
  }
  return new Response(new Uint8Array(png), { headers: { "content-type": "image/png", "cache-control": "public, max-age=3600, stale-while-revalidate=86400" } });
}
