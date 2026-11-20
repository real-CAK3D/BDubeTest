"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { money } from "@/lib/format";
import { useCart } from "./CartProvider";
import { PayChoices, type PayOptions } from "./PayChoices";

type Props = {
  currency: string;
  ships: boolean; // asks for a shipping address
  freeOver: number;
  intl: number;
  pickup: boolean;
  pickupNote: string;
  storeOpen: boolean;
  closedMessage: string;
  promoCodes: boolean;
  tax: boolean;
  giftNotes: boolean;
  bulk: { minQty: number; percent: number }[];
  military: { percent: number; href: string } | null;
  pay: PayOptions;
};
type Quote = { amount: number; label: string; free?: boolean };
type Estimate = { subtotal: number; discount: number; shipping: number; tax: number; taxLabel: string; taxLater: boolean; gift: number; giftLeft: number; total: number; codes: string[]; errors: string[] };

export function CartView(props: Props) {
  const cart = useCart();
  const qty = cart.lines.reduce((n, l) => n + l.quantity, 0);
  const bulkPct = props.bulk.filter((t) => qty >= t.minQty).reduce((m, t) => Math.max(m, t.percent), 0);
  const nextTier = props.bulk.find((t) => t.minQty > qty && t.percent > bulkPct);
  const bulkOff = Math.round((cart.subtotal * bulkPct) / 100);
  const afterBulk = cart.subtotal - bulkOff;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [delivery, setDelivery] = useState<"ship" | "pickup">("ship");
  const [abroad, setAbroad] = useState(false);
  const [zip, setZip] = useState("");
  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoting, setQuoting] = useState(false);
  const [codes, setCodes] = useState<string[]>([]);
  const [code, setCode] = useState("");
  const [codeErr, setCodeErr] = useState("");
  const [est, setEst] = useState<Estimate | null>(null);

  useEffect(() => {
    try {
      const z = localStorage.getItem("cart:zip");
      if (z) setZip(z);
    } catch {}
  }, []);

  // re-price when the ZIP or the cart changes
  const items = cart.lines.map((l) => ({ productId: l.productId, quantity: l.quantity, size: l.size, design: l.design }));
  const itemsKey = JSON.stringify(items);
  useEffect(() => {
    setQuote(null);
    if (!props.ships || delivery !== "ship" || abroad || !/^\d{5}$/.test(zip)) return;
    const t = setTimeout(async () => {
      setQuoting(true);
      try {
        localStorage.setItem("cart:zip", zip);
      } catch {}
      const r = await fetch("/api/shipping-quote", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ zip, items }) });
      if (r.ok) setQuote(await r.json());
      setQuoting(false);
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zip, itemsKey, delivery, abroad, props.ships]);

  // the real totals from the shop: codes, shipping and sales tax (worked out on the server)
  const zipOk = !props.ships || delivery !== "ship" || abroad || /^\d{5}$/.test(zip);
  const codesKey = codes.join(",");
  useEffect(() => {
    setEst(null);
    if (!cart.lines.length || !zipOk) return;
    let stale = false;
    const t = setTimeout(async () => {
      const r = await fetch("/api/pay/estimate", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ items: cart.lines, delivery: props.ships ? delivery : "none", zip, abroad, codes }) }).catch(() => null);
      const d = r?.ok ? ((await r.json()) as Estimate) : null;
      if (stale || !d) return;
      setEst(d);
      // a code that didn't work comes off, with the reason
      if (d.errors.length) {
        setCodeErr(d.errors[0]);
        setCodes(codes.filter((c) => d.codes.includes(c)));
      }
    }, 400);
    return () => {
      stale = true;
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zip, itemsKey, delivery, abroad, props.ships, codesKey, zipOk]);

  function applyCode() {
    const c = code.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (!c) return;
    setCodeErr("");
    setCodes((l) => [...new Set([...l, c])].slice(-2));
    setCode("");
  }

  if (!cart.lines.length) {
    return (
      <div className="empty">
        <p>Your cart is empty.</p>
        <Link href="/shop" className="btn">Browse the shop</Link>
      </div>
    );
  }

  const free = props.freeOver > 0 && cart.subtotal >= props.freeOver;
  const shipping = !props.ships || delivery === "pickup" ? 0 : free ? 0 : abroad ? props.intl : quote?.amount ?? null;
  const needZip = props.ships && delivery === "ship" && !abroad && !/^\d{5}$/.test(zip);

  async function checkout() {
    if (needZip) return setError("Enter your ZIP code so we can work out shipping.");
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ items: cart.lines, delivery: props.ships ? delivery : "none", zip, abroad, codes }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else throw new Error(data.error || "Checkout couldn't start.");
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  return (
    <div className="cart-wrap">
      <ul className="cart-lines">
        {cart.lines.map((l) => {
          const p = cart.products.find((x) => x.id === l.productId)!;
          return (
            <li key={`${l.productId}|${l.size ?? ""}|${l.design ?? ""}|${l.art ?? ""}|${l.option ?? ""}|${l.custom ?? ""}`} className="cart-line">
              <Link href={`/product/${p.slug}`} className="cart-thumb" aria-label={p.name}>
                {p.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.image} alt="" />
                ) : (
                  <span />
                )}
              </Link>
              <div className="cart-name">
                <Link href={`/product/${p.slug}`}>{p.name}</Link>
                {l.size || l.option ? <span className="muted">{[l.size, l.option].filter(Boolean).join(" · ")}</span> : null}
                {l.art ? (
                  <span className="cart-design">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={l.art} alt="" />
                    Your artwork
                  </span>
                ) : l.design ? (
                  <span className="cart-design">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {cart.designOf(l)?.image ? <img src={cart.designOf(l)!.image} alt="" /> : null}
                    {cart.designOf(l)?.name ?? l.design}
                  </span>
                ) : null}
                {l.custom ? <span className="custom-text">&ldquo;{l.custom}&rdquo;</span> : null}
              </div>
              <div className="stepper" role="group" aria-label={`Quantity of ${p.name}`}>
                <button onClick={() => cart.setQty(l, l.quantity - 1)} aria-label="One fewer">−</button>
                <span>{l.quantity}</span>
                <button onClick={() => cart.setQty(l, l.quantity + 1)} aria-label="One more" disabled={p.stock !== null && l.quantity >= p.stock}>+</button>
              </div>
              <span className="cart-amt">{money(cart.linePrice(l) * l.quantity, props.currency)}</span>
            </li>
          );
        })}
      </ul>
      <aside className="cart-sum">
        <dl>
          <div><dt>Subtotal</dt><dd>{money(cart.subtotal, props.currency)}</dd></div>
          {bulkPct ? <div className="saving"><dt>Bulk order ({bulkPct}% off)</dt><dd>−{money(bulkOff, props.currency)}</dd></div> : null}
          {props.ships ? (
            <div>
              <dt>{delivery === "pickup" ? "Local pickup" : "Shipping"}</dt>
              <dd>{shipping === null ? (quoting ? "…" : "Enter ZIP") : shipping === 0 ? "Free" : money(shipping, props.currency)}</dd>
            </div>
          ) : null}
          {est?.discount ? <div className="saving"><dt>Code {codes.find((c) => !c.startsWith("GIFT")) ?? ""}</dt><dd>−{money(est.discount, props.currency)}</dd></div> : null}
          {est?.tax ? <div><dt>{est.taxLabel || "Sales tax"}</dt><dd>{money(est.tax, props.currency)}</dd></div> : est?.taxLater ? <div><dt>Sales tax</dt><dd className="muted small">worked out at checkout</dd></div> : null}
          {est?.gift ? <div className="saving"><dt>Gift card</dt><dd>−{money(est.gift, props.currency)}</dd></div> : null}
          <div className="total">
            <dt>Total</dt>
            <dd>{est ? money(est.total, props.currency) : <>{money(afterBulk + (shipping ?? 0), props.currency)}{shipping === null && props.ships ? " + shipping" : ""}</>}</dd>
          </div>
        </dl>
        {est?.gift && est.giftLeft > 0 ? <p className="muted small">{money(est.giftLeft, props.currency)} stays on your gift card for next time.</p> : null}
        <div className="pay-code">
          <div className="row-inline">
            <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), applyCode())} placeholder={props.promoCodes ? "Promo or gift card code" : "Gift card code"} aria-label={props.promoCodes ? "Promo or gift card code" : "Gift card code"} />
            <button type="button" className="btn btn-sm" onClick={applyCode}>Apply</button>
          </div>
          {codes.length ? (
            <p className="small">
              {codes.map((c) => (
                <span key={c} className="code-chip">
                  {c} <button type="button" className="linkish" aria-label={`Remove ${c}`} onClick={() => (setCodes(codes.filter((x) => x !== c)), setCodeErr(""))}>✕</button>
                </span>
              ))}
            </p>
          ) : null}
          {codeErr ? <p className="error small" role="alert">{codeErr}</p> : null}
        </div>
        {props.ships ? (
          <fieldset className="delivery">
            <legend>Delivery</legend>
            <label className="radio"><input type="radio" name="delivery" checked={delivery === "ship"} onChange={() => setDelivery("ship")} /> Ship it to me</label>
            {delivery === "ship" ? (
              <div className="ship-zip">
                {!abroad ? (
                  <label className="field"><span>ZIP code</span><input inputMode="numeric" autoComplete="postal-code" maxLength={5} value={zip} onChange={(e) => setZip(e.target.value.replace(/\D/g, "").slice(0, 5))} placeholder="e.g. 73501" /></label>
                ) : null}
                {quote && !abroad ? <p className="muted small">{quote.label}</p> : null}
                <label className="check-sm"><input type="checkbox" checked={abroad} onChange={(e) => setAbroad(e.target.checked)} /> Shipping outside the US</label>
              </div>
            ) : null}
            {props.pickup ? (
              <>
                <label className="radio"><input type="radio" name="delivery" checked={delivery === "pickup"} onChange={() => setDelivery("pickup")} /> Local pickup (free)</label>
                {delivery === "pickup" && props.pickupNote ? <p className="muted small">{props.pickupNote}</p> : null}
              </>
            ) : null}
          </fieldset>
        ) : null}
        {nextTier ? <p className="muted small">Order {nextTier.minQty - qty} more item{nextTier.minQty - qty === 1 ? "" : "s"} for {nextTier.percent}% off everything.</p> : null}
        {props.military ? (
          <p className="muted small">
            Veteran, active duty or first responder? <Link href={props.military.href}>Get {props.military.percent}% off</Link>.
          </p>
        ) : null}
        {props.ships && delivery === "ship" && props.freeOver > 0 && !free ? (
          <p className="muted small">Add {money(props.freeOver - afterBulk, props.currency)} more for free shipping.</p>
        ) : null}
        {props.storeOpen ? (
          <PayChoices
            opts={props.pay}
            request={{ items: cart.lines, delivery: props.ships ? delivery : "none", zip, abroad, codes }}
            total={est ? est.total : null}
            currency={props.currency}
            ships={props.ships && delivery === "ship"}
            pickup={props.ships && delivery === "pickup"}
            giftNotes={props.giftNotes}
            onCard={checkout}
            cardBusy={busy}
            ready={() => (needZip ? "Enter your ZIP code so we can work out shipping." : "")}
          />
        ) : (
          <p>{props.closedMessage}</p>
        )}
        {error ? <p className="error" role="alert">{error}</p> : null}
      </aside>
    </div>
  );
}
