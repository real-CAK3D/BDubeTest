import type { SiteSettings } from "./types";

/** Fills in {business}, {email} and {state} in policy and page text. */
export function fillPolicy(text: string, s: SiteSettings) {
  return (text || "")
    .replaceAll("{business}", s.businessName)
    .replaceAll("{email}", s.contactEmail || "the email on our contact page")
    .replaceAll("{state}", s.legalState ? `the State of ${s.legalState}` : "the state where we're based")
    .replaceAll("{payments}", paymentsSentence(s));
}

/** "Cards, Apple Pay and Google Pay, PayPal, Venmo, and Cash App": the ways to pay switched on in Settings > Payments. */
export function paymentsSentence(s: SiteSettings) {
  const p = s.payments;
  const parts: string[] = [];
  if (p?.stripe !== false) parts.push("all major cards, Apple Pay and Google Pay (secure Stripe checkout)");
  if (p?.paypal) parts.push("PayPal, Venmo and Pay Later");
  for (const m of p?.manual ?? []) if (m.on && (m.handle || m.id === "cash")) parts.push(m.id === "cash" ? "cash at local pickup" : m.id === "cashapp" ? "Cash App" : m.id === "venmo" ? "Venmo" : "Zelle");
  const uniq = [...new Set(parts)];
  return uniq.length > 1 ? `${uniq.slice(0, -1).join(", ")} and ${uniq.at(-1)}` : uniq[0] ?? "card";
}

export const POLICY_PAGES: Record<string, { title: string; field: keyof SiteSettings; group: "Help" | "Legal" }> = {
  shipping: { title: "Shipping", field: "shippingPolicy", group: "Help" },
  returns: { title: "Returns", field: "returnPolicy", group: "Help" },
  "custom-orders": { title: "Custom & engraved orders", field: "customOrderPolicy", group: "Help" },
  privacy: { title: "Privacy", field: "privacyPolicy", group: "Legal" },
  terms: { title: "Terms of service", field: "termsOfService", group: "Legal" },
  disclaimer: { title: "Disclaimer", field: "disclaimer", group: "Legal" },
};
