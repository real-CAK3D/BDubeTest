import { NextResponse } from "next/server";
import { getSession } from "@/lib/admin-security";
import { getOrders, getSettings, logOn, saveOrders } from "@/lib/db";
import { currentSession } from "@/lib/session";
import { emailReady, sendEmail, shippedEmail } from "@/lib/email";
import type { OrderStatus } from "@/lib/types";
import { mutating } from "@/lib/store";
import { markDirectPaid } from "@/lib/direct-orders";

const STATUSES: OrderStatus[] = ["awaiting", "paid", "shipped", "delivered", "refunded", "cancelled"];

// { id, status?, note?, trackingNumber?, carrier?, emailCustomer? }
async function handlePATCH(req: Request) {
  const b = await req.json();
  const orders = await getOrders();
  const o = orders.find((x) => x.id === b.id);
  if (!o) return NextResponse.json({ error: "Order not found." }, { status: 404 });
  const sid = await currentSession();
  const by = sid ? (await getSession(sid))?.name : undefined;
  // a pay-directly order: the money arrived (gives the thank-you code too)
  if (b.markPaid) {
    const paid = await markDirectPaid(o.id, by ?? "");
    return NextResponse.json(paid ?? o);
  }
  if (STATUSES.includes(b.status) && b.status !== o.status) {
    o.status = b.status;
    logOn(o, `Marked ${b.status === "paid" ? "to ship" : b.status}`, by);
  }
  if (typeof b.note === "string" && b.note.slice(0, 2000) !== (o.note ?? "")) {
    o.note = b.note.slice(0, 2000);
    logOn(o, "Private note changed", by);
  }
  if (typeof b.trackingNumber === "string" && (b.trackingNumber.trim().slice(0, 80) || undefined) !== o.trackingNumber) {
    o.trackingNumber = b.trackingNumber.trim().slice(0, 80) || undefined;
    logOn(o, o.trackingNumber ? `Tracking number set: ${o.trackingNumber}` : "Tracking number removed", by);
  }
  if (typeof b.carrier === "string" && (b.carrier.slice(0, 20) || undefined) !== o.carrier) {
    o.carrier = b.carrier.slice(0, 20) || undefined;
    if (o.carrier) logOn(o, `Carrier: ${o.carrier}`, by);
  }
  let emailed = false;
  if (b.emailCustomer) {
    const s = await getSettings();
    if (!(await emailReady(s.emailFrom))) return NextResponse.json({ error: "Email isn't set up yet (Keys > Resend, and a sender in Settings)." }, { status: 400 });
    if (!o.email) return NextResponse.json({ error: "This order has no email address." }, { status: 400 });
    const m = shippedEmail(o, s.businessName);
    await sendEmail({ from: s.emailFrom, to: o.email, subject: m.subject, text: m.text, replyTo: s.contactEmail || undefined });
    o.shippedEmailAt = new Date().toISOString();
    logOn(o, `Shipped email sent to ${o.email}`, by);
    emailed = true;
  }
  await saveOrders(orders);
  return NextResponse.json({ ...o, emailed });
}

export const PATCH = mutating(handlePATCH);
