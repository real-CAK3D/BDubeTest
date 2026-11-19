"use client";
import { useState } from "react";
import type { SiteSettings, UpcomingItem } from "@/lib/types";
import { api } from "./api";
import { ImageField } from "./ImageField";
import { useSettings } from "./useSettings";

type Interest = Record<string, { wants: number; emails: { email: string; at: string }[] }>;
const STAGES: { id: UpcomingItem["stage"]; label: string }[] = [
  { id: "idea", label: "Just an idea" },
  { id: "working", label: "In the works" },
  { id: "soon", label: "Coming soon" },
];
const newId = () => Math.random().toString(36).slice(2, 10);

/** Dashboard > What's to come: new things on the way, and who wants them. */
export function UpcomingManager({ initial, interest: startInterest }: { initial: SiteSettings; interest: Interest }) {
  const { s, set, bar } = useSettings(initial);
  const u = s.upcoming;
  const up = (patch: Partial<SiteSettings["upcoming"]>) => set({ upcoming: { ...u, ...patch } });
  const setItem = (id: string, patch: Partial<UpcomingItem>) => up({ items: u.items.map((x) => (x.id === id ? { ...x, ...patch } : x)) });
  const move = (i: number, by: number) => {
    const items = [...u.items];
    const [x] = items.splice(i, 1);
    items.splice(Math.max(0, Math.min(items.length, i + by)), 0, x);
    up({ items });
  };
  const [interest, setInterest] = useState(startInterest);
  const [open, setOpen] = useState("");

  return (
    <>
      <div className="page-head">
        <h1>What&apos;s to come</h1>
        <button className="b b-primary" onClick={() => { const id = newId(); up({ items: [{ id, title: "", text: "", image: "", when: "", stage: "idea" }, ...u.items] }); setOpen(id); }}>Add something</button>
      </div>
      <p className="muted lead">New products and options you&apos;re working on. Customers can tap <strong>I want this</strong> (so you know what to make first) and leave their email to hear when it&apos;s ready. They show on the home page (the first three) and on the <a href="/coming-soon" target="_blank" rel="noreferrer">What&apos;s to come page</a>.</p>
      <section className="panel stack">
        <label className="check"><input type="checkbox" checked={u.on} onChange={(e) => up({ on: e.target.checked })} /> Show the section on the home page</label>
        <label className="f"><span>Heading</span><input value={u.heading} onChange={(e) => up({ heading: e.target.value })} placeholder="What's to come" /></label>
        <label className="f"><span>Intro</span><textarea rows={2} value={u.intro} onChange={(e) => up({ intro: e.target.value })} /></label>
      </section>
      <ul className="faq-list upcoming-list">
        {u.items.map((x, i) => {
          const who = interest[x.id];
          const isOpen = open === x.id || !x.title;
          return (
            <li key={x.id} className={`panel ${x.hidden ? "hidden-item" : ""}`}>
              <div className="row wrap">
                <span className="stack-tight">
                  <strong>{x.title || "New item"}</strong>
                  <span className="muted small">
                    {STAGES.find((st) => st.id === x.stage)?.label}{x.when ? ` · ${x.when}` : ""}{x.hidden ? " · hidden" : ""} · ♥ {who?.wants ?? 0} want it{who?.emails.length ? ` · ${who.emails.length} waiting for an email` : ""}
                  </span>
                </span>
                <span className="grow" />
                <button className="b b-ghost b-sm" aria-label="Move up" onClick={() => move(i, -1)} disabled={!i}>↑</button>
                <button className="b b-ghost b-sm" aria-label="Move down" onClick={() => move(i, 1)} disabled={i === u.items.length - 1}>↓</button>
                <button className="b b-sm" onClick={() => setOpen(isOpen ? "-" : x.id)}>{isOpen ? "Close" : "Edit"}</button>
              </div>
              {isOpen ? (
                <div className="stack" style={{ marginTop: "0.8rem" }}>
                  <label className="f"><span>Name</span><input autoFocus={!x.title} value={x.title} onChange={(e) => setItem(x.id, { title: e.target.value })} placeholder="e.g. Photo engraving on slate" /></label>
                  <label className="f"><span>What it is</span><textarea rows={3} value={x.text} onChange={(e) => setItem(x.id, { text: e.target.value })} placeholder="A sentence or two customers will see" /></label>
                  <div className="row2">
                    <label className="f"><span>How far along</span>
                      <select value={x.stage} onChange={(e) => setItem(x.id, { stage: e.target.value as UpcomingItem["stage"] })}>{STAGES.map((st) => <option key={st.id} value={st.id}>{st.label}</option>)}</select>
                    </label>
                    <label className="f"><span>When (optional)</span><input value={x.when} onChange={(e) => setItem(x.id, { when: e.target.value })} placeholder="e.g. This spring" /></label>
                  </div>
                  <ImageField label="Photo or sketch (optional)" value={x.image} onChange={(image) => setItem(x.id, { image })} folder="upcoming" />
                  {who?.emails.length ? (
                    <div className="panel-sub">
                      <strong className="small">Waiting to hear ({who.emails.length})</strong>
                      <p className="small">{who.emails.map((e) => e.email).join(", ")}</p>
                      <div className="row wrap">
                        <a className="b b-sm" href={`mailto:?bcc=${encodeURIComponent(who.emails.map((e) => e.email).join(","))}&subject=${encodeURIComponent(`${x.title} is here!`)}`}>Email them all</a>
                        <button className="b b-ghost b-sm" onClick={async () => { if (confirm("Clear the count and the email list for this one?")) { await api("/api/admin/upcoming", "POST", { action: "clear", id: x.id }); const n = { ...interest }; delete n[x.id]; setInterest(n); } }}>Clear the list</button>
                      </div>
                    </div>
                  ) : null}
                  <div className="row wrap">
                    <label className="check"><input type="checkbox" checked={!x.hidden} onChange={(e) => setItem(x.id, { hidden: !e.target.checked })} /> Show on the shop</label>
                    <span className="grow" />
                    <button className="b b-danger b-sm" onClick={() => confirm("Delete this for good? (Untick \"Show on the shop\" to keep it.)") && up({ items: u.items.filter((y) => y.id !== x.id) })}>Delete</button>
                  </div>
                  <p className="hint">When it&apos;s ready: add it in Products, email the people waiting, then delete or hide it here.</p>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
      {bar}
    </>
  );
}
