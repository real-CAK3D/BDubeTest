import "server-only";
import type { PricedCart } from "./cart-price";
import { stripe } from "./stripe";
import { stateOfZip, taxByRate, type TaxSettings } from "./tax";
import type { SiteSettings } from "./types";

export type TaxResult = { amount: number; label: string; state: string; note?: string };
const NONE: TaxResult = { amount: 0, label: "", state: "" };

/** off / rates ("Automatic") / stripe (older shops only had the "Sales tax by Stripe" switch). */
export function taxMode(s: SiteSettings): TaxSettings["mode"] {
  if (s.stripeTax && s.tax?.mode !== "rates") return "stripe";
  return s.tax?.mode ?? "rates";
}

/** The shop's own ZIP: "Ship from ZIP" in Settings > Store, or the ship-from address. */
export const shopZip = (s: SiteSettings) => String(s.shipFromZip || s.shipFrom?.zip || "").replace(/\D/g, "").slice(0, 5);
export const homeState = (s: SiteSettings) => stateOfZip(shopZip(s));

/** Which state the tax is for: where it ships, or the shop's own state for pickup. */
export function taxState(p: PricedCart) {
  if (p.abroad) return "";
  if (p.shipping) return stateOfZip(p.shipZip);
  return homeState(p.settings); // pickup, or nothing shipped
}

/**
 * The sales tax on an order after its discount. For card checkout in "stripe"
 * mode Stripe adds the tax on its own page, so pass `forCard` to skip it here.
 */
export async function computeTax(p: PricedCart, discount: number, opts: { forCard?: boolean; estimate?: boolean } = {}): Promise<TaxResult> {
  const s = p.settings;
  const mode = taxMode(s);
  const state = taxState(p);
  if (mode === "off" || !state) return NONE;
  const taxable = Math.max(0, p.subtotal - discount);
  const shipping = p.shipping?.amount ?? 0;
  if (mode === "rates") return taxByRate(s.tax, state, taxable, shipping, homeState(s)) ?? { ...NONE, state };
  // Stripe Tax
  if (opts.forCard) return { ...NONE, state, note: "stripe-page" };
  if (opts.estimate) return { ...NONE, state, note: "later" };
  const st = await stripe();
  const zip = p.shipping ? p.shipZip : shopZip(s);
  if (st && /^\d{5}$/.test(zip)) {
    try {
      const calc = await st.tax.calculations.create({
        currency: s.currency,
        line_items: [{ amount: taxable, reference: "order", tax_behavior: "exclusive" }],
        customer_details: { address: { postal_code: zip, country: "US", state }, address_source: "shipping" },
        ...(shipping ? { shipping_cost: { amount: shipping } } : {}),
      });
      return { amount: calc.tax_amount_exclusive, label: "Sales tax", state };
    } catch (e) {
      console.error("stripe tax:", (e as Error).message);
    }
  }
  // Stripe Tax isn't reachable: fall back to your own rate for that state, if there is one
  const fallback = taxByRate(s.tax, state, taxable, shipping, homeState(s));
  return fallback ? { ...fallback, note: "fallback" } : { ...NONE, state, note: "missed" };
}
