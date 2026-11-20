"use client";
import { useEffect, useState } from "react";
import { savedIds, toggleSaved } from "./wishlist";

/** The heart on an item: save it for later. */
export function WishButton({ id, name, big = false }: { id: string; name: string; big?: boolean }) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const sync = () => setOn(savedIds().includes(id));
    sync();
    window.addEventListener("wishlist", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("wishlist", sync);
      window.removeEventListener("storage", sync);
    };
  }, [id]);
  return (
    <button
      type="button"
      className={`wish ${on ? "on" : ""} ${big ? "wish-big" : ""}`}
      aria-pressed={on}
      aria-label={big ? undefined : on ? `Saved: remove ${name}` : `Save ${name} for later`}
      title={on ? "Saved" : "Save for later"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleSaved(id);
      }}
    >
      <svg width={big ? 22 : 18} height={big ? 22 : 18} viewBox="0 0 24 24" aria-hidden>
        <path d="M12 20.5s-7.5-4.6-9.3-9.2C1.4 8 3.4 4.5 7 4.5c2.1 0 3.6 1.2 5 3 1.4-1.8 2.9-3 5-3 3.6 0 5.6 3.5 4.3 6.8-1.8 4.6-9.3 9.2-9.3 9.2z" fill={on ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      </svg>
      {big ? <span>{on ? "Saved" : "Save for later"}</span> : null}
    </button>
  );
}
