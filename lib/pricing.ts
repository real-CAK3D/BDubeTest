import type { Design, Product } from "./types";

/*
 * EDIT-POINT: PRICING
 * How an item's price is worked out from the size and design a customer picks.
 * Used by the product page, the cart and checkout (checkout re-checks it on the
 * server, so a price can't be changed in the browser).
 */

type Priced = Pick<Product, "price" | "sizes" | "designs">;

/** Design ids that fit this item in the chosen size (or all sizes, for "*"). */
export function fittingIds(p: Priced, size: string) {
  if (!p.designs) return [];
  return p.designs.fit[p.sizes?.length ? size : "*"] ?? [];
}

export function fittingDesigns(p: Priced, size: string, library: Design[]) {
  const ids = fittingIds(p, size);
  return ids.map((id) => library.find((d) => d.id === id && d.active)).filter((d): d is Design => Boolean(d));
}

/** Price of one item with the chosen size and design, in cents. null = that choice isn't valid. */
export function unitPrice(p: Priced, size: string | undefined, designId: string | undefined, library: Design[]): number | null {
  let price = p.price;
  if (p.sizes?.length) {
    const s = p.sizes.find((x) => x.name === size);
    if (!s) return null;
    price = s.price;
  }
  if (designId) {
    const d = fittingDesigns(p, size ?? "", library).find((x) => x.id === designId);
    if (!d) return null;
    price += d.extra;
  } else if (p.designs?.required && fittingDesigns(p, size ?? "", library).length) return null;
  return price;
}

/** Lowest price, for "From $30" on cards. */
export function fromPrice(p: Priced) {
  return p.sizes?.length ? Math.min(...p.sizes.map((s) => s.price)) : p.price;
}

/** "30 oz · Design: American flag" for the cart, order and receipt. */
export function choiceLabel(parts: { size?: string; option?: string; design?: string }) {
  return [parts.size, parts.option, parts.design ? `Design: ${parts.design}` : ""].filter(Boolean).join(" · ");
}
