import type { Order } from "./types";

/** How many times each design was ordered (refunded and cancelled orders don't count). id -> count */
export function designCounts(orders: Order[]) {
  const n: Record<string, number> = {};
  for (const o of orders) {
    if (o.status === "refunded" || o.status === "cancelled") continue;
    for (const i of o.items) if (i.design) n[i.design] = (n[i.design] ?? 0) + i.quantity;
  }
  return n;
}
