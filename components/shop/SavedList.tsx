"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { money } from "@/lib/format";
import { useCart } from "./CartProvider";
import { WishButton } from "./WishButton";
import { savedIds } from "./wishlist";

/** Items saved with the heart, kept on this device (and on the account when signed in). */
export function SavedList() {
  const { products } = useCart();
  const [ids, setIds] = useState<string[] | null>(null);
  useEffect(() => {
    const sync = () => setIds(savedIds());
    sync();
    window.addEventListener("wishlist", sync);
    return () => window.removeEventListener("wishlist", sync);
  }, []);
  if (ids === null) return null;
  const items = ids.map((id) => products.find((p) => p.id === id)).filter((p): p is NonNullable<typeof p> => Boolean(p));
  if (!items.length)
    return (
      <div className="empty">
        <p>Nothing saved yet. Tap the ♥ on anything you like to keep it here.</p>
        <Link href="/shop" className="btn">Browse the shop</Link>
      </div>
    );
  return (
    <ul className="saved-list">
      {items.map((p) => (
        <li key={p.id}>
          <Link href={`/product/${p.slug}`} className="saved-item">
            {p.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.image} alt="" />
            ) : (
              <span className="saved-noimg" />
            )}
            <span>
              <strong>{p.name}</strong>
              <span className="muted">{money(p.price, "usd")}{p.stock === 0 ? " · sold out" : ""}</span>
            </span>
          </Link>
          <WishButton id={p.id} name={p.name} />
        </li>
      ))}
    </ul>
  );
}
