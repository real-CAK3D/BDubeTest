import "server-only";
import { getActiveProducts, getProductBySlug, getSettings } from "./db";
import type { SiteSettings } from "./types";
import { wmProduct, wmSettings } from "./watermark";

/*
 * What the shop pages read. Same as lib/db.ts, but photo addresses go through
 * the watermark when it's switched on. Only for showing to customers; the
 * dashboard reads lib/db.ts directly so it never saves a watermarked address.
 */
export async function shopSettings() {
  return hideHidden(wmSettings(await getSettings()));
}

/** What the owner hid (instead of deleting) isn't shown to customers. */
function hideHidden(s: SiteSettings): SiteSettings {
  const out = { ...s, customSteps: s.customSteps.filter((x) => !x.hidden), gallery: s.gallery.filter((g) => !g.hidden) } as SiteSettings;
  for (const f of s.hiddenFields) if (typeof (out as Record<string, unknown>)[f] === "string") (out as Record<string, unknown>)[f] = "";
  return out;
}

export async function shopProducts() {
  const [list, s] = await Promise.all([getActiveProducts(), getSettings()]);
  return list.map((p) => wmProduct(p, s));
}

export async function shopProduct(slug: string) {
  const [p, s] = await Promise.all([getProductBySlug(slug), getSettings()]);
  return p ? wmProduct(p, s) : null;
}
