"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Product } from "@/lib/types";
import { api } from "./api";

/** Shop categories: add, rename, put in order, remove. */
export function CategoryManager({ initial, products, onClose }: { initial: string[]; products: Product[]; onClose: () => void }) {
  const router = useRouter();
  const extra = [...new Set(products.map((p) => p.category).filter((c) => c && !initial.includes(c)))];
  const [list, setList] = useState([...initial, ...extra]);
  const [names, setNames] = useState<Record<number, string>>({});
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const count = (c: string) => products.filter((p) => p.category === c).length;

  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= list.length) return;
    const next = [...list];
    [next[i], next[j]] = [next[j], next[i]];
    setList(next);
  };

  async function save(next = list) {
    setBusy(true);
    setMsg("");
    try {
      await api("/api/admin/settings", "PUT", { categories: next });
      setMsg("Saved");
      router.refresh();
    } catch (e) {
      setMsg((e as Error).message);
    }
    setBusy(false);
  }

  async function rename(i: number) {
    const from = list[i];
    const to = (names[i] ?? from).trim();
    if (!to || to === from) return;
    setBusy(true);
    try {
      if (count(from)) await api("/api/admin/products", "PATCH", { action: "renameCategory", from, to });
      const next = list.map((c, j) => (j === i ? to : c)).filter((c, j, a) => a.indexOf(c) === j);
      setList(next);
      setNames({});
      await save(next);
      setTimeout(() => window.location.reload(), 300);
    } catch (e) {
      setMsg((e as Error).message);
    }
    setBusy(false);
  }

  async function remove(i: number) {
    const c = list[i];
    const n = count(c);
    let to = "";
    if (n) {
      const others = list.filter((x) => x !== c);
      const pick = prompt(`${n} item${n === 1 ? " is" : "s are"} in ${c}. Move ${n === 1 ? "it" : "them"} to which category? (Type one of: ${others.join(", ") || "none yet"}, or leave empty for no category)`);
      if (pick === null) return;
      to = others.find((x) => x.toLowerCase() === pick.trim().toLowerCase()) ?? "";
    } else if (!confirm(`Remove the ${c} category?`)) return;
    setBusy(true);
    try {
      if (n) await api("/api/admin/products", "PATCH", { action: "renameCategory", from: c, to });
      const next = list.filter((_, j) => j !== i);
      setList(next);
      await save(next);
      if (n) setTimeout(() => window.location.reload(), 300);
    } catch (e) {
      setMsg((e as Error).message);
    }
    setBusy(false);
  }

  return (
    <section className="panel stack">
      <div className="panel-head">
        <h2>Categories</h2>
        <button className="b b-ghost b-sm" onClick={onClose}>Done</button>
      </div>
      <p className="hint">The shop shows categories in this order. Renaming one moves its items with it.</p>
      <ul className="order-list">
        {list.map((c, i) => (
          <li key={c + i}>
            <span className="order-btns">
              <button type="button" className="b b-ghost b-sm" aria-label={`Move ${c} up`} disabled={i === 0} onClick={() => move(i, -1)}>↑</button>
              <button type="button" className="b b-ghost b-sm" aria-label={`Move ${c} down`} disabled={i === list.length - 1} onClick={() => move(i, 1)}>↓</button>
            </span>
            <input aria-label="Category name" value={names[i] ?? c} onChange={(e) => setNames({ ...names, [i]: e.target.value })} onBlur={() => rename(i)} onKeyDown={(e) => e.key === "Enter" && (e.currentTarget as HTMLInputElement).blur()} />
            <span className="muted small">{count(c)} item{count(c) === 1 ? "" : "s"}</span>
            <button type="button" className="b b-ghost b-sm" aria-label={`Remove ${c}`} onClick={() => remove(i)}>✕</button>
          </li>
        ))}
      </ul>
      <div className="row wrap">
        <button
          type="button"
          className="b b-sm"
          onClick={() => {
            const n = prompt("New category name (e.g. Home decor)")?.trim().slice(0, 40);
            if (n && !list.includes(n)) setList([...list, n]);
          }}
        >
          Add a category
        </button>
        <button type="button" className="b b-primary b-sm" disabled={busy} onClick={() => save()}>{busy ? "Saving…" : "Save order"}</button>
        {msg ? <span className="muted small" role="status">{msg}</span> : null}
      </div>
    </section>
  );
}
