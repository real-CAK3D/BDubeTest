import "server-only";
import { getExpenses, getOrders, getProducts, getSettings } from "./db";
import { locate } from "./shipping";
import { kv } from "./store";

/*
 * The numbers behind the Insights charts: sales over time (with order and
 * refund markers and the owner's own notes), sales split by category, design
 * and payment, best sellers, busy days and hours, and where orders ship to.
 */
export type ChartNote = { id: string; date: string; text: string };

export const getChartNotes = async () => (await kv.get<ChartNote[]>("chartNotes")) ?? [];
export const saveChartNotes = (l: ChartNote[]) => kv.set("chartNotes", l.slice(0, 300));

export async function insightsData(days: number) {
  const [orders, products, expenses, s, notes] = await Promise.all([getOrders(), getProducts(), getExpenses(), getSettings(), getChartNotes()]);
  const since = Date.now() - days * 86400_000;
  const live = orders.filter((o) => o.status !== "cancelled" && o.status !== "awaiting" && Date.parse(o.createdAt) >= since); // not paid yet = not money yet
  const counted = live.filter((o) => o.status !== "refunded");
  const day = (iso: string) => iso.slice(0, 10);

  // every day in the range, so the line has no gaps
  const byDay = new Map<string, { revenue: number; orders: number; expenses: number }>();
  for (let t = since; t <= Date.now(); t += 86400_000) byDay.set(day(new Date(t).toISOString()), { revenue: 0, orders: 0, expenses: 0 });
  for (const o of counted) {
    const d = byDay.get(day(o.createdAt));
    if (d) (d.revenue += o.total), d.orders++;
  }
  for (const e of expenses) {
    const d = byDay.get(e.date);
    if (d) d.expenses += e.amount;
  }
  const series = [...byDay.entries()].map(([date, v]) => ({ date, ...v }));

  // markers: the biggest orders and every refund
  const big = [...counted].sort((a, b) => b.total - a.total).slice(0, 5);
  const markers = [
    ...big.map((o) => ({ date: day(o.createdAt), kind: "big" as const, label: `#${o.number}`, amount: o.total })),
    ...live.filter((o) => o.status === "refunded").map((o) => ({ date: day(o.createdAt), kind: "refund" as const, label: `#${o.number} refunded`, amount: o.total })),
  ];

  const tally = (pairs: [string, number][]) => {
    const m = new Map<string, number>();
    for (const [k, v] of pairs) m.set(k, (m.get(k) ?? 0) + v);
    return [...m.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  };
  const catOf = (id: string) => products.find((p) => p.id === id)?.category || "Other";
  const items = counted.flatMap((o) => o.items);
  const byCategory = tally(items.map((i) => [i.productId ? catOf(i.productId) : "Gift cards", i.unitAmount * i.quantity]));
  const byDesign = tally(items.filter((i) => i.design).map((i) => [i.design === "upload" ? "Their own artwork" : s.designs.find((d) => d.id === i.design)?.name ?? i.design!, i.quantity]));
  const byPayment = tally(counted.map((o) => [(o.paymentMethod ?? "Card").replace(/ •+ \d+$/, "").replace(/^\w/, (c) => c.toUpperCase()), 1]));
  const byDelivery = tally(counted.map((o) => [o.delivery === "pickup" ? "Local pickup" : "Shipped", 1]));
  const topItems = tally(items.map((i) => [i.name.replace(/ \(.*\)$/, ""), i.quantity])).slice(0, 10);

  // busy times: day of week x hour (in the shop's own time zone would need settings; this uses Central time)
  const heat: [number, number, number][] = [];
  const grid = new Map<string, number>();
  for (const o of counted) {
    const d = new Date(new Date(o.createdAt).toLocaleString("en-US", { timeZone: "America/Chicago" }));
    const k = `${d.getDay()}:${d.getHours()}`;
    grid.set(k, (grid.get(k) ?? 0) + 1);
  }
  for (const [k, v] of grid) {
    const [dd, hh] = k.split(":").map(Number);
    heat.push([hh, dd, v]);
  }

  // where orders go: ZIPs looked up once and remembered
  const zips = new Map<string, number>();
  for (const o of counted) if (o.shipTo?.zip && (o.shipTo.country ?? "US") === "US") zips.set(o.shipTo.zip.slice(0, 5), (zips.get(o.shipTo.zip.slice(0, 5)) ?? 0) + 1);
  const points: { name: string; value: [number, number, number] }[] = [];
  for (const [zip, n] of [...zips.entries()].slice(0, 300)) {
    const pt = await locate("US", zip).catch(() => null);
    if (pt) points.push({ name: pt.place, value: [pt.lng, pt.lat, n] });
  }
  const byState = tally(counted.filter((o) => o.shipTo?.state).map((o) => [o.shipTo!.state, 1]));

  return {
    days,
    currency: s.currency,
    totals: { revenue: counted.reduce((n, o) => n + o.total, 0), orders: counted.length, items: items.reduce((n, i) => n + i.quantity, 0) },
    series,
    markers,
    notes: notes.filter((n) => Date.parse(n.date) >= since - 86400_000),
    byCategory,
    byDesign,
    byPayment,
    byDelivery,
    topItems,
    heat,
    points,
    byState,
  };
}
export type Insights = Awaited<ReturnType<typeof insightsData>>;
