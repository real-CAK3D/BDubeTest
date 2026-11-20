"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { money } from "@/lib/format";
import { savedIds, setSaved } from "./wishlist";

type Data = {
  email: string;
  orders: { id: string; number: number; createdAt: string; status: string; delivery?: string; total: number; currency: string; paymentMethod?: string; items: { productId: string; name: string; quantity: number }[]; trackingNumber?: string; carrier?: string }[];
  lastAddress: { name: string; line1: string; line2?: string; city: string; state: string; zip: string; country: string } | null;
  lastName: string;
  lastPhone: string;
  giftCards: { code: string; amount: number; balance: number }[];
  saved: string[];
};
const STATUS: Record<string, string> = { awaiting: "Waiting for your payment", paid: "Being made", shipped: "On its way", delivered: "Delivered", refunded: "Refunded", cancelled: "Cancelled" };
const post = (b: object) => fetch("/api/account", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(b) }).then(async (r) => ({ ok: r.ok, ...(await r.json().catch(() => ({}))) }));

/** Sign in with an emailed code, then: orders, gift cards, saved items. */
export function AccountView({ data, canEmail, currency }: { data: Data | null; canEmail: boolean; currency: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  // signed in: bring saved items together, and fill in checkout details next time
  useEffect(() => {
    if (!data) return;
    const merged = [...new Set([...savedIds(), ...data.saved])];
    if (merged.length !== savedIds().length || merged.length !== data.saved.length) setSaved(merged);
    try {
      const a = data.lastAddress;
      const prev = JSON.parse(localStorage.getItem("cart:buyer") ?? "{}");
      localStorage.setItem("cart:buyer", JSON.stringify({ name: data.lastName, email: data.email, phone: data.lastPhone, ...(a ? { line1: a.line1, line2: a.line2 ?? "", city: a.city, state: a.state, zip: a.zip } : {}), ...prev }));
    } catch {}
  }, [data]);

  async function ask(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    const r = await post({ action: "code", email });
    setBusy(false);
    if (r.ok) setSent(true);
    else setErr(r.error ?? "Try again.");
  }
  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    const r = await post({ action: "verify", email, code });
    setBusy(false);
    if (r.ok) router.refresh();
    else setErr(r.error ?? "Try again.");
  }

  if (!data)
    return (
      <div className="account-signin">
        <h1>Your orders</h1>
        <p className="lede">Sign in with your email to see your orders, gift cards and saved items. No password: we email you a code.</p>
        {!canEmail ? (
          <p className="muted">Signing in by email isn&apos;t switched on yet. You&apos;re signed in automatically on this device after you buy something, and you can look up any order on <Link href="/order-status">Order status</Link>.</p>
        ) : !sent ? (
          <form onSubmit={ask} className="account-form">
            <label className="field"><span>Email</span><input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></label>
            <button className="btn" disabled={busy}>{busy ? "Sending…" : "Email me a code"}</button>
          </form>
        ) : (
          <form onSubmit={verify} className="account-form">
            <p>We sent a 6-digit code to <strong>{email}</strong> (check spam too). It works for 15 minutes.</p>
            <label className="field"><span>Code</span><input inputMode="numeric" autoComplete="one-time-code" pattern="[0-9 ]{6,7}" maxLength={7} required value={code} onChange={(e) => setCode(e.target.value)} /></label>
            <button className="btn" disabled={busy}>{busy ? "Checking…" : "Sign in"}</button>
            <button type="button" className="linkish" onClick={() => (setSent(false), setCode(""))}>Use a different email</button>
          </form>
        )}
        {err ? <p className="error" role="alert">{err}</p> : null}
        <p className="muted small">Saved items (♥) are on <Link href="/saved">Saved items</Link>, even without signing in.</p>
      </div>
    );

  return (
    <div className="account-page">
      <div className="account-head">
        <h1>Your orders</h1>
        <span className="muted">{data.email}</span>
        <button className="linkish" onClick={async () => (await post({ action: "signout" }), router.refresh())}>Sign out</button>
      </div>
      {data.orders.length ? (
        <ul className="account-orders">
          {data.orders.map((o) => (
            <li key={o.id} className="panel-ish">
              <div className="account-order-top">
                <strong>Order #{o.number}</strong>
                <span className="muted">{new Date(o.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                <span className={`pill s-${o.status}`}>{o.status === "shipped" && o.delivery === "pickup" ? "Ready for pickup" : STATUS[o.status] ?? o.status}</span>
                <strong className="account-total">{money(o.total, o.currency)}</strong>
              </div>
              <ul className="account-items">
                {o.items.map((i, n) => (
                  <li key={n}>{i.quantity} × {i.name}</li>
                ))}
              </ul>
              {o.trackingNumber ? <p className="small">Tracking{o.carrier ? ` (${o.carrier})` : ""}: <code>{o.trackingNumber}</code></p> : null}
              <div className="row-inline">
                {[...new Set(o.items.map((i) => i.productId).filter(Boolean))].slice(0, 1).length ? <Link href="/shop" className="btn btn-sm btn-ghost">Shop again</Link> : null}
                <Link href={`/contact?order=${o.number}`} className="btn btn-sm btn-ghost">Question about this order</Link>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="muted">No orders with this email yet. <Link href="/shop">Browse the shop</Link>.</p>
      )}
      {data.giftCards.length ? (
        <>
          <h2>Your gift cards</h2>
          <ul className="account-gifts">
            {data.giftCards.map((g) => (
              <li key={g.code}><code>{g.code}</code> <span>{money(g.balance, currency)} left of {money(g.amount, currency)}</span></li>
            ))}
          </ul>
        </>
      ) : null}
      <p><Link href="/saved">Saved items ♥</Link></p>
    </div>
  );
}
