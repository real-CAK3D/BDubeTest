"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { money } from "@/lib/format";
import { useCart } from "./CartProvider";

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
};
type Quote = { amount: number; label: string; free?: boolean };

export function CartView(props: Props) {
  const cart = useCart();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [delivery, setDelivery] = useState<"ship" | "pickup">("ship");
  const [abroad, setAbroad] = useState(false);
  const [zip, setZip] = useState("");
  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoting, setQuoting] = useState(false);

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
        body: JSON.stringify({ items: cart.lines, delivery: props.ships ? delivery : "none", zip, abroad }),
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
            <li key={`${l.productId}|${l.size ?? ""}|${l.design ?? ""}|${l.option ?? ""}|${l.custom ?? ""}`} className="cart-line">
              <Link href={`/product/${p.slug}`} className="cart-thumb">
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
                {l.design ? (
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
          {props.ships ? (
            <div>
              <dt>{delivery === "pickup" ? "Local pickup" : "Shipping"}</dt>
              <dd>{shipping === null ? (quoting ? "…" : "Enter ZIP") : shipping === 0 ? "Free" : money(shipping, props.currency)}</dd>
            </div>
          ) : null}
          <div className="total"><dt>Total</dt><dd>{money(cart.subtotal + (shipping ?? 0), props.currency)}{shipping === null && props.ships ? " + shipping" : ""}</dd></div>
        </dl>
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
        {props.ships && delivery === "ship" && props.freeOver > 0 && !free ? (
          <p className="muted small">Add {money(props.freeOver - cart.subtotal, props.currency)} more for free shipping.</p>
        ) : null}
        {props.storeOpen ? (
          <button className="btn btn-lg btn-block" onClick={checkout} disabled={busy}>
            {busy ? "Opening secure checkout…" : "Check out"}
          </button>
        ) : (
          <p>{props.closedMessage}</p>
        )}
        <p className="pay-note">
          Pay with card, Apple Pay or Google Pay on Stripe&apos;s secure page.
          {props.promoCodes ? " Have a promo code? Enter it there." : ""}
          {props.tax ? " Sales tax is added at checkout." : ""}
          {props.giftNotes ? " You can add a gift message there too." : ""}
        </p>
        {error ? <p className="error" role="alert">{error}</p> : null}
      </aside>
    </div>
  );
}
