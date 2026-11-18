"use client";
import { useState } from "react";
import type { GalleryItem, SiteSettings } from "@/lib/types";
import { ImageList } from "./ImageField";
import { useSettings } from "./useSettings";

const blank: GalleryItem = { slug: "", title: "", category: "", description: "", photos: [], featured: true, productSlug: "" };

export function GalleryManager({ initial, products }: { initial: SiteSettings; products: { slug: string; name: string }[] }) {
  const { s, set, bar } = useSettings(initial);
  const [open, setOpen] = useState<number | null>(null);
  const items = s.gallery;
  const cats = [...new Set(items.map((g) => g.category).filter(Boolean))];
  const update = (i: number, patch: Partial<GalleryItem>) => set({ gallery: items.map((g, j) => (j === i ? { ...g, ...patch } : g)) });
  const move = (i: number, d: number) => {
    const next = [...items];
    const [x] = next.splice(i, 1);
    next.splice(i + d, 0, x);
    set({ gallery: next });
  };

  if (open !== null && items[open]) {
    const g = items[open];
    return (
      <>
        <div className="page-head">
          <h1>{g.title || "New piece"}</h1>
          <button className="b b-ghost" onClick={() => setOpen(null)}>Back to list</button>
        </div>
        <div className="editor">
          <section className="panel stack">
            <label className="f"><span>Title</span><input value={g.title} onChange={(e) => update(open, { title: e.target.value, slug: g.slug || "" })} placeholder="e.g. Sea Turtle Tumbler" /></label>
            <label className="f">
              <span>Kind of work</span>
              <input list="work-cats" value={g.category} onChange={(e) => update(open, { category: e.target.value })} placeholder="e.g. Tumblers, Signs, Leather" />
              <datalist id="work-cats">{cats.map((c) => <option key={c} value={c} />)}</datalist>
            </label>
            <label className="f"><span>Description</span><textarea rows={6} value={g.description} onChange={(e) => update(open, { description: e.target.value })} placeholder="What it is, who it was for, how it's made. Leave a blank line between paragraphs." /></label>
            <ImageList value={g.photos} onChange={(photos) => update(open, { photos })} folder="work" />
          </section>
          <section className="panel stack">
            <h2>Where it shows</h2>
            <label className="check"><input type="checkbox" checked={g.featured} onChange={(e) => update(open, { featured: e.target.checked })} /> In the rotating showcase on the home page</label>
            <p className="hint">The showcase appears once at least 3 pieces are in it.</p>
            <h2>Buying one</h2>
            <label className="f">
              <span>Link to a shop item <em className="muted">(optional)</em></span>
              <select value={g.productSlug} onChange={(e) => update(open, { productSlug: e.target.value })}>
                <option value="">No, show &quot;Order one like this&quot; (goes to Contact)</option>
                {products.map((p) => <option key={p.slug} value={p.slug}>{p.name}</option>)}
              </select>
            </label>
            <h2>Web address</h2>
            <label className="f"><span>/gallery/…</span><input value={g.slug} onChange={(e) => update(open, { slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, "-") })} placeholder="made from the title if empty" /></label>
            <div className="row wrap">
              {g.slug ? <a className="b b-ghost b-sm" href={`/gallery/${g.slug}`} target="_blank" rel="noreferrer">View</a> : null}
              <button className="b b-danger b-sm" onClick={() => { if (confirm(`Delete "${g.title || "this piece"}"?`)) { set({ gallery: items.filter((_, j) => j !== open) }); setOpen(null); } }}>Delete piece</button>
            </div>
          </section>
        </div>
        {bar}
      </>
    );
  }

  return (
    <>
      <div className="page-head">
        <h1>Our work</h1>
        <button className="b b-primary" onClick={() => { set({ gallery: [{ ...blank }, ...items] }); setOpen(0); }}>Add a piece</button>
      </div>
      <p className="muted lead">Finished pieces you want to show off, for sale or not. Customers see them under &quot;Our work&quot;, and the ones you choose spin in the 3D showcase on the home page. Use the arrows to change the order.</p>
      <section className="panel stack">
        <div className="row2">
          <label className="f"><span>Page heading</span><input value={s.galleryHeading} onChange={(e) => set({ galleryHeading: e.target.value })} /></label>
          <label className="f"><span>Intro text</span><input value={s.galleryText} onChange={(e) => set({ galleryText: e.target.value })} /></label>
        </div>
      </section>
      {items.length ? (
        <ul className="plist">
          {items.map((g, i) => (
            <li key={i}>
              <button className="plist-main" onClick={() => setOpen(i)}>
                <span className="plist-thumb">{/* eslint-disable-next-line @next/next/no-img-element */}{g.photos[0] ? <img src={g.photos[0]} alt="" /> : null}</span>
                <span className="plist-name">
                  <strong>{g.title || "Untitled"}</strong>
                  <span className="muted">{[g.category, `${g.photos.length} photo${g.photos.length === 1 ? "" : "s"}`, g.featured ? "In showcase" : null].filter(Boolean).join(", ")}</span>
                </span>
              </button>
              <span className="order-btns">
                <button className="b b-ghost b-sm" disabled={i === 0} onClick={() => move(i, -1)} aria-label={`Move ${g.title} up`}>↑</button>
                <button className="b b-ghost b-sm" disabled={i === items.length - 1} onClick={() => move(i, 1)} aria-label={`Move ${g.title} down`}>↓</button>
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="panel"><p>Nothing here yet. Tap Add a piece and choose some photos from your phone.</p></div>
      )}
      {bar}
    </>
  );
}
