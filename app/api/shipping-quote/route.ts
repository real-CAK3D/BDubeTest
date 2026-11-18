import { NextResponse } from "next/server";
import { getActiveProducts, getSettings } from "@/lib/db";
import { tooMany } from "@/lib/guard";
import { quoteShipping } from "@/lib/shipping";

// The cart asks for a shipping price before checkout: { zip, items: [{productId, quantity}] }
export async function POST(req: Request) {
  if (tooMany(req, 30, 60_000)) return NextResponse.json({ error: "Too many tries. Wait a minute." }, { status: 429 });
  const b = await req.json().catch(() => ({}));
  const [s, products] = await Promise.all([getSettings(), getActiveProducts()]);
  const subtotal = (Array.isArray(b.items) ? b.items : []).reduce((n: number, it: { productId?: string; quantity?: number }) => {
    const p = products.find((x) => x.id === it.productId);
    return n + (p ? p.price * Math.max(1, Math.min(99, Number(it.quantity) || 1)) : 0);
  }, 0);
  return NextResponse.json(await quoteShipping(s, { zip: String(b.zip ?? ""), country: "US", subtotal }));
}
