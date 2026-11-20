"use client";
import { useEffect, useRef, useState } from "react";
import { money } from "@/lib/format";

export type PayOptions = {
  stripe: boolean;
  paypal: { clientId: string; currency: string } | null;
  manual: { id: string; name: string; icon: string; handle: string; pickupOnly?: boolean }[];
  accepts: { file: string; name: string }[];
};
type Body = { items: unknown[]; delivery: string; zip: string; abroad: boolean };
type PayPalSdk = { Buttons: (o: Record<string, unknown>) => { render: (el: HTMLElement) => Promise<void>; close?: () => void; isEligible?: () => boolean } };

/** "We accept" payment pictures (public/icons/pay). */
export function Accepts({ list, label = "We accept" }: { list: { file: string; name: string }[]; label?: string }) {
  if (!list.length) return null;
  return (
    <div className="accepts">
      <span className="accepts-label">{label}</span>
      <ul>
        {list.map((a) => (
          <li key={a.file}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/icons/pay/${a.file}.svg`} alt={a.name} title={a.name} width={45} height={30} loading="lazy" />
          </li>
        ))}
      </ul>
    </div>
  );
}

let sdk: Promise<PayPalSdk> | null = null;
function loadPayPal(clientId: string, currency: string) {
  sdk ??= new Promise<PayPalSdk>((ok, fail) => {
    const s = document.createElement("script");
    s.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&currency=${currency.toUpperCase()}&intent=capture&components=buttons&enable-funding=venmo,paylater`;
    s.async = true;
    s.onload = () => ((window as unknown as { paypal?: PayPalSdk }).paypal ? ok((window as unknown as { paypal: PayPalSdk }).paypal) : fail(new Error("PayPal didn't load")));
    s.onerror = () => {
      sdk = null;
      fail(new Error("PayPal didn't load. Check your connection and try again."));
    };
    document.head.append(s);
  });
  return sdk;
}

/**
 * The ways to pay in the cart: card checkout (Stripe), the PayPal / Venmo /
 * Pay Later buttons, and "pay us directly" (Cash App, Venmo, Zelle, cash at
 * pickup) with a short form. Shown only for what the owner switched on.
 */
export function PayChoices({ opts, body, total, currency, ships, pickup, promoCodes, giftNotes, onCard, cardBusy, ready }: {
  opts: PayOptions;
  body: Body;
  total: number | null; // cents before a code, null while shipping isn't known
  currency: string;
  ships: boolean; // this order gets shipped (address needed)
  pickup: boolean;
  promoCodes: boolean;
  giftNotes: boolean;
  onCard: () => void;
  cardBusy: boolean;
  ready: () => string; // "" when the cart is ready to pay, else what's missing
}) {
  const choices = [
    ...(opts.stripe ? [{ id: "card", name: "Card, Apple Pay or Google Pay", icons: ["visa", "mastercard", "apple-pay", "google-pay"] }] : []),
    ...(opts.paypal ? [{ id: "paypal", name: "PayPal or Venmo", icons: ["paypal", "venmo"] }] : []),
    ...opts.manual.filter((m) => !m.pickupOnly || pickup).map((m) => ({ id: m.id, name: m.id === "cash" ? m.name : `${m.name} (send it yourself)`, icons: [m.icon] })),
  ];
  const [pick, setPick] = useState(choices[0]?.id ?? "");
  const [code, setCode] = useState("");
  const [applied, setApplied] = useState<{ code: string; off: number } | null>(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});
  const box = useRef<HTMLDivElement>(null);
  const latest = useRef({ body, applied, ready });
  latest.current = { body, applied, ready };
  const bodyKey = JSON.stringify(body);

  useEffect(() => {
    if (!choices.some((c) => c.id === pick)) setPick(choices[0]?.id ?? "");
  }, [pickup]); // eslint-disable-line react-hooks/exhaustive-deps
  // a code was checked against this cart; a different cart needs it checked again
  useEffect(() => setApplied(null), [bodyKey]);
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("cart:buyer") ?? "{}");
      if (saved && typeof saved === "object") setForm(saved);
    } catch {}
  }, []);

  // the PayPal buttons (they read the latest cart when tapped)
  useEffect(() => {
    if (pick !== "paypal" || !opts.paypal || !box.current) return;
    let buttons: ReturnType<PayPalSdk["Buttons"]> | null = null;
    let gone = false;
    const el = box.current;
    loadPayPal(opts.paypal.clientId, opts.paypal.currency)
      .then((pp) => {
        if (gone) return;
        el.innerHTML = "";
        buttons = pp.Buttons({
          style: { layout: "vertical", shape: "pill", label: "pay", height: 48 },
          onClick: (_d: unknown, actions: { reject: () => Promise<void>; resolve: () => Promise<void> }) => {
            const missing = latest.current.ready();
            setErr(missing);
            return missing ? actions.reject() : actions.resolve();
          },
          createOrder: async () => {
            setErr("");
            const r = await fetch("/api/pay/paypal", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "create", ...latest.current.body, code: latest.current.applied?.code }) });
            const d = await r.json();
            if (!d.id) {
              setErr(d.error || "PayPal checkout couldn't start.");
              throw new Error(d.error);
            }
            return d.id;
          },
          onApprove: async (data: { orderID: string }) => {
            setBusy(true);
            const r = await fetch("/api/pay/paypal", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "capture", id: data.orderID }) });
            const d = await r.json();
            if (d.url) window.location.href = d.url;
            else {
              setBusy(false);
              setErr(d.error || "The payment didn't go through. Nothing was charged.");
            }
          },
          onError: () => setErr((e) => e || "PayPal had a problem. Please try again, or pick another way to pay."),
        });
        return buttons.render(el);
      })
      .catch((e) => {
        el.innerHTML = "";
        setErr((e as Error).message);
      });
    return () => {
      gone = true;
      buttons?.close?.();
    };
  }, [pick, opts.paypal]);

  async function applyCode() {
    setErr("");
    if (!code.trim()) return;
    const r = await fetch("/api/pay/code", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...body, code }) });
    const d = await r.json();
    if (d.code) setApplied({ code: d.code, off: d.off });
    else setErr(d.error || "That code didn't work.");
  }

  async function placeDirect(e: React.FormEvent) {
    e.preventDefault();
    const missing = ready();
    if (missing) return setErr(missing);
    setBusy(true);
    setErr("");
    try {
      localStorage.setItem("cart:buyer", JSON.stringify({ name: form.name, email: form.email, phone: form.phone, line1: form.line1, line2: form.line2, city: form.city, state: form.state, zip: form.zip, country: form.country }));
    } catch {}
    const r = await fetch("/api/pay/direct", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...body, payWith: pick, code: applied?.code, buyer: form, website: form.website }) });
    const d = await r.json().catch(() => ({}));
    if (d.url) window.location.href = d.url;
    else {
      setErr(d.error || "The order couldn't be placed. Please try again.");
      setBusy(false);
    }
  }

  if (!choices.length) return <p className="error">Checkout isn&apos;t set up yet. Please message us to order.</p>;
  const f = (k: string, label: string, extra: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <label className="field">
      <span>{label}</span>
      <input value={form[k] ?? ""} onChange={(e) => setForm({ ...form, [k]: e.target.value })} {...extra} />
    </label>
  );
  const manual = opts.manual.find((m) => m.id === pick);
  const codeBox =
    promoCodes && pick !== "card" ? (
      <div className="pay-code">
        {applied ? (
          <p className="saving small">
            Code <strong>{applied.code}</strong>: −{money(applied.off, currency)}{" "}
            <button type="button" className="linkish" onClick={() => setApplied(null)}>Remove</button>
          </p>
        ) : (
          <div className="row-inline">
            <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="Promo or gift card code" aria-label="Promo or gift card code" />
            <button type="button" className="btn btn-sm" onClick={applyCode}>Apply</button>
          </div>
        )}
      </div>
    ) : null;

  return (
    <div className="pay-choices">
      {choices.length > 1 ? (
        <fieldset className="pay-pick">
          <legend>How would you like to pay?</legend>
          {choices.map((c) => (
            <label key={c.id} className={`pay-opt ${pick === c.id ? "on" : ""}`}>
              <input type="radio" name="pay" checked={pick === c.id} onChange={() => (setPick(c.id), setErr(""))} />
              <span className="pay-opt-name">{c.name}</span>
              <span className="pay-opt-icons" aria-hidden>
                {c.icons.map((i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={i} src={`/icons/pay/${i}.svg`} alt="" width={36} height={24} />
                ))}
              </span>
            </label>
          ))}
        </fieldset>
      ) : null}

      {pick === "card" ? (
        <>
          <button className="btn btn-lg btn-block" onClick={onCard} disabled={cardBusy}>
            {cardBusy ? "Opening secure checkout…" : "Check out"}
          </button>
          <p className="pay-note">
            Pay with card, Apple Pay or Google Pay on Stripe&apos;s secure page.
            {promoCodes ? " Have a promo code? Enter it there." : ""}
            {giftNotes ? " You can add a gift message there too." : ""}
          </p>
        </>
      ) : pick === "paypal" ? (
        <>
          {codeBox}
          {applied && total !== null ? <p className="small"><strong>New total: {money(Math.max(0, total - applied.off), currency)}</strong></p> : null}
          <div ref={box} className={`paypal-box ${err ? "failed" : ""}`} aria-busy={busy}>
            <p className="muted small">Loading PayPal…</p>
          </div>
          <p className="pay-note">Pay with your PayPal account, Venmo (on your phone), Pay Later, or a card through PayPal. {ships ? "PayPal asks where to ship it." : ""}</p>
        </>
      ) : manual ? (
        <form className="pay-direct" onSubmit={placeDirect}>
          <p className="small">
            {manual.id === "cash" ? (
              <>Place the order now and pay in cash when you pick it up.</>
            ) : (
              <>
                Place the order, then send the money by <strong>{manual.name}</strong> to <strong>{manual.handle}</strong>. We start as soon as it arrives. The details are on the next page and emailed to you.
              </>
            )}
          </p>
          {f("name", "Your name", { autoComplete: "name", required: true, maxLength: 80 })}
          {f("email", "Email", { type: "email", autoComplete: "email", required: true, maxLength: 200 })}
          {f("phone", "Phone (optional)", { type: "tel", autoComplete: "tel", maxLength: 30 })}
          {ships ? (
            <>
              {f("line1", "Street address", { autoComplete: "address-line1", required: true, maxLength: 100 })}
              {f("line2", "Apt, suite (optional)", { autoComplete: "address-line2", maxLength: 100 })}
              <div className="pay-row">
                {f("city", "City", { autoComplete: "address-level2", required: true, maxLength: 60 })}
                {body.abroad ? f("country", "Country code", { autoComplete: "country", required: true, maxLength: 2, placeholder: "CA" }) : f("state", "State", { autoComplete: "address-level1", required: true, maxLength: 30, placeholder: "OK" })}
                {f("zip", body.abroad ? "Postal code" : "ZIP", { autoComplete: "postal-code", required: true, maxLength: 12 })}
              </div>
            </>
          ) : null}
          {giftNotes ? f("note", "Gift message (optional)", { maxLength: 255 }) : null}
          <input name="website" tabIndex={-1} autoComplete="off" className="hp" aria-hidden value={form.website ?? ""} onChange={(e) => setForm({ ...form, website: e.target.value })} />
          {codeBox}
          <button className="btn btn-lg btn-block" disabled={busy}>
            {busy ? "Placing your order…" : `Place order${total !== null ? ` · ${money(Math.max(0, total - (applied?.off ?? 0)), currency)}` : ""}`}
          </button>
        </form>
      ) : null}
      {err ? <p className="error" role="alert">{err}</p> : null}
      <Accepts list={opts.accepts} />
    </div>
  );
}
