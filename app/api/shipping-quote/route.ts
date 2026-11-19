import { NextResponse } from "next/server";
import { getActiveProducts, getSettings } from "@/lib/db";
import { tooMany } from "@/lib/guard";
import { bulkPercent } from "@/lib/discount-defaults";
import { unitPrice } from "@/lib/pricing";
import { quoteShipping } from "@/lib/shipping";

// The cart asks for a shipping price before checkout: { zip, items: [{productId, quantity}] }
export async function POST(req: Request) {
  if (tooMany(req, 30, 60_000)) return NextResponse.json({ error: "Too many tries. Wait a minute." }, { status: 429 });
  const b = await req.json().catch(() => ({}));
  const [s, products] = await Promise.all([getSettings(), getActiveProducts()]);
  const subtotal = (Array.isArray(b.items) ? b.items : []).slice(0, 50).reduce((n: number, it: { productId?: string; quantity?: number; size?: string; design?: string }) => {
    const p = products.find((x) => x.id === it.productId);
    const each = p ? unitPrice(p, it.size, it.design, s.designs) : null;
    return n + (each ?? 0) * Math.max(1, Math.min(99, Number(it.quantity) || 1));
  }, 0);
  const qty = (Array.isArray(b.items) ? b.items : []).slice(0, 50).reduce((n: number, it: { quantity?: number }) => n + Math.max(1, Math.min(99, Number(it.quantity) || 1)), 0);
  const pct = bulkPercent(s.discounts.bulk, qty);
  return NextResponse.json(await quoteShipping(s, { zip: String(b.zip ?? ""), country: "US", subtotal: Math.round((subtotal * (100 - pct)) / 100) }));
}
