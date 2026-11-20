import type { Metadata } from "next";
import Link from "next/link";
import { viewsFor } from "@/components/shop/layouts";
import { byCategory } from "@/components/shop/layouts/types";
import { Tracker } from "@/components/shop/Tracker";
import { shopProducts, shopSettings } from "@/lib/shop-data";
import { slugify } from "@/lib/format-slug";
import { getLayout } from "@/lib/themes";
import { searchProducts } from "@/lib/search";

type SP = { searchParams: Promise<{ category?: string; page?: string; q?: string; find?: string }> };

async function load(sp: Awaited<SP["searchParams"]>) {
  const [s, all] = await Promise.all([shopSettings(), shopProducts()]);
  const q = String(sp.q ?? "").trim().slice(0, 60);
  const products = q ? searchProducts(all, s.designs, q) : all;
  const category = sp.category ? byCategory(products).find(([c]) => slugify(c) === sp.category)?.[0] ?? null : null;
  return { s, products, all, q, find: sp.find, category, page: Math.max(1, parseInt(sp.page ?? "1", 10) || 1) };
}

export async function generateMetadata({ searchParams }: SP): Promise<Metadata> {
  const { category } = await load(await searchParams);
  return { title: category ?? "Shop", alternates: { canonical: "/shop" } };
}

export default async function ShopPage({ searchParams }: SP) {
  const d = await load(await searchParams);
  const layout = getLayout(d.s.layout).id;
  const { Catalog } = viewsFor(layout);
  return (
    <>
      <Tracker />
      <div className={`shop-page layout-${layout}`}>
        {d.all.length > 1 || d.q ? (
          <form className="shop-search" action="/shop" role="search">
            <input type="search" name="q" defaultValue={d.q} placeholder="Search the shop" aria-label="Search the shop" autoFocus={Boolean(d.find)} />
            <button className="btn">Search</button>
            {d.q ? <Link href="/shop" className="linkish">Clear</Link> : null}
          </form>
        ) : null}
        {d.q && !d.products.length ? (
          <div className="section"><p>Nothing matches &ldquo;{d.q}&rdquo;. Try another word, or <Link href={d.s.showCustomOrders ? "/custom-order" : "/contact"}>ask us to make it</Link>.</p></div>
        ) : (
          <Catalog s={d.s} products={d.products} category={d.q ? null : d.category} page={d.page} />
        )}
      </div>
    </>
  );
}
