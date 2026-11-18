import { NextResponse } from "next/server";
import { getOrders } from "@/lib/db";
import { tooMany } from "@/lib/guard";
import { trackingLink } from "@/lib/email";

// Customers look up an order with the number from their receipt plus their email.
export async function POST(req: Request) {
  if (tooMany(req, 10, 10 * 60_000)) return NextResponse.json({ error: "Too many lookups. Try again in a few minutes." }, { status: 429 });
  const b = await req.json().catch(() => ({}));
  const num = parseInt(String(b.number ?? "").replace(/\D/g, ""), 10);
  const email = String(b.email ?? "").trim().toLowerCase();
  const o = (await getOrders()).find((x) => x.number === num && x.email.toLowerCase() === email);
  if (!o) return NextResponse.json({ error: "We couldn't find that order. Check the order number on your receipt and the email you used." }, { status: 404 });
  return NextResponse.json({
    number: o.number,
    date: o.createdAt,
    status: o.status,
    delivery: o.delivery ?? "ship",
    items: o.items.map((i) => ({ name: i.option ? `${i.name} (${i.option})` : i.name, quantity: i.quantity })),
    total: o.total,
    currency: o.currency,
    tracking: o.trackingNumber ? { number: o.trackingNumber, carrier: o.carrier ?? "", url: trackingLink(o.carrier, o.trackingNumber) } : null,
  });
}
