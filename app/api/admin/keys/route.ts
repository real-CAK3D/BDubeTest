import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import webpush from "web-push";
import { checkFormat, KEY_DEFS, keyStatuses, removeKey, saveKey, validName } from "@/lib/keys";
import { connectStripeWebhook } from "@/lib/stripe-webhook";
import { syncStripeCatalog } from "@/lib/stripe-catalog";

async function test(envName: string, value: string): Promise<string | null> {
  if (envName === "STRIPE_SECRET_KEY") {
    try {
      await new Stripe(value).accounts.retrieve();
      return null;
    } catch (e) {
      return `Stripe didn't accept that key: ${(e as Error).message}`;
    }
  }
  if (envName === "ANTHROPIC_API_KEY") {
    try {
      await new Anthropic({ apiKey: value }).models.list({ limit: 1 });
      return null;
    } catch (e) {
      return e instanceof Anthropic.AuthenticationError ? "Anthropic didn't accept that key." : `Couldn't check the key: ${(e as Error).message}`;
    }
  }
  if (envName === "SHIPPO_API_KEY") {
    const r = await fetch("https://api.goshippo.com/addresses/?results=1", { headers: { authorization: `ShippoToken ${value}` } }).catch(() => null);
    return r?.ok ? null : "Shippo didn't accept that token.";
  }
  if (envName === "RESEND_API_KEY") {
    const r = await fetch("https://api.resend.com/domains", { headers: { authorization: `Bearer ${value}` } }).catch(() => null);
    return r?.ok ? null : "Resend didn't accept that key.";
  }
  return null;
}

export async function GET() {
  return NextResponse.json(await keyStatuses());
}

// { action: "save", name, value } | { action: "remove", name } | { action: "test", name, value? } | { action: "vapid" }
export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  const name = String(b.name ?? "").trim().toUpperCase();
  try {
    if (b.action === "vapid") {
      const k = webpush.generateVAPIDKeys();
      await saveKey("NEXT_PUBLIC_VAPID_PUBLIC_KEY", k.publicKey);
      await saveKey("VAPID_PRIVATE_KEY", k.privateKey);
      return NextResponse.json({ ok: true, message: "Notification keys created. Turn on notifications under Settings." });
    }
    if (!validName(name)) return NextResponse.json({ error: "Key names use capital letters, numbers and underscores, like MY_SERVICE_KEY." }, { status: 400 });
    if (b.action === "remove") {
      await removeKey(name);
      return NextResponse.json({ ok: true, message: "Removed." });
    }
    const value = String(b.value ?? "").trim();
    const known = KEY_DEFS.some((d) => d.envName === name);
    const formatErr = known ? checkFormat(name, value) : value ? null : "Paste the key first.";
    if (formatErr) return NextResponse.json({ error: formatErr }, { status: 400 });
    const testErr = await test(name, value);
    if (b.action === "test") return testErr ? NextResponse.json({ error: testErr }, { status: 400 }) : NextResponse.json({ ok: true, message: "That key works." });
    if (testErr) return NextResponse.json({ error: testErr }, { status: 400 });
    await saveKey(name, value);
    let message = "Saved.";
    if (name === "STRIPE_SECRET_KEY") {
      // one paste does it all: pull in products made in Stripe and connect the webhook
      const parts = ["Saved. Stripe is connected."];
      try {
        const c = await syncStripeCatalog();
        if (c.added + c.updated) parts.push(`${c.added + c.updated} product${c.added + c.updated === 1 ? "" : "s"} pulled in from Stripe.`);
      } catch {}
      try {
        await connectStripeWebhook(req);
        parts.push("Orders and refunds will now reach your dashboard.");
      } catch (e) {
        parts.push(`One more step: press "Connect Stripe webhook". (${(e as Error).message})`);
      }
      message = parts.join(" ");
    }
    return NextResponse.json({ ok: true, message });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
