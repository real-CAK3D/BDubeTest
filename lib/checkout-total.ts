import "server-only";
import type { PricedCart } from "./cart-price";
import { checkCode, getGiftCards } from "./discounts";
import { computeTax, taxMode } from "./tax-calc";

export type PromoApplied = { promoId: string; code: string; off: number };
export type GiftApplied = { giftId: string; code: string; off: number; balance: number };
export type Totals = {
  subtotal: number; // after the bulk discount
  discount: number; // promo code
  shipping: number;
  tax: number;
  taxLabel: string;
  taxLater: boolean; // Stripe works the tax out on its own page
  gift: number; // paid by gift card
  total: number; // left to pay
  promo?: PromoApplied;
  giftCard?: GiftApplied;
  errors: string[];
};

const norm = (c: string) => String(c ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 30);

/** The codes typed in the cart: at most one promo code and one gift card. */
export async function resolveCodes(raw: unknown, p: PricedCart) {
  const codes = [...new Set((Array.isArray(raw) ? raw : raw ? [raw] : []).map((c) => norm(String(c))).filter(Boolean))].slice(0, 3);
  const errors: string[] = [];
  let promo: PromoApplied | undefined;
  let gift: { giftId: string; code: string; balance: number } | undefined;
  if (!codes.length) return { errors };
  const cards = await getGiftCards();
  for (const code of codes) {
    const card = cards.find((c) => c.code === code && !c.promoId);
    if (card) {
      if (card.disabled) errors.push(`${code} has been switched off. Please contact us.`);
      else if (!(card.balance ?? 0)) errors.push(`${code} has no money left on it.`);
      else if (gift) errors.push("Only one gift card per order.");
      else gift = { giftId: card.id, code, balance: card.balance ?? 0 };
      continue;
    }
    if (!p.settings.allowPromoCodes) {
      errors.push(`${code} isn't a gift card code, and promo codes aren't being taken right now.`);
      continue;
    }
    if (promo) {
      errors.push("Only one promo code per order.");
      continue;
    }
    const r = await checkCode(code, p.subtotal);
    if ("error" in r) errors.push(r.error);
    else promo = r;
  }
  return { promo, gift, errors };
}

/**
 * Everything an order costs, in this order: items (after bulk), minus a promo
 * code, plus shipping, plus sales tax on that, then a gift card pays what it
 * can (a gift card is money, not a discount, so it doesn't lower the tax).
 */
export async function orderTotals(p: PricedCart, codes: unknown, opts: { forCard?: boolean; estimate?: boolean } = {}): Promise<Totals> {
  const { promo, gift, errors } = await resolveCodes(codes, p);
  const discount = Math.min(promo?.off ?? 0, p.subtotal);
  const shipping = p.shipping?.amount ?? 0;
  // with a gift card on the card checkout, the shop works the tax out (so Stripe doesn't tax the gift card part away)
  const tax = await computeTax(p, discount, { forCard: opts.forCard && !gift && taxMode(p.settings) === "stripe", estimate: opts.estimate });
  const before = p.subtotal - discount + shipping + tax.amount;
  const giftOff = gift ? Math.min(gift.balance, before) : 0;
  return {
    subtotal: p.subtotal,
    discount,
    shipping,
    tax: tax.amount,
    taxLabel: tax.label,
    taxLater: tax.note === "stripe-page" || tax.note === "later",
    gift: giftOff,
    total: before - giftOff,
    promo: promo ? { ...promo, off: discount } : undefined,
    giftCard: gift ? { ...gift, off: giftOff } : undefined,
    errors,
  };
}
