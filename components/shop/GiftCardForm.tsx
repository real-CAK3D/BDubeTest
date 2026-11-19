"use client";
import { useState } from "react";

/** Pick an amount and who it's for, then pay on Stripe's page. The code is emailed once it's paid. */
export function GiftCardForm({ amounts, business }: { amounts: number[]; business: string }) {
  const [amount, setAmount] = useState(amounts[1] ?? amounts[0]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function buy(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr("");
    setBusy(true);
    const f = Object.fromEntries(new FormData(e.currentTarget));
    const res = await fetch("/api/checkout", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ giftCard: { ...f, amount } }) });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.url) window.location.href = data.url;
    else {
      setErr(data.error ?? "Checkout couldn't start. Please try again.");
      setBusy(false);
    }
  }
  return (
    <form className="review-form" onSubmit={buy}>
      <fieldset className="field full size-pick">
        <legend>Amount</legend>
        <div className="size-chips">
          {amounts.map((a) => (
            <label key={a} className={amount === a ? "on" : ""}>
              <input type="radio" name="amount-pick" checked={amount === a} onChange={() => setAmount(a)} />
              <strong>${a}</strong>
            </label>
          ))}
        </div>
      </fieldset>
      <label className="field"><span>From</span><input name="fromName" maxLength={60} placeholder="Your name" /></label>
      <label className="field"><span>To</span><input name="toName" maxLength={60} placeholder="Their name" /></label>
      <label className="field full"><span>Send it to <em>(their email; leave empty to get it yourself)</em></span><input name="toEmail" type="email" maxLength={200} /></label>
      <label className="field full"><span>Message <em>(optional)</em></span><textarea name="message" rows={3} maxLength={300} /></label>
      <p className="muted small full">The {business} gift card code works once, on any order of at least its amount.</p>
      <button className="btn btn-lg" disabled={busy}>{busy ? "Opening secure checkout…" : `Buy a $${amount} gift card`}</button>
      {err ? <p className="error full" role="alert">{err}</p> : null}
    </form>
  );
}
