import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCart } from "@/components/shop/AddToCart";
import { Gallery } from "@/components/shop/Gallery";
import { Price, StockNote } from "@/components/shop/Price";
import { categoryHref } from "@/components/shop/layouts/types";
import { Tracker } from "@/components/shop/Tracker";
import { getProductBySlug, getSettings } from "@/lib/db";
import { paragraphs } from "@/lib/format";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const p = await getProductBySlug((await params).slug);
  if (!p) return {};
  return { title: p.name, description: p.summary, openGraph: { images: p.images.slice(0, 1) } };
}

export default async function ProductPage({ params }: Params) {
  const { slug } = await params;
  const [p, s] = await Promise.all([getProductBySlug(slug), getSettings()]);
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
        <Gallery p={p} />
        <div className="product-info">
          {p.category ? <p className="muted">{p.category}</p> : null}
          <h1>{p.name}</h1>
          <div className="product-price">
            <Price p={p} currency={s.currency} />
            <StockNote p={p} low={s.lowStockAlert} />
          </div>
          {p.summary ? <p className="lede">{p.summary}</p> : null}
          <AddToCart productId={p.id} option={p.option} personalize={p.personalize} soldOut={p.stock === 0} storeOpen={s.storeOpen} />
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
