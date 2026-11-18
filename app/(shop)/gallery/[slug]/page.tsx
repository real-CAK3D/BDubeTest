import { pageOn } from "@/lib/site-structure";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PhotoViewer } from "@/components/shop/PhotoViewer";
import { Tracker } from "@/components/shop/Tracker";
import { getActiveProducts, getSettings } from "@/lib/db";
import { paragraphs } from "@/lib/format";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const g = (await getSettings()).gallery.find((x) => x.slug === slug);
  return g ? { title: g.title, description: g.description.slice(0, 160), openGraph: { images: g.photos.slice(0, 1) } } : {};
}

export default async function GalleryItemPage({ params }: Params) {
  const { slug } = await params;
  const [s, products] = await Promise.all([getSettings(), getActiveProducts()]);
  if (!pageOn(s, "gallery")) notFound();
  const g = s.gallery.find((x) => x.slug === slug);
  if (!g) notFound();
  const product = g.productSlug ? products.find((p) => p.slug === g.productSlug) : null;
  return (
    <article className="product">
      <Tracker />
      <Link href="/gallery" className="back">Back to {s.galleryHeading.toLowerCase()}</Link>
      <div className="product-grid">
        <PhotoViewer photos={g.photos} title={g.title} />
        <div className="product-info">
          {g.category ? <p className="muted">{g.category}</p> : null}
          <h1>{g.title}</h1>
          <div className="prose">
            {paragraphs(g.description).map((p, i) => <p key={i}>{p}</p>)}
          </div>
          <div className="hero-actions">
            {product ? <Link href={`/product/${product.slug}`} className="btn btn-lg">Buy one</Link> : null}
            <Link href={`/${s.showCustomOrders ? "custom-order" : "contact"}?about=${encodeURIComponent(g.title)}`} className={`btn btn-lg ${product ? "btn-ghost" : ""}`}>Order one like this</Link>
          </div>
          <p className="muted small">Every piece is made by hand, so yours will be one of a kind.</p>
        </div>
      </div>
    </article>
  );
}
