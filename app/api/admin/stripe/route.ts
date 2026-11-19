import { after, NextResponse } from "next/server";
import { syncToGitHub } from "@/lib/github-sync";
import { connectStripeWebhook } from "@/lib/stripe-webhook";
import { listDiscounts, syncStripeCatalog } from "@/lib/stripe-catalog";

// { action: "sync" } pulls products from Stripe
// { action: "webhook" } creates the Stripe webhook for this site and saves its secret
// { action: "discounts" } lists promotion codes and coupons
export async function POST(req: Request) {
  const { action } = await req.json().catch(() => ({}));
  try {
    if (action === "sync") {
      const c = await syncStripeCatalog();
      after(() => syncToGitHub("products from Stripe"));
      return NextResponse.json({ ok: true, message: `Synced from Stripe: ${c.added} new, ${c.updated} updated, ${c.hidden} hidden.` });
    }
    if (action === "discounts") return NextResponse.json(await listDiscounts());
    if (action === "webhook") return NextResponse.json({ ok: true, message: `Webhook connected: ${await connectStripeWebhook(req)}` });
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
