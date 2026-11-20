import "server-only";
import { blankFor, getBlanks } from "./blanks";
import { getActiveProducts, getSettings } from "./db";
import { bulkPercent } from "./discount-defaults";
import { choiceLabel, unitPrice, UPLOAD_ID } from "./pricing";
import { cleanZip, quoteShipping } from "./shipping";
import { siteUrl } from "./stripe";
import type { Product, SiteSettings } from "./types";

export type CartLine = { productId: string; quantity: number; option?: string; custom?: string; size?: string; design?: string; art?: string };
export type CartBody = { items: CartLine[]; delivery?: string; zip?: string; abroad?: boolean };
export type PricedLine = { product: Product; qty: number; unit: number; option: string; custom: string; design: string; art: string; name: string; description: string; image?: string };
export type PricedCart = {
  settings: SiteSettings;
  lines: PricedLine[];
  subtotal: number; // cents, after the bulk discount
  bulk: number; // bulk discount percent
  cart: [string, string][]; // [productId, choice] per line
  pickup: boolean;
  shipZip: string;
  abroad: boolean;
  shipping: { amount: number; label: string } | null; // null = nothing to ship
  countries: string[];
};
export type PriceError = { error: string; status: number };

// Customer artwork must be a file uploaded to this shop's own photo storage
function ownArt(url: unknown, base: string) {
  const u = String(url ?? "");
  if (!u || u.length > 400) return "";
  if (u.startsWith("/uploads/customer-art/")) return base + u;
  const sb = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (sb && u.startsWith(new URL(sb).origin + "/storage/v1/object/public/") && u.includes("/customer-art/")) return u;
  if (/^https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\/customer-art\//.test(u)) return u;
  return "";
}

/**
 * Prices a cart on the server from the shop's own items, sizes, designs,
 * bulk discount and shipping (nothing is trusted from the browser). Every way
 * to pay (Stripe, PayPal, pay directly) charges exactly this.
 */
export async function priceCart(body: CartBody, req: Request): Promise<PricedCart | PriceError> {
  const err = (error: string, status = 400) => ({ error, status });
  const items = Array.isArray(body.items) ? body.items.slice(0, 50) : [];
  const [products, settings] = await Promise.all([getActiveProducts(), getSettings()]);
  if (!settings.storeOpen) return err(settings.closedMessage);
  const base = siteUrl(req);

  // bulk discount: only real items for sale count, in the quantity that can actually be bought
  const totalQty = items.reduce((n, it) => {
    const p = products.find((x) => x.id === it.productId);
    if (!p) return n;
    const q = Math.max(1, Math.min(99, Math.floor(Number(it.quantity) || 1)));
    return n + (p.stock !== null ? Math.max(0, Math.min(q, p.stock)) : q);
  }, 0);
  const bulk = bulkPercent(settings.discounts.bulk, totalQty);

  const shelf = await getBlanks();
  const lines: PricedLine[] = [];
  const cart: [string, string][] = [];
  let subtotal = 0;
  for (const it of items) {
    const p = products.find((x) => x.id === it.productId);
    if (!p) continue;
    const size = p.sizes?.length ? String(it.size ?? "") : "";
    const designId = p.designs ? String(it.design ?? "") : "";
    const each = unitPrice(p, size || undefined, designId || undefined, settings.designs);
    if (each === null) return err(`The size or design picked for ${p.name} isn't available any more. Remove it from the cart and choose again.`);
    if (each < 50) return err(`${p.name}${size ? ` (${size})` : ""} doesn't have a price yet. Please contact us to order it.`);
    const unit = bulk ? Math.round((each * (100 - bulk)) / 100) : each;
    const blankId = blankFor(p, size);
    if (blankId && shelf.find((b) => b.id === blankId)?.qty === 0) return err(`${p.name}${size ? ` (${size})` : ""} just sold out. Remove it from the cart or pick another size.`);
    const design = designId && designId !== UPLOAD_ID ? settings.designs.find((d) => d.id === designId) : undefined;
    const art = designId === UPLOAD_ID ? ownArt(it.art, base) : "";
    if (designId === UPLOAD_ID && !art) return err(`The artwork for ${p.name} didn't upload. Remove it from the cart and add it again.`);
    let qty = Math.max(1, Math.min(99, Math.floor(Number(it.quantity) || 1)));
    if (p.stock !== null) qty = Math.min(qty, p.stock);
    if (qty <= 0) return err(`${p.name} is sold out.`);
    const picked = p.option && it.option && p.option.values.includes(it.option) ? it.option : "";
    const option = choiceLabel({ size, option: picked, design: art ? "your own artwork" : design?.name });
    const custom = p.personalize ? String(it.custom ?? "").replace(/\s+/g, " ").trim().slice(0, p.personalize.maxLength) : "";
    if (p.personalize?.required && !custom) return err(`${p.name} needs "${p.personalize.label}" filled in. Remove it from the cart and add it again.`);
    subtotal += unit * qty;
    cart.push([p.id, option]);
    const image = p.images.slice(0, 1).map((u) => (u.startsWith("http") ? u : base + u)).find((u) => u.startsWith("https://"));
    lines.push({
      product: p,
      qty,
      unit,
      option,
      custom,
      design: art ? UPLOAD_ID : design?.id ?? "",
      art,
      name: option ? `${p.name} (${option})` : p.name,
      description: [custom ? `${p.personalize!.label}: "${custom}"` : p.summary, bulk ? `Bulk order: ${bulk}% off` : ""].filter(Boolean).join(" · "),
      image,
    });
  }
  if (!lines.length) return err("Your cart is empty.");

  // Shipping is priced here again from the ZIP
  const pickup = settings.collectShipping && settings.localPickup && body.delivery === "pickup";
  const shipZip = cleanZip(body.zip).slice(0, 5);
  const abroad = Boolean(body.abroad);
  if (settings.collectShipping && !pickup && !abroad && !/^\d{5}$/.test(shipZip)) return err("Enter your ZIP code in the cart so we can work out shipping.");
  const quote = settings.collectShipping && !pickup ? await quoteShipping(settings, { zip: shipZip, country: abroad ? "XX" : "US", subtotal }) : null;
  const countries = abroad ? settings.shipCountries.filter((c) => c !== "US") : ["US"];
  if (abroad && !countries.length) return err("Sorry, we only ship within the US right now.");
  return { settings, lines, subtotal, bulk, cart, pickup, shipZip, abroad, shipping: quote ? { amount: quote.amount, label: quote.label } : null, countries };
}

export const isPriceError = (x: PricedCart | PriceError): x is PriceError => "error" in x;
