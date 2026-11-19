import type { Design, GalleryItem, Product, SiteSettings, Watermark } from "./types";

/*
 * EDIT-POINT: WATERMARK
 * Turns photo addresses into watermarked ones when the watermark is on
 * (Look & layout > Watermark). The original photo is never changed: switching
 * the watermark off shows the clean photos again straight away.
 * The stamping itself happens in app/api/wm/route.ts.
 */

export const DEFAULT_WATERMARK: Watermark = { on: false, text: "", useLogo: true, position: "corner", opacity: 45, size: 28, onGallery: true, onDesigns: false };

/** Short fingerprint of the watermark settings; part of each address so a change shows at once. */
export function wmVersion(w: Watermark, logo: string) {
  const str = JSON.stringify([w, logo]);
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

export function wmUrl(src: string, w: Watermark, logo: string) {
  if (!w.on || !src || src.startsWith("data:") || src.startsWith("/api/wm")) return src;
  return `/api/wm?u=${encodeURIComponent(src)}&v=${wmVersion(w, logo)}`;
}

/** The shop's copy of the data, with watermarked photo addresses. Never save what this returns. */
export function wmProduct(p: Product, s: SiteSettings): Product {
  const w = s.watermark;
  if (!w.on) return p;
  const mark = (u: string) => wmUrl(u, w, s.logo);
  const pv = p.preview;
  return {
    ...p,
    images: p.images.map(mark),
    preview: pv ? { ...pv, ...(pv.mockup ? { mockup: { ...pv.mockup, image: mark(pv.mockup.image) } } : {}), ...(pv.spin ? { spin: pv.spin.map(mark) } : {}) } : pv,
  };
}

export function wmSettings(s: SiteSettings): SiteSettings {
  const w = s.watermark;
  if (!w.on) return s;
  const mark = (u: string) => wmUrl(u, w, s.logo);
  return {
    ...s,
    gallery: w.onGallery ? s.gallery.map((g: GalleryItem) => ({ ...g, photos: g.photos.map(mark) })) : s.gallery,
    designs: w.onDesigns ? s.designs.map((d: Design) => ({ ...d, image: mark(d.image) })) : s.designs,
  };
}
