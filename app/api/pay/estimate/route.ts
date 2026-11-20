import { NextResponse } from "next/server";
import { isPriceError, priceCart, type CartBody } from "@/lib/cart-price";
import { orderTotals } from "@/lib/checkout-total";
import { tooMany } from "@/lib/guard";

// The cart's totals from the server: codes (promo, gift card), shipping and sales tax.
export async function POST(req: Request) {
  if (tooMany(req, 60, 60_000)) return NextResponse.json({ error: "Too many tries. Wait a minute." }, { status: 429 });
  const body = (await req.json().catch(() => ({}))) as CartBody & { codes?: string[] };
  const priced = await priceCart(body, req);
  if (isPriceError(priced)) return NextResponse.json({ error: priced.error }, { status: priced.status });
  const t = await orderTotals(priced, body.codes, { estimate: true });
  return NextResponse.json({
    subtotal: t.subtotal,
    discount: t.discount,
    shipping: t.shipping,
    tax: t.tax,
    taxLabel: t.taxLabel,
    taxLater: t.taxLater,
    gift: t.gift,
    giftLeft: t.giftCard ? t.giftCard.balance - t.gift : 0,
    total: t.total,
    codes: [t.promo?.code, t.giftCard?.code].filter(Boolean),
    errors: t.errors,
  });
}
