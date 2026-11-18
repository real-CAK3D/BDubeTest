import type { Metadata } from "next";
import Link from "next/link";
import { viewsFor } from "@/components/shop/layouts";
import { byCategory } from "@/components/shop/layouts/types";
import { Tracker } from "@/components/shop/Tracker";
import { getActiveProducts, getSettings } from "@/lib/db";
import { slugify } from "@/lib/format-slug";
import { getLayout } from "@/lib/themes";

type SP = { searchParams: Promise<{ category?: string; page?: string; q?: string }> };

async function load(sp: Awaited<SP["searchParams"]>) {
  const [s, all] = await Promise.all([getSettings(), getActiveProducts()]);
  const q = String(sp.q ?? "").trim().slice(0, 60);
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  const products = words.length ? all.filter((p) => words.every((w) => `${p.name} ${p.summary} ${p.description} ${p.category}`.toLowerCase().includes(w))) : all;
  const category = sp.category ? byCategory(products).find(([c]) => slugify(c) === sp.category)?.[0] ?? null : null;
  return { s, products, all, q, category, page: Math.max(1, parseInt(sp.page ?? "1", 10) || 1) };
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
        {d.all.length > 6 || d.q ? (
          <form className="shop-search" action="/shop" role="search">
            <input type="search" name="q" defaultValue={d.q} placeholder="Search the shop" aria-label="Search the shop" />
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
