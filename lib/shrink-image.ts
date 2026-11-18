"use client";

// Phone photos are often 5MB+ (over Vercel's upload limit), and iPhones may hand
// over HEIC files. This resizes big photos and turns anything unusual into a JPEG.
const OK = /^image\/(jpeg|png|webp)$/;

async function decode(file: File): Promise<CanvasImageSource & { width: number; height: number }> {
  try {
    return await createImageBitmap(file);
  } catch {
    // older Safari: fall back to an <img>
    const url = URL.createObjectURL(file);
    try {
      const img = new Image();
      img.src = url;
      await img.decode();
      return img;
    } finally {
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
  }
}

export async function shrink(file: File, maxSide = 1800): Promise<Blob> {
  if (file.type === "image/gif" || file.type === "image/svg+xml") return file;
  if (OK.test(file.type) && file.size < 1_500_000) {
    // small enough already, unless it's huge in pixels
    const bmp = await createImageBitmap(file).catch(() => null);
    if (!bmp || Math.max(bmp.width, bmp.height) <= maxSide) return file;
  }
  let pic;
  try {
    pic = await decode(file);
  } catch {
    if (OK.test(file.type)) return file;
    throw new Error("That photo format can't be opened here. Try a JPG or PNG, or take a screenshot of it.");
  }
  const scale = Math.min(1, maxSide / Math.max(pic.width, pic.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(pic.width * scale);
  canvas.height = Math.round(pic.height * scale);
  canvas.getContext("2d")!.drawImage(pic, 0, 0, canvas.width, canvas.height);
  const type = file.type === "image/png" ? "image/png" : "image/jpeg";
  return new Promise((r) => canvas.toBlob((b) => r(b ?? file), type, 0.86));
}
