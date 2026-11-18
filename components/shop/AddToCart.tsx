"use client";
import { useState } from "react";
import Link from "next/link";
import { money } from "@/lib/format";
import { type CartDesign, useCart } from "./CartProvider";

type Size = { name: string; price: number };

/*
 * Add to cart, with the item's choices: size, then a design that fits that
 * size (the list narrows to what fits), any other pick-list, and engraving text.
 */
export function AddToCart({
  productId,
  option,
  personalize,
  soldOut,
  storeOpen,
  compact = false,
  sizes,
  designs,
  fits,
  basePrice,
  currency = "usd",
}: {
  productId: string;
  option?: { label: string; values: string[] } | null;
  personalize?: { label: string; maxLength: number; required: boolean } | null;
  soldOut: boolean;
  storeOpen: boolean;
  compact?: boolean;
  sizes?: Size[] | null;
  designs?: { label: string; required: boolean } | null;
  fits?: Record<string, CartDesign[]>; // designs that fit, by size ("*" with no sizes)
  basePrice?: number;
  currency?: string;
}) {
  const cart = useCart();
  const [size, setSize] = useState(sizes?.length === 1 ? sizes[0].name : "");
  const [design, setDesign] = useState("");
  const [group, setGroup] = useState("");
  const [choice, setChoice] = useState(option?.values[0] ?? "");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [custom, setCustom] = useState("");
  const [err, setErr] = useState("");

  if (!storeOpen) return <p className="muted">Ordering is paused right now.</p>;
  if (soldOut) return <button className="btn" disabled>Sold out</button>;

  const hasSizes = Boolean(sizes?.length);
  const available = designs && fits ? fits[hasSizes ? size : "*"] ?? [] : [];
  const groups = [...new Set(available.map((d) => d.group).filter(Boolean))];
  const shown = available.filter((d) => !group || d.group === group);
  const picked = available.find((d) => d.id === design);
  const each = (hasSizes ? sizes!.find((s) => s.name === size)?.price ?? null : basePrice ?? null) ?? null;
  const total = each === null ? null : (each + (picked?.extra ?? 0)) * qty;

  function pickSize(name: string) {
    setSize(name);
    setErr("");
    // keep the design if it also fits the new size
    if (design && !(fits?.[name] ?? []).some((d) => d.id === design)) setDesign("");
  }

  function add() {
    const text = custom.trim();
    if (hasSizes && !size) return setErr("Pick a size first.");
    if (designs?.required && available.length && !picked) return setErr(`Pick a ${designs.label.toLowerCase()} first.`);
    if (personalize?.required && !text) return setErr(`Fill in "${personalize.label}" first.`);
    setErr("");
    cart.add({ productId, quantity: qty, option: choice || undefined, custom: text || undefined, size: size || undefined, design: picked?.id });
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
      {hasSizes ? (
        <fieldset className="field size-pick">
          <legend>Size</legend>
          <div className="size-chips">
            {sizes!.map((s) => {
              const n = designs && fits ? (fits[s.name] ?? []).length : null;
              return (
                <label key={s.name} className={size === s.name ? "on" : ""}>
                  <input type="radio" name={`size-${productId}`} value={s.name} checked={size === s.name} onChange={() => pickSize(s.name)} />
                  <strong>{s.name}</strong>
                  <span>{money(s.price, currency)}</span>
                  {n !== null && designs ? <em>{n} {designs.label.toLowerCase()}{n === 1 ? "" : "s"}</em> : null}
                </label>
              );
            })}
          </div>
        </fieldset>
      ) : null}

      {designs && fits ? (
        <fieldset className="field design-choose">
          <legend>
            {designs.label}
            {designs.required ? "" : " (optional)"}
            {picked ? <span className="muted">: {picked.name}</span> : null}
          </legend>
          {hasSizes && !size ? (
            <p className="muted small">Pick a size to see the {designs.label.toLowerCase()}s that fit it.</p>
          ) : !available.length ? (
            <p className="muted small">No {designs.label.toLowerCase()}s for this size. Add text below, or ask us about a custom piece.</p>
          ) : (
            <>
              {hasSizes ? <p className="muted small">{available.length} {designs.label.toLowerCase()}{available.length === 1 ? " fits" : "s fit"} the {size}.</p> : null}
              {groups.length > 1 ? (
                <div className="mini-chips" role="group" aria-label={`${designs.label} type`}>
                  <button type="button" className={!group ? "on" : ""} onClick={() => setGroup("")}>All</button>
                  {groups.map((g) => <button key={g} type="button" className={group === g ? "on" : ""} onClick={() => setGroup(g)}>{g}</button>)}
                </div>
              ) : null}
              <div className="design-grid-shop">
                {!designs.required ? (
                  <label className={!design ? "on" : ""}>
                    <input type="radio" name={`design-${productId}`} checked={!design} onChange={() => setDesign("")} />
                    <span className="none">None</span>
                    <span>Plain</span>
                  </label>
                ) : null}
                {shown.map((d) => (
                  <label key={d.id} className={design === d.id ? "on" : ""}>
                    <input type="radio" name={`design-${productId}`} value={d.id} checked={design === d.id} onChange={() => setDesign(d.id)} />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={d.image} alt="" loading="lazy" />
                    <span>{d.name}{d.extra ? ` +${money(d.extra, currency)}` : ""}</span>
                  </label>
                ))}
              </div>
            </>
          )}
        </fieldset>
      ) : null}

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
            {personalize.required || /optional/i.test(personalize.label) ? "" : " (optional)"}
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
        Add to cart{total !== null && (hasSizes || picked?.extra) ? ` · ${money(total, currency)}` : ""}
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
