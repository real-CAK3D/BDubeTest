import type { SiteSettings } from "./types";

/** Fills in {business}, {email} and {state} in policy and page text. */
export function fillPolicy(text: string, s: SiteSettings) {
  return (text || "")
    .replaceAll("{business}", s.businessName)
    .replaceAll("{email}", s.contactEmail || "the email on our contact page")
    .replaceAll("{state}", s.legalState ? `the State of ${s.legalState}` : "the state where we're based");
}

export const POLICY_PAGES: Record<string, { title: string; field: keyof SiteSettings; group: "Help" | "Legal" }> = {
  shipping: { title: "Shipping", field: "shippingPolicy", group: "Help" },
  returns: { title: "Returns", field: "returnPolicy", group: "Help" },
  "custom-orders": { title: "Custom & engraved orders", field: "customOrderPolicy", group: "Help" },
  privacy: { title: "Privacy", field: "privacyPolicy", group: "Legal" },
  terms: { title: "Terms of service", field: "termsOfService", group: "Legal" },
  disclaimer: { title: "Disclaimer", field: "disclaimer", group: "Legal" },
};
