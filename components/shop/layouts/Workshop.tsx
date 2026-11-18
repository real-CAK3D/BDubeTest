import Link from "next/link";
import type { Product, SiteSettings } from "@/lib/types";
import { AboutTeaser, CatalogHead, CategoryTabs, CategoryTiles, Pager, SeeAll } from "../CatalogParts";
import { Patch } from "../Logo";
import { Price } from "../Price";
import { ProductImage } from "../ProductImage";
import { VeteranBadge } from "../Sections";
import { featuredOf, slice, type CatalogProps, type HomeProps } from "./types";

/*
 * EDIT-POINT: WORKSHOP-STEPS
 * The "How custom orders work" steps on the Workshop layout's home page.
 */
const STEPS = [
  { title: "Pick a piece", text: "Choose something from the shop, or describe what you have in mind." },
  { title: "Make it yours", text: "Add a name, date, unit or message. Engraving text goes in right on the item page." },
  { title: "Made by hand", text: "Cut, engraved and finished in the workshop, one at a time." },
  { title: "Shipped to you", text: "Packed with care. You'll get tracking as soon as it's on its way." },
];

function Gallery({ s, items }: { s: SiteSettings; items: Product[] }) {
  if (!items.length) return <p className="empty">New pieces are on the way. Check back soon.</p>;
  return (
    <div className="gallery-wall">
      {items.map((p) => (
        <Link key={p.id} href={`/product/${p.slug}`} className="wall-item">
          <ProductImage p={p} />
          <span className="wall-cap">
            <strong>{p.name}</strong>
            <Price p={p} currency={s.currency} />
          </span>
          {p.personalize ? <span className="wall-tag">Can be personalized</span> : null}
        </Link>
      ))}
    </div>
  );
}

export function WorkshopHome({ s, products }: HomeProps) {
  const cover = products.find((p) => p.images[0]);
  return (
    <>
      <section className="hero-workshop">
        <div className="hw-copy">
          <h1>{s.heroHeadline}</h1>
          <p className="lede">{s.heroText}</p>
          <div className="hero-actions">
            <Link href="/shop" className="btn btn-lg">Browse the work</Link>
            <Link href="/contact" className="btn btn-lg btn-ghost">Request a custom piece</Link>
          </div>
          <VeteranBadge s={s} />
        </div>
        <div className="hw-media">
          {s.heroImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={s.heroImage} alt="" />
          ) : cover ? (
            <ProductImage p={cover} />
          ) : (
            <Patch s={s} size={220} />
          )}
        </div>
      </section>
      <section className="section">
        <h2>How custom orders work</h2>
        <ol className="steps-row">
          {STEPS.map((st) => (
            <li key={st.title}>
              <strong>{st.title}</strong>
              <span>{st.text}</span>
            </li>
          ))}
        </ol>
      </section>
      <section className="section">
        <h2>{s.featuredHeading}</h2>
        <Gallery s={s} items={featuredOf(products, 9)} />
        {products.length > 9 ? <SeeAll /> : null}
      </section>
      <CategoryTiles products={products} />
      <AboutTeaser s={s} />
    </>
  );
}

export function WorkshopCatalog({ s, products, category, page }: CatalogProps) {
  const v = slice(products, category, page, 18);
  return (
    <section className="section catalog">
      <CatalogHead title={category ?? s.allItemsHeading} count={v.total} />
      <CategoryTabs products={products} current={category} />
      <Gallery s={s} items={v.items} />
      <Pager page={v.page} pages={v.pages} category={category} />
    </section>
  );
}
