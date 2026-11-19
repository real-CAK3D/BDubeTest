import "server-only";
import { saveKey } from "./keys";
import { siteUrl, stripe, WEBHOOK_EVENTS } from "./stripe";

/**
 * Creates the Stripe webhook for this site and saves its secret, so orders and
 * refunds reach the site. Returns the webhook address, or throws a plain-English error.
 */
export async function connectStripeWebhook(req?: Request): Promise<string> {
  const s = await stripe();
  if (!s) throw new Error("Save your Stripe secret key first.");
  const base = siteUrl(req);
  if (!base.startsWith("https://") || /localhost|127\.0\.0\.1/.test(base)) {
    throw new Error("Stripe can only reach the live site. Do this from your Vercel web address, not your own computer.");
  }
  const url = `${base}/api/stripe/webhook`;
  // Replace any old endpoint for this address (Stripe only reveals the secret when it's created).
  for await (const ep of s.webhookEndpoints.list({ limit: 100 })) {
    if (ep.url === url) await s.webhookEndpoints.del(ep.id);
  }
  const ep = await s.webhookEndpoints.create({ url, enabled_events: WEBHOOK_EVENTS, description: "Shop website (orders, refunds, product changes)" });
  if (!ep.secret) throw new Error("Stripe didn't return a signing secret. Try again.");
  await saveKey("STRIPE_WEBHOOK_SECRET", ep.secret);
  return url;
}
