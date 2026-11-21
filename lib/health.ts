import "server-only";
import { lastBackup } from "./backup";
import { getSettings } from "./db";
import { emailReady } from "./email";
import { lastGitHubSync } from "./github-sync";
import { getKey } from "./keys";
import { paypalKeys } from "./paypal";
import { MANUAL_INFO } from "./payments";
import { kv, storageMode } from "./store";
import { stripe } from "./stripe";
import { homeState, taxMode } from "./tax-calc";
import { collectStates, typicalRate } from "./tax";

/*
 * EDIT-POINT: SITE-HEALTH
 * The checks on Dashboard > Site health. Each one: ok, a short line, and
 * what to do. The daily check (app/api/cron/daily) sends a phone
 * notification when something important fails.
 */
export type Check = { id: string; label: string; level: "ok" | "warn" | "bad"; detail: string; fix?: string; href?: string };

export async function storeWorks() {
  const v = Date.now();
  await kv.set("health:ping", v);
  return (await kv.get<number>("health:ping")) === v;
}

export async function runChecks(deep = true): Promise<Check[]> {
  const out: Check[] = [];
  const add = (c: Check) => out.push(c);
  const s = await getSettings();

  const stored = await storeWorks().catch(() => false);
  add(
    !stored
      ? { id: "store", label: "Saving data", level: "bad", detail: "The shop can't save right now.", fix: "Check Supabase in Vercel (Storage). Orders can't be recorded until this works." }
      : storageMode === "file" && process.env.VERCEL
        ? { id: "store", label: "Saving data", level: "bad", detail: "Data is kept in temporary storage that Vercel wipes now and then.", fix: "Connect Supabase: Vercel > your project > Storage > Supabase. Takes 2 minutes and is free.", href: "/admin/setup" }
        : { id: "store", label: "Saving data", level: "ok", detail: storageMode === "supabase" ? "Saved in Supabase." : storageMode === "redis" ? "Saved in Redis." : "Saved on this computer (testing)." }
  );
  add(process.env.AUTH_SECRET ? { id: "secret", label: "Login and customer data lock", level: "ok", detail: "AUTH_SECRET is set." } : { id: "secret", label: "Login and customer data lock", level: process.env.VERCEL ? "bad" : "warn", detail: "AUTH_SECRET isn't set.", fix: "Add AUTH_SECRET in Vercel > Settings > Environment Variables (40+ random characters), then redeploy." });

  // payments
  const sk = await getKey("STRIPE_SECRET_KEY");
  const pp = await paypalKeys();
  const manual = s.payments.manual.filter((m) => m.on && (m.handle || m.id === "cash"));
  const ways = [s.payments.stripe && sk ? "card" : "", s.payments.paypal && pp ? "PayPal" : "", ...manual.map((m) => MANUAL_INFO[m.id].name)].filter(Boolean);
  add(ways.length ? { id: "pay", label: "Ways to pay", level: "ok", detail: `Customers can pay by ${ways.join(", ")}.` } : { id: "pay", label: "Ways to pay", level: "bad", detail: "Nobody can pay: no way to pay is set up.", fix: "Connect Stripe or PayPal on Accounts & keys, or switch on Cash App / Venmo / Zelle in Settings > Payments & tax.", href: "/admin/settings" });
  if (deep && s.payments.stripe && sk) {
    const st = await stripe();
    const ok = await st?.balance.retrieve().then(() => true).catch(() => false);
    add(ok ? { id: "stripe", label: "Stripe", level: "ok", detail: sk.includes("_test_") ? "Connected in TEST mode (no real money)." : "Connected." } : { id: "stripe", label: "Stripe", level: "bad", detail: "Stripe didn't accept the key.", fix: "Paste the secret key again on Accounts & keys.", href: "/admin/keys" });
    if (ok && sk.includes("_test_")) out[out.length - 1].level = "warn";
    if (ok && !(await getKey("STRIPE_WEBHOOK_SECRET"))) add({ id: "webhook", label: "Stripe webhook", level: "warn", detail: "Orders are only recorded when the customer reaches the thank-you page.", fix: "Press \"Connect Stripe webhook\" on Accounts & keys.", href: "/admin/keys" });
  }
  if (deep && s.payments.paypal) {
    if (!pp) add({ id: "paypal", label: "PayPal", level: "warn", detail: "PayPal is switched on but its keys aren't saved, so it doesn't show.", href: "/admin/keys" });
    else {
      const base = process.env.PAYPAL_API_BASE || (s.payments.paypalMode === "sandbox" ? "https://api-m.sandbox.paypal.com" : "https://api-m.paypal.com");
      const r = await fetch(`${base}/v1/oauth2/token`, { method: "POST", headers: { authorization: `Basic ${Buffer.from(`${pp.id}:${pp.secret}`).toString("base64")}`, "content-type": "application/x-www-form-urlencoded" }, body: "grant_type=client_credentials", signal: AbortSignal.timeout(8000) }).catch(() => null);
      add(r?.ok ? { id: "paypal", label: "PayPal", level: s.payments.paypalMode === "sandbox" ? "warn" : "ok", detail: s.payments.paypalMode === "sandbox" ? "Connected in Sandbox (practice money)." : "Connected." } : { id: "paypal", label: "PayPal", level: "bad", detail: "PayPal didn't accept the keys.", fix: "Check the keys and Live/Sandbox (Settings > Payments & tax).", href: "/admin/keys" });
    }
  }
  const home = homeState(s);
  if (taxMode(s) !== "off" && !home) add({ id: "tax", label: "Sales tax", level: "warn", detail: "Your shop's ZIP isn't filled in, so the shop doesn't know your state and adds no sales tax.", fix: "Type it in Settings > Store (Ship from ZIP).", href: "/admin/settings" });
  else if (taxMode(s) === "rates") {
    const list = collectStates(s.tax, home);
    add({ id: "tax", label: "Sales tax", level: "ok", detail: `Automatic: ${list.map((r) => `${r.state} ${r.rate > 0 ? r.rate : typicalRate(r.state)}%`).join(", ")}. Orders to other states: no tax.` });
  }

  add((await emailReady(s.emailFrom)) ? { id: "email", label: "Customer emails", level: "ok", detail: `Sent from ${s.emailFrom}.` } : { id: "email", label: "Customer emails", level: "warn", detail: "Emails to customers (gift cards, how-to-pay, sign-in codes, shipping) aren't switched on.", fix: "Add a Resend key on Accounts & keys and a sender address in Settings.", href: "/admin/keys" });
  add(process.env.NEXT_PUBLIC_SITE_URL ? { id: "url", label: "Site address", level: "ok", detail: process.env.NEXT_PUBLIC_SITE_URL } : { id: "url", label: "Site address", level: "warn", detail: "NEXT_PUBLIC_SITE_URL isn't set, so links in emails and shares guess the address.", fix: "Add it in Vercel (e.g. https://dubefamilycreations.com)." });

  const sync = await lastGitHubSync().catch(() => null);
  if (sync && !sync.ok) add({ id: "github", label: "Saving to GitHub", level: "warn", detail: sync.message, href: "/admin/keys" });
  const b = await lastBackup().catch(() => null);
  const age = b ? (Date.now() - Date.parse(b.at)) / 86400_000 : Infinity;
  add(b?.ok && age < 9 ? { id: "backup", label: "Backups", level: "ok", detail: `${b.message} (${Math.round(age) || "today"}${age >= 1 ? " days ago" : ""})` } : { id: "backup", label: "Backups", level: "warn", detail: b?.message ?? "No automatic backup yet.", fix: "Download a backup below now and then, or make your GitHub repository private for weekly automatic copies." });
  return out;
}
