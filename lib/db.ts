import "server-only";
import { getPrivate, setPrivate } from "./private-data";
import { kv } from "./store";
import { DEFAULT_ADMIN } from "./site-structure";
import { fileSettings, syncVariables } from "./sync";
import type { AppNotification, CustomRequest, Expense, Message, Order, Product, Review, SiteSettings, Subscriber } from "./types";
import { withLock } from "./store";

// Starting values come from site-variables.ts (the SITE-VARIABLES edit point).
export const DEFAULT_SETTINGS: SiteSettings = {
  ...fileSettings(),
  admin: DEFAULT_ADMIN,
  shipFrom: { name: "", company: "", street1: "", street2: "", city: "", state: "", zip: "", phone: "", email: "" },
  parcels: [
    { name: "Tumbler box", length: 12, width: 6, height: 6, weightOz: 32 },
    { name: "Small flat (coaster, card holder)", length: 8, width: 6, height: 2, weightOz: 12 },
    { name: "Sign box", length: 26, width: 12, height: 3, weightOz: 64 },
  ],
};

export async function getSettings(): Promise<SiteSettings> {
  await syncVariables();
  const s = await kv.get<Partial<SiteSettings>>("settings");
  return { ...DEFAULT_SETTINGS, ...(s ?? {}), social: { ...(s?.social ?? {}) }, admin: { ...DEFAULT_ADMIN, ...(s?.admin ?? {}) }, shipFrom: { ...DEFAULT_SETTINGS.shipFrom, ...(s?.shipFrom ?? {}) } };
}

export async function saveSettings(patch: Partial<SiteSettings>) {
  const current = await getSettings();
  const next = { ...current, ...patch };
  await kv.set("settings", next);
  return next;
}

export async function getProducts(): Promise<Product[]> {
  await syncVariables();
  return (await kv.get<Product[]>("products")) ?? [];
}

/** Items customers can see, grouped in the owner's category order (Products > Categories). */
export async function getActiveProducts() {
  const [list, s] = await Promise.all([getProducts(), getSettings()]);
  const rank = (c: string) => {
    const i = s.categories.indexOf(c);
    return i < 0 ? s.categories.length + (c ? 0 : 1) : i;
  };
  return list.filter((p) => p.active).sort((a, b) => rank(a.category) - rank(b.category));
}

export async function getProductBySlug(slug: string) {
  return (await getProducts()).find((p) => p.slug === slug) ?? null;
}

export async function saveProducts(list: Product[]) {
  await kv.set("products", list);
}

export { newId, slugify } from "./ids";

export async function getOrders(): Promise<Order[]> {
  return await getPrivate<Order[]>("orders", []);
}

export async function saveOrders(list: Order[]) {
  await setPrivate("orders", list);
}

/** Adds a line to an order's history (kept with the order, newest last). */
export function logOn(o: Order, what: string, by?: string) {
  o.history = [...(o.history ?? []), { at: new Date().toISOString(), what: what.slice(0, 200), ...(by ? { by } : {}) }].slice(-100);
}

async function _updateOrder(id: string, patch: Partial<Order>) {
  const orders = await getOrders();
  const o = orders.find((x) => x.id === id);
  if (!o) return null;
  Object.assign(o, patch);
  await saveOrders(orders);
  return o;
}

// Returns null if we already have it (webhook and thank-you page both call this).
async function _addOrderOnce(order: Omit<Order, "number">): Promise<Order | null> {
  const orders = await getOrders();
  if (orders.some((o) => o.id === order.id)) return null;
  const number = (orders.reduce((m, o) => Math.max(m, o.number), 1000) || 1000) + 1;
  const full: Order = { ...order, number };
  orders.unshift(full);
  await saveOrders(orders);
  return full;
}

export async function getExpenses(): Promise<Expense[]> {
  return (await kv.get<Expense[]>("expenses")) ?? [];
}
export async function saveExpenses(list: Expense[]) {
  await kv.set("expenses", list);
}

export async function getNotifications(): Promise<AppNotification[]> {
  return await getPrivate<AppNotification[]>("notifications", []);
}
export async function saveNotifications(list: AppNotification[]) {
  await setPrivate("notifications", list.slice(0, 200));
}

export function dayKey(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

export async function trackView(opts: { productId?: string; newVisitor: boolean; referrer?: string }) {
  const day = dayKey();
  const jobs = [kv.hincrby("views", day, 1)];
  if (opts.newVisitor) jobs.push(kv.hincrby("visitors", day, 1));
  if (opts.productId) jobs.push(kv.hincrby("productViews", opts.productId, 1));
  if (opts.referrer) jobs.push(kv.hincrby("referrers", opts.referrer, 1));
  await Promise.all(jobs);
}

export async function getAnalytics() {
  const [views, visitors, productViews, referrers] = await Promise.all([
    kv.hgetall("views"),
    kv.hgetall("visitors"),
    kv.hgetall("productViews"),
    kv.hgetall("referrers"),
  ]);
  return { views, visitors, productViews, referrers };
}

export type PushSub = { endpoint: string; keys: { p256dh: string; auth: string }; label?: string };
export async function getPushSubs(): Promise<PushSub[]> {
  return await getPrivate<PushSub[]>("pushSubs", []);
}
export async function savePushSubs(list: PushSub[]) {
  await setPrivate("pushSubs", list);
}

export async function getMessages(): Promise<Message[]> {
  return await getPrivate<Message[]>("messages", []);
}
export async function saveMessages(list: Message[]) {
  await setPrivate("messages", list.slice(0, 1000));
}
export async function getSubscribers(): Promise<Subscriber[]> {
  return await getPrivate<Subscriber[]>("subscribers", []);
}
export async function saveSubscribers(list: Subscriber[]) {
  await setPrivate("subscribers", list);
}

export async function getReviews(): Promise<Review[]> {
  return (await kv.get<Review[]>("reviews")) ?? [];
}
export async function saveReviews(list: Review[]) {
  await kv.set("reviews", list.slice(0, 2000));
}
/** What the home page shows: the ones he pinned, or else the newest approved. */
export async function homeReviews(max = 6) {
  const ok = (await getReviews()).filter((r) => r.status === "approved");
  const pinned = ok.filter((r) => r.featured);
  return (pinned.length ? pinned : ok).slice(0, max);
}

export async function getRequests(): Promise<CustomRequest[]> {
  return await getPrivate<CustomRequest[]>("requests", []);
}
export async function saveRequests(list: CustomRequest[]) {
  await setPrivate("requests", list.slice(0, 2000));
}

// one change at a time (see withLock in lib/store.ts)
export function updateOrder(...a: Parameters<typeof _updateOrder>) {
  return withLock("write", () => _updateOrder(...a));
}
export function addOrderOnce(...a: Parameters<typeof _addOrderOnce>) {
  return withLock("write", () => _addOrderOnce(...a));
}
