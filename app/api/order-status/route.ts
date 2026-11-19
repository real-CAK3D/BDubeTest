import { NextResponse } from "next/server";
import { lockedFor, recordFail, visitorKey } from "@/lib/admin-security";
import { barcodeSvg } from "@/lib/codes";
import { getOrders, getSettings } from "@/lib/db";
import { orderCode } from "@/lib/order-code";
import { tooMany } from "@/lib/guard";
import { trackingLink } from "@/lib/email";

// Customers look up an order with the number from their receipt plus their email.
export async function POST(req: Request) {
  if (tooMany(req, 10, 10 * 60_000)) return NextResponse.json({ error: "Too many lookups. Try again in a few minutes." }, { status: 429 });
  const who = visitorKey(req, "lookup");
  const wait = await lockedFor(who);
  if (wait) return NextResponse.json({ error: `Too many lookups. Try again in ${wait} minutes.` }, { status: 429 });
  const b = await req.json().catch(() => ({}));
  const raw = String(b.number ?? "").trim().toUpperCase();
  const fromCode = raw.match(/^[A-Z]{1,3}(\d+)-[A-Z0-9]{4}$/);
  const num = parseInt(fromCode ? fromCode[1] : raw.replace(/\D/g, ""), 10);
  const email = String(b.email ?? "").trim().toLowerCase();
  const o = (await getOrders()).find((x) => x.number === num && x.email.toLowerCase() === email);
  if (!o) await recordFail(who);
  if (!o) return NextResponse.json({ error: "We couldn't find that order. Check the order number on your receipt and the email you used." }, { status: 404 });
  return NextResponse.json({
    number: o.number,
    code: orderCode(o, (await getSettings()).businessName),
    barcode: barcodeSvg(orderCode(o, (await getSettings()).businessName)),
    date: o.createdAt,
    status: o.status,
    delivery: o.delivery ?? "ship",
    items: o.items.map((i) => ({ name: i.option ? `${i.name} (${i.option})` : i.name, quantity: i.quantity })),
    tracking: o.trackingNumber ? { number: o.trackingNumber, carrier: o.carrier ?? "", url: trackingLink(o.carrier, o.trackingNumber) } : null,
  });
}
