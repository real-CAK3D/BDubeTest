import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getActiveProducts, getSettings } from "@/lib/db";
import { choiceLabel, unitPrice } from "@/lib/pricing";
import { cleanZip, quoteShipping } from "@/lib/shipping";
import { siteUrl, stripe } from "@/lib/stripe";

type CartLine = { productId: string; quantity: number; option?: string; custom?: string; size?: string; design?: string };

export async function POST(req: Request) {
  const s = await stripe();
  if (!s) return NextResponse.json({ error: "Online checkout isn't switched on yet. Please check back soon." }, { status: 503 });

  const body = (await req.json().catch(() => ({ items: [] }))) as { items: CartLine[]; delivery?: string; zip?: string; abroad?: boolean };
  const items = body.items;
  const [products, settings] = await Promise.all([getActiveProducts(), getSettings()]);
  if (!settings.storeOpen) return NextResponse.json({ error: settings.closedMessage }, { status: 400 });

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
    const design = designId ? settings.designs.find((d) => d.id === designId) : undefined;
    let qty = Math.max(1, Math.min(99, Math.floor(Number(it.quantity) || 1)));
    if (p.stock !== null) qty = Math.min(qty, p.stock);
    if (qty <= 0) return NextResponse.json({ error: `${p.name} is sold out.` }, { status: 400 });
    const picked = p.option && it.option && p.option.values.includes(it.option) ? it.option : "";
    // one line describing every choice: "30 oz · Black · Design: American flag"
    const option = choiceLabel({ size, option: picked, design: design?.name });
    const custom = p.personalize ? String(it.custom ?? "").replace(/\s+/g, " ").trim().slice(0, p.personalize.maxLength) : "";
    if (p.personalize?.required && !custom) return NextResponse.json({ error: `${p.name} needs "${p.personalize.label}" filled in. Remove it from the cart and add it again.` }, { status: 400 });
    subtotal += each * qty;
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
            { currency: settings.currency, unit_amount: each, product: p.stripeProductId, ...tax }
          : {
              currency: settings.currency,
              unit_amount: each,
              ...tax,
              product_data: {
                name: option ? `${p.name} (${option})` : p.name,
                // shows on the Stripe checkout page and the receipt
                description: custom ? `${p.personalize!.label}: "${custom}"` : p.summary || undefined,
                images: absImages.length ? absImages : undefined,
                metadata: { productId: p.id, option, custom, design: design?.id ?? "" },
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
      allow_promotion_codes: settings.allowPromoCodes || undefined,
      // needs Stripe Tax set up first (Stripe > Settings > Tax)
      ...(settings.stripeTax ? { automatic_tax: { enabled: true } } : {}),
      metadata: { cart: JSON.stringify(cart).slice(0, 499), delivery: pickup ? "pickup" : quote ? "ship" : "none", shipZip: abroad ? "" : shipZip },
      success_url: `${base}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/cart`,
    });
    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Checkout couldn't start. Please try again in a minute." }, { status: 500 });
  }
}
