"use client";
import Link from "next/link";
import { MANUAL_INFO, type PaymentSettings } from "@/lib/payments";

/** Settings > Payments: which ways to pay the cart offers. */
export function PaymentsPanel({ value, onChange, ready }: { value: PaymentSettings; onChange: (p: PaymentSettings) => void; ready: { stripe: boolean; paypal: boolean } }) {
  const p = value;
  const put = (patch: Partial<PaymentSettings>) => onChange({ ...p, ...patch });
  const putM = (id: string, patch: Partial<PaymentSettings["manual"][number]>) => put({ manual: p.manual.map((m) => (m.id === id ? { ...m, ...patch } : m)) });
  const keys = <Link href="/admin/keys" className="small">Accounts &amp; keys</Link>;
  return (
    <section className="panel stack">
      <div className="panel-head"><h2>Payments</h2></div>
      <p className="hint">Pick every way customers can pay. They choose in the cart. You don&apos;t need Stripe to sell: PayPal or Cash App alone works.</p>

      <div className="pay-row-admin">
        <label className="check"><input type="checkbox" checked={p.stripe} onChange={(e) => put({ stripe: e.target.checked })} /> <strong>Card, Apple Pay, Google Pay</strong> (Stripe)</label>
        <p className="muted small">{ready.stripe ? "Stripe is connected." : <>Needs the Stripe key on {keys}.</>} Sales tax, gift messages and abandoned-checkout reminders work with this one.</p>
      </div>

      <div className="pay-row-admin">
        <label className="check"><input type="checkbox" checked={p.paypal} onChange={(e) => put({ paypal: e.target.checked })} /> <strong>PayPal, Venmo and Pay Later</strong></label>
        <p className="muted small">{ready.paypal ? "PayPal is connected." : <>Needs a free PayPal Business account and its two keys on {keys}.</>} Venmo shows on phones in the US. Money lands in your PayPal balance.</p>
        {p.paypal ? (
          <div className="seg">
            <button type="button" className={p.paypalMode === "live" ? "on" : ""} onClick={() => put({ paypalMode: "live" })}>Live (real money)</button>
            <button type="button" className={p.paypalMode === "sandbox" ? "on" : ""} onClick={() => put({ paypalMode: "sandbox" })}>Sandbox (practice)</button>
          </div>
        ) : null}
      </div>

      <h3>Pay us directly</h3>
      <p className="hint">The customer places the order, then sends the money in the app. The order waits under <strong>Orders › Waiting for payment</strong> until you tap <strong>Mark paid</strong>. Use a business profile on Venmo and Cash App for sales.</p>
      {p.manual.map((m) => {
        const info = MANUAL_INFO[m.id];
        return (
          <div key={m.id} className="pay-row-admin">
            <label className="check">
              <input type="checkbox" checked={m.on} onChange={(e) => putM(m.id, { on: e.target.checked })} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/icons/pay/${info.icon}.svg`} alt="" width={36} height={24} /> <strong>{info.name}</strong>
              {info.pickupOnly ? <span className="muted small"> (only offered for local pickup)</span> : null}
            </label>
            {m.on ? (
              <div className="row wrap">
                <label className="f grow">
                  <span>{info.handleLabel}</span>
                  <input value={m.handle} placeholder={info.placeholder} onChange={(e) => putM(m.id, { handle: e.target.value })} maxLength={80} />
                </label>
                <label className="f grow">
                  <span>Extra note for the customer (optional)</span>
                  <input value={m.note} placeholder="e.g. Choose 'Friends' is fine, or the last 4 of our phone are 0100" onChange={(e) => putM(m.id, { note: e.target.value })} maxLength={300} />
                </label>
              </div>
            ) : null}
            {m.on && !m.handle && m.id !== "cash" ? <p className="error small">Add your {info.handleLabel.replace(/^Your /, "")} or it won&apos;t show in the cart.</p> : null}
          </div>
        );
      })}

      <label className="check"><input type="checkbox" checked={p.accepts} onChange={(e) => put({ accepts: e.target.checked })} /> Show &ldquo;We accept&rdquo; payment pictures in the footer and cart</label>
    </section>
  );
}
