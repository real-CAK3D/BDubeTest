/*
 * EDIT-POINT: SALES-TAX
 * Sales tax by where the order goes (Dashboard > Settings > Payments > Sales tax).
 *  - off: no tax added
 *  - rates: your own rate for each state you collect in. The state comes from
 *    the ZIP code the order ships to (local pickup uses your shop's state).
 *  - stripe: Stripe Tax works out the exact rate for the address, including
 *    city and county rates (needs Stripe Tax switched on in Stripe; small fee).
 * Only collect tax in states where you're registered to. Ask a tax pro.
 */

export type TaxRate = { state: string; rate: number; shipping: boolean }; // rate in percent, e.g. 8.5
export type TaxSettings = { mode: "off" | "rates" | "stripe"; rates: TaxRate[] };
export const DEFAULT_TAX: TaxSettings = { mode: "off", rates: [] };

export const STATES: Record<string, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California", CO: "Colorado", CT: "Connecticut", DE: "Delaware", DC: "District of Columbia",
  FL: "Florida", GA: "Georgia", HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa", KS: "Kansas", KY: "Kentucky", LA: "Louisiana", ME: "Maine",
  MD: "Maryland", MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi", MO: "Missouri", MT: "Montana", NE: "Nebraska", NV: "Nevada",
  NH: "New Hampshire", NJ: "New Jersey", NM: "New Mexico", NY: "New York", NC: "North Carolina", ND: "North Dakota", OH: "Ohio", OK: "Oklahoma", OR: "Oregon",
  PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina", SD: "South Dakota", TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont", VA: "Virginia",
  WA: "Washington", WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming", PR: "Puerto Rico", AA: "Armed Forces Americas", AE: "Armed Forces Europe", AP: "Armed Forces Pacific",
};

// First three digits of a ZIP code -> state (USPS ranges)
const RANGES: [number, number, string][] = [
  [5, 5, "NY"], [6, 7, "PR"], [9, 9, "PR"], [10, 27, "MA"], [28, 29, "RI"], [30, 38, "NH"], [39, 49, "ME"], [50, 54, "VT"], [55, 55, "MA"], [56, 59, "VT"],
  [60, 69, "CT"], [70, 89, "NJ"], [90, 99, "AE"], [100, 149, "NY"], [150, 196, "PA"], [197, 199, "DE"], [200, 200, "DC"], [201, 201, "VA"], [202, 205, "DC"],
  [206, 219, "MD"], [220, 246, "VA"], [247, 268, "WV"], [270, 289, "NC"], [290, 299, "SC"], [300, 319, "GA"], [320, 339, "FL"], [340, 340, "AA"], [341, 349, "FL"],
  [350, 369, "AL"], [370, 385, "TN"], [386, 397, "MS"], [398, 399, "GA"], [400, 427, "KY"], [430, 459, "OH"], [460, 479, "IN"], [480, 499, "MI"], [500, 528, "IA"],
  [530, 549, "WI"], [550, 567, "MN"], [569, 569, "DC"], [570, 577, "SD"], [580, 588, "ND"], [590, 599, "MT"], [600, 629, "IL"], [630, 658, "MO"], [660, 679, "KS"],
  [680, 693, "NE"], [700, 714, "LA"], [716, 729, "AR"], [730, 732, "OK"], [733, 733, "TX"], [734, 749, "OK"], [750, 799, "TX"], [800, 816, "CO"], [820, 831, "WY"],
  [832, 838, "ID"], [840, 847, "UT"], [850, 865, "AZ"], [870, 884, "NM"], [885, 885, "TX"], [889, 898, "NV"], [900, 961, "CA"], [962, 966, "AP"], [967, 968, "HI"],
  [970, 979, "OR"], [980, 994, "WA"], [995, 999, "AK"],
];

export function stateOfZip(zip: string): string {
  const z = String(zip ?? "").replace(/\D/g, "");
  if (z.length < 3) return "";
  const n = Number(z.slice(0, 3));
  return RANGES.find(([a, b]) => n >= a && n <= b)?.[2] ?? "";
}

export function cleanTax(v: unknown): TaxSettings {
  const z = (v ?? {}) as Record<string, unknown>;
  const seen = new Set<string>();
  return {
    mode: z.mode === "rates" || z.mode === "stripe" ? z.mode : "off",
    rates: (Array.isArray(z.rates) ? (z.rates as Record<string, unknown>[]) : [])
      .map((r) => ({ state: String(r.state ?? "").toUpperCase().slice(0, 2), rate: Math.min(20, Math.max(0, Math.round((Number(r.rate) || 0) * 1000) / 1000)), shipping: Boolean(r.shipping) }))
      .filter((r) => r.state in STATES && !seen.has(r.state) && seen.add(r.state))
      .slice(0, 60),
  };
}

/** Tax with your own rates: on (items - discount), plus shipping where that state taxes it. */
export function taxByRate(t: TaxSettings, state: string, taxable: number, shipping: number) {
  const r = t.rates.find((x) => x.state === state);
  if (!r || r.rate <= 0) return null;
  const base = Math.max(0, taxable) + (r.shipping ? shipping : 0);
  return { amount: Math.round((base * r.rate) / 100), rate: r.rate, state, label: `Sales tax (${state} ${r.rate}%)` };
}
