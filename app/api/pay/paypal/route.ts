import { NextResponse } from "next/server";
import { isPriceError, priceCart, type CartBody } from "@/lib/cart-price";
import { getSettings } from "@/lib/db";
import { finishPayPal, startPayPal, thanksUrl } from "@/lib/direct-orders";
import { checkCode } from "@/lib/discounts";
import { tooMany } from "@/lib/guard";
import { paypalKeys } from "@/lib/paypal";

// The PayPal / Venmo / Pay Later buttons in the cart: "create" makes the PayPal order, "capture" takes the money.
export async function POST(req: Request) {
  if (tooMany(req, 30)) return NextResponse.json({ error: "Too many tries. Wait a few minutes." }, { status: 429 });
  const body = (await req.json().catch(() => ({}))) as CartBody & { action?: string; id?: string; code?: string };
  const settings = await getSettings();
  if (!settings.payments.paypal || !(await paypalKeys())) return NextResponse.json({ error: "PayPal isn't available right now." }, { status: 400 });
  const mode = settings.payments.paypalMode;
  try {
    if (body.action === "capture") {
      const order = await finishPayPal(mode, String(body.id ?? ""));
      return NextResponse.json({ url: thanksUrl(order) });
    }
    const priced = await priceCart(body, req);
    if (isPriceError(priced)) return NextResponse.json({ error: priced.error }, { status: priced.status });
    let code;
    if (body.code && priced.settings.allowPromoCodes) {
      const c = await checkCode(body.code, priced.subtotal);
      if ("error" in c) return NextResponse.json({ error: c.error }, { status: 400 });
      code = c;
    }
    return NextResponse.json({ id: await startPayPal(priced, mode, code) });
  } catch (e) {
    console.error("paypal:", e);
    const msg = (e as Error & { issue?: string }).issue === "INSTRUMENT_DECLINED" ? "That card or account was declined by PayPal. Try another." : (e as Error).message;
    return NextResponse.json({ error: msg.startsWith("PayPal") || msg.startsWith("That") ? msg : "PayPal checkout didn't go through. Please try again." }, { status: 400 });
  }
}
