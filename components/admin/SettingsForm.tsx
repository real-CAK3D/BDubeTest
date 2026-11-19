"use client";
import Link from "next/link";
import { useState } from "react";
import type { SyncStatus } from "@/lib/github-sync";
import type { SiteSettings } from "@/lib/types";
import { api } from "./api";
import { LogoutButton } from "./LogoutButton";
import { PushToggle } from "./PushToggle";
import { SecurityPanel } from "./SecurityPanel";
import { Tabs } from "./Tabs";
import { useSettings } from "./useSettings";

function PasswordForm() {
  const [f, setF] = useState({ current: "", next: "", again: "" });
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  async function save(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    setErr("");
    if (f.next !== f.again) return setErr("The new passwords don't match.");
    try {
      await api("/api/admin/password", "POST", { current: f.current, next: f.next });
      setF({ current: "", next: "", again: "" });
      setMsg("Password changed. Use the new one next time you log in.");
    } catch (e) {
      setErr((e as Error).message);
    }
  }
  return (
    <form className="stack" onSubmit={save}>
      <div className="row3">
        <label className="f"><span>Current password</span><input type="password" autoComplete="current-password" value={f.current} onChange={(e) => setF({ ...f, current: e.target.value })} /></label>
        <label className="f"><span>New password</span><input type="password" autoComplete="new-password" value={f.next} onChange={(e) => setF({ ...f, next: e.target.value })} /></label>
        <label className="f"><span>New password again</span><input type="password" autoComplete="new-password" value={f.again} onChange={(e) => setF({ ...f, again: e.target.value })} /></label>
      </div>
      <div className="row wrap">
        <button className="b" disabled={!f.current || !f.next}>Change password</button>
        {msg ? <span role="status">{msg}</span> : null}
        {err ? <span className="err" role="alert">{err}</span> : null}
      </div>
      <p className="hint">Your own password (at least 8 characters). Each person has their own; the starter password for new people is below.</p>
    </form>
  );
}

export function SettingsForm({ initial, vapidKey, deviceCount, stripeTest, hasResend, repo, github }: { initial: SiteSettings; vapidKey: string; deviceCount: number; stripeTest: boolean; hasResend: boolean; repo: string; github: { token: boolean; last: SyncStatus | null } }) {
  const { s, set, bar } = useSettings(initial);
  const dollars = (c: number) => (c / 100).toFixed(2);
  const cents = (v: string) => Math.round((parseFloat(v) || 0) * 100);
  const t = stripeTest ? "test/" : "";
  const accounts = [
    { name: "Stripe", note: "Payments, payouts, products, coupons", links: [["Dashboard", `https://dashboard.stripe.com/${t}dashboard`], ["Payments", `https://dashboard.stripe.com/${t}payments`], ["Products", `https://dashboard.stripe.com/${t}products`], ["Payouts", "https://dashboard.stripe.com/payouts"]] },
    { name: "Supabase", note: "Database and photo storage", links: [["Open Supabase", "https://supabase.com/dashboard/projects"]] },
    { name: "Vercel", note: "Hosting, domains, environment variables", links: [["Dashboard", "https://vercel.com/dashboard"]] },
    { name: "GitHub", note: repo ? repo : "The site's files and site-variables.ts", links: [["Open", repo ? `https://github.com/${repo}` : "https://github.com"], ...(repo ? [["site-variables.ts", `https://github.com/${repo}/blob/HEAD/site-variables.ts`]] : [])] },
  ];

  return (
    <>
      <div className="page-head"><h1>Settings</h1></div>
      <p className="muted">Store settings also live in <code>site-variables.ts</code> on GitHub. Whichever is changed most recently wins. Logins, API keys and links to your accounts are on the <Link href="/admin/keys">Accounts &amp; keys</Link> page.</p>

      <Tabs
        label="Settings sections"
        tabs={[
          { id: "store", label: "Store", content: (
        <>
        <section className="panel">
          <div className="panel-head"><h2>Store</h2></div>
          <div className="stack">
            <label className="check big"><input type="checkbox" checked={s.storeOpen} onChange={(e) => set({ storeOpen: e.target.checked })} /> Shop is open for orders</label>
            {!s.storeOpen ? <label className="f"><span>Message while closed</span><input value={s.closedMessage} onChange={(e) => set({ closedMessage: e.target.value })} /></label> : null}
            <div className="row2">
              <label className="check"><input type="checkbox" checked={s.collectShipping} onChange={(e) => set({ collectShipping: e.target.checked })} /> Ask for a shipping address</label>
              <label className="f"><span>Low-stock alert at</span><input inputMode="numeric" value={s.lowStockAlert} onChange={(e) => set({ lowStockAlert: Number(e.target.value.replace(/\D/g, "")) || 0 })} /></label>
            </div>
            {s.collectShipping ? (
              <>
                <h3 className="sub">Shipping by distance</h3>
                <p className="hint">Customers enter their ZIP code in the cart and see the price before they pay. Distance is measured in a straight line from your ZIP.</p>
                <label className="f"><span>Your ZIP code (ship from)</span><input inputMode="numeric" maxLength={5} value={s.shipFromZip} onChange={(e) => set({ shipFromZip: e.target.value.replace(/\D/g, "").slice(0, 5) })} placeholder="e.g. 73501" /></label>
                <div className="tiers">
                  {s.shippingTiers.map((t, i) => (
                    <div key={i} className="tier">
                      <span>Up to</span>
                      <input aria-label="Miles" inputMode="numeric" value={t.upToMiles} onChange={(e) => set({ shippingTiers: s.shippingTiers.map((x, j) => (j === i ? { ...x, upToMiles: Number(e.target.value.replace(/\D/g, "")) || 0 } : x)) })} />
                      <span>miles: $</span>
                      <input aria-label="Price" inputMode="decimal" defaultValue={dollars(t.price)} onBlur={(e) => set({ shippingTiers: s.shippingTiers.map((x, j) => (j === i ? { ...x, price: cents(e.target.value) } : x)) })} />
                      <button type="button" className="b b-ghost b-sm" onClick={() => set({ shippingTiers: s.shippingTiers.filter((_, j) => j !== i) })} aria-label="Remove this distance">✕</button>
                    </div>
                  ))}
                  <button type="button" className="b b-sm" onClick={() => set({ shippingTiers: [...s.shippingTiers, { upToMiles: (s.shippingTiers.at(-1)?.upToMiles ?? 0) + 250, price: s.shippingTiers.at(-1)?.price ?? 0 }] })}>Add a distance</button>
                </div>
                <div className="row2">
                  <label className="f"><span>Farther than that (or ZIP not found)</span><input inputMode="decimal" defaultValue={dollars(s.shippingFlat)} onBlur={(e) => set({ shippingFlat: cents(e.target.value) })} /></label>
                  <label className="f"><span>Outside the US</span><input inputMode="decimal" defaultValue={dollars(s.intlShipping)} onBlur={(e) => set({ intlShipping: cents(e.target.value) })} /></label>
                </div>
                <div className="row2">
                  <label className="f"><span>Free shipping on orders over <em className="muted">(0 = never)</em></span><input inputMode="decimal" defaultValue={dollars(s.freeShippingOver)} onBlur={(e) => set({ freeShippingOver: cents(e.target.value) })} /></label>
                  <label className="f"><span>Ship to countries <em className="muted">(two-letter codes)</em></span><input defaultValue={s.shipCountries.join(", ")} onBlur={(e) => set({ shipCountries: e.target.value.split(",").map((c) => c.trim().toUpperCase()).filter((c) => /^[A-Z]{2}$/.test(c)) })} /></label>
                </div>
                <h3 className="sub">Local pickup</h3>
                <label className="check"><input type="checkbox" checked={s.localPickup} onChange={(e) => set({ localPickup: e.target.checked })} /> Let customers pick up for free</label>
                {s.localPickup ? <label className="f"><span>Pickup note</span><input value={s.pickupNote} onChange={(e) => set({ pickupNote: e.target.value })} /></label> : null}
              </>
            ) : null}
          </div>
        </section>
        <section className="panel stack">
          <div className="panel-head"><h2>Shipping labels</h2></div>
          <p className="hint">Your return address and box sizes, for buying labels from an order (needs a free Shippo token on Accounts & keys). Private: never shown on the shop or saved to GitHub.</p>
          <h3 className="sub">Ship from</h3>
          <div className="row2">
            {([["name", "Your name"], ["company", "Business name (optional)"], ["street1", "Street address"], ["street2", "Apt, suite (optional)"], ["city", "City"], ["state", "State (2 letters)"], ["zip", "ZIP"], ["phone", "Phone (carriers ask for it)"], ["email", "Email"]] as const).map(([k, label]) => (
              <label key={k} className="f"><span>{label}</span><input value={s.shipFrom[k]} onChange={(e) => set({ shipFrom: { ...s.shipFrom, [k]: e.target.value } })} /></label>
            ))}
          </div>
          <h3 className="sub">Boxes you use</h3>
          {s.parcels.map((p, i) => {
            const upd = (patch: Partial<typeof p>) => set({ parcels: s.parcels.map((x, j) => (j === i ? { ...x, ...patch } : x)) });
            const n = (v: string) => Number(v.replace(/[^0-9.]/g, "")) || 0;
            return (
              <div key={i} className="tier wrap-ok">
                <input aria-label="Box name" value={p.name} style={{ flex: "1 1 10rem", width: "auto" }} onChange={(e) => upd({ name: e.target.value })} />
                <input aria-label="Length in inches" value={p.length} onChange={(e) => upd({ length: n(e.target.value) })} />×
                <input aria-label="Width in inches" value={p.width} onChange={(e) => upd({ width: n(e.target.value) })} />×
                <input aria-label="Height in inches" value={p.height} onChange={(e) => upd({ height: n(e.target.value) })} /><span>in,</span>
                <input aria-label="Weight in ounces" value={p.weightOz} onChange={(e) => upd({ weightOz: n(e.target.value) })} /><span>oz</span>
                <button type="button" className="b b-ghost b-sm" aria-label="Remove box" onClick={() => set({ parcels: s.parcels.filter((_, j) => j !== i) })}>✕</button>
              </div>
            );
          })}
          <div><button type="button" className="b b-sm" onClick={() => set({ parcels: [...s.parcels, { name: "New box", length: 10, width: 8, height: 4, weightOz: 16 }] })}>Add a box</button></div>
        </section>

          </>
          ) },
          { id: "checkout", label: "Checkout & emails", content: (
        <>
        <section className="panel">
          <div className="panel-head"><h2>Checkout & emails</h2></div>
          <div className="stack">
            <label className="check"><input type="checkbox" checked={s.allowPromoCodes} onChange={(e) => set({ allowPromoCodes: e.target.checked })} /> Let customers enter promo codes <Link href="/admin/discounts" className="small">Discounts</Link></label>
            <label className="check"><input type="checkbox" checked={s.stripeTax} onChange={(e) => set({ stripeTax: e.target.checked })} /> Sales tax by Stripe <a className="small" href="https://dashboard.stripe.com/settings/tax" target="_blank" rel="noreferrer">set up Stripe Tax first</a></label>
            <label className="check"><input type="checkbox" checked={s.showContactForm} onChange={(e) => set({ showContactForm: e.target.checked })} /> Contact form on the shop <Link href="/admin/inbox" className="small">Inbox</Link></label>
            <label className="check"><input type="checkbox" checked={s.giftNotes} onChange={(e) => set({ giftNotes: e.target.checked })} /> Gift message box at checkout</label>
          <label className="check"><input type="checkbox" checked={s.showNewsletter} onChange={(e) => set({ showNewsletter: e.target.checked })} /> Email sign-up box in the footer</label>
            <label className="f">
              <span>Send customer emails from <em className="muted">(for tracking emails{hasResend ? "" : "; needs a Resend key"})</em></span>
              <input value={s.emailFrom} onChange={(e) => set({ emailFrom: e.target.value })} placeholder="Your Shop <orders@yourshop.com>" />
            </label>
          </div>
        </section>
  
          </>
          ) },
          { id: "notifications", label: "Notifications", content: (
        <>
        <section className="panel">
          <div className="panel-head"><h2>Notifications on this device</h2></div>
          <PushToggle vapidKey={vapidKey} configured={Boolean(vapidKey)} deviceCount={deviceCount} />
          <details className="howto">
            <summary>Put the dashboard on an iPhone home screen</summary>
            <ol>
              <li>Open this site&apos;s <strong>/admin</strong> address in Safari and log in.</li>
              <li>Tap the Share button, then <strong>Add to Home Screen</strong>.</li>
              <li>Open the new <strong>Shop HQ</strong> icon, come back to this page and tap <strong>Turn on notifications</strong>.</li>
            </ol>
            <p className="hint">iPhone only allows website notifications from apps added to the home screen (iOS 16.4 or newer).</p>
          </details>
        </section>
  
          </>
          ) },
          { id: "password", label: "Password & security", content: (
        <>
        <section className="panel">
          <div className="panel-head"><h2>Your password</h2></div>
          <PasswordForm />
        </section>
        <SecurityPanel />
  
          <section className="panel">
          <div className="panel-head"><h2>Account</h2></div>
          <LogoutButton />
        </section>
          </>
          ) },
        ]}
      />
      {bar}
    </>
  );
}
