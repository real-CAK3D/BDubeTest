"use client";
import { useEffect, useState } from "react";
import type { CustomLink } from "@/lib/types";
import { api } from "./api";

type Entry = { id: string; service: string; url: string; username: string; note: string; hasPassword: boolean; updatedAt: string };
const blank = { id: "", service: "", url: "", username: "", password: "", note: "" };

/** Logins for the services you use, stored encrypted. Passwords only appear when you tap Show. */
export function SavedLogins() {
  const [list, setList] = useState<Entry[] | null>(null);
  const [form, setForm] = useState<typeof blank | null>(null);
  const [shown, setShown] = useState<Record<string, string>>({});
  const [err, setErr] = useState("");

  useEffect(() => {
    api<Entry[]>("/api/admin/vault", "GET").then(setList).catch((e) => setErr(e.message));
  }, []);

  async function save() {
    if (!form) return;
    setErr("");
    try {
      setList(await api<Entry[]>("/api/admin/vault", "POST", { action: "save", entry: form }));
      setForm(null);
    } catch (e) {
      setErr((e as Error).message);
    }
  }
  async function reveal(id: string) {
    if (shown[id] !== undefined) return setShown(({ [id]: _, ...rest }) => rest);
    const r = await api<{ password: string }>("/api/admin/vault", "POST", { action: "reveal", id });
    setShown({ ...shown, [id]: r.password });
    setTimeout(() => setShown(({ [id]: _, ...rest }) => rest), 30_000);
  }
  async function copy(id: string) {
    const r = await api<{ password: string }>("/api/admin/vault", "POST", { action: "reveal", id });
    await navigator.clipboard.writeText(r.password);
  }

  return (
    <section className="panel stack">
      <div className="panel-head"><h2>Saved logins</h2><button className="b b-primary b-sm" onClick={() => setForm({ ...blank })}>Add a login</button></div>
      <p className="hint">Usernames and passwords for the services you use, stored encrypted and visible only when signed in here. Tip: a password manager on your phone works too; use whichever you'll keep up to date.</p>
      {err ? <p className="err">{err}</p> : null}
      {form ? (
        <div className="panel stack inner">
          <div className="row2">
            <label className="f"><span>Service</span><input value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })} placeholder="e.g. Stripe" /></label>
            <label className="f"><span>Sign-in page</span><input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://dashboard.stripe.com/login" /></label>
            <label className="f"><span>Username or email</span><input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} autoComplete="off" /></label>
            <label className="f"><span>Password {form.id ? <em className="muted">(empty keeps the saved one)</em> : null}</span><input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} autoComplete="new-password" /></label>
          </div>
          <label className="f"><span>Note</span><input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="e.g. two-step code goes to my phone" /></label>
          <div className="row"><button className="b b-primary b-sm" onClick={save}>Save</button><button className="b b-ghost b-sm" onClick={() => setForm(null)}>Cancel</button></div>
        </div>
      ) : null}
      {!list ? <p className="muted">Loading…</p> : list.length ? (
        <ul className="rows vault">
          {list.map((e) => (
            <li key={e.id}>
              <span>
                <strong>{e.service}</strong>
                <span className="muted small"> {e.username}</span>
                {shown[e.id] !== undefined ? <code className="pw">{shown[e.id] || "(no password saved)"}</code> : null}
                {e.note ? <span className="muted small"><br />{e.note}</span> : null}
              </span>
              <span className="row wrap">
                {e.url ? <a className="b b-sm" href={e.url} target="_blank" rel="noreferrer">Open</a> : null}
                {e.hasPassword ? <button className="b b-ghost b-sm" onClick={() => reveal(e.id)}>{shown[e.id] !== undefined ? "Hide" : "Show"}</button> : null}
                {e.hasPassword ? <button className="b b-ghost b-sm" onClick={() => copy(e.id)}>Copy password</button> : null}
                <button className="b b-ghost b-sm" onClick={() => setForm({ id: e.id, service: e.service, url: e.url, username: e.username, password: "", note: e.note })}>Edit</button>
                <button className="b b-ghost b-sm" aria-label="Delete" onClick={async () => confirm(`Delete the ${e.service} login?`) && setList(await api<Entry[]>("/api/admin/vault", "POST", { action: "delete", id: e.id }))}>✕</button>
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="muted">No logins saved yet.</p>
      )}
    </section>
  );
}

/** Shortcuts to anything else you use: labels, suppliers, the bank. */
export function MyLinks({ initial }: { initial: CustomLink[] }) {
  const [list, setList] = useState(initial);
  const [msg, setMsg] = useState("");
  async function save(next = list) {
    try {
      await api("/api/admin/settings", "PUT", { customLinks: next });
      setMsg("Saved");
      setTimeout(() => setMsg(""), 2000);
    } catch (e) {
      setMsg((e as Error).message);
    }
  }
  return (
    <section className="panel stack">
      <div className="panel-head"><h2>My links</h2></div>
      <p className="hint">Shortcuts to anything else you use: shipping labels, suppliers, your bank.</p>
      <ul className="linklist">
        {list.map((l, i) => (
          <li key={i} className="row">
            <input aria-label="Link name" value={l.label} onChange={(e) => setList(list.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} placeholder="Name" />
            <input aria-label="Link address" type="url" value={l.url} onChange={(e) => setList(list.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)))} placeholder="https://" />
            {l.url ? <a className="b b-sm" href={l.url} target="_blank" rel="noreferrer">Open</a> : null}
            <button type="button" className="b b-sm b-ghost" onClick={() => setList(list.filter((_, j) => j !== i))}>Remove</button>
          </li>
        ))}
      </ul>
      <div className="row">
        <button type="button" className="b b-sm" onClick={() => setList([...list, { label: "", url: "" }])}>Add a link</button>
        <button type="button" className="b b-primary b-sm" onClick={() => save()}>Save links</button>
        {msg ? <span className="small">{msg}</span> : null}
      </div>
    </section>
  );
}
