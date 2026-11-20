/*
 * EDIT-POINT: PAYMENTS
 * Ways customers can pay (Dashboard > Settings > Payments).
 *  - Card checkout by Stripe (cards, Apple Pay, Google Pay, Link)
 *  - PayPal: the PayPal buttons, which also offer Venmo (US phones) and Pay Later
 *  - "Pay us directly": Cash App, Venmo, Zelle or cash at pickup. The order is
 *    saved as "Waiting for payment" and you mark it paid when the money arrives.
 * Keys (Stripe, PayPal) go on Dashboard > Accounts & keys, never here.
 */

export type ManualId = "cashapp" | "venmo" | "zelle" | "cash";
export type ManualMethod = { id: ManualId; on: boolean; handle: string; note: string };
export type PaymentSettings = {
  stripe: boolean; // card checkout (needs the Stripe key)
  paypal: boolean; // PayPal / Venmo / Pay Later buttons (needs the PayPal keys)
  paypalMode: "live" | "sandbox"; // sandbox = practice money
  manual: ManualMethod[];
  accepts: boolean; // "We accept" payment pictures in the footer and cart
};

export const MANUAL_INFO: Record<ManualId, { name: string; icon: string; handleLabel: string; placeholder: string; pickupOnly?: boolean }> = {
  cashapp: { name: "Cash App", icon: "cash-app", handleLabel: "Your $cashtag", placeholder: "$DubeFamily" },
  venmo: { name: "Venmo", icon: "venmo", handleLabel: "Your Venmo @username", placeholder: "@Dube-Family" },
  zelle: { name: "Zelle", icon: "zelle", handleLabel: "Email or phone number on Zelle", placeholder: "you@example.com" },
  cash: { name: "Cash at pickup", icon: "cash", handleLabel: "Where / when to pick up (optional)", placeholder: "Pay when you pick it up", pickupOnly: true },
};

export const DEFAULT_PAYMENTS: PaymentSettings = {
  stripe: true,
  paypal: false,
  paypalMode: "live",
  manual: (Object.keys(MANUAL_INFO) as ManualId[]).map((id) => ({ id, on: false, handle: "", note: "" })),
  accepts: true,
};

export function cleanPayments(v: unknown): PaymentSettings {
  const z = (v ?? {}) as Record<string, unknown>;
  const rows = Array.isArray(z.manual) ? (z.manual as Record<string, unknown>[]) : [];
  return {
    stripe: z.stripe !== false,
    paypal: Boolean(z.paypal),
    paypalMode: z.paypalMode === "sandbox" ? "sandbox" : "live",
    manual: (Object.keys(MANUAL_INFO) as ManualId[]).map((id) => {
      const r = rows.find((x) => x.id === id) ?? {};
      return { id, on: Boolean(r.on), handle: String(r.handle ?? "").trim().slice(0, 80), note: String(r.note ?? "").trim().slice(0, 300) };
    }),
    accepts: z.accepts !== false,
  };
}

/** A tap-to-pay link with the amount filled in, where the app supports it. */
export function payLink(m: ManualMethod, cents: number, orderNumber: number) {
  const amt = (cents / 100).toFixed(2);
  const h = m.handle.trim();
  if (m.id === "cashapp" && h) return `https://cash.app/$${h.replace(/^\$/, "")}/${amt}`;
  if (m.id === "venmo" && h) return `https://venmo.com/${encodeURIComponent(h.replace(/^@/, ""))}?txn=pay&amount=${amt}&note=${encodeURIComponent(`Order #${orderNumber}`)}`;
  return "";
}

// pictures for "We accept" (public/icons/pay, see public/icons/CREDITS.md)
export function acceptedIcons(p: PaymentSettings, stripeReady: boolean, paypalReady: boolean) {
  const out: { file: string; name: string }[] = [];
  if (p.stripe && stripeReady)
    out.push({ file: "visa", name: "Visa" }, { file: "mastercard", name: "Mastercard" }, { file: "american-express", name: "American Express" }, { file: "discover", name: "Discover" }, { file: "apple-pay", name: "Apple Pay" }, { file: "google-pay", name: "Google Pay" });
  if (p.paypal && paypalReady) out.push({ file: "paypal", name: "PayPal" }, { file: "venmo", name: "Venmo" });
  for (const m of p.manual) if (m.on && (m.handle || m.id === "cash") && !out.some((o) => o.file === MANUAL_INFO[m.id].icon)) out.push({ file: MANUAL_INFO[m.id].icon, name: MANUAL_INFO[m.id].name });
  return out;
}
