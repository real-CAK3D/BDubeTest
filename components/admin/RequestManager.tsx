"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { CustomRequest, RequestStatus } from "@/lib/types";
import { api } from "./api";
import { Tabs } from "./Tabs";

const LABEL: Record<RequestStatus, string> = { new: "New", quoted: "Quoted", accepted: "Accepted", declined: "Declined", done: "Done" };

export function RequestManager({ initial, business, on }: { initial: CustomRequest[]; business: string; on: boolean }) {
  const router = useRouter();
  const [list, setList] = useState(initial);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState("");

  async function save(r: CustomRequest, change: { status?: RequestStatus; note?: string; delete?: boolean }) {
    if (change.delete && !confirm(`Delete request #${r.number} for good?`)) return;
    setBusy(r.id);
    try {
      const res = await api<{ request: CustomRequest | null }>("/api/admin/requests", "POST", { id: r.id, ...change });
      setList((l) => (change.delete ? l.filter((x) => x.id !== r.id) : l.map((x) => (x.id === r.id && res.request ? res.request : x))));
      router.refresh();
    } catch (e) {
      alert((e as Error).message);
    }
    setBusy("");
  }

  const reply = (r: CustomRequest, kind: "quote" | "decline") => {
    const subject = `Your custom order request #${r.number}`;
    const body =
      kind === "quote"
        ? `Hi ${r.name},\n\nThanks for your request for ${r.quantity > 1 ? `${r.quantity} x ` : ""}${r.kind || "a custom piece"}.\n\nWe can make this for $___ ${r.quantity > 1 ? "each " : ""}plus shipping, and it would be ready in about ___.\n\nLet us know if you'd like to go ahead.\n\n${business}`
        : `Hi ${r.name},\n\nThanks for thinking of us for your request. Unfortunately this one is outside what our equipment can do without major changes, so we have to pass on it this time.\n\nIf you have a different idea, or a larger order, we'd be glad to take another look.\n\n${business}`;
    return `mailto:${r.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const card = (r: CustomRequest) => (
    <li key={r.id} className="panel request">
      <div className="review-meta">
        <strong>#{r.number} {r.name}</strong>
        <span className={`pill s-${r.status === "done" || r.status === "accepted" ? "shipped" : r.status === "declined" ? "refunded" : "paid"}`}>{LABEL[r.status]}</span>
        <span className="muted small">{new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
      </div>
      <p><strong>{r.quantity > 1 ? `${r.quantity} x ` : ""}{r.kind || "Custom piece"}</strong>{r.neededBy ? <span className="muted"> · needed by {new Date(r.neededBy + "T12:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span> : null}{r.budget ? <span className="muted"> · budget {r.budget}</span> : null}</p>
      <p className="review-text pre">{r.details}</p>
      {r.engraving ? <p className="engrave"><span className="muted small">Engraving:</span> {r.engraving}</p> : null}
      {r.photos.length ? (
        <div className="req-photos">
          {r.photos.map((p) => (
            <a key={p} href={p} target="_blank" rel="noreferrer">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p} alt="Reference" />
            </a>
          ))}
        </div>
      ) : null}
      <p className="small">
        <a href={`mailto:${r.email}`}>{r.email}</a>
        {r.phone ? <> · <a href={`tel:${r.phone}`}>{r.phone}</a></> : null}
        {r.zip ? <span className="muted"> · ZIP {r.zip}</span> : null}
      </p>
      <label className="field">
        <span className="small muted">Private note (only you see this)</span>
        <textarea rows={2} value={notes[r.id] ?? r.note} onChange={(e) => setNotes((n) => ({ ...n, [r.id]: e.target.value }))} onBlur={() => notes[r.id] !== undefined && notes[r.id] !== r.note && save(r, { note: notes[r.id] })} placeholder="Price you quoted, material, dates..." />
      </label>
      <div className="row wrap">
        <a className="b b-primary b-sm" href={reply(r, "quote")} onClick={() => r.status === "new" && save(r, { status: "quoted" })}>Email a quote</a>
        <a className="b b-sm" href={reply(r, "decline")} onClick={() => save(r, { status: "declined" })}>Politely decline</a>
        <select className="b-sm" value={r.status} disabled={busy === r.id} onChange={(e) => save(r, { status: e.target.value as RequestStatus })} aria-label="Status">
          {(Object.keys(LABEL) as RequestStatus[]).map((st) => <option key={st} value={st}>{LABEL[st]}</option>)}
        </select>
        <button className="b b-danger b-sm" disabled={busy === r.id} onClick={() => save(r, { delete: true })}>Delete</button>
      </div>
    </li>
  );

  const of = (...st: RequestStatus[]) => list.filter((r) => st.includes(r.status));
  const view = (rs: CustomRequest[], empty: string) => (rs.length ? <ul className="reviews-admin">{rs.map(card)}</ul> : <div className="panel"><p>{empty}</p></div>);

  return (
    <>
      <div className="page-head">
        <h1>Custom requests</h1>
        <a className="b b-ghost b-sm" href="/custom-order" target="_blank" rel="noreferrer">Open the request form</a>
      </div>
      <p className="muted lead">
        Requests from the custom order form. Email a quote, or politely decline the ones your equipment can&apos;t handle. When a customer agrees to a price, make a product for it (it can be hidden) or send a Stripe payment link.
        {on ? "" : " The form is turned off in Words & logos > Custom orders."}
      </p>
      <Tabs
        label="Request lists"
        initial="open"
        tabs={[
          { id: "open", label: "To answer", badge: of("new").length || undefined, content: view(of("new"), "No new requests. You'll get a notification when one comes in.") },
          { id: "working", label: "In progress", badge: of("quoted", "accepted").length || undefined, content: view(of("quoted", "accepted"), "Nothing quoted or in progress.") },
          { id: "closed", label: "Finished", content: view(of("done", "declined"), "Nothing finished yet.") },
        ]}
      />
    </>
  );
}
