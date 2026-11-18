"use client";
import { useState } from "react";
import Link from "next/link";
import { useCart } from "./CartProvider";

export function AddToCart({
  productId,
  option,
  personalize,
  soldOut,
  storeOpen,
  compact = false,
}: {
  productId: string;
  option?: { label: string; values: string[] } | null;
  personalize?: { label: string; maxLength: number; required: boolean } | null;
  soldOut: boolean;
  storeOpen: boolean;
  compact?: boolean;
}) {
  const cart = useCart();
  const [choice, setChoice] = useState(option?.values[0] ?? "");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [custom, setCustom] = useState("");
  const [err, setErr] = useState("");

  if (!storeOpen) return <p className="muted">Ordering is paused right now.</p>;
  if (soldOut) return <button className="btn" disabled>Sold out</button>;

  function add() {
    const text = custom.trim();
    if (personalize?.required && !text) return setErr(`Fill in "${personalize.label}" first.`);
    setErr("");
    cart.add({ productId, quantity: qty, option: choice || undefined, custom: text || undefined });
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  }

  if (compact) {
    return (
      <button className="btn btn-sm" onClick={add} aria-live="polite">
        {added ? "Added" : "Add to cart"}
      </button>
    );
  }

  return (
    <div className="buy">
      {option ? (
        <label className="field">
          <span>{option.label}</span>
          <select value={choice} onChange={(e) => setChoice(e.target.value)}>
            {option.values.map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </label>
      ) : null}
      {personalize ? (
        <label className="field personalize">
          <span>
            {personalize.label}
            {personalize.required ? "" : " (optional)"}
          </span>
          <textarea rows={2} maxLength={personalize.maxLength} value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="Exactly as you want it, spelling and capitals included" />
          <em className="count">{custom.length}/{personalize.maxLength}</em>
        </label>
      ) : null}
      <label className="field qty">
        <span>Quantity</span>
        <input type="number" min={1} max={99} value={qty} onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))} />
      </label>
      <button className="btn btn-lg" onClick={add}>
        Add to cart
      </button>
      <p className="added" aria-live="polite">
        {err ? <span className="error">{err}</span> : added ? (
          <>
            Added to your cart. <Link href="/cart">Check out now</Link>
          </>
        ) : null}
      </p>
    </div>
  );
}
