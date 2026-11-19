"use client";
import { useRef, useState } from "react";
import { money, toCents } from "@/lib/format";
import type { Design, Product, SiteSettings } from "@/lib/types";
import { api, uploadImage } from "./api";
import { ImageField } from "./ImageField";
import { useSettings } from "./useSettings";

const idFrom = (s: string) => s.toLowerCase().replace(/\.[a-z0-9]+$/, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "design";
const nameFrom = (file: string) => file.replace(/\.[a-z0-9]+$/i, "").replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()).slice(0, 60);

/*
 * The design library: decals and engraving artwork. Each design can be
 * offered on any item and size; that's picked here ("Fits on") or on the item
 * itself in Products.
 */
export function DesignLibrary({ settings, products: initialProducts }: { settings: SiteSettings; products: Product[] }) {
  const { s, set, save, bar, dirty } = useSettings(settings);
  const [products, setProducts] = useState(initialProducts);
  const [changed, setChanged] = useState<Set<string>>(new Set());
  const [openId, setOpenId] = useState("");
  const [group, setGroup] = useState("");
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState("");
  const [msg, setMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const list = s.designs;
  const groups = [...new Set(list.map((d) => d.group).filter(Boolean))];
  const shown = list.filter((d) => (!group || d.group === group) && (!q || (d.name + d.group).toLowerCase().includes(q.toLowerCase())));
  const withDesigns = products.filter((p) => p.designs);
  const uses = (id: string) => withDesigns.reduce((n, p) => n + Object.values(p.designs!.fit).filter((ids) => ids.includes(id)).length, 0);

  const setDesign = (id: string, patch: Partial<Design>) => set({ designs: list.map((d) => (d.id === id ? { ...d, ...patch } : d)) });
  const move = (id: string, dir: number) => {
    const i = list.findIndex((d) => d.id === id);
    const j = i + dir;
    if (j < 0 || j >= list.length) return;
    const next = [...list];
    [next[i], next[j]] = [next[j], next[i]];
    set({ designs: next });
  };

  async function add(files: FileList | null) {
    if (!files?.length) return;
    setMsg("");
    const added: Design[] = [];
    const taken = new Set(list.map((d) => d.id));
    for (const f of Array.from(files).slice(0, 20)) {
      setBusy(`Uploading ${f.name}…`);
      try {
        const image = await uploadImage(f, "designs");
        let id = idFrom(f.name);
        for (let n = 2; taken.has(id); n++) id = `${idFrom(f.name)}-${n}`;
        taken.add(id);
        added.push({ id, name: nameFrom(f.name), image, group: group || "", extra: 0, active: true });
      } catch (e) {
        setMsg((e as Error).message);
      }
    }
    setBusy("");
    if (added.length) {
      set({ designs: [...list, ...added] });
      if (added.length === 1) setOpenId(added[0].id);
      setMsg(`${added.length} design${added.length === 1 ? "" : "s"} added. Pick which items ${added.length === 1 ? "it fits" : "they fit"}, then save.`);
    }
    if (fileRef.current) fileRef.current.value = "";
  }

  function setFits(p: Product, size: string, id: string, on: boolean) {
    if (!p.designs) return;
    const cur = p.designs.fit[size] ?? [];
    const next = { ...p, designs: { ...p.designs, fit: { ...p.designs.fit, [size]: on ? [...new Set([...cur, id])] : cur.filter((x) => x !== id) } } };
    setProducts((l) => l.map((x) => (x.id === p.id ? next : x)));
    setChanged((c) => new Set(c).add(p.id));
  }

  // the design on every size of one item, in one go
  function setFitsAll(p: Product, id: string, on: boolean) {
    if (!p.designs) return;
    const fit = Object.fromEntries(Object.entries(p.designs.fit).map(([k, ids]) => [k, on ? [...new Set([...ids, id])] : ids.filter((x) => x !== id)]));
    setProducts((l) => l.map((x) => (x.id === p.id ? { ...p, designs: { ...p.designs!, fit } } : x)));
    setChanged((c) => new Set(c).add(p.id));
  }

  function remove(d: Design) {
    if (!confirm(`Delete the "${d.name}" design? It will be taken off every item.`)) return;
    set({ designs: list.filter((x) => x.id !== d.id) });
    for (const p of withDesigns) if (Object.values(p.designs!.fit).some((ids) => ids.includes(d.id))) setFitsAll(p, d.id, false);
    setOpenId("");
  }

  async function saveAll() {
    setBusy("Saving…");
    try {
      for (const id of changed) {
        const p = products.find((x) => x.id === id);
        if (p) await api("/api/admin/products", "PUT", p);
      }
      setChanged(new Set());
      if (dirty) await save();
      setMsg("Saved");
    } catch (e) {
      setMsg((e as Error).message);
    }
    setBusy("");
  }

  const open = list.find((d) => d.id === openId);

  return (
    <>
      <div className="page-head">
        <h1>Designs</h1>
        <div className="row wrap">
          <button className="b b-primary" onClick={() => fileRef.current?.click()} disabled={Boolean(busy)}>{busy || "Add designs"}</button>
        </div>
      </div>
      <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => add(e.target.files)} />
      <p className="muted lead">
        Your decals and engraving artwork.
        Add several at once from your phone&apos;s photos; PNGs with a see-through background look best.
      </p>
      {msg ? <p className="alert" role="status">{msg}</p> : null}
      {list.length > 8 ? <input className="search" placeholder="Search designs" value={q} onChange={(e) => setQ(e.target.value)} /> : null}
      {groups.length > 1 ? (
        <div className="chips" role="group" aria-label="Show group">
          <button type="button" className={!group ? "on" : ""} onClick={() => setGroup("")}>All ({list.length})</button>
          {groups.map((g) => <button key={g} type="button" className={group === g ? "on" : ""} onClick={() => setGroup(g)}>{g} ({list.filter((d) => d.group === g).length})</button>)}
        </div>
      ) : null}

      {open ? (
        <section className="panel stack">
          <div className="panel-head">
            <h2>{open.name || "Design"}</h2>
            <button className="b b-ghost b-sm" onClick={() => setOpenId("")}>Close</button>
          </div>
          <div className="row2">
            <ImageField label="Artwork" value={open.image} onChange={(image) => setDesign(open.id, { image })} folder="designs" shape="square" />
            <div className="stack">
              <label className="f"><span>Name</span><input value={open.name} onChange={(e) => setDesign(open.id, { name: e.target.value })} /></label>
              <label className="f">
                <span>Group <em className="muted">(Military, Patriotic, Family...)</em></span>
                <input list="design-groups" value={open.group} onChange={(e) => setDesign(open.id, { group: e.target.value })} />
                <datalist id="design-groups">{groups.map((g) => <option key={g} value={g} />)}</datalist>
              </label>
              <label className="f"><span>Extra charge <em className="muted">(added to the item price, 0 for none)</em></span><input inputMode="decimal" defaultValue={(open.extra / 100).toFixed(2)} key={open.id} onBlur={(e) => setDesign(open.id, { extra: toCents(e.target.value) })} /></label>
              <label className="f">
                <span>Laser notes <em className="muted">(only you see this; shows on orders)</em></span>
                <textarea rows={2} maxLength={300} value={open.note ?? ""} onChange={(e) => setDesign(open.id, { note: e.target.value })} placeholder={"e.g. 2.5\" wide, 60% power / 300 speed, file: flag-v2.lbrn"} />
              </label>
              <label className="check"><input type="checkbox" checked={open.active} onChange={(e) => setDesign(open.id, { active: e.target.checked })} /> Offer this design</label>
            </div>
          </div>
          <h2>Fits on</h2>
          {withDesigns.length ? (
            <ul className="order-list">
              {withDesigns.map((p) => (
                <li key={p.id}>
                  <strong style={{ flex: "1 1 10rem" }}>{p.name}{p.active ? "" : <span className="muted small"> (hidden)</span>}</strong>
                  {Object.keys(p.designs!.fit).length > 1 ? (
                    <button
                      type="button"
                      className="b b-ghost b-sm"
                      onClick={() => {
                        const all = Object.keys(p.designs!.fit).every((k) => p.designs!.fit[k].includes(open.id));
                        setFitsAll(p, open.id, !all);
                      }}
                    >
                      {Object.keys(p.designs!.fit).every((k) => p.designs!.fit[k].includes(open.id)) ? "No sizes" : "All sizes"}
                    </button>
                  ) : null}
                  {Object.keys(p.designs!.fit).map((k) => (
                    <label key={k} className="check small">
                      <input type="checkbox" checked={p.designs!.fit[k].includes(open.id)} onChange={(e) => setFits(p, k, open.id, e.target.checked)} />
                      {k === "*" ? "Fits" : k}
                    </label>
                  ))}
                </li>
              ))}
            </ul>
          ) : (
            <p className="hint">No items offer designs yet. Open an item in Products and tick &quot;Customers pick a decal or engraving&quot;.</p>
          )}
          <div className="row wrap">
            <button className="b b-ghost b-sm" onClick={() => move(open.id, -1)}>Move earlier</button>
            <button className="b b-ghost b-sm" onClick={() => move(open.id, 1)}>Move later</button>
            <button className="b b-danger b-sm" onClick={() => remove(open)}>Delete design</button>
          </div>
        </section>
      ) : null}

      {shown.length ? (
        <ul className="design-grid">
          {shown.map((d) => (
            <li key={d.id} className={d.active ? "" : "hidden-item"}>
              <button type="button" onClick={() => setOpenId(d.id)} className={openId === d.id ? "on" : ""}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={d.image} alt="" />
                <strong>{d.name}</strong>
                <span className="muted small">
                  {[d.group, d.extra ? `+${money(d.extra, s.currency)}` : "", `fits ${uses(d.id)} size${uses(d.id) === 1 ? "" : "s"}`, d.active ? "" : "hidden"].filter(Boolean).join(" · ")}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="panel"><p>No designs yet. Tap <strong>Add designs</strong> to upload your decal and engraving artwork.</p></div>
      )}
      {dirty || changed.size ? (
        <div className="savebar dirty">
          <span className="muted">You have unsaved changes</span>
          <button className="b b-primary" onClick={saveAll} disabled={Boolean(busy)}>{busy || "Save changes"}</button>
        </div>
      ) : (
        bar
      )}
    </>
  );
}
