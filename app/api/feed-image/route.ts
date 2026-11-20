import { readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

// The product feed's photos as plain JPGs (Facebook/Instagram and Google take JPG everywhere; some reject WebP).
// Only this shop's own photos: files in /public, or its photo storage.
function allowed(src: string) {
  if (src.startsWith("/") && !src.includes("..") && !src.startsWith("//")) return "local";
  const sb = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (sb && src.startsWith(new URL(sb).origin + "/storage/v1/object/public/")) return "remote";
  if (/^https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\//.test(src)) return "remote";
  return "";
}

export async function GET(req: Request) {
  const src = new URL(req.url).searchParams.get("src") ?? "";
  const kind = allowed(src);
  if (!kind) return new Response("Not allowed", { status: 400 });
  try {
    const buf =
      kind === "local"
        ? await readFile(path.join(process.cwd(), "public", decodeURIComponent(src.split("?")[0])))
        : Buffer.from(await (await fetch(src, { signal: AbortSignal.timeout(8000) })).arrayBuffer());
    const jpg = await sharp(buf).rotate().resize(1600, 1600, { fit: "inside", withoutEnlargement: true }).flatten({ background: "#ffffff" }).jpeg({ quality: 85, mozjpeg: true }).toBuffer();
    return new Response(new Uint8Array(jpg), { headers: { "content-type": "image/jpeg", "cache-control": "public, max-age=86400, s-maxage=604800" } });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
