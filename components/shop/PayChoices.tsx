"use client";
import { useEffect, useRef, useState } from "react";
import { money } from "@/lib/format";

export type PayOptions = {
  stripe: boolean;
  paypal: { clientId: string; currency: string } | null;
  manual: { id: string; name: string; icon: string; handle: string; pickupOnly?: boolean }[];
  accepts: { file: string; name: string }[];
};
type PayPalSdk = { Buttons: (o: Record<string, unknown>) => { render: (el: HTMLElement) => Promise<void>; close?: () => void } };

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

const post = (url: string, data: unknown) => fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(data) }).then((r) => r.json().catch(() => ({})));

/**
 * The ways to pay: card checkout (Stripe), the PayPal / Venmo / Pay Later
 * buttons, and "pay us directly" (Cash App, Venmo, Zelle, cash at pickup) with
 * a short form. Used by the cart and the gift card page. When a gift card
 * covers the whole order, it's just "Place order".
 */
export function PayChoices({ opts, request, total, currency, ships, pickup, giftNotes, onCard, cardBusy, ready, kind = "cart" }: {
  opts: PayOptions;
  request: Record<string, unknown>; // what's sent with every payment request (cart lines + codes, or the gift card)
  total: number | null; // what's left to pay, null while it's not known yet
  currency: string;
  ships: boolean; // this order gets shipped (address needed)
  pickup: boolean;
  giftNotes: boolean;
  onCard: () => void;
  cardBusy: boolean;
  ready: () => string; // "" when it's ready to pay, else what's missing
  kind?: "cart" | "giftcard";
}) {
  const covered = kind === "cart" && total === 0;
  const choices = covered
    ? [{ id: "covered", name: "Paid by gift card", icons: ["gift-card"] }]
    : [
        ...(opts.stripe ? [{ id: "card", name: "Card, Apple Pay or Google Pay", icons: ["visa", "mastercard", "apple-pay", "google-pay"] }] : []),
        ...(opts.paypal ? [{ id: "paypal", name: "PayPal or Venmo", icons: ["paypal", "venmo"] }] : []),
        ...opts.manual.filter((m) => (!m.pickupOnly || pickup) && !(kind === "giftcard" && m.pickupOnly)).map((m) => ({ id: m.id, name: m.id === "cash" ? m.name : `${m.name} (send it yourself)`, icons: [m.icon] })),
      ];
  const [pick, setPick] = useState(choices[0]?.id ?? "");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});
  const box = useRef<HTMLDivElement>(null);
  const latest = useRef({ request, ready });
  latest.current = { request, ready };
  const choiceKey = choices.map((c) => c.id).join(",");

  useEffect(() => {
    if (!choices.some((c) => c.id === pick)) setPick(choices[0]?.id ?? "");
  }, [choiceKey]); // eslint-disable-line react-hooks/exhaustive-deps
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
            const d = await post("/api/pay/paypal", { action: "create", ...latest.current.request });
            if (!d.id) {
              setErr(d.error || "PayPal checkout couldn't start.");
              throw new Error(d.error);
            }
            return d.id;
          },
          onApprove: async (data: { orderID: string }) => {
            setBusy(true);
            const d = await post("/api/pay/paypal", { action: "capture", id: data.orderID });
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

  async function placeDirect(e: React.FormEvent) {
    e.preventDefault();
    const missing = ready();
    if (missing) return setErr(missing);
    setBusy(true);
    setErr("");
    try {
      localStorage.setItem("cart:buyer", JSON.stringify({ name: form.name, email: form.email, phone: form.phone, line1: form.line1, line2: form.line2, city: form.city, state: form.state, zip: form.zip, country: form.country }));
    } catch {}
    const d = await post("/api/pay/direct", { ...request, payWith: pick, buyer: form, website: form.website });
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
  const amount = total !== null ? ` · ${money(total, currency)}` : "";

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
            {cardBusy ? "Opening secure checkout…" : `Check out${amount}`}
          </button>
          <p className="pay-note">
            Pay with card, Apple Pay or Google Pay on Stripe&apos;s secure page.
            {giftNotes && kind === "cart" ? " You can add a gift message there too." : ""}
          </p>
        </>
      ) : pick === "paypal" ? (
        <>
          <div ref={box} className={`paypal-box ${err ? "failed" : ""}`} aria-busy={busy}>
            <p className="muted small">Loading PayPal…</p>
          </div>
          <p className="pay-note">Pay with your PayPal account, Venmo (on your phone), Pay Later, or a card through PayPal.{ships ? " PayPal asks where to ship it." : ""}</p>
        </>
      ) : manual || pick === "covered" ? (
        <form className="pay-direct" onSubmit={placeDirect}>
          <p className="small">
            {pick === "covered" ? (
              <>Your gift card covers the whole order. Fill this in and place it.</>
            ) : manual!.id === "cash" ? (
              <>Place the order now and pay in cash when you pick it up.</>
            ) : (
              <>
                Place the order, then send the money by <strong>{manual!.name}</strong> to <strong>{manual!.handle}</strong>. We start as soon as it arrives. The details are on the next page and emailed to you.
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
                {request.abroad ? f("country", "Country code", { autoComplete: "country", required: true, maxLength: 2, placeholder: "CA" }) : f("state", "State", { autoComplete: "address-level1", required: true, maxLength: 30, placeholder: "OK" })}
                {f("zip", request.abroad ? "Postal code" : "ZIP", { autoComplete: "postal-code", required: true, maxLength: 12 })}
              </div>
            </>
          ) : null}
          {giftNotes && kind === "cart" ? f("note", "Gift message (optional)", { maxLength: 255 }) : null}
          <input name="website" tabIndex={-1} autoComplete="off" className="hp" aria-hidden value={form.website ?? ""} onChange={(e) => setForm({ ...form, website: e.target.value })} />
          <button className="btn btn-lg btn-block" disabled={busy}>
            {busy ? "Placing your order…" : `Place order${amount}`}
          </button>
        </form>
      ) : null}
      {err ? <p className="error" role="alert">{err}</p> : null}
      <Accepts list={opts.accepts} />
    </div>
  );
}
