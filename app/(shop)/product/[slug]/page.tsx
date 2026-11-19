import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCart } from "@/components/shop/AddToCart";
import { getBlanks } from "@/lib/blanks";
import { ProductViews } from "@/components/shop/ProductViews";
import { ShareButtons } from "@/components/shop/ShareButtons";
import { Price, StockNote } from "@/components/shop/Price";
import { categoryHref } from "@/components/shop/layouts/types";
import { Tracker } from "@/components/shop/Tracker";
import { shopProduct, shopSettings } from "@/lib/shop-data";
import { paragraphs } from "@/lib/format";
import { fittingDesigns } from "@/lib/pricing";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const p = await shopProduct((await params).slug);
  if (!p) return {};
  return { title: p.name, description: p.summary, openGraph: { images: p.images.slice(0, 1) } };
}

export default async function ProductPage({ params }: Params) {
  const { slug } = await params;
  const [p, s, blanks] = await Promise.all([shopProduct(slug), shopSettings(), getBlanks()]);
  if (!p || !p.active) notFound();
  return (
    <article className="product">
      <Tracker productId={p.id} />
      <script
        type="application/ld+json"
        // product details for search engines (price, stock, photos)
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: p.name,
            description: p.summary || p.description.slice(0, 300),
            image: p.images.slice(0, 3).map((u) => (u.startsWith("http") ? u : `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}${u}`)),
            brand: { "@type": "Brand", name: s.businessName },
            ...(p.price >= 50
              ? { offers: { "@type": "Offer", price: (p.price / 100).toFixed(2), priceCurrency: s.currency.toUpperCase(), availability: p.stock === 0 ? "https://schema.org/OutOfStock" : "https://schema.org/InStock" } }
              : {}),
          }).replace(/</g, "\\u003c"),
        }}
      />
      <Link href={categoryHref(p.category || null)} className="back">Back to {p.category || "shop"}</Link>
      <div className="product-grid">
        <ProductViews p={p} />
        <div className="product-info">
          {p.category ? <p className="muted">{p.category}</p> : null}
          <h1>{p.name}</h1>
          <div className="product-price">
            <Price p={p} currency={s.currency} />
            <StockNote p={p} low={s.lowStockAlert} />
          </div>
          {p.summary ? <p className="lede">{p.summary}</p> : null}
          <AddToCart
            productId={p.id}
            option={p.option}
            personalize={p.personalize}
            soldOut={p.stock === 0 || Boolean(p.blank && blanks.find((b) => b.id === p.blank)?.qty === 0) || Boolean(p.sizes?.length && p.sizes.every((z) => z.blank && blanks.find((b) => b.id === z.blank)?.qty === 0))}
            storeOpen={s.storeOpen}
            sizes={p.sizes?.map((z) => ({ name: z.name, price: z.price, out: Boolean(z.blank && blanks.find((b) => b.id === z.blank)?.qty === 0) }))}
            designs={p.designs ? { label: p.designs.label, required: p.designs.required, allowUpload: p.designs.allowUpload, uploadExtra: p.designs.uploadExtra } : null}
            fits={
              p.designs
                ? Object.fromEntries(
                    Object.keys(p.designs.fit).map((k) => [k, fittingDesigns(p, k === "*" ? "" : k, s.designs).map((d) => ({ id: d.id, name: d.name, image: d.image, extra: d.extra, active: d.active, group: d.group }))])
                  )
                : undefined
            }
            basePrice={p.price}
            currency={s.currency}
          />
          {s.discounts.bulk.length ? (
            <p className="bulk-note">Buying several? {s.discounts.bulk.map((t) => `${t.minQty}+ items: ${t.percent}% off`).join(" · ")}</p>
          ) : null}
          <ShareButtons title={p.name} path={`/product/${p.slug}`} />
          <div className="prose">
            {paragraphs(p.description).map((x, i) => (
              <p key={i}>{x}</p>
            ))}
          </div>
          <ul className="assure">
            <li>Secure checkout with card, Apple Pay or Google Pay</li>
            {s.shippingPolicy ? <li>{s.shippingPolicy}</li> : null}
          </ul>
        </div>
      </div>
    </article>
  );
}
