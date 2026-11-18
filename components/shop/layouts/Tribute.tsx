import Link from "next/link";
import { AboutTeaser, CatalogHead, CategoryTabs, CategoryTiles, Pager, SeeAll } from "../CatalogParts";
import { Patch } from "../Logo";
import { ProductGrid } from "../ProductCard";
import { VeteranBadge } from "../Sections";
import { featuredOf, slice, type CatalogProps, type HomeProps } from "./types";

export function TributeHome({ s, products }: HomeProps) {
  return (
    <>
      <section className="hero-tribute">
        <Patch s={s} size={170} />
        <h1>{s.heroHeadline}</h1>
        <p className="lede">{s.heroText}</p>
        <VeteranBadge s={s} />
        <Link href="/shop" className="btn btn-lg">View the collection</Link>
      </section>
      <section className="section tribute-section">
        <h2>{s.featuredHeading}</h2>
        <ProductGrid items={featuredOf(products, 6)} currency={s.currency} low={s.lowStockAlert} variant="framed" />
        {products.length > 6 ? <SeeAll /> : null}
      </section>
      <CategoryTiles products={products} />
      <AboutTeaser s={s} />
    </>
  );
}

export function TributeCatalog({ s, products, category, page }: CatalogProps) {
  const v = slice(products, category, page, 12);
  return (
    <section className="section catalog tribute-section">
      <CatalogHead title={category ?? s.allItemsHeading} count={v.total} />
      <CategoryTabs products={products} current={category} />
      <ProductGrid items={v.items} currency={s.currency} low={s.lowStockAlert} variant="framed" />
      <Pager page={v.page} pages={v.pages} category={category} />
    </section>
  );
}
