import { promises as fs } from "fs";
import path from "path";

// On your own computer (no Supabase), photos uploaded while the shop runs are saved in
// public/uploads, which a built site doesn't serve by itself. This serves them.
const TYPES: Record<string, string> = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", gif: "image/gif", avif: "image/avif", glb: "model/gltf-binary", svg: "image/svg+xml" };

export async function GET(_req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  const root = path.join(process.cwd(), "public", "uploads");
  const file = path.join(root, ...(await ctx.params).path);
  const ext = path.extname(file).slice(1).toLowerCase();
  if (!file.startsWith(root + path.sep) || !TYPES[ext]) return new Response("Not found", { status: 404 });
  try {
    const body = await fs.readFile(file);
    return new Response(new Uint8Array(body), { headers: { "content-type": TYPES[ext], "cache-control": "public, max-age=31536000, immutable", "x-content-type-options": "nosniff", ...(ext === "svg" ? { "content-security-policy": "script-src 'none'" } : {}) } });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
