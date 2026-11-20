import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getSettings } from "@/lib/db";
import { isEmail } from "@/lib/guard";
import { isPriceError, priceCart, type CartBody } from "@/lib/cart-price";
import type { SiteSettings } from "@/lib/types";
import { siteUrl, stripe } from "@/lib/stripe";

export async function POST(req: Request) {
  const s = await stripe();
  if (!s) return NextResponse.json({ error: "Card checkout isn't switched on yet. Please pick another way to pay, or check back soon." }, { status: 503 });

  const body = (await req.json().catch(() => ({ items: [] }))) as CartBody & { giftCard?: GiftCardBuy };
  if (body.giftCard) {
    const settings = await getSettings();
    if (!settings.storeOpen) return NextResponse.json({ error: settings.closedMessage }, { status: 400 });
    return buyGiftCard(s, settings, body.giftCard, req);
  }
  const priced = await priceCart(body, req);
  if (isPriceError(priced)) return NextResponse.json({ error: priced.error }, { status: priced.status });
  const { settings, bulk, cart, pickup, shipZip, abroad } = priced;
  if (!settings.payments.stripe) return NextResponse.json({ error: "Card checkout is switched off. Please pick another way to pay." }, { status: 400 });
  const tax = settings.stripeTax ? { tax_behavior: "exclusive" as const } : {};
  const lines: Stripe.Checkout.SessionCreateParams.LineItem[] = priced.lines.map((l) => ({
    quantity: l.qty,
    price_data:
      l.product.stripeProductId && !l.option && !l.custom
        ? // Items made in Stripe are charged against that Stripe product, so Stripe's reports line up.
          { currency: settings.currency, unit_amount: l.unit, product: l.product.stripeProductId, ...tax }
        : {
            currency: settings.currency,
            unit_amount: l.unit,
            ...tax,
            product_data: {
              name: l.name,
              // shows on the Stripe checkout page and the receipt
              description: l.description || undefined,
              images: l.image ? [l.image] : undefined,
              metadata: { productId: l.product.id, option: l.option, custom: l.custom, design: l.design, art: l.art },
            },
          },
  }));
  const quote = priced.shipping;
  const countries = priced.countries as Stripe.Checkout.SessionCreateParams.ShippingAddressCollection.AllowedCountry[];
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
