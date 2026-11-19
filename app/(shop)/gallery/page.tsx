import { pageOn } from "@/lib/site-structure";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Showcase3D } from "@/components/shop/Showcase3D";
import { Tracker } from "@/components/shop/Tracker";
import { shopSettings } from "@/lib/shop-data";
import { slugify } from "@/lib/format-slug";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await shopSettings()).galleryHeading };
}

export default async function GalleryPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const [s, sp] = await Promise.all([shopSettings(), searchParams]);
  if (!pageOn(s, "gallery")) notFound();
  const items = s.gallery.filter((g) => g.photos[0]);
  const cats = [...new Set(items.map((g) => g.category).filter(Boolean))];
  const current = cats.find((c) => slugify(c) === sp.category) ?? null;
  const shown = current ? items.filter((g) => g.category === current) : items;
  return (
    <section className="section gallery-page">
      <Tracker />
      <div className="catalog-head">
        <h1>{s.galleryHeading}</h1>
        <span className="muted">{shown.length} piece{shown.length === 1 ? "" : "s"}</span>
      </div>
      {s.galleryText ? <p className="lede">{s.galleryText}</p> : null}
      {!current && items.length >= 3 ? <Showcase3D label={s.galleryHeading} items={items.map((g) => ({ title: g.title, image: g.photos[0], href: `/gallery/${g.slug}` }))} /> : null}
      {cats.length > 1 ? (
        <nav className="cat-tabs" aria-label="Kinds of work">
          <Link href="/gallery" className={!current ? "on" : ""}>All <span>{items.length}</span></Link>
          {cats.map((c) => (
            <Link key={c} href={`/gallery?category=${slugify(c)}`} className={c === current ? "on" : ""}>
              {c} <span>{items.filter((g) => g.category === c).length}</span>
            </Link>
          ))}
        </nav>
      ) : null}
      {shown.length ? (
        <div className="work-grid">
          {shown.map((g) => (
            <Link key={g.slug} href={`/gallery/${g.slug}`} className="work-card">
              <span className="work-media">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={g.photos[0]} alt={g.title} loading="lazy" />
                {g.photos.length > 1 ? <em>{g.photos.length} photos</em> : null}
              </span>
              <span className="work-body">
                {g.category ? <span className="muted small">{g.category}</span> : null}
                <strong>{g.title}</strong>
                <span className="work-desc">{g.description}</span>
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <p className="empty">New pieces are on the way. Check back soon.</p>
      )}
    </section>
  );
}
