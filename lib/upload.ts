import "server-only";
import { put } from "@vercel/blob";
import { promises as fs } from "fs";
import path from "path";
import { BUCKET, ensureSupabase, supabase, supabaseConfigured } from "./supabase";

export const blobConfigured = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);
export const imageStorage = (): "supabase" | "blob" | "local" => (supabaseConfigured() ? "supabase" : blobConfigured() ? "blob" : "local");
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml", "image/avif"];

// 3D scans (.glb). Phones often send these without a type, so the name is checked too.
export const isModelFile = (file: File) => file.type === "model/gltf-binary" || /\.glb$/i.test(file.name);

export async function saveImage(file: File, folder: string): Promise<string> {
  if (folder === "models" && isModelFile(file)) return saveFile(file, folder, "model/gltf-binary");
  if (!ALLOWED.includes(file.type)) throw new Error("Use a JPG, PNG, WebP, GIF or SVG image.");
  if (file.size > 4_400_000) throw new Error("That image is over 4 MB. Try a smaller one.");
  return saveFile(file, folder, file.type);
}

/**
 * For uploads from customers (reviews, custom requests, their own artwork): the
 * picture is opened and saved again as a plain JPG (or PNG when it has see-through
 * parts), so only real photos get stored: no SVG, no files pretending to be images.
 */
export async function savePublicImage(file: File, folder: string): Promise<string> {
  if (file.size > 12_000_000) throw new Error("That photo is over 12 MB. Try a smaller one.");
  const sharp = (await import("sharp")).default;
  let out: Buffer;
  let png = false;
  try {
    const img = sharp(Buffer.from(await file.arrayBuffer()), { limitInputPixels: 60_000_000 }).rotate();
    const meta = await img.metadata();
    if (!meta.format || !["jpeg", "png", "webp", "gif", "heif", "avif", "tiff"].includes(meta.format)) throw new Error("not a photo");
    png = meta.format === "png" || (meta.hasAlpha === true && meta.format !== "jpeg");
    const sized = img.resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true });
    out = png ? await sized.png({ compressionLevel: 9 }).toBuffer() : await sized.jpeg({ quality: 85, mozjpeg: true }).toBuffer();
  } catch {
    throw new Error("That file isn't a photo we can use. Try a JPG or PNG.");
  }
  const type = png ? "image/png" : "image/jpeg";
  return saveFile(new File([new Uint8Array(out)], png ? "photo.png" : "photo.jpg", { type }), folder, type);
}

async function saveFile(file: File, folder: string, contentType: string): Promise<string> {
  if (file.size > 4_400_000)
    throw new Error("That file is over 4 MB, the most the site can take in one go. Export a smaller version, or put it in the public/models folder on GitHub and paste its link instead.");
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const name = `${folder}/${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}.${ext}`;

  if (supabaseConfigured()) {
    await ensureSupabase();
    const sb = supabase();
    const { error } = await sb.storage.from(BUCKET).upload(name, Buffer.from(await file.arrayBuffer()), { contentType, upsert: false, cacheControl: "31536000" });
    if (error) throw new Error(`Upload failed: ${error.message}`);
    return sb.storage.from(BUCKET).getPublicUrl(name).data.publicUrl;
  }
  if (blobConfigured()) {
    const res = await put(name, file, { access: "public", contentType });
    return res.url;
  }
  if (process.env.VERCEL) throw new Error("Photo storage isn't connected yet. Connect Supabase in Vercel (Storage), then redeploy.");
  const dest = path.join(process.cwd(), "public", "uploads", name);
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.writeFile(dest, Buffer.from(await file.arrayBuffer()));
  return `/uploads/${name}`;
}
