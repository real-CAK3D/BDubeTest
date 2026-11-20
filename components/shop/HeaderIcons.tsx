"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { savedIds } from "./wishlist";

/** Search, saved items and account, next to the cart. */
export function HeaderIcons() {
  const [saved, setSaved] = useState(0);
  useEffect(() => {
    const sync = () => setSaved(savedIds().length);
    sync();
    window.addEventListener("wishlist", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("wishlist", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  const ic = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  return (
    <>
      <Link href="/shop?find=1" className="head-ic" aria-label="Search the shop" title="Search">
        <svg {...ic}><circle cx="11" cy="11" r="6.5" /><path d="M20 20l-4.2-4.2" /></svg>
      </Link>
      <Link href="/saved" className="head-ic" aria-label={`Saved items${saved ? `, ${saved}` : ""}`} title="Saved items">
        <svg {...ic}><path d="M12 20.5s-7.5-4.6-9.3-9.2C1.4 8 3.4 4.5 7 4.5c2.1 0 3.6 1.2 5 3 1.4-1.8 2.9-3 5-3 3.6 0 5.6 3.5 4.3 6.8-1.8 4.6-9.3 9.2-9.3 9.2z" /></svg>
        {saved ? <b className="cart-count">{saved}</b> : null}
      </Link>
      <Link href="/account" className="head-ic" aria-label="Your account and orders" title="Your orders">
        <svg {...ic}><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" /></svg>
      </Link>
    </>
  );
}
