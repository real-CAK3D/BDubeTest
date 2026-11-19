import type { DiscountPrograms } from "./types";

export const DEFAULT_DISCOUNTS: DiscountPrograms = {
  thankYou: { on: false, percent: 10, days: 60 },
  veteran: {
    on: true,
    percent: 10,
    verify: true,
    code: "",
    heading: "Military & first responder discount",
    text: "Thank you for your service. Veterans, active duty, Guard and Reserve, police, firefighters and EMTs get {percent}% off.",
  },
  bulk: [
    { minQty: 10, percent: 5 },
    { minQty: 25, percent: 10 },
    { minQty: 50, percent: 15 },
  ],
  giftCards: { on: true, amounts: [25, 50, 100], heading: "Gift cards", text: "Let them pick their own piece. Sent by email with a code to use at checkout." },
  reminders: { on: true, hours: 2 },
};

/** The bulk discount for this many items (0 if none). */
export function bulkPercent(tiers: DiscountPrograms["bulk"], qty: number) {
  return tiers.filter((t) => qty >= t.minQty).reduce((m, t) => Math.max(m, t.percent), 0);
}
