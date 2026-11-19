import "server-only";
import { getActiveProducts, getProductBySlug, getSettings } from "./db";
import { wmProduct, wmSettings } from "./watermark";

/*
 * What the shop pages read. Same as lib/db.ts, but photo addresses go through
 * the watermark when it's switched on. Only for showing to customers; the
 * dashboard reads lib/db.ts directly so it never saves a watermarked address.
 */
export async function shopSettings() {
  return wmSettings(await getSettings());
}

export async function shopProducts() {
  const [list, s] = await Promise.all([getActiveProducts(), getSettings()]);
  return list.map((p) => wmProduct(p, s));
}

export async function shopProduct(slug: string) {
  const [p, s] = await Promise.all([getProductBySlug(slug), getSettings()]);
  return p ? wmProduct(p, s) : null;
}
