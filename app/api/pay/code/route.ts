import { NextResponse } from "next/server";
import { isPriceError, priceCart, type CartBody } from "@/lib/cart-price";
import { checkCode } from "@/lib/discounts";
import { tooMany } from "@/lib/guard";

// Checks a promo or gift card code typed in the cart (for PayPal and pay-directly orders).
export async function POST(req: Request) {
  if (tooMany(req, 20)) return NextResponse.json({ error: "Too many tries. Wait a few minutes." }, { status: 429 });
  const body = (await req.json().catch(() => ({}))) as CartBody & { code?: string };
  const priced = await priceCart(body, req);
  if (isPriceError(priced)) return NextResponse.json({ error: priced.error }, { status: priced.status });
  if (!priced.settings.allowPromoCodes) return NextResponse.json({ error: "Codes aren't being taken right now." }, { status: 400 });
  const r = await checkCode(String(body.code ?? ""), priced.subtotal);
  if ("error" in r) return NextResponse.json({ error: r.error }, { status: 400 });
  return NextResponse.json({ code: r.code, off: r.off });
}
