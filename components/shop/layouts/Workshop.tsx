import { WorkShowcase } from "../WorkShowcase";
import Link from "next/link";
import type { Product, SiteSettings } from "@/lib/types";
import { ReviewsStrip } from "../ReviewsStrip";
import { AboutTeaser, CatalogHead, CategoryTabs, CategoryTiles, Pager, SeeAll } from "../CatalogParts";
import { Patch } from "../Logo";
import { Price } from "../Price";
import { ProductImage } from "../ProductImage";
import { VeteranBadge } from "../Sections";
import { featuredOf, slice, type CatalogProps, type HomeProps } from "./types";
import { ComingSoonHome } from "../ComingSoon";

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

export function WorkshopHome({ s, products, reviews }: HomeProps) {
  const cover = products.find((p) => p.images[0]);
  return (
    <>
      <section className="hero-workshop">
        <div className="hw-copy">
          <h1>{s.heroHeadline}</h1>
          <p className="lede">{s.heroText}</p>
          <div className="hero-actions">
            <Link href="/shop" className="btn btn-lg">{s.shopButton}</Link>
            <Link href={s.showCustomOrders ? "/custom-order" : "/contact"} className="btn btn-lg btn-ghost">{s.customButton}</Link>
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
      <WorkShowcase s={s} />
      <section className="section">
        <h2>{s.stepsHeading}</h2>
        <ol className="steps-row">
          {s.customSteps.filter((st) => st.title).map((st) => (
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
      <CategoryTiles products={products} heading={s.categoriesHeading} />
      <ComingSoonHome s={s} />
      <ReviewsStrip s={s} reviews={reviews} />
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
