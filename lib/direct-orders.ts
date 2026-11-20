import "server-only";
import { randomBytes } from "node:crypto";
import type { PricedCart } from "./cart-price";
import { addOrderOnce, getOrders } from "./db";
import { useCodeOutside } from "./discounts";
import { emailReady, sendEmail } from "./email";
import { money } from "./format";
import { runSteps } from "./orders";
import { MANUAL_INFO, payLink, type ManualId } from "./payments";
import { capturePayPalOrder, createPayPalOrder, type PayPalMode } from "./paypal";
import { kv, withLock } from "./store";
import type { Order, OrderItem, ShipTo } from "./types";

/*
 * Orders paid with PayPal / Venmo, or "pay us directly" (Cash App, Venmo, Zelle,
 * cash at pickup). Priced by priceCart, exactly like the card checkout, and
 * finished by the same steps (stock, thank-you code, phone notification).
 */

type Saved = { items: OrderItem[]; subtotal: number; shipping: number; discount: number; promoId?: string; promoCode?: string; delivery?: "ship" | "pickup"; shipZip: string; bulk: number; currency: string };

const itemsOf = (p: PricedCart): OrderItem[] =>
  p.lines.map((l) => ({ productId: l.product.id, name: l.name, option: l.option || undefined, custom: l.custom || undefined, design: l.design || undefined, art: l.art || undefined, quantity: l.qty, unitAmount: l.unit }));

function savedOf(p: PricedCart, code?: { promoId: string; code: string; off: number }): Saved {
  return {
    items: itemsOf(p),
    subtotal: p.subtotal,
    shipping: p.shipping?.amount ?? 0,
    discount: Math.min(code?.off ?? 0, p.subtotal),
    promoId: code?.promoId,
    promoCode: code?.code,
    delivery: p.pickup ? "pickup" : p.shipping ? "ship" : undefined,
    shipZip: p.abroad ? "" : p.shipZip,
    bulk: p.bulk,
    currency: p.settings.currency,
  };
}

const viewKey = () => randomBytes(12).toString("base64url");
export const thanksUrl = (o: Pick<Order, "id" | "viewKey">) => `/success?order=${encodeURIComponent(o.id)}&k=${o.viewKey ?? ""}`;

// ---------- PayPal ----------

export async function startPayPal(p: PricedCart, mode: PayPalMode, code?: { promoId: string; code: string; off: number }) {
  const saved = savedOf(p, code);
  const ref = randomBytes(9).toString("base64url");
  const id = await createPayPalOrder(mode, {
    ref,
    brand: p.settings.businessName,
    currency: p.settings.currency,
    items: p.lines.map((l) => ({ name: l.name, quantity: l.qty, unit: l.unit, description: l.custom ? `"${l.custom}"` : undefined })),
    shipping: saved.shipping,
    discount: saved.discount,
    ship: Boolean(p.shipping),
  });
  await withLock("paypalCarts", async () => {
    const all = (await kv.get<Record<string, Saved & { at: number }>>("paypalCarts")) ?? {};
    for (const [k, v] of Object.entries(all)) if (Date.now() - v.at > 6 * 3600_000) delete all[k];
    all[id] = { ...saved, at: Date.now() };
    await kv.set("paypalCarts", all);
  });
  return id;
}

const pendingCart = async (id: string) => ((await kv.get<Record<string, Saved>>("paypalCarts")) ?? {})[id] ?? null;
const dropCart = (id: string) =>
  withLock("paypalCarts", async () => {
    const all = (await kv.get<Record<string, Saved>>("paypalCarts")) ?? {};
    delete all[id];
    await kv.set("paypalCarts", all);
  });

/** Captures an approved PayPal order and records it. Safe to call twice. */
export function finishPayPal(mode: PayPalMode, paypalId: string) {
  return withLock(`checkout:pp_${paypalId}`, () => _finishPayPal(mode, paypalId), { ttl: 60_000, wait: 45_000 });
}

async function _finishPayPal(mode: PayPalMode, paypalId: string): Promise<Order> {
  const id = `pp_${paypalId}`;
  const existing = (await getOrders()).find((o) => o.id === id);
  if (existing) return existing.pending ? runSteps(existing, existing.items) : existing;
  const saved = await pendingCart(paypalId);
  if (!saved) throw new Error("That PayPal checkout ran out. Please try again from the cart.");
  const cap = await capturePayPalOrder(mode, paypalId);
  const capture = cap.purchase_units?.[0]?.payments?.captures?.[0];
  if (cap.status !== "COMPLETED" || !capture || !["COMPLETED", "PENDING"].includes(capture.status)) throw new Error("PayPal didn't finish the payment. Nothing was charged; please try again.");
  const total = Math.round(Number(capture.amount.value) * 100);
  const source = Object.keys(cap.payment_source ?? {})[0] ?? "paypal";
  const via = source === "venmo" ? "Venmo" : source === "paypal" ? "PayPal" : `PayPal (${source})`;
  const ship = cap.purchase_units?.[0]?.shipping;
  const a = ship?.address;
  const name = ship?.name?.full_name ?? [cap.payer?.name?.given_name, cap.payer?.name?.surname].filter(Boolean).join(" ");
  const email = cap.payer?.email_address ?? cap.payment_source?.[source]?.email_address ?? "";
  const shipTo: ShipTo | undefined = a?.address_line_1
    ? { name, line1: a.address_line_1, line2: a.address_line_2, city: a.admin_area_2 ?? "", state: a.admin_area_1 ?? "", zip: a.postal_code ?? "", country: a.country_code ?? "US", email: email || undefined }
    : undefined;
  const order = await addOrderOnce({
    id,
    viewKey: viewKey(),
    createdAt: new Date().toISOString(),
    email,
    name,
    phone: cap.payer?.phone?.phone_number?.national_number,
    shippingAddress: shipTo ? [shipTo.line1, shipTo.line2, `${shipTo.city}, ${shipTo.state} ${shipTo.zip}`, shipTo.country].filter(Boolean).join("\n") : undefined,
    shipTo,
    items: saved.items,
    subtotal: saved.subtotal,
    shipping: saved.shipping,
    discount: saved.discount || undefined,
    promoCode: saved.promoCode,
    bulkPercent: saved.bulk || undefined,
    delivery: saved.delivery,
    shipNote: saved.shipZip && shipTo?.zip && !shipTo.zip.startsWith(saved.shipZip) ? `Shipping was priced for ZIP ${saved.shipZip} but the address is ${shipTo.zip}. Check the shipping cost before sending.` : undefined,
    total,
    currency: saved.currency,
    paymentMethod: `${via}${capture.status === "PENDING" ? " (PayPal is still checking it)" : ""}`,
    status: "paid",
    pending: true,
    steps: {},
    note: `PayPal transaction ${capture.id}`,
    history: [{ at: new Date().toISOString(), what: `Paid ${money(total, saved.currency)} by ${via}${saved.promoCode ? `, code ${saved.promoCode}` : ""} (PayPal transaction ${capture.id})` }],
  });
  if (!order) return (await getOrders()).find((o) => o.id === id)!;
  if (saved.promoId) await useCodeOutside(saved.promoId).catch(() => {});
  await dropCart(paypalId).catch(() => {});
  return runSteps(order, order.items);
}

// ---------- pay us directly ----------

export type Buyer = { name: string; email: string; phone: string; shipTo?: ShipTo; note?: string };

export async function placeDirectOrder(p: PricedCart, payWith: ManualId, buyer: Buyer, code?: { promoId: string; code: string; off: number }) {
  const m = p.settings.payments.manual.find((x) => x.id === payWith && x.on);
  if (!m) throw new Error("That way to pay isn't available.");
  if (MANUAL_INFO[payWith].pickupOnly && !p.pickup) throw new Error("Cash is only for local pickup. Choose pickup in the cart, or another way to pay.");
  const saved = savedOf(p, code);
  const total = saved.subtotal + saved.shipping - saved.discount;
  const info = MANUAL_INFO[payWith];
  const order = await addOrderOnce({
    id: `pd_${randomBytes(9).toString("base64url")}`,
    viewKey: viewKey(),
    createdAt: new Date().toISOString(),
    email: buyer.email,
    name: buyer.name,
    phone: buyer.phone || undefined,
    shipTo: buyer.shipTo,
    shippingAddress: buyer.shipTo ? [buyer.shipTo.line1, buyer.shipTo.line2, `${buyer.shipTo.city}, ${buyer.shipTo.state} ${buyer.shipTo.zip}`, buyer.shipTo.country].filter(Boolean).join("\n") : undefined,
    items: saved.items,
    subtotal: saved.subtotal,
    shipping: saved.shipping,
    discount: saved.discount || undefined,
    promoCode: saved.promoCode,
    bulkPercent: saved.bulk || undefined,
    delivery: saved.delivery,
    giftNote: buyer.note || undefined,
    total,
    currency: saved.currency,
    paymentMethod: info.name,
    payWith,
    status: "awaiting",
    pending: true,
    steps: {},
    history: [{ at: new Date().toISOString(), what: `Ordered, paying ${money(total, saved.currency)} by ${info.name}${saved.promoCode ? `, code ${saved.promoCode}` : ""}. Waiting for the money.` }],
  });
  if (!order) throw new Error("The order couldn't be saved. Please try again.");
  if (saved.promoId) await useCodeOutside(saved.promoId).catch(() => {});
  const done = await runSteps(order, order.items, { notifyTitle: `New order #${order.number}: ${money(total, saved.currency)} by ${info.name} (not paid yet)` });
  await emailPayInstructions(done, p.settings.businessName, p.settings.emailFrom, m.handle, m.note).catch((e) => console.error("pay email:", e));
  return done;
}

/** What to tell the customer: where to send the money and what to write in the note. */
export function payInstructions(o: Order, handle: string, note: string) {
  const info = MANUAL_INFO[(o.payWith ?? "cash") as ManualId];
  const amount = money(o.total, o.currency);
  const lines =
    o.payWith === "cash"
      ? [`Please bring ${amount} in cash when you pick up order #${o.number}.`]
      : [`Send ${amount} by ${info.name} to ${handle}.`, `Put "Order #${o.number}" in the note so we know it's yours.`];
  if (note) lines.push(note);
  lines.push("We'll start on it as soon as the payment arrives, and email you.");
  return lines;
}

async function emailPayInstructions(o: Order, business: string, from: string, handle: string, note: string) {
  if (!o.email || !(await emailReady(from))) return;
  const m = { id: o.payWith as ManualId, on: true, handle, note };
  const link = payLink(m, o.total, o.number);
  await sendEmail({
    from,
    to: o.email,
    subject: `${business}: order #${o.number}, how to pay`,
    text: [
      `Hi ${o.name.split(" ")[0] || "there"},`,
      "",
      `Thanks for your order #${o.number}!`,
      ...o.items.map((i) => `  ${i.quantity} × ${i.name}`),
      "",
      ...payInstructions(o, handle, note),
      ...(link ? ["", `Pay now: ${link}`] : []),
      "",
      business,
    ].join("\n"),
  });
}

/** The owner got the money: mark it paid and give the thank-you code. */
export async function markDirectPaid(id: string, by: string) {
  return withLock(`checkout:${id}`, async () => {
    const o = (await getOrders()).find((x) => x.id === id);
    if (!o || o.status !== "awaiting") return o ?? null;
    const { updateOrder } = await import("./db");
    const paid = await updateOrder(id, {
      status: "paid",
      pending: true,
      history: [...(o.history ?? []), { at: new Date().toISOString(), what: `Payment received (${o.paymentMethod ?? "directly"})`, by }],
    });
    return paid ? runSteps(paid, paid.items, {}) : null;
  });
}
