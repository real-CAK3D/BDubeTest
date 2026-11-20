import "server-only";
import type Stripe from "stripe";
import { markRecovered } from "./abandoned";
import { useBlanks } from "./blanks";
import { addOrderOnce, getOrders, getProducts, getSettings, saveProducts, updateOrder } from "./db";
import { createCode, issueGiftCard, randomCode } from "./discounts";
import { money } from "./format";
import { notifyOwner } from "./push";
import { stripe } from "./stripe";
import { withLock } from "./store";
import type { Order, OrderItem } from "./types";

/**
 * Records a paid checkout as an order. Safe to call any number of times, from
 * any server at once (the thank-you page and Stripe's webhook both call it):
 * one call at a time per checkout, the order is only created once, and each
 * step after payment is marked done so a retry finishes only what's missing.
 */
export function recordOrderFromSession(sessionId: string) {
  return withLock(`checkout:${sessionId}`, () => record(sessionId), { ttl: 60_000, wait: 45_000 });
}

async function record(sessionId: string) {
  const s = await stripe();
  if (!s) return null;
  const session = await s.checkout.sessions.retrieve(sessionId, {
    expand: ["line_items.data.price.product", "payment_intent.payment_method"],
  });
  if (session.payment_status !== "paid") return null;

  const items: OrderItem[] = [];
  let shipping = 0;
  let cart: [string, string][] = [];
  try {
    cart = JSON.parse(session.metadata?.cart ?? "[]");
  } catch {}
  const catalog = await getProducts();
  let lineIndex = 0;
  for (const li of session.line_items?.data ?? []) {
    const product = li.price?.product as Stripe.Product | undefined;
    const meta = product?.metadata ?? {};
    const fromCart = cart[lineIndex++] ?? [];
    const appProduct =
      catalog.find((p) => p.id === (meta.productId || fromCart[0])) ?? catalog.find((p) => product && p.stripeProductId === product.id);
    if (meta.kind === "shipping") {
      shipping += li.amount_total;
      continue;
    }
    items.push({
      productId: appProduct?.id ?? meta.productId ?? "",
      name: product?.name ?? li.description ?? "Item",
      option: meta.option || fromCart[1] || undefined,
      custom: meta.custom || undefined,
      design: meta.design || undefined,
      art: meta.art || undefined,
      quantity: li.quantity ?? 1,
      unitAmount: li.price?.unit_amount ?? 0,
    });
  }
  shipping += session.shipping_cost?.amount_total ?? 0;
  let promoCode: string | undefined;
  const disc = session.discounts?.[0]?.promotion_code;
  if (disc) {
    try {
      promoCode = typeof disc === "string" ? (await s.promotionCodes.retrieve(disc)).code : disc.code;
    } catch {}
  }

  const ship = session.collected_information?.shipping_details ?? null;
  const addr = ship?.address ?? session.customer_details?.address ?? null;
  const pi = session.payment_intent as Stripe.PaymentIntent | null;
  const pm = pi && typeof pi === "object" ? (pi.payment_method as Stripe.PaymentMethod | null) : null;
  const wallet = pm?.card?.wallet?.type;
  const paymentMethod = wallet
    ? wallet === "apple_pay" ? "Apple Pay" : wallet === "google_pay" ? "Google Pay" : wallet
    : pm?.card ? `${pm.card.brand} •••• ${pm.card.last4}` : pm?.type;

  const created = await addOrderOnce({
    id: session.id,
    createdAt: new Date((session.created ?? Date.now() / 1000) * 1000).toISOString(),
    email: session.customer_details?.email ?? "",
    name: ship?.name ?? session.customer_details?.name ?? "",
    phone: session.customer_details?.phone ?? undefined,
    shippingAddress: addr
      ? [addr.line1, addr.line2, `${addr.city ?? ""}, ${addr.state ?? ""} ${addr.postal_code ?? ""}`, addr.country]
          .filter(Boolean)
          .join("\n")
      : undefined,
    items,
    shipTo: addr?.line1
      ? { name: ship?.name ?? session.customer_details?.name ?? "", line1: addr.line1, line2: addr.line2 ?? undefined, city: addr.city ?? "", state: addr.state ?? "", zip: addr.postal_code ?? "", country: addr.country ?? "US", phone: session.customer_details?.phone ?? undefined, email: session.customer_details?.email ?? undefined }
      : undefined,
    bulkPercent: Number(session.metadata?.bulk) || undefined,
    delivery: session.metadata?.delivery === "pickup" ? "pickup" : session.metadata?.delivery === "ship" ? "ship" : undefined,
    giftNote: session.custom_fields?.find((f) => f.key === "gift")?.text?.value || undefined,
    shipNote:
      session.metadata?.shipZip && addr?.postal_code && !addr.postal_code.startsWith(session.metadata.shipZip)
        ? `Shipping was priced for ZIP ${session.metadata.shipZip} but the address is ${addr.postal_code}. Check the shipping cost before sending.`
        : undefined,
    subtotal: session.amount_subtotal ?? 0,
    shipping,
    discount: session.total_details?.amount_discount || undefined,
    tax: session.total_details?.amount_tax || undefined,
    promoCode,
    total: session.amount_total ?? 0,
    currency: session.currency ?? "usd",
    paymentMethod: paymentMethod ?? undefined,
    status: "paid",
    pending: true,
    steps: {},
    history: [
      { at: new Date().toISOString(), what: `Paid ${money(session.amount_total ?? 0, session.currency ?? "usd")}${paymentMethod ? ` by ${paymentMethod}` : ""}${promoCode ? `, code ${promoCode}` : ""}` },
    ],
  });
  let order: Order | null = created;
  if (!order) {
    // already recorded: finish any step a failed earlier try left undone
    order = (await getOrders()).find((o) => o.id === session.id) ?? null;
    if (!order?.pending) return null;
  }
  return runSteps(order, items, {
    recoveredFrom: session.recovered_from ?? undefined,
    gifts: async (o, save) => {
      let failed = "";
      const giftCodes = [...(o.giftCodes ?? [])];
      let need = 0;
      for (const li of session.line_items?.data ?? []) {
        const meta = ((li.price?.product as Stripe.Product | undefined)?.metadata ?? {}) as Record<string, string>;
        if (meta.kind !== "giftcard") continue;
        for (let n = 0; n < (li.quantity ?? 1); n++, need++) {
          if (need < giftCodes.length) continue; // made on an earlier try
          try {
            const card = await issueGiftCard({
              amount: li.price?.unit_amount ?? 0,
              fromName: meta.fromName ?? "",
              buyerEmail: o.email,
              toName: meta.toName ?? "",
              toEmail: meta.toEmail ?? "",
              message: meta.message ?? "",
              orderNumber: o.number,
            });
            giftCodes.push(card.code);
            await save({ giftCodes, history: [...(o.history ?? []), { at: new Date().toISOString(), what: `Gift card code made: ${card.code}` }] });
          } catch (e) {
            console.error("gift card:", e);
            failed = `gift card code: ${(e as Error).message}`;
          }
        }
      }
      return failed;
    },
  });
}

/**
 * The steps after an order is placed, for every way to pay: take the items off
 * the shelf, make gift card codes, give a thank-you code (only once it's paid)
 * and send the phone notification. Each step is marked done, so a retry only
 * finishes what's missing.
 */
export async function runSteps(start: Order, items: OrderItem[], extra: { recoveredFrom?: string; gifts?: (o: Order, save: (p: Partial<Order>) => Promise<void>) => Promise<string>; notifyTitle?: string } = {}) {
  let order: Order = start;
  const steps = { ...(order.steps ?? {}) };
  const done = async (patch: Partial<Order>) => {
    order = (await updateOrder(order.id, { ...patch, steps: { ...steps } })) ?? order;
  };
  const settings = await getSettings();
  let failed = "";

  // Reduce stock and warn when it's getting low
  const low: string[] = [];
  if (!steps.stock) {
    await withLock("write", async () => {
      const products = await getProducts();
      for (const it of items) {
        const p = products.find((x) => x.id === it.productId);
        if (p && p.stock !== null) {
          p.stock = Math.max(0, p.stock - it.quantity);
          if (p.stock <= settings.lowStockAlert) low.push(`${p.name} (${p.stock} left)`);
        }
      }
      await saveProducts(products);
    });
    await useBlanks(items).catch((e) => console.error("blanks:", e));
    if (extra.recoveredFrom) await markRecovered(extra.recoveredFrom).catch(() => {});
    steps.stock = true;
    await done({});
  }

  // Gift cards bought in this order (Stripe only)
  if (!steps.gifts) {
    failed = extra.gifts ? await extra.gifts(order, done) : "";
    if (!failed) {
      steps.gifts = true;
      await done({});
    } else {
      await notifyOwner(`Order #${order.number}: a gift card code wasn't made yet`, "It will be tried again automatically. If it keeps failing, check Stripe on Accounts & keys.", `/admin/orders?open=${order.id}`);
    }
  }

  // A thank-you code for their next order
  const ty = settings.discounts.thankYou;
  if (!steps.thanks && order.status !== "awaiting") {
    if (ty.on && items.some((i) => i.productId) && !order.nextCode) {
      const nextCode = await createCode({ code: randomCode("THANKS", 5), name: `Thank-you ${ty.percent}% off`, percent: ty.percent, maxUses: 1, expiresDays: ty.days, kind: "thanks" })
        .then((c) => c.code)
        .catch(() => undefined);
      if (nextCode) await done({ nextCode, history: [...(order.history ?? []), { at: new Date().toISOString(), what: `Thank-you code given: ${nextCode}` }] });
    }
    steps.thanks = true;
    await done({});
  }

  const count = items.reduce((n, i) => n + i.quantity, 0);
  /*
   * EDIT-POINT: NOTIFICATION-TEXT
   * Wording of the phone notification sent for each new order and low stock.
   */
  if (!steps.notified) {
    await notifyOwner(
      extra.notifyTitle ?? `New order #${order.number}: ${money(order.total, order.currency)}`,
      `${order.name || order.email} bought ${count} item${count === 1 ? "" : "s"}.`,
      `/admin/orders?open=${order.id}`
    );
    if (low.length) await notifyOwner("Running low on stock", low.join(", "), "/admin/products");
    steps.notified = true;
  }
  await done({ pending: failed ? true : undefined });
  // something still owed: make Stripe send the webhook again so it's finished then
  if (failed) throw new Error(`Order #${order.number} not finished (${failed}); will retry.`);
  return order;
}
