"use client";
// Saved items ("wishlist"): kept on this phone or computer, and copied to the
// customer's account when they're signed in (see /account).
const KEY = "wishlist:v1";

export function savedIds(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(v) ? v.filter((x) => typeof x === "string").slice(0, 200) : [];
  } catch {
    return [];
  }
}

export function setSaved(ids: string[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify([...new Set(ids)].slice(0, 200)));
  } catch {}
  window.dispatchEvent(new Event("wishlist"));
  // signed-in customers keep the list on their account too (ignored when not signed in)
  fetch("/api/account", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "saved", ids: savedIds() }), keepalive: true }).catch(() => {});
}

export function toggleSaved(id: string) {
  const ids = savedIds();
  setSaved(ids.includes(id) ? ids.filter((x) => x !== id) : [id, ...ids]);
}
