import "server-only";
import { getKey } from "./keys";
import { acceptedIcons, MANUAL_INFO } from "./payments";
import { paypalKeys } from "./paypal";
import type { SiteSettings } from "./types";

/** What the cart offers, from Settings > Payments and the keys that are actually saved (secrets never leave the server). */
export async function payOptions(s: SiteSettings) {
  const p = s.payments;
  const [stripeKey, pp] = await Promise.all([getKey("STRIPE_SECRET_KEY"), paypalKeys()]);
  return {
    stripe: Boolean(p.stripe && stripeKey),
    paypal: p.paypal && pp ? { clientId: pp.id, currency: s.currency } : null,
    manual: p.manual.filter((m) => m.on && (m.handle || m.id === "cash")).map((m) => ({ id: m.id, name: MANUAL_INFO[m.id].name, icon: MANUAL_INFO[m.id].icon, handle: m.handle, pickupOnly: MANUAL_INFO[m.id].pickupOnly })),
    accepts: p.accepts ? acceptedIcons(p, Boolean(stripeKey), Boolean(pp)) : [],
  };
}
