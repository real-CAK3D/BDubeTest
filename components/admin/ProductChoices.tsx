"use client";
import Link from "next/link";
import { useState } from "react";
import type { Design, ProductDesigns } from "@/lib/types";

export type SizeDraft = { name: string; price: string };

const PRESETS: { label: string; sizes: string[] }[] = [
  { label: "Tumbler sizes", sizes: ["16 oz", "20 oz", "30 oz", "40 oz"] },
  { label: "Small / Medium / Large", sizes: ["Small", "Medium", "Large"] },
  { label: "Sign sizes", sizes: ['12" x 6"', '18" x 8"', '24" x 10"'] },
];

/*
 * Sizes with their own prices, and which designs from the library fit each
 * size. A big tumbler might fit 2 designs while a small one fits 10, so each
 * size has its own list.
 */
export function ProductChoices({
  sizes,
  designs,
  library,
  onSizes,
  onDesigns,
}: {
  sizes: SizeDraft[];
  designs: ProductDesigns | null;
  library: Design[];
  onSizes: (s: SizeDraft[], designs: ProductDesigns | null) => void;
  onDesigns: (d: ProductDesigns | null) => void;
}) {
  const [group, setGroup] = useState("");
  const [open, setOpen] = useState<string>("");
  const groups = [...new Set(library.map((d) => d.group).filter(Boolean))];
  const keys = sizes.length ? sizes.map((s) => s.name.trim()).filter(Boolean) : ["*"];
  const shown = library.filter((d) => !group || d.group === group);

  // keep the design lists in step when sizes are renamed, added or removed
  function changeSizes(next: SizeDraft[], renamed?: { from: string; to: string }) {
    if (!designs) return onSizes(next, null);
    const fit: Record<string, string[]> = {};
    const nextKeys = next.length ? next.map((s) => s.name.trim()).filter(Boolean) : ["*"];
    for (const k of nextKeys) {
      const from = renamed && k === renamed.to ? renamed.from : k;
      fit[k] = designs.fit[from] ?? (sizes.length ? [] : designs.fit["*"] ?? []);
    }
    onSizes(next, { ...designs, fit });
  }

  const setFit = (k: string, ids: string[]) => designs && onDesigns({ ...designs, fit: { ...designs.fit, [k]: ids } });
  const toggle = (k: string, id: string) => {
    const cur = designs?.fit[k] ?? [];
    setFit(k, cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]);
  };

  return (
    <>
      <h2>Sizes</h2>
      <p className="hint">Give each size its own price. Leave this empty if the item only comes one way.</p>
      {sizes.map((s, i) => (
        <div key={i} className="tier">
          <input aria-label="Size name" value={s.name} placeholder="e.g. 30 oz" style={{ flex: "1 1 auto", width: "auto" }} onChange={(e) => changeSizes(sizes.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)), { from: s.name.trim(), to: e.target.value.trim() })} />
          <span>$</span>
          <input aria-label={`Price for ${s.name || "this size"}`} inputMode="decimal" value={s.price} placeholder="0.00" onChange={(e) => changeSizes(sizes.map((x, j) => (j === i ? { ...x, price: e.target.value } : x)))} />
          <button type="button" className="b b-ghost b-sm" aria-label={`Remove ${s.name || "size"}`} onClick={() => changeSizes(sizes.filter((_, j) => j !== i))}>✕</button>
        </div>
      ))}
      <div className="row wrap">
        <button type="button" className="b b-sm" onClick={() => changeSizes([...sizes, { name: "", price: sizes.at(-1)?.price ?? "" }])}>Add a size</button>
        {!sizes.length
          ? PRESETS.map((p) => (
              <button key={p.label} type="button" className="b b-ghost b-sm" onClick={() => changeSizes(p.sizes.map((name) => ({ name, price: "" })))}>{p.label}</button>
            ))
          : null}
      </div>

      <h2>Designs</h2>
      <label className="check">
        <input type="checkbox" checked={Boolean(designs)} onChange={(e) => onDesigns(e.target.checked ? { label: "Design", required: false, fit: Object.fromEntries(keys.map((k) => [k, library.filter((d) => d.active).map((d) => d.id)])) } : null)} />
        Customers pick a decal or engraving from your design library
      </label>
      {designs ? (
        <>
          {!library.length ? (
            <p className="alert">Your design library is empty. <Link href="/admin/designs">Add designs</Link> first, then come back to pick which fit this item.</p>
          ) : null}
          <div className="row2">
            <label className="f"><span>What to call it</span><input value={designs.label} onChange={(e) => onDesigns({ ...designs, label: e.target.value })} placeholder="Design" /></label>
            <label className="check"><input type="checkbox" checked={designs.required} onChange={(e) => onDesigns({ ...designs, required: e.target.checked })} /> They must pick one</label>
          </div>
          <div className="row2">
            <label className="check"><input type="checkbox" checked={Boolean(designs.allowUpload)} onChange={(e) => onDesigns({ ...designs, allowUpload: e.target.checked, uploadExtra: designs.uploadExtra ?? 0 })} /> Customers can upload their own logo or artwork</label>
            {designs.allowUpload ? (
              <label className="f">
                <span>Extra charge for their own artwork</span>
                <input inputMode="decimal" defaultValue={((designs.uploadExtra ?? 0) / 100).toFixed(2)} onBlur={(e) => onDesigns({ ...designs, uploadExtra: Math.max(0, Math.round(parseFloat(e.target.value.replace(/[^0-9.]/g, "")) * 100) || 0) })} />
              </label>
            ) : null}
          </div>
          <p className="hint">Tap the designs that fit {sizes.length ? "each size" : "this item"}. Customers only see the ones you pick, so a size with room for fewer designs offers fewer.</p>
          {groups.length > 1 ? (
            <div className="chips" role="group" aria-label="Show designs from">
              <button type="button" className={!group ? "on" : ""} onClick={() => setGroup("")}>All</button>
              {groups.map((g) => <button key={g} type="button" className={group === g ? "on" : ""} onClick={() => setGroup(g)}>{g}</button>)}
            </div>
          ) : null}
          {keys.map((k, i) => {
            const ids = designs.fit[k] ?? [];
            const isOpen = keys.length === 1 || open === k;
            return (
              <div key={k} className="fit-size">
                <button type="button" className="fit-head" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? "" : k)}>
                  <strong>{k === "*" ? "Designs that fit" : k}</strong>
                  <span className="muted">{ids.filter((id) => library.some((d) => d.id === id)).length} of {library.length} designs</span>
                </button>
                {isOpen ? (
                  <>
                    <div className="row wrap">
                      <button type="button" className="b b-ghost b-sm" onClick={() => setFit(k, [...new Set([...ids, ...shown.map((d) => d.id)])])}>Pick all{group ? ` ${group}` : ""}</button>
                      <button type="button" className="b b-ghost b-sm" onClick={() => setFit(k, ids.filter((id) => !shown.some((d) => d.id === id)))}>Clear{group ? ` ${group}` : ""}</button>
                      {i > 0 ? <button type="button" className="b b-ghost b-sm" onClick={() => setFit(k, [...(designs.fit[keys[i - 1]] ?? [])])}>Same as {keys[i - 1]}</button> : null}
                    </div>
                    <div className="design-pick">
                      {shown.map((d) => (
                        <button key={d.id} type="button" aria-pressed={ids.includes(d.id)} className={ids.includes(d.id) ? "on" : ""} onClick={() => toggle(k, d.id)} title={d.name}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={d.image} alt="" />
                          <span>{d.name}</span>
                          {!d.active ? <em>hidden</em> : null}
                        </button>
                      ))}
                    </div>
                  </>
                ) : null}
              </div>
            );
          })}
        </>
      ) : null}
    </>
  );
}
