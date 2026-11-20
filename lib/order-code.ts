/*
 * EDIT-POINT: ORDER-CODES
 * Every order has a reference code like DFC1042-7KQ3 (shop initials, the order
 * number, and 4 check characters). It's different from the carrier's tracking
 * number. The same code is printed as a barcode on the customer's receipt and
 * packing slip, and as a QR code that opens the full order in the dashboard
 * (for a signed-in admin only; anyone else just gets the login page).
 */
const ALPHA = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function check(id: string) {
  // FNV-1a over the order's private id, so the code can't be guessed from the number
  let h = 0x811c9dc5;
  for (let i = 0; i < id.length; i++) h = Math.imul(h ^ id.charCodeAt(i), 0x01000193) >>> 0;
  let out = "";
  for (let i = 0; i < 4; i++) {
    out += ALPHA[h % ALPHA.length];
    h = Math.floor(h / ALPHA.length) ^ (i * 7919);
  }
  return out;
}

export function initials(business: string) {
  return (business.match(/[A-Za-z0-9]+/g) ?? ["SHOP"]).map((w) => w[0]).join("").toUpperCase().slice(0, 3) || "SH";
}

export function orderCode(o: { id: string; number: number }, business: string) {
  return `${initials(business)}${o.number}-${check(o.id)}`;
}

/** A stock code for an item (and size), printed on item labels: e.g. DFC-STANLEY-AU-40OZ */
export function skuOf(business: string, slug: string, size?: string) {
  // every word counts (two items that differ only at the end, like 30 oz / 40 oz, get different codes);
  // long names are shortened with a short fingerprint of the full name so they stay unique
  const full = slug.toUpperCase().replace(/[^A-Z0-9]+/g, "-").split("-").filter(Boolean).map((w) => w.slice(0, 7)).join("-");
  let h = 5381;
  for (const ch of slug) h = ((h * 33) ^ ch.charCodeAt(0)) >>> 0;
  const base = full.length <= 28 ? full : `${full.slice(0, 22).replace(/-+$/, "")}-${h.toString(36).toUpperCase().slice(-4)}`;
  const sz = size ? `-${size.toUpperCase().replace(/[^A-Z0-9]+/g, "")}` : "";
  return `${initials(business)}-${base}${sz}`.slice(0, 40);
}
