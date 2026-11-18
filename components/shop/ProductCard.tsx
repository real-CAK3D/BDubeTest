import Link from "next/link";
import type { Product } from "@/lib/types";
import { Price, StockNote } from "./Price";
import { ProductImage } from "./ProductImage";

export function ProductCard({ p, currency, low }: { p: Product; currency: string; low: number }) {
  return (
    <Link href={`/product/${p.slug}`} className="card">
      <div className="card-media">
        <ProductImage p={p} />
      </div>
      <div className="card-body">
        <h3>{p.name}</h3>
        {p.summary ? <p>{p.summary}</p> : null}
        {p.personalize ? <span className="personal-note">Can be personalized</span> : null}
        <div className="card-foot">
          <Price p={p} currency={currency} />
          <StockNote p={p} low={low} />
        </div>
      </div>
    </Link>
  );
}

export function ProductGrid({ items, currency, low, variant = "" }: { items: Product[]; currency: string; low: number; variant?: string }) {
  if (!items.length) return <p className="empty">New items are on the way. Check back soon.</p>;
  return (
    <div className={`grid ${variant}`}>
      {items.map((p) => (
        <ProductCard key={p.id} p={p} currency={currency} low={low} />
      ))}
    </div>
  );
}
