import "server-only";
import { randomBytes } from "node:crypto";
import type { PricedCart } from "./cart-price";
import type { Totals } from "./checkout-total";
import { addOrderOnce, getOrders } from "./db";
import { emailReady, sendEmail } from "./email";
import { money } from "./format";
import { runSteps } from "./orders";
import { MANUAL_INFO, payLink, type ManualId } from "./payments";
import { capturePayPalOrder, createPayPalOrder, type PayPalMode } from "./paypal";
import { kv, withLock } from "./store";
import type { Order, OrderItem, ShipTo, SiteSettings } from "./types";

/*
 * Orders paid with PayPal / Venmo, "pay us directly" (Cash App, Venmo, Zelle,
 * cash at pickup), or fully by a gift card. Priced by priceCart + orderTotals,
 * exactly like the card checkout, and finished by the same steps (stock,
 * codes, gift cards, thank-you code, phone notification).
 */

/** What's being bought and what it costs, whichever way it's paid. */
export type Parts = {
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  tax: number;
  gift: number;
  total: number;
  promoId?: string;
  promoCode?: string;
  giftId?: string;
  giftCode?: string;
  delivery?: "ship" | "pickup";
  ship: boolean; // needs a shipping address
  pickup: boolean;
  shipZip: string;
  bulk: number;
  currency: string;
  giftCardBuy?: Order["giftCardBuy"];
};

export function partsOf(p: PricedCart, t: Totals): Parts {
  return {
    items: p.lines.map((l) => ({ productId: l.product.id, name: l.name, option: l.option || undefined, custom: l.custom || undefined, design: l.design || undefined, art: l.art || undefined, quantity: l.qty, unitAmount: l.unit })),
    subtotal: t.subtotal,
    shipping: t.shipping,
    discount: t.discount,
    tax: t.tax,
    gift: t.gift,
    total: t.total,
    promoId: t.promo?.promoId,
    promoCode: t.promo?.code,
    giftId: t.giftCard?.giftId,
    giftCode: t.giftCard?.code,
    delivery: p.pickup ? "pickup" : p.shipping ? "ship" : undefined,
    ship: Boolean(p.shipping),
    pickup: p.pickup,
    shipZip: p.abroad ? "" : p.shipZip,
    bulk: p.bulk,
    currency: p.settings.currency,
  };
}

/** A gift card on its own: no shipping, no tax, no codes. */
export function giftCardParts(s: SiteSettings, g: { amount: number; fromName?: string; toName?: string; toEmail?: string; message?: string }): Parts | string {
  const gc = s.discounts.giftCards;
  if (!gc.on) return "Gift cards aren't available right now.";
  const dollars = Math.round(Number(g.amount) || 0);
  if (!gc.amounts.includes(dollars)) return "Pick one of the gift card amounts.";
  const clip = (v: unknown, n: number) => String(v ?? "").replace(/\s+/g, " ").trim().slice(0, n);
  const amount = dollars * 100;
  return {
    items: [{ productId: "", name: `${s.businessName} gift card (${money(amount, s.currency)})`, quantity: 1, unitAmount: amount }],
    subtotal: amount,
    shipping: 0,
    discount: 0,
    tax: 0,
    gift: 0,
    total: amount,
    ship: false,
    pickup: false,
    shipZip: "",
    bulk: 0,
    currency: s.currency,
    giftCardBuy: { amount, fromName: clip(g.fromName, 60), toName: clip(g.toName, 60), toEmail: clip(g.toEmail, 200), message: clip(g.message, 300) },
  };
}

const viewKey = () => randomBytes(12).toString("base64url");
export const thanksUrl = (o: Pick<Order, "id" | "viewKey">) => `/success?order=${encodeURIComponent(o.id)}&k=${o.viewKey ?? ""}`;
const addressText = (t?: ShipTo) => (t ? [t.line1, t.line2, `${t.city}, ${t.state} ${t.zip}`, t.country].filter(Boolean).join("\n") : undefined);

function orderBase(x: Parts): Omit<Order, "id" | "number" | "createdAt" | "email" | "name" | "total" | "status" | "history"> {
  return {
    viewKey: viewKey(),
    items: x.items,
    subtotal: x.subtotal,
    shipping: x.shipping,
    discount: x.discount || undefined,
    tax: x.tax || undefined,
    promoCode: x.promoCode,
    giftPaid: x.gift || undefined,
    giftCode: x.giftCode,
    codes: x.promoId || x.giftId ? { promoId: x.promoId, giftId: x.giftId, giftOff: x.gift || undefined } : undefined,
    giftCardBuy: x.giftCardBuy,
    bulkPercent: x.bulk || undefined,
    delivery: x.delivery,
    currency: x.currency,
    pending: true,
    steps: {},
  };
}
const extras = (x: Parts) => `${x.promoCode ? `, code ${x.promoCode}` : ""}${x.gift ? `, ${money(x.gift, x.currency)} from gift card ${x.giftCode}` : ""}`;

// ---------- PayPal ----------

export async function startPayPal(x: Parts, mode: PayPalMode, brand: string) {
  const ref = randomBytes(9).toString("base64url");
  // PayPal's own breakdown: the gift card part counts as a discount there
  const id = await createPayPalOrder(mode, {
    ref,
    brand,
    currency: x.currency,
    items: x.items.map((i) => ({ name: i.name, quantity: i.quantity, unit: i.unitAmount, description: i.custom ? `"${i.custom}"` : undefined })),
    shipping: x.shipping,
    tax: x.tax,
    discount: x.discount + x.gift,
    ship: x.ship,
  });
  await withLock("paypalCarts", async () => {
    const all = (await kv.get<Record<string, Parts & { at: number }>>("paypalCarts")) ?? {};
    for (const [k, v] of Object.entries(all)) if (Date.now() - v.at > 6 * 3600_000) delete all[k];
    all[id] = { ...x, at: Date.now() };
    await kv.set("paypalCarts", all);
  });
  return id;
}

const pendingCart = async (id: string) => ((await kv.get<Record<string, Parts>>("paypalCarts")) ?? {})[id] ?? null;
const dropCart = (id: string) =>
  withLock("paypalCarts", async () => {
    const all = (await kv.get<Record<string, Parts>>("paypalCarts")) ?? {};
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
  const x = await pendingCart(paypalId);
  if (!x) throw new Error("That PayPal checkout ran out. Please try again from the cart.");
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
    ...orderBase(x),
    id,
    createdAt: new Date().toISOString(),
    email,
    name,
    phone: cap.payer?.phone?.phone_number?.national_number,
    shippingAddress: addressText(shipTo),
    shipTo,
    shipNote: x.shipZip && shipTo?.zip && !shipTo.zip.startsWith(x.shipZip) ? `Shipping and tax were worked out for ZIP ${x.shipZip} but the address is ${shipTo.zip}. Check them before sending.` : undefined,
    total,
    paymentMethod: `${via}${capture.status === "PENDING" ? " (PayPal is still checking it)" : ""}`,
    status: "paid",
    note: `PayPal transaction ${capture.id}`,
    history: [{ at: new Date().toISOString(), what: `Paid ${money(total, x.currency)} by ${via}${extras(x)} (PayPal transaction ${capture.id})` }],
  });
  if (!order) return (await getOrders()).find((o) => o.id === id)!;
  await dropCart(paypalId).catch(() => {});
  return runSteps(order, order.items);
}

// ---------- pay us directly, or all paid by a gift card ----------

export type Buyer = { name: string; email: string; phone: string; shipTo?: ShipTo; note?: string };

export async function placeDirectOrder(s: SiteSettings, x: Parts, payWith: ManualId | "covered", buyer: Buyer) {
  const covered = payWith === "covered";
  if (covered && x.total > 0) throw new Error("The gift card doesn't cover the whole order. Pick a way to pay the rest.");
  const m = covered ? null : s.payments.manual.find((y) => y.id === payWith && y.on);
  if (!covered && !m) throw new Error("That way to pay isn't available.");
  if (!covered && MANUAL_INFO[payWith as ManualId].pickupOnly && !x.pickup) throw new Error("Cash is only for local pickup. Choose pickup in the cart, or another way to pay.");
  const name = covered ? "Gift card" : MANUAL_INFO[payWith as ManualId].name;
  const order = await addOrderOnce({
    ...orderBase(x),
    id: `pd_${randomBytes(9).toString("base64url")}`,
    createdAt: new Date().toISOString(),
    email: buyer.email,
    name: buyer.name,
    phone: buyer.phone || undefined,
    shipTo: buyer.shipTo,
    shippingAddress: addressText(buyer.shipTo),
    giftNote: buyer.note || undefined,
    total: x.total,
    paymentMethod: name,
    payWith: covered ? undefined : payWith,
    status: covered ? "paid" : "awaiting",
    history: [
      {
        at: new Date().toISOString(),
        what: covered ? `Paid in full by gift card ${x.giftCode} (${money(x.gift, x.currency)})${x.promoCode ? `, code ${x.promoCode}` : ""}` : `Ordered, paying ${money(x.total, x.currency)} by ${name}${extras(x)}. Waiting for the money.`,
      },
    ],
  });
  if (!order) throw new Error("The order couldn't be saved. Please try again.");
  const done = await runSteps(order, order.items, covered ? {} : { notifyTitle: `New order #${order.number}: ${money(x.total, x.currency)} by ${name} (not paid yet)` });
  if (!covered) await emailPayInstructions(done, s.businessName, s.emailFrom, m!.handle, m!.note).catch((e) => console.error("pay email:", e));
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

/** The owner got the money: mark it paid, make any gift card bought, give the thank-you code. */
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
