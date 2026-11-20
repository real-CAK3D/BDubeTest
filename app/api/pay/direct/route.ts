import { NextResponse } from "next/server";
import { isPriceError, priceCart, type CartBody } from "@/lib/cart-price";
import { orderTotals } from "@/lib/checkout-total";
import { getSettings } from "@/lib/db";
import { giftCardParts, partsOf, placeDirectOrder, thanksUrl, type Parts } from "@/lib/direct-orders";
import { isEmail, tooMany } from "@/lib/guard";
import { MANUAL_INFO, type ManualId } from "@/lib/payments";
import type { ShipTo } from "@/lib/types";

type Body = CartBody & { payWith?: string; codes?: string[]; website?: string; buyer?: Record<string, string>; giftCard?: { amount: number; fromName?: string; toName?: string; toEmail?: string; message?: string } };
const clip = (v: unknown, n: number) => String(v ?? "").replace(/[\u0000-\u001f]/g, " ").trim().slice(0, n);

// "Pay us directly" (Cash App, Venmo, Zelle, cash at pickup) or "covered" (a gift card pays it all).
export async function POST(req: Request) {
  if (tooMany(req, 6)) return NextResponse.json({ error: "Too many orders from here. Wait a few minutes, or message us." }, { status: 429 });
  const body = (await req.json().catch(() => ({}))) as Body;
  if (body.website) return NextResponse.json({ ok: true }); // a bot filled the hidden field
  const payWith = String(body.payWith) as ManualId | "covered";
  if (payWith !== "covered" && !(payWith in MANUAL_INFO)) return NextResponse.json({ error: "Pick how you'll pay." }, { status: 400 });
  const settings = await getSettings();
  if (!settings.storeOpen) return NextResponse.json({ error: settings.closedMessage }, { status: 400 });
  const b = body.buyer ?? {};
  const name = clip(b.name, 80);
  const email = clip(b.email, 200);
  const phone = clip(b.phone, 30);
  if (!name) return NextResponse.json({ error: "Type your name." }, { status: 400 });
  if (!isEmail(email)) return NextResponse.json({ error: "Type your email so we can send the details." }, { status: 400 });

  let parts: Parts;
  let shipTo: ShipTo | undefined;
  if (body.giftCard) {
    if (payWith === "covered") return NextResponse.json({ error: "Pick how you'll pay." }, { status: 400 });
    const g = giftCardParts(settings, body.giftCard);
    if (typeof g === "string") return NextResponse.json({ error: g }, { status: 400 });
    if (body.giftCard.toEmail && !isEmail(String(body.giftCard.toEmail))) return NextResponse.json({ error: "Check the recipient's email address." }, { status: 400 });
    parts = g;
  } else {
    const priced = await priceCart(body, req);
    if (isPriceError(priced)) return NextResponse.json({ error: priced.error }, { status: priced.status });
    if (priced.shipping) {
      shipTo = { name, line1: clip(b.line1, 100), line2: clip(b.line2, 100) || undefined, city: clip(b.city, 60), state: clip(b.state, 30).toUpperCase(), zip: clip(b.zip, 12), country: priced.abroad ? clip(b.country, 2).toUpperCase() : "US", phone: phone || undefined, email };
      if (!shipTo.line1 || !shipTo.city || !shipTo.zip || (!priced.abroad && !shipTo.state)) return NextResponse.json({ error: "Fill in the shipping address." }, { status: 400 });
      if (!priced.abroad && !shipTo.zip.startsWith(priced.shipZip)) return NextResponse.json({ error: `Shipping and tax were worked out for ZIP ${priced.shipZip}. Change the ZIP in the cart to match the address.` }, { status: 400 });
      if (priced.abroad && !priced.countries.includes(shipTo.country)) return NextResponse.json({ error: "We don't ship to that country yet." }, { status: 400 });
    }
    const t = await orderTotals(priced, body.codes);
    if (t.errors.length) return NextResponse.json({ error: t.errors[0] }, { status: 400 });
    parts = partsOf(priced, t);
  }
  try {
    const order = await placeDirectOrder(settings, parts, payWith, { name, email, phone, shipTo, note: clip(b.note, 255) });
    return NextResponse.json({ url: thanksUrl(order) });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
