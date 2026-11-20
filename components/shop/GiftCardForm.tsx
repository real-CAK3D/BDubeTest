"use client";
import { useState } from "react";
import { PayChoices, type PayOptions } from "./PayChoices";

/** Pick an amount and who it's for, then pay any way the shop takes. The code is emailed once it's paid. */
export function GiftCardForm({ amounts, business, pay, currency }: { amounts: number[]; business: string; pay: PayOptions; currency: string }) {
  const [amount, setAmount] = useState(amounts[1] ?? amounts[0]);
  const [f, setF] = useState({ fromName: "", toName: "", toEmail: "", message: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const giftCard = { ...f, amount };
  const bad = () => (f.toEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.toEmail) ? "Check the recipient's email address." : "");

  async function card() {
    const b = bad();
    if (b) return setErr(b);
    setErr("");
    setBusy(true);
    const res = await fetch("/api/checkout", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ giftCard }) });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.url) window.location.href = data.url;
    else {
      setErr(data.error ?? "Checkout couldn't start. Please try again.");
      setBusy(false);
    }
  }
  const field = (k: keyof typeof f, label: React.ReactNode, extra: React.InputHTMLAttributes<HTMLInputElement> = {}, full = false) => (
    <label className={`field ${full ? "full" : ""}`}>
      <span>{label}</span>
      <input value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} {...extra} />
    </label>
  );
  return (
    <div className="review-form">
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
      {field("fromName", "From", { maxLength: 60, placeholder: "Your name" })}
      {field("toName", "To", { maxLength: 60, placeholder: "Their name" })}
      {field("toEmail", <>Send it to <em>(their email; leave empty to get it yourself)</em></>, { type: "email", maxLength: 200 }, true)}
      <label className="field full"><span>Message <em>(optional)</em></span><textarea value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} rows={3} maxLength={300} /></label>
      <p className="muted small full">Use the {business} gift card code on any order. Whatever isn&apos;t spent stays on the card for next time. It never expires.</p>
      <div className="full">
        <PayChoices opts={pay} request={{ giftCard }} total={amount * 100} currency={currency} ships={false} pickup={false} giftNotes={false} onCard={card} cardBusy={busy} ready={bad} kind="giftcard" />
      </div>
      {err ? <p className="error full" role="alert">{err}</p> : null}
    </div>
  );
}
