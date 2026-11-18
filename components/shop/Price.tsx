import { money } from "@/lib/format";
import type { Product } from "@/lib/types";

export function Price({ p, currency }: { p: Product; currency: string }) {
  return (
    <span className="price">
      {p.sizes && p.sizes.length > 1 && new Set(p.sizes.map((s) => s.price)).size > 1 ? <em className="from">From </em> : null}
      {money(p.price, currency)}
      {p.compareAtPrice && p.compareAtPrice > p.price ? <s>{money(p.compareAtPrice, currency)}</s> : null}
    </span>
  );
}

export function StockNote({ p, low }: { p: Product; low: number }) {
  if (p.madeToOrder) return <span className="stock">Made to order</span>;
  if (p.stock === null) return null;
  if (p.stock === 0) return <span className="stock out">Sold out</span>;
  if (p.stock <= low) return <span className="stock low">Only {p.stock} left</span>;
  return null;
}
