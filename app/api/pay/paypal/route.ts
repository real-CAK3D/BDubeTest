import { NextResponse } from "next/server";
import { isPriceError, priceCart, type CartBody } from "@/lib/cart-price";
import { orderTotals } from "@/lib/checkout-total";
import { getSettings } from "@/lib/db";
import { finishPayPal, giftCardParts, partsOf, startPayPal, thanksUrl } from "@/lib/direct-orders";
import { tooMany } from "@/lib/guard";
import { paypalKeys } from "@/lib/paypal";

type Body = CartBody & { action?: string; id?: string; codes?: string[]; giftCard?: { amount: number } };

// The PayPal / Venmo / Pay Later buttons: "create" makes the PayPal order, "capture" takes the money.
export async function POST(req: Request) {
  if (tooMany(req, 30)) return NextResponse.json({ error: "Too many tries. Wait a few minutes." }, { status: 429 });
  const body = (await req.json().catch(() => ({}))) as Body;
  const settings = await getSettings();
  if (!settings.payments.paypal || !(await paypalKeys())) return NextResponse.json({ error: "PayPal isn't available right now." }, { status: 400 });
  if (!settings.storeOpen) return NextResponse.json({ error: settings.closedMessage }, { status: 400 });
  const mode = settings.payments.paypalMode;
  try {
    if (body.action === "capture") {
      const order = await finishPayPal(mode, String(body.id ?? ""));
      return NextResponse.json({ url: thanksUrl(order) });
    }
    let parts;
    if (body.giftCard) {
      const g = giftCardParts(settings, body.giftCard);
      if (typeof g === "string") return NextResponse.json({ error: g }, { status: 400 });
      parts = g;
    } else {
      const priced = await priceCart(body, req);
      if (isPriceError(priced)) return NextResponse.json({ error: priced.error }, { status: priced.status });
      const t = await orderTotals(priced, body.codes);
      if (t.errors.length) return NextResponse.json({ error: t.errors[0] }, { status: 400 });
      if (t.total <= 0) return NextResponse.json({ error: "Your gift card covers the whole order, so there's nothing to pay with PayPal. Use \"Place order\" instead." }, { status: 400 });
      parts = partsOf(priced, t);
    }
    return NextResponse.json({ id: await startPayPal(parts, mode, settings.businessName) });
  } catch (e) {
    console.error("paypal:", e);
    const msg = (e as Error & { issue?: string }).issue === "INSTRUMENT_DECLINED" ? "That card or account was declined by PayPal. Try another." : (e as Error).message;
    return NextResponse.json({ error: msg.startsWith("PayPal") || msg.startsWith("That") ? msg : "PayPal checkout didn't go through. Please try again." }, { status: 400 });
  }
}
