import "server-only";
import { getProducts, getSettings } from "./db";
import { notifyOwner } from "./push";
import { kv } from "./store";
import type { Blank, OrderItem } from "./types";
import { withLock } from "./store";

/*
 * EDIT-POINT: BLANKS
 * The plain stock he engraves (tumblers, slate, leather...). Each item, or each
 * size of an item, can be linked to a blank; every sale takes one off the shelf,
 * he gets a heads-up when one runs low, and a size with no blanks left shows as
 * sold out in the shop.
 */
export async function getBlanks(): Promise<Blank[]> {
  return (await kv.get<Blank[]>("blanks")) ?? [];
}

export async function saveBlanks(list: Blank[]) {
  await kv.set("blanks", list.slice(0, 500));
}

/** Which blank one of this item (in this choice) uses, if any. */
export function blankFor(p: { blank?: string; sizes?: { name: string; blank?: string }[] | null }, option?: string) {
  if (p.sizes?.length) {
    const size = p.sizes.find((s) => option === s.name || option?.startsWith(`${s.name} ·`));
    return size?.blank || "";
  }
  return p.blank || "";
}

/** Takes the sold items' blanks off the shelf. */
async function _useBlanks(items: OrderItem[]) {
  const [blanks, products, settings] = await Promise.all([getBlanks(), getProducts(), getSettings()]);
  if (!blanks.length) return;
  const low: string[] = [];
  for (const it of items) {
    const p = products.find((x) => x.id === it.productId);
    const b = p ? blanks.find((x) => x.id === blankFor(p, it.option)) : undefined;
    if (!b) continue;
    b.qty = Math.max(0, b.qty - it.quantity);
    if (b.qty <= (b.low || settings.lowStockAlert)) low.push(`${b.name}: ${b.qty} left`);
  }
  await saveBlanks(blanks);
  if (low.length) await notifyOwner("Blanks running low", low.join(", "), "/admin/blanks");
}

// one change at a time (see withLock in lib/store.ts)
export function useBlanks(...a: Parameters<typeof _useBlanks>) {
  return withLock("write", () => _useBlanks(...a));
}
