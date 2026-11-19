import type { AdminPrefs, MenuItem, SiteSettings } from "./types";

/*
 * EDIT-POINT: PAGES
 * The shop's built-in pages. The owner orders them, renames them, hides them
 * from the menu or footer, or turns them off in Dashboard > Pages & menu.
 * Pages he writes himself (FAQ, Events...) and outside links join this list.
 */
export const BUILTIN_PAGES: { id: string; label: string; href: string; canTurnOff: boolean; note: string }[] = [
  { id: "shop", label: "Shop", href: "/shop", canTurnOff: false, note: "Everything for sale, by category" },
  { id: "gallery", label: "Our work", href: "/gallery", canTurnOff: true, note: "Finished pieces with photos" },
  { id: "custom", label: "Custom orders", href: "/custom-order", canTurnOff: true, note: "The custom order request form" },
  { id: "about", label: "About", href: "/about", canTurnOff: true, note: "Your story" },
  { id: "contact", label: "Contact", href: "/contact", canTurnOff: true, note: "Contact details and message form" },
  { id: "status", label: "Order status", href: "/order-status", canTurnOff: true, note: "Customers look up an order" },
  { id: "review", label: "Leave a review", href: "/review", canTurnOff: true, note: "The review form" },
];

export const DEFAULT_MENU: MenuItem[] = [
  { id: "shop", label: "Shop", top: true, footer: false },
  { id: "gallery", label: "Our work", top: true, footer: false },
  { id: "custom", label: "Custom orders", top: true, footer: false },
  { id: "about", label: "About", top: true, footer: false },
  { id: "contact", label: "Contact", top: true, footer: true },
  { id: "status", label: "Order status", top: false, footer: true },
  { id: "review", label: "Leave a review", top: false, footer: false },
];

export type ResolvedItem = MenuItem & { href: string; kind: "builtin" | "page" | "link"; note: string };

/** The full page list: saved order first, then anything new (a page just added) at the end. */
export function resolveMenu(s: Pick<SiteSettings, "menu" | "extraPages" | "showCustomOrders" | "showReviews">): ResolvedItem[] {
  const saved = s.menu?.length ? s.menu : DEFAULT_MENU;
  const out: ResolvedItem[] = [];
  const seen = new Set<string>();
  const push = (m: MenuItem) => {
    if (seen.has(m.id)) return;
    const b = BUILTIN_PAGES.find((x) => x.id === m.id);
    if (b) {
      // these two have their own on/off switch elsewhere; keep them in step
      const off = m.id === "custom" ? !s.showCustomOrders : m.id === "review" ? !s.showReviews : Boolean(m.off && b.canTurnOff);
      out.push({ ...m, label: m.label || b.label, href: b.href, kind: "builtin", note: b.note, off });
    } else if (m.id.startsWith("page:")) {
      const p = s.extraPages.find((x) => `page:${x.slug}` === m.id);
      if (!p) return;
      out.push({ ...m, label: m.label || p.title, href: `/pages/${p.slug}`, kind: "page", note: "A page you wrote", footer: p.inFooter || m.footer });
    } else if (m.id.startsWith("link:") && m.href) {
      out.push({ ...m, href: m.href, kind: "link", note: "Link to another site or page" });
    } else return;
    seen.add(m.id);
  };
  saved.forEach(push);
  DEFAULT_MENU.forEach(push);
  s.extraPages.forEach((p) => push({ id: `page:${p.slug}`, label: p.title, top: false, footer: p.inFooter }));
  return out;
}

/** Is a built-in page switched on? (Used by each page to show a 404 when off.) */
export function pageOn(s: Pick<SiteSettings, "menu" | "extraPages" | "showCustomOrders" | "showReviews">, id: string) {
  return !resolveMenu(s).find((m) => m.id === id)?.off;
}

export const DEFAULT_CATEGORIES = ["Drinkware", "Home decor", "Leather goods", "Patriotic & military", "Gifts & keepsakes"];

/*
 * EDIT-POINT: ADMIN-DEFAULTS
 * How the dashboard looks before the owner changes anything in
 * Dashboard > Customize dashboard.
 */
export const DASHBOARD_WIDGETS: { id: string; label: string; note: string }[] = [
  { id: "setup", label: "Setup progress", note: "Until every setup step is done" },
  { id: "quick", label: "Quick links", note: "Your own buttons: the shop, Stripe, labels..." },
  { id: "tiles", label: "Sales numbers", note: "Sales, orders, profit, visitors" },
  { id: "alerts", label: "Alerts", note: "Orders to ship, low stock, new requests" },
  { id: "charts", label: "Charts", note: "Sales and visitors over time" },
  { id: "orders", label: "Recent orders", note: "The last 5 orders" },
  { id: "items", label: "Popular items", note: "Best sellers, most viewed, where visitors came from" },
  { id: "designs", label: "Top designs", note: "The designs customers order most" },
  { id: "summary", label: "Totals line", note: "Average order, page views, expenses" },
];

export const DEFAULT_ADMIN: AdminPrefs = {
  title: "",
  accent: "",
  mode: "auto",
  density: "comfy",
  textSize: "normal",
  startPage: "/admin",
  nav: [],
  tabs: ["/admin", "/admin/orders", "/admin/products", "/admin/money"],
  widgets: DASHBOARD_WIDGETS.map((w) => ({ id: w.id, hidden: false })),
  quickLinks: [{ label: "Open the shop", url: "/" }],
};

/** Saved widget order with any new widgets added at the end. */
export function widgetOrder(a: AdminPrefs) {
  const known = new Set(DASHBOARD_WIDGETS.map((w) => w.id));
  const list = (a.widgets ?? []).filter((w) => known.has(w.id));
  for (const w of DASHBOARD_WIDGETS) if (!list.some((x) => x.id === w.id)) list.push({ id: w.id, hidden: false });
  return list;
}
