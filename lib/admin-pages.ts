import type { AdminPrefs } from "./types";

export type AdminPage = { group: string; href: string; label: string; note: string; icon: string; tab?: boolean };

// These stay in the menu so the owner can never hide his way out of the settings.
export const ALWAYS_SHOWN = ["/admin", "/admin/settings", "/admin/customize", "/admin/help"];

/*
 * EDIT-POINT: ADMIN-MENU
 * Owner dashboard menu, grouped under the headings in "group".
 * tab: true items also appear in the phone's bottom bar (keep that to 4;
 * the 5th spot is "More", which lists the rest).
 */
export const ADMIN_PAGES: AdminPage[] = [
  { group: "Selling", href: "/admin", label: "Dashboard", note: "Sales, orders and charts", icon: "M3 12l9-8 9 8M5 10v10h5v-6h4v6h5V10", tab: true },
  { group: "Selling", href: "/admin/orders", label: "Orders", note: "Paid orders, shipping and tracking", icon: "M4 4h16v4H4zM5 8v12h14V8M9 12h6", tab: true },
  { group: "Selling", href: "/admin/studio", label: "3D & 360", note: "Give items a 3D model, upload a 3D scan, or take 360° photos with the camera", icon: "M12 3l8 4.5v9L12 21l-8-4.5v-9zM4 7.5l8 4.5 8-4.5M12 12v9" },
  { group: "Selling", href: "/admin/scan", label: "Scan", note: "Scan an order's barcode or QR code to open it", icon: "M4 7V4h3M17 4h3v3M20 17v3h-3M7 20H4v-3M7 8v8M10 8v8M13 8v8M16 8v8" },
  { group: "Selling", href: "/admin/item-labels", label: "Item labels", note: "Print barcode and QR labels for each item and size", icon: "M3 7l9-4 9 4v10l-9 4-9-4zM7 9v6M10 9v6M13 9v6" },
  { group: "Selling", href: "/admin/products", label: "Products", note: "Items, sizes, prices and stock", icon: "M12 3l8 4.5v9L12 21l-8-4.5v-9zM12 12l8-4.5M12 12v9M12 12L4 7.5", tab: true },
  { group: "Selling", href: "/admin/insights", label: "Insights", note: "Charts: sales over time, what's selling, busy hours, a map of orders", icon: "M4 19V5M4 19h16M8 15l3-4 3 2 5-6" },
  { group: "Selling", href: "/admin/money", label: "Money", note: "Income, expenses and profit", icon: "M3 6h18v12H3zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6M6 9v.01M18 15v.01", tab: true },
  { group: "Selling", href: "/admin/blanks", label: "Blanks", note: "Plain stock to engrave, counts and low alerts", icon: "M7 3h10l-1 18H8zM7 3c0 1.5 2.2 2 5 2s5-.5 5-2M9 9h6" },
  { group: "Selling", href: "/admin/designs", label: "Designs", note: "Decals and engravings, and which items they fit", icon: "M12 3l2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 15.3 7.2 17.9l.9-5.4-3.9-3.8 5.4-.8zM4 21h16" },
  { group: "Selling", href: "/admin/discounts", label: "Discounts", note: "Coupons and promo codes from Stripe", icon: "M9 15l6-6M9.5 9.5v.01M14.5 14.5v.01M3 12l2-2V5h5l2-2 2 2h5v5l2 2-2 2v5h-5l-2 2-2-2H5v-5z" },
  { group: "Customers", href: "/admin/customers", label: "Customers", note: "Who's buying, email sign-ups, downloads", icon: "M16 19v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1M9 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6M22 19v-1a4 4 0 0 0-3-3.9M16 4.1a3 3 0 0 1 0 5.8" },
  { group: "Customers", href: "/admin/requests", label: "Requests", note: "Quote or decline custom order requests", icon: "M14 3H6v18h12V7zM14 3v4h4M9 13h6M9 17h6M9 9h2" },
  { group: "Customers", href: "/admin/chat", label: "Chat", note: "The Ask us chat: questions, answers and what people asked", icon: "M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12zM8 11h8M8 14h5" },
  { group: "Customers", href: "/admin/live", label: "Live chat", note: "Chat with customers on the shop while you're available", icon: "M21 12a8 8 0 0 1-11.6 7.1L4 21l1.9-5.4A8 8 0 1 1 21 12zM8 12h.01M12 12h.01M16 12h.01" },
  { group: "Customers", href: "/admin/reviews", label: "Reviews", note: "Approve customer reviews and photos", icon: "M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6 6.6 19.5l1.2-6-4.5-4.2 6.1-.7z" },
  { group: "Customers", href: "/admin/inbox", label: "Inbox", note: "Messages from the contact form", icon: "M3 13h5l1.5 3h5L16 13h5M5 5h14l2 8v6H3v-6z" },
  { group: "Your site", href: "/admin/gallery", label: "Our work", note: "Photos and descriptions of finished pieces", icon: "M4 5h16v14H4zM4 15l4-4 4 4 3-3 5 5M15 9.5v.01" },
  { group: "Your site", href: "/admin/pages", label: "Pages & menu", note: "Add, remove and order the shop's pages", icon: "M4 4h16v4H4zM4 12h7v8H4zM14 12h6M14 16h6M14 20h6" },
  { group: "Your site", href: "/admin/content", label: "Words & logos", note: "Business name, words, logos, photos", icon: "M4 20h4L19 9l-4-4L4 16zM14 6l4 4" },
  { group: "Your site", href: "/admin/appearance", label: "Look & layout", note: "Themes and page styles", icon: "M12 3a9 9 0 1 0 0 18c1 0 1.5-.8 1.5-1.5 0-1.2-1-1.5-1-2.5 0-.8.7-1.5 1.5-1.5H16a5 5 0 0 0 5-5c0-4-4-7.5-9-7.5M7.5 12v.01M10 7.5v.01M15 7.5v.01" },
  { group: "Admin", href: "/admin/setup", label: "Setup", note: "Step by step: GitHub, Vercel, Supabase, Stripe", icon: "M9 11l3 3 8-8M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9" },
  { group: "Admin", href: "/admin/keys", label: "Accounts & keys", note: "API keys for Stripe and other services", icon: "M15 7a4 4 0 1 1-3.9 4.9L3 20v-3h3v-3h3l1.1-1.1A4 4 0 0 1 15 7zM16.5 9.5v.01" },
  { group: "Admin", href: "/admin/customize", label: "Customize dashboard", note: "Colors, menu order, home screen, shortcuts", icon: "M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0M14 4v4M8 10v4M16 16v4" },
  { group: "Admin", href: "/admin/settings", label: "Settings", note: "Shipping, checkout, password, your accounts", icon: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1" },
  { group: "Admin", href: "/admin/help", label: "Help", note: "How every part of the site works", icon: "M12 21.5a9.5 9.5 0 1 0 0-19 9.5 9.5 0 0 0 0 19M9.5 9.3a2.6 2.6 0 0 1 5 .9c0 1.8-2.5 2.3-2.5 3.8M12 17.2v.01" },
];

export const ADMIN_GROUPS = [...new Set(ADMIN_PAGES.map((i) => i.group))];

/** Dashboard menu in the owner's chosen order, without hidden pages. */
export function orderedPages(a: AdminPrefs) {
  const saved = (a.nav ?? []).filter((n) => ADMIN_PAGES.some((p) => p.href === n.href));
  const list = [...saved, ...ADMIN_PAGES.filter((p) => !saved.some((n) => n.href === p.href)).map((p) => ({ href: p.href, hidden: false }))];
  return list.map((n) => ({ ...ADMIN_PAGES.find((p) => p.href === n.href)!, hidden: n.hidden && !ALWAYS_SHOWN.includes(n.href) }));
}

/** The 4 pages in the phone's bottom bar. */
export function bottomTabs(a: AdminPrefs) {
  const picked = (a.tabs ?? []).filter((h) => ADMIN_PAGES.some((p) => p.href === h)).slice(0, 4);
  const fill = ADMIN_PAGES.filter((p) => p.tab && !picked.includes(p.href)).map((p) => p.href);
  return [...picked, ...fill].slice(0, 4).map((h) => ADMIN_PAGES.find((p) => p.href === h)!);
}
