import { getActiveProducts, getSettings } from "@/lib/db";
import { siteUrl } from "@/lib/stripe";

/*
 * EDIT-POINT: PRODUCT-FEED
 * A product list in the format Google Merchant Center and Facebook / Instagram
 * Shops read (/feed.xml). Point them at it once and they pick up new items,
 * prices and stock by themselves. Each size is listed as its own variant.
 * Photos here are always the clean originals: ad platforms reject watermarks.
 */
export const dynamic = "force-dynamic";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export async function GET(req: Request) {
  const [s, products] = await Promise.all([getSettings(), getActiveProducts()]);
  const base = siteUrl(req);
  const abs = (u: string) => (u.startsWith("http") ? u : base + u);
  // photos as JPG through /api/feed-image (WebP and PNG are turned into JPG)
  const img = (u: string) => (/\.jpe?g($|\?)/i.test(u) ? abs(u) : `${base}/api/feed-image?src=${encodeURIComponent(u)}`);
  const cur = s.currency.toUpperCase();
  const items: string[] = [];
  for (const p of products) {
    if (!p.images[0]) continue;
    const variants = p.sizes?.length ? p.sizes.map((z) => ({ id: `${p.slug}-${z.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`, price: z.price, size: z.name })) : [{ id: p.slug, price: p.price, size: "" }];
    for (const v of variants) {
      if (v.price < 50) continue; // items without a price yet
      const desc = (p.description || p.summary || p.name).replace(/\s+/g, " ").slice(0, 4900);
      items.push(
        [
          "<item>",
          `<g:id>${esc(v.id)}</g:id>`,
          `<title>${esc(v.size ? `${p.name} - ${v.size}` : p.name)}</title>`,
          `<description>${esc(desc)}</description>`,
          `<link>${esc(`${base}/product/${p.slug}`)}</link>`,
          `<g:image_link>${esc(img(p.images[0]))}</g:image_link>`,
          ...p.images.slice(1, 10).map((u) => `<g:additional_image_link>${esc(img(u))}</g:additional_image_link>`),
          `<g:availability>${p.stock === 0 ? "out_of_stock" : "in_stock"}</g:availability>`,
          `<g:price>${(v.price / 100).toFixed(2)} ${cur}</g:price>`,
          ...(p.compareAtPrice && p.compareAtPrice > v.price && !p.sizes?.length ? [`<g:sale_price>${(p.price / 100).toFixed(2)} ${cur}</g:sale_price>`] : []),
          `<g:brand>${esc(s.businessName)}</g:brand>`,
          "<g:condition>new</g:condition>",
          "<g:identifier_exists>no</g:identifier_exists>",
          ...(p.category ? [`<g:product_type>${esc(p.category)}</g:product_type>`] : []),
          ...(p.sizes?.length ? [`<g:item_group_id>${esc(p.slug)}</g:item_group_id>`, `<g:size>${esc(v.size)}</g:size>`] : []),
          // a flat price only when that's how shipping works; by-distance shipping is set in Merchant Center / Commerce Manager instead
          ...(s.collectShipping && !s.shippingTiers.length ? [`<g:shipping><g:country>US</g:country><g:price>${(s.shippingFlat / 100).toFixed(2)} ${cur}</g:price></g:shipping>`] : []),
          "</item>",
        ].join("")
      );
    }
  }
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
<channel>
<title>${esc(s.businessName)}</title>
<link>${esc(base)}</link>
<description>${esc(s.tagline || s.businessName)}</description>
${items.join("\n")}
</channel>
</rss>`;
  return new Response(xml, { headers: { "content-type": "application/xml; charset=utf-8", "cache-control": "public, max-age=0, s-maxage=3600" } });
}
