import type { MetadataRoute } from "next";
import { getActiveProducts, getSettings } from "@/lib/db";
import { POLICY_PAGES } from "@/lib/policy-text";
import { siteUrl } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const products = await getActiveProducts().catch(() => []);
  const s = await getSettings().catch(() => null);
  return [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/shop`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/about`, priority: 0.5 },
    { url: `${base}/gallery`, priority: 0.8 },
    ...(s?.gallery ?? []).map((g) => ({ url: `${base}/gallery/${g.slug}`, priority: 0.6 })),
    { url: `${base}/contact`, priority: 0.5 },
    ...(s?.showCustomOrders ? [{ url: `${base}/custom-order`, priority: 0.7 }] : []),
    ...products.map((p) => ({ url: `${base}/product/${p.slug}`, lastModified: p.updatedAt, changeFrequency: "weekly" as const, priority: 0.8 })),
    ...Object.keys(POLICY_PAGES).map((x) => ({ url: `${base}/policies/${x}`, priority: 0.2 })),
    ...(s?.extraPages ?? []).map((p) => ({ url: `${base}/pages/${p.slug}`, priority: 0.3 })),
  ];
}
