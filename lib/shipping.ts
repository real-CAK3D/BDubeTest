import "server-only";
import type { SiteSettings } from "./types";

/*
 * EDIT-POINT: SHIPPING
 * Works out shipping from the distance between the shop's ZIP code and the
 * customer's, using the owner's price tiers (Settings > Store). ZIP locations
 * come from the free zippopotam.us lookup; if it can't be reached, the
 * fallback price is used so checkout never gets stuck.
 */

type Point = { lat: number; lng: number; place: string };
const cache = new Map<string, Point | null>();

async function locate(country: string, zip: string): Promise<Point | null> {
  const key = `${country}:${zip}`;
  if (cache.has(key)) return cache.get(key)!;
  let pt: Point | null = null;
  try {
    const r = await fetch(`https://api.zippopotam.us/${country.toLowerCase()}/${encodeURIComponent(zip)}`, { signal: AbortSignal.timeout(4000), next: { revalidate: 60 * 60 * 24 * 30 } });
    if (r.ok) {
      const b = (await r.json()) as { places?: { latitude: string; longitude: string; "place name": string; "state abbreviation"?: string }[] };
      const p = b.places?.[0];
      if (p) pt = { lat: parseFloat(p.latitude), lng: parseFloat(p.longitude), place: `${p["place name"]}${p["state abbreviation"] ? `, ${p["state abbreviation"]}` : ""}` };
    }
  } catch {}
  if (cache.size > 2000) cache.clear();
  cache.set(key, pt);
  return pt;
}

function miles(a: Point, b: Point) {
  const R = 3958.8;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export const cleanZip = (z: unknown) => String(z ?? "").trim().toUpperCase().replace(/[^A-Z0-9 -]/g, "").slice(0, 10);

export type Quote = { amount: number; label: string; miles?: number; place?: string; free?: boolean };

/** Shipping for one order. subtotal in cents. */
export async function quoteShipping(s: SiteSettings, opts: { zip: string; country?: string; subtotal: number }): Promise<Quote> {
  if (s.freeShippingOver > 0 && opts.subtotal >= s.freeShippingOver) return { amount: 0, label: "Free shipping", free: true };
  const country = (opts.country || "US").toUpperCase();
  if (country !== "US") return { amount: s.intlShipping, label: "International shipping" };
  const zip = cleanZip(opts.zip).slice(0, 5);
  if (!/^\d{5}$/.test(zip)) return { amount: s.shippingFlat, label: "Standard shipping" };
  const tiers = [...s.shippingTiers].filter((t) => t.upToMiles > 0).sort((a, b) => a.upToMiles - b.upToMiles);
  if (!s.shipFromZip || !tiers.length) return { amount: s.shippingFlat, label: "Standard shipping" };
  const [from, to] = await Promise.all([locate("US", cleanZip(s.shipFromZip).slice(0, 5)), locate("US", zip)]);
  if (!from || !to) return { amount: s.shippingFlat, label: "Standard shipping" };
  const d = Math.round(miles(from, to));
  const tier = tiers.find((t) => d <= t.upToMiles);
  return { amount: tier ? tier.price : s.shippingFlat, label: `Shipping to ${to.place} (about ${d} miles)`, miles: d, place: to.place };
}
