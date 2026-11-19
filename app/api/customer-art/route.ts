import { NextResponse } from "next/server";
import { tooMany } from "@/lib/guard";
import { savePublicImage } from "@/lib/upload";
import { mutating } from "@/lib/store";

// A customer's own logo or artwork for an item that allows it (multipart "file").
async function handlePOST(req: Request) {
  if (tooMany(req, 12, 60 * 60_000)) return NextResponse.json({ error: "Too many uploads. Try again in a while, or email us the file." }, { status: 429 });
  const f = await req.formData().catch(() => null);
  const file = f?.get("file");
  if (!(file instanceof File) || !file.size) return NextResponse.json({ error: "Choose an image first." }, { status: 400 });
  // no SVG from the public: it can carry scripts
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return NextResponse.json({ error: "Use a JPG or PNG image (a PNG with a see-through background is best)." }, { status: 400 });
  try {
    return NextResponse.json({ url: await savePublicImage(file, "customer-art") });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}

export const POST = mutating(handlePOST);
