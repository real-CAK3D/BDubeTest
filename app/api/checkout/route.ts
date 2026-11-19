import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getActiveProducts, getSettings } from "@/lib/db";
import { blankFor, getBlanks } from "@/lib/blanks";
import { bulkPercent } from "@/lib/discount-defaults";
import { isEmail } from "@/lib/guard";
import { choiceLabel, unitPrice, UPLOAD_ID } from "@/lib/pricing";
import type { SiteSettings } from "@/lib/types";
import { cleanZip, quoteShipping } from "@/lib/shipping";
import { siteUrl, stripe } from "@/lib/stripe";

type CartLine = { productId: string; quantity: number; option?: string; custom?: string; size?: string; design?: string; art?: string };

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

export async function POST(req: Request) {
  const s = await stripe();
  if (!s) return NextResponse.json({ error: "Online checkout isn't switched on yet. Please check back soon." }, { status: 503 });

  const body = (await req.json().catch(() => ({ items: [] }))) as { items: CartLine[]; delivery?: string; zip?: string; abroad?: boolean; giftCard?: GiftCardBuy };
  const items = body.items;
  const [products, settings] = await Promise.all([getActiveProducts(), getSettings()]);
  if (!settings.storeOpen) return NextResponse.json({ error: settings.closedMessage }, { status: 400 });
  if (body.giftCard) return buyGiftCard(s, settings, body.giftCard, req);

  // bulk discount: the more items in one order, the bigger the discount (Dashboard > Discounts)
  // only real items for sale count, in the quantity that can actually be bought
  const totalQty = (Array.isArray(items) ? items.slice(0, 50) : []).reduce((n, it) => {
    const p = products.find((x) => x.id === it.productId);
    if (!p) return n;
    const q = Math.max(1, Math.min(99, Math.floor(Number(it.quantity) || 1)));
    return n + (p.stock !== null ? Math.max(0, Math.min(q, p.stock)) : q);
  }, 0);
  const bulk = bulkPercent(settings.discounts.bulk, totalQty);

  const shelf = await getBlanks();
  const lines: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
  let subtotal = 0;
  const cart: [string, string][] = []; // [productId, choice] per line, so orders map back to items
  for (const it of Array.isArray(items) ? items.slice(0, 50) : []) {
    const p = products.find((x) => x.id === it.productId);
    if (!p) continue;
    const size = p.sizes?.length ? String(it.size ?? "") : "";
    const designId = p.designs ? String(it.design ?? "") : "";
    const each = unitPrice(p, size || undefined, designId || undefined, settings.designs);
    if (each === null) return NextResponse.json({ error: `The size or design picked for ${p.name} isn't available any more. Remove it from the cart and choose again.` }, { status: 400 });
    if (each < 50) return NextResponse.json({ error: `${p.name}${size ? ` (${size})` : ""} doesn't have a price yet. Please contact us to order it.` }, { status: 400 });
    const unit = bulk ? Math.round((each * (100 - bulk)) / 100) : each;
    const blankId = blankFor(p, size);
    if (blankId && shelf.find((b) => b.id === blankId)?.qty === 0) return NextResponse.json({ error: `${p.name}${size ? ` (${size})` : ""} just sold out. Remove it from the cart or pick another size.` }, { status: 400 });
    const design = designId && designId !== UPLOAD_ID ? settings.designs.find((d) => d.id === designId) : undefined;
    const art = designId === UPLOAD_ID ? ownArt(it.art, siteUrl(req)) : "";
    if (designId === UPLOAD_ID && !art) return NextResponse.json({ error: `The artwork for ${p.name} didn't upload. Remove it from the cart and add it again.` }, { status: 400 });
    let qty = Math.max(1, Math.min(99, Math.floor(Number(it.quantity) || 1)));
    if (p.stock !== null) qty = Math.min(qty, p.stock);
    if (qty <= 0) return NextResponse.json({ error: `${p.name} is sold out.` }, { status: 400 });
    const picked = p.option && it.option && p.option.values.includes(it.option) ? it.option : "";
    // one line describing every choice: "30 oz · Black · Design: American flag"
    const option = choiceLabel({ size, option: picked, design: art ? "your own artwork" : design?.name });
    const custom = p.personalize ? String(it.custom ?? "").replace(/\s+/g, " ").trim().slice(0, p.personalize.maxLength) : "";
    if (p.personalize?.required && !custom) return NextResponse.json({ error: `${p.name} needs "${p.personalize.label}" filled in. Remove it from the cart and add it again.` }, { status: 400 });
    subtotal += unit * qty;
    const absImages = p.images
      .slice(0, 1)
      .map((u) => (u.startsWith("http") ? u : siteUrl(req) + u))
      .filter((u) => u.startsWith("https://"));
    cart.push([p.id, option]);
    const tax = settings.stripeTax ? { tax_behavior: "exclusive" as const } : {};
    lines.push({
      quantity: qty,
      price_data:
        p.stripeProductId && !option && !custom
          ? // Items made in Stripe are charged against that Stripe product, so Stripe's reports line up.
            { currency: settings.currency, unit_amount: unit, product: p.stripeProductId, ...tax }
          : {
              currency: settings.currency,
              unit_amount: unit,
              ...tax,
              product_data: {
                name: option ? `${p.name} (${option})` : p.name,
                // shows on the Stripe checkout page and the receipt
                description: [custom ? `${p.personalize!.label}: "${custom}"` : p.summary, bulk ? `Bulk order: ${bulk}% off` : ""].filter(Boolean).join(" · ") || undefined,
                images: absImages.length ? absImages : undefined,
                metadata: { productId: p.id, option, custom, design: art ? UPLOAD_ID : design?.id ?? "", art },
              },
            },
    });
  }
  if (!lines.length) return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });

  // Shipping is priced here again from the ZIP (never trusted from the browser).
  const pickup = settings.collectShipping && settings.localPickup && body.delivery === "pickup";
  const shipZip = cleanZip(body.zip).slice(0, 5);
  const abroad = Boolean(body.abroad);
  if (settings.collectShipping && !pickup && !abroad && !/^\d{5}$/.test(shipZip)) return NextResponse.json({ error: "Enter your ZIP code in the cart so we can work out shipping." }, { status: 400 });
  const quote = settings.collectShipping && !pickup ? await quoteShipping(settings, { zip: shipZip, country: abroad ? "XX" : "US", subtotal }) : null;
  const countries = (abroad ? settings.shipCountries.filter((c) => c !== "US") : ["US"]) as Stripe.Checkout.SessionCreateParams.ShippingAddressCollection.AllowedCountry[];
  if (abroad && !countries.length) return NextResponse.json({ error: "Sorry, we only ship within the US right now." }, { status: 400 });
  const base = siteUrl(req);

  try {
    /*
     * EDIT-POINT: CHECKOUT
     * Stripe Checkout options. Card, Apple Pay, Google Pay and Link are turned
     * on in the Stripe dashboard (Settings > Payment methods), not here.
     * Other options: https://docs.stripe.com/api/checkout/sessions/create
     */
    const session = await s.checkout.sessions.create({
      mode: "payment",
      line_items: lines,
      ...(quote
        ? {
            shipping_address_collection: { allowed_countries: countries },
            shipping_options: [
              {
                shipping_rate_data: {
                  type: "fixed_amount",
                  display_name: quote.label.slice(0, 100),
                  fixed_amount: { amount: quote.amount, currency: settings.currency },
                  ...(settings.stripeTax ? { tax_behavior: "exclusive" as const } : {}),
                },
              },
            ],
          }
        : {}),
      ...(settings.giftNotes
        ? { custom_fields: [{ key: "gift", label: { type: "custom" as const, custom: "Gift message (optional)" }, type: "text" as const, optional: true, text: { maximum_length: 255 } }] }
        : {}),
      phone_number_collection: { enabled: true },
      ...(settings.discounts.reminders.on
        ? {
            // the checkout runs out after this long; Stripe then hands us a link back to it
            expires_at: Math.floor(Date.now() / 1000) + Math.max(1, settings.discounts.reminders.hours) * 3600,
            after_expiration: { recovery: { enabled: true, allow_promotion_codes: settings.allowPromoCodes } },
            consent_collection: { promotions: "auto" as const },
          }
        : {}),
      allow_promotion_codes: settings.allowPromoCodes || undefined,
      // needs Stripe Tax set up first (Stripe > Settings > Tax)
      ...(settings.stripeTax ? { automatic_tax: { enabled: true } } : {}),
      metadata: { cart: JSON.stringify(cart).slice(0, 499), delivery: pickup ? "pickup" : quote ? "ship" : "none", shipZip: abroad ? "" : shipZip, bulk: String(bulk) },
      success_url: `${base}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/cart`,
    });
    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Checkout couldn't start. Please try again in a minute." }, { status: 500 });
  }
}

type GiftCardBuy = { amount: number; fromName?: string; toName?: string; toEmail?: string; message?: string };

const clip = (v: unknown, n: number) => String(v ?? "").replace(/\s+/g, " ").trim().slice(0, n);

// A gift card on its own checkout: no shipping, no promo codes. The code is made and emailed once it's paid.
async function buyGiftCard(s: Stripe, settings: SiteSettings, g: GiftCardBuy, req: Request) {
  const gc = settings.discounts.giftCards;
  if (!gc.on) return NextResponse.json({ error: "Gift cards aren't available right now." }, { status: 400 });
  const dollars = Math.round(Number(g.amount) || 0);
  if (!gc.amounts.includes(dollars)) return NextResponse.json({ error: "Pick one of the gift card amounts." }, { status: 400 });
  const toEmail = String(g.toEmail ?? "").trim().slice(0, 200);
  if (toEmail && !isEmail(toEmail)) return NextResponse.json({ error: "Check the recipient's email address." }, { status: 400 });
  const base = siteUrl(req);
  try {
    const session = await s.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: settings.currency,
            unit_amount: dollars * 100,
            product_data: {
              name: `${settings.businessName} gift card ($${dollars})`,
              description: toEmail ? `Emailed to ${clip(g.toName, 60) || toEmail}` : "The code is emailed to you",
              metadata: { kind: "giftcard", fromName: clip(g.fromName, 60), toName: clip(g.toName, 60), toEmail, message: clip(g.message, 300) },
            },
          },
        },
      ],
      metadata: { delivery: "none", kind: "giftcard" },
      success_url: `${base}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/gift-cards`,
    });
    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Checkout couldn't start. Please try again in a minute." }, { status: 500 });
  }
}
