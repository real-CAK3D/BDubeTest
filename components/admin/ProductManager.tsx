"use client";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { money, toCents } from "@/lib/format";
import { fromPrice } from "@/lib/pricing";
import type { Design, Product } from "@/lib/types";
import { api } from "./api";
import { CategoryManager } from "./CategoryManager";
import { ImageList } from "./ImageField";
import { PreviewEditor } from "./PreviewEditor";
import { ProductChoices, type SizeDraft } from "./ProductChoices";

type Draft = Omit<Product, "price" | "compareAtPrice" | "stock" | "id" | "slug" | "createdAt" | "updatedAt"> & {
  id?: string;
  price: string;
  compareAtPrice: string;
  stock: string;
  optionValues: string;
  sizesDraft: SizeDraft[];
};

const blank: Draft = { stripeProductId: undefined, name: "", price: "", compareAtPrice: "", summary: "", description: "", category: "", images: [], stock: "", madeToOrder: false, featured: false, active: true, option: null, personalize: null, optionValues: "", sizes: null, designs: null, sizesDraft: [] };

function toDraft(p: Product): Draft {
  return {
    ...p,
    price: (p.price / 100).toFixed(2),
    compareAtPrice: p.compareAtPrice ? (p.compareAtPrice / 100).toFixed(2) : "",
    stock: p.stock === null ? "" : String(p.stock),
    option: p.option ?? null,
    optionValues: p.option?.values.join(", ") ?? "",
    sizesDraft: (p.sizes ?? []).map((s) => ({ name: s.name, price: (s.price / 100).toFixed(2) })),
    designs: p.designs ?? null,
  };
}

export function ProductManager({ initial, currency, views, lowAt, stripeOn, stripeTest, library, categories: savedCats }: { initial: Product[]; currency: string; views: Record<string, number>; lowAt: number; stripeOn: boolean; stripeTest: boolean; library: Design[]; categories: string[] }) {
  const router = useRouter();
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState("");
  async function syncStripe() {
    setSyncing(true);
    setSyncMsg("");
    try {
      setSyncMsg((await api<{ message: string }>("/api/admin/stripe", "POST", { action: "sync" })).message);
      router.refresh();
      setTimeout(() => window.location.reload(), 600);
    } catch (e) {
      setSyncMsg((e as Error).message);
    }
    setSyncing(false);
  }
  const [list, setList] = useState(initial);
  const [editing, setEditing] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");
  const [cats, setCats] = useState(savedCats);
  const [catFilter, setCatFilter] = useState("");
  const [catsOpen, setCatsOpen] = useState(false);
  const categories = useMemo(() => [...new Set([...cats, ...list.map((p) => p.category).filter(Boolean)])], [cats, list]);
  const shown = list.filter((p) => (!q || (p.name + p.category).toLowerCase().includes(q.toLowerCase())) && (!catFilter || (catFilter === "-" ? !p.category : p.category === catFilter)));

  async function newCategory(): Promise<string> {
    const name = prompt("Name of the new category (e.g. Drinkware)")?.trim().slice(0, 40);
    if (!name) return "";
    if (!cats.includes(name)) {
      const next = [...cats, name];
      setCats(next);
      await api("/api/admin/settings", "PUT", { categories: next }).catch(() => {});
    }
    return name;
  }

  async function save() {
    if (!editing) return;
    if (!editing.name.trim()) return setErr("Give the item a name.");
    const sizes = editing.sizesDraft.filter((s) => s.name.trim() || s.price.trim());
    if (sizes.some((s) => !s.name.trim())) return setErr("Every size needs a name.");
    if (sizes.some((s) => !toCents(s.price))) return setErr("Every size needs a price.");
    if (!sizes.length && !toCents(editing.price)) return setErr("Add a price.");
    setBusy(true);
    setErr("");
    const label = editing.option?.label?.trim() || "";
    const body = {
      ...editing,
      price: sizes.length ? 0 : toCents(editing.price),
      sizes: sizes.length ? sizes.map((s) => ({ name: s.name.trim(), price: toCents(s.price) })) : null,
      compareAtPrice: editing.compareAtPrice ? toCents(editing.compareAtPrice) : null,
      stock: editing.stock.trim() === "" ? null : Number(editing.stock),
      option: label ? { label, values: editing.optionValues.split(",").map((v) => v.trim()).filter(Boolean) } : null,
    };
    try {
      const saved = await api<Product>("/api/admin/products", editing.id ? "PUT" : "POST", body);
      setList((l) => (editing.id ? l.map((p) => (p.id === saved.id ? saved : p)) : [saved, ...l]));
      setEditing(null);
      router.refresh();
    } catch (e) {
      setErr((e as Error).message);
    }
    setBusy(false);
  }

  async function remove(p: { id?: string; name: string }) {
    if (!p.id || !confirm(`Delete "${p.name}"? This can't be undone.`)) return;
    await api(`/api/admin/products?id=${p.id}`, "DELETE");
    setList((l) => l.filter((x) => x.id !== p.id));
    setEditing(null);
  }

  async function quick(p: Product, patch: Partial<Product>) {
    const saved = await api<Product>("/api/admin/products", "PUT", { ...p, ...patch });
    setList((l) => l.map((x) => (x.id === saved.id ? saved : x)));
  }

  if (editing) {
    const set = (patch: Partial<Draft>) => setEditing({ ...editing, ...patch });
    return (
      <>
        <div className="page-head">
          <h1>{editing.id ? "Edit item" : "New item"}</h1>
          <button className="b b-ghost" onClick={() => setEditing(null)}>Cancel</button>
        </div>
        {editing.stripeProductId ? (
          <p className="alert">
            This item comes from Stripe. Its name, price, description and photos update from Stripe; change them there so they don&apos;t get overwritten.{" "}
            <a href={`https://dashboard.stripe.com/${stripeTest ? "test/" : ""}products/${editing.stripeProductId}`} target="_blank" rel="noreferrer">Edit in Stripe</a>
          </p>
        ) : null}
        <div className="editor">
          <section className="panel stack">
            <label className="f"><span>Name</span><input value={editing.name} onChange={(e) => set({ name: e.target.value })} placeholder="e.g. Challenge Coin Display" /></label>
            <div className="row2">
              {editing.sizesDraft.length ? (
                <div className="f"><span>Price</span><p className="hint">Set for each size below.</p></div>
              ) : (
                <label className="f"><span>Price</span><input inputMode="decimal" value={editing.price} onChange={(e) => set({ price: e.target.value })} placeholder="45.00" /></label>
              )}
              <label className="f"><span>Was price <em className="muted">(optional, shows a sale)</em></span><input inputMode="decimal" value={editing.compareAtPrice} onChange={(e) => set({ compareAtPrice: e.target.value })} /></label>
            </div>
            <label className="f"><span>Short description <em className="muted">(shown on the shop page)</em></span><input value={editing.summary} onChange={(e) => set({ summary: e.target.value })} maxLength={300} placeholder="One line that sells it" /></label>
            <label className="f"><span>Full description</span><textarea rows={7} value={editing.description} onChange={(e) => set({ description: e.target.value })} placeholder={"Materials, size, care, how it's made.\n\nLeave a blank line between paragraphs."} /></label>
            <label className="f">
              <span>Category</span>
              <select value={editing.category} onChange={async (e) => set({ category: e.target.value === "+new" ? (await newCategory()) || editing.category : e.target.value })}>
                <option value="">No category</option>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                <option value="+new">+ New category…</option>
              </select>
            </label>
            <ImageList value={editing.images} onChange={(images) => set({ images })} folder="products" />
          </section>
          <section className="panel stack">
            <h2>Stock</h2>
            <label className="f"><span>How many do you have? <em className="muted">(leave empty for unlimited)</em></span><input inputMode="numeric" value={editing.stock} onChange={(e) => set({ stock: e.target.value.replace(/[^0-9]/g, "") })} /></label>
            <label className="check"><input type="checkbox" checked={editing.madeToOrder} onChange={(e) => set({ madeToOrder: e.target.checked })} /> Made to order</label>
            <ProductChoices
              sizes={editing.sizesDraft}
              designs={editing.designs ?? null}
              library={library}
              onSizes={(sizesDraft, designs) => set({ sizesDraft, designs })}
              onDesigns={(designs) => set({ designs })}
            />
            <PreviewEditor value={editing.preview ?? null} onChange={(preview) => set({ preview })} photos={editing.images} library={library} />
            <h2>Other choice</h2>
            <p className="hint">One more pick-list if needed: color, wood, finish...</p>
            <label className="f"><span>Choice name</span><input value={editing.option?.label ?? ""} onChange={(e) => set({ option: { label: e.target.value, values: [] } })} placeholder="e.g. Color" /></label>
            <label className="f"><span>Options, separated by commas</span><input value={editing.optionValues} onChange={(e) => set({ optionValues: e.target.value })} placeholder="Black, Brown, Natural" /></label>
            <h2>Personalization</h2>
            <label className="check">
              <input type="checkbox" checked={Boolean(editing.personalize)} onChange={(e) => set({ personalize: e.target.checked ? { label: "Engraving text", maxLength: 40, required: false } : null })} />
              Customers can type text to engrave or add
            </label>
            {editing.personalize ? (
              <>
                <div className="row2">
                  <label className="f"><span>Box label</span><input value={editing.personalize.label} onChange={(e) => set({ personalize: { ...editing.personalize!, label: e.target.value } })} placeholder="e.g. Name and dates to engrave" /></label>
                  <label className="f"><span>Most characters</span><input inputMode="numeric" value={editing.personalize.maxLength} onChange={(e) => set({ personalize: { ...editing.personalize!, maxLength: Number(e.target.value.replace(/\D/g, "")) || 0 } })} /></label>
                </div>
                <label className="check"><input type="checkbox" checked={editing.personalize.required} onChange={(e) => set({ personalize: { ...editing.personalize!, required: e.target.checked } })} /> Required (they can&apos;t add it to the cart without it)</label>
                <p className="hint">Their text shows on the order, highlighted, so you can copy it straight into your engraving software.</p>
              </>
            ) : null}
            <h2>Visibility</h2>
            <label className="check"><input type="checkbox" checked={editing.active} onChange={(e) => set({ active: e.target.checked })} /> Show in the shop</label>
            <label className="check"><input type="checkbox" checked={editing.featured} onChange={(e) => set({ featured: e.target.checked })} /> Feature at the top</label>
          </section>
        </div>
        <div className="savebar">
          {editing.id ? <button className="b b-danger" onClick={() => remove(editing)}>Delete item</button> : <span />}
          {err ? <span className="err">{err}</span> : null}
          <button className="b b-primary" onClick={save} disabled={busy}>{busy ? "Saving…" : editing.id ? "Save changes" : "Add item"}</button>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="page-head">
        <h1>Products</h1>
        <div className="row wrap">
          {stripeOn ? <button className="b" onClick={syncStripe} disabled={syncing}>{syncing ? "Syncing…" : "Sync from Stripe"}</button> : null}
          {stripeOn ? <a className="b b-ghost" href={`https://dashboard.stripe.com/${stripeTest ? "test/" : ""}products/create`} target="_blank" rel="noreferrer">Add in Stripe</a> : null}
          <button className="b" onClick={() => setCatsOpen(!catsOpen)}>Categories</button>
          <a className="b b-ghost" href="/admin/designs">Designs</a>
          <button className="b b-primary" onClick={() => { setErr(""); setEditing({ ...blank }); }}>Add item</button>
        </div>
      </div>
      {catsOpen ? <CategoryManager initial={cats} products={list} onClose={() => setCatsOpen(false)} /> : null}
      {syncMsg ? <p className="alert" role="status">{syncMsg}</p> : null}
      {list.length > 6 ? <input className="search" placeholder="Search items" value={q} onChange={(e) => setQ(e.target.value)} /> : null}
      {categories.length > 1 ? (
        <div className="chips" role="group" aria-label="Show category">
          <button type="button" className={!catFilter ? "on" : ""} onClick={() => setCatFilter("")}>All ({list.length})</button>
          {categories.map((c) => <button key={c} type="button" className={catFilter === c ? "on" : ""} onClick={() => setCatFilter(c)}>{c} ({list.filter((p) => p.category === c).length})</button>)}
          {list.some((p) => !p.category) ? <button type="button" className={catFilter === "-" ? "on" : ""} onClick={() => setCatFilter("-")}>No category</button> : null}
        </div>
      ) : null}
      {shown.length ? (
        <ul className="plist">
          {shown.map((p) => (
            <li key={p.id} className={p.active ? "" : "hidden-item"}>
              <button className="plist-main" onClick={() => { setErr(""); setEditing(toDraft(p)); }}>
                <span className="plist-thumb">{/* eslint-disable-next-line @next/next/no-img-element */}{p.images[0] ? <img src={p.images[0]} alt="" /> : null}</span>
                <span className="plist-name">
                  <strong>{p.name}</strong>
                  <span className="muted">{[p.stripeProductId ? "From Stripe" : null, p.category, p.active ? null : "Hidden", p.featured ? "Featured" : null].filter(Boolean).join(", ")}</span>
                </span>
                <span className="plist-meta">
                  <strong>{p.sizes?.length ? `From ${money(fromPrice(p), currency)}` : money(p.price, currency)}</strong>
                  {p.sizes?.length ? <span className="muted">{p.sizes.length} sizes{p.designs ? ", designs" : ""}</span> : null}
                  <span className={p.stock !== null && p.stock <= lowAt ? "warn-text" : "muted"}>{p.stock === null ? (p.madeToOrder ? "Made to order" : "Unlimited") : `${p.stock} in stock`}</span>
                  <span className="muted">{views[p.id] ?? 0} views</span>
                </span>
              </button>
              <label className="switch" title="Show in shop">
                <input type="checkbox" checked={p.active} onChange={(e) => quick(p, { active: e.target.checked })} aria-label={`Show ${p.name} in shop`} />
                <span />
              </label>
            </li>
          ))}
        </ul>
      ) : (
        <div className="panel"><p>No items yet. Add your first one and it shows up in the shop right away.</p></div>
      )}
    </>
  );
}
