"use client";
import { useState } from "react";
import { money } from "@/lib/format";
import type { Blank } from "@/lib/types";
import { api } from "./api";

const id = () => Math.random().toString(36).slice(2, 10);

/** Plain stock waiting to be engraved: counts, low alerts, what each costs. */
export function BlanksManager({ initial, used }: { initial: Blank[]; used: Record<string, string[]> }) {
  const [list, setList] = useState(initial);
  const [saved, setSaved] = useState(JSON.stringify(initial));
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const dirty = JSON.stringify(list) !== saved;
  const up = (i: number, patch: Partial<Blank>) => setList((l) => l.map((b, j) => (j === i ? { ...b, ...patch } : b)));
  const n = (v: string) => Math.max(0, Number(v.replace(/[^0-9.]/g, "")) || 0);

  async function save(next = list) {
    setBusy(true);
    setMsg("");
    try {
      const r = await api<Blank[]>("/api/admin/blanks", "PUT", next);
      setList(r);
      setSaved(JSON.stringify(r));
      setMsg("Saved");
    } catch (e) {
      setMsg((e as Error).message);
    }
    setBusy(false);
  }

  const value = list.reduce((t, b) => t + b.qty * b.cost, 0);
  const lowOnes = list.filter((b) => b.qty <= b.low).length;

  return (
    <>
      <div className="page-head">
        <h1>Blanks</h1>
        <button className="b b-primary" onClick={() => setList([...list, { id: id(), name: "", qty: 0, low: 2, cost: 0, note: "" }])}>Add a blank</button>
      </div>
      <p className="muted lead">
        The plain pieces you engrave: tumblers, slate, leather, wood. Link each one to an item or size under Products (the Blank box next to each size). Every sale takes one off here, you get a notification when one runs low, and a size with none left shows as sold out in the shop.
      </p>
      {list.length ? (
        <div className="tiles">
          <div className="tile"><span>Kinds of blanks</span><strong>{list.length}</strong></div>
          <div className="tile"><span>Running low</span><strong className={lowOnes ? "neg" : ""}>{lowOnes}</strong></div>
          <div className="tile"><span>Worth on the shelf</span><strong>{money(value)}</strong></div>
        </div>
      ) : null}
      <ul className="blanks">
        {list.map((b, i) => (
          <li key={b.id} className={`panel ${b.qty <= b.low ? "low" : ""}`}>
            <div className="row2">
              <label className="f"><span>Name</span><input value={b.name} onChange={(e) => up(i, { name: e.target.value })} placeholder="e.g. Stanley 40 oz, black" /></label>
              <div className="f">
                <span>On the shelf</span>
                <div className="stepper-a">
                  <button type="button" className="b b-sm" onClick={() => up(i, { qty: Math.max(0, b.qty - 1) })} aria-label="One fewer">−</button>
                  <input inputMode="numeric" value={b.qty} onChange={(e) => up(i, { qty: n(e.target.value) })} aria-label="How many" />
                  <button type="button" className="b b-sm" onClick={() => up(i, { qty: b.qty + 1 })} aria-label="One more">+</button>
                  <button type="button" className="b b-ghost b-sm" onClick={() => { const add = Number(prompt("How many arrived?") || 0); if (add > 0) up(i, { qty: b.qty + Math.round(add) }); }}>+ Shipment</button>
                </div>
              </div>
            </div>
            <div className="row2">
              <label className="f"><span>Warn me at</span><input inputMode="numeric" value={b.low} onChange={(e) => up(i, { low: n(e.target.value) })} /></label>
              <label className="f"><span>Cost each, $</span><input inputMode="decimal" defaultValue={(b.cost / 100).toFixed(2)} onBlur={(e) => up(i, { cost: Math.round(n(e.target.value) * 100) })} /></label>
            </div>
            <label className="f"><span>Note <em className="muted">(supplier, color...)</em></span><input value={b.note} onChange={(e) => up(i, { note: e.target.value })} /></label>
            <div className="row wrap">
              <span className="muted small">{used[b.id]?.length ? `Used by: ${used[b.id].join(", ")}` : "Not linked to any item yet."}</span>
              <span className="grow" />
              {b.qty <= b.low ? <span className="pill s-paid">Running low</span> : null}
              <button type="button" className="b b-danger b-sm" onClick={() => confirm(`Remove ${b.name || "this blank"}?`) && setList(list.filter((x) => x.id !== b.id))}>Remove</button>
            </div>
          </li>
        ))}
      </ul>
      {!list.length ? <div className="panel"><p>No blanks yet. Tap <strong>Add a blank</strong> for each kind you keep in stock.</p></div> : null}
      {dirty || msg ? (
        <div className={`savebar ${dirty ? "dirty" : ""}`}>
          <span className="muted">{msg || "You have unsaved changes"}</span>
          <button className="b b-primary" disabled={busy || !dirty} onClick={() => save()}>{busy ? "Saving…" : "Save changes"}</button>
        </div>
      ) : null}
    </>
  );
}
