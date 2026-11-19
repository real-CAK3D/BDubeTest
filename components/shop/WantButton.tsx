"use client";
import { useEffect, useState } from "react";

const KEY = "wants:v1";
const read = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
};

/** "I want this" (counted once per phone) and "Tell me when it's ready" (an email). */
export function WantButton({ id, count }: { id: string; count: number }) {
  const [n, setN] = useState(count);
  const [mine, setMine] = useState(false);
  const [asking, setAsking] = useState(false);
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  useEffect(() => setMine(read().includes(id)), [id]);

  async function want() {
    const undo = mine;
    setMine(!undo);
    setN((x) => Math.max(0, x + (undo ? -1 : 1)));
    try {
      localStorage.setItem(KEY, JSON.stringify(undo ? read().filter((x) => x !== id) : [...read(), id]));
    } catch {}
    const r = await fetch("/api/coming-soon", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ id, action: undo ? "unwant" : "want" }) }).catch(() => null);
    const d = r?.ok ? await r.json() : null;
    if (d) setN(d.wants);
    if (!undo) setAsking(true);
  }
  async function notify(e: React.FormEvent) {
    e.preventDefault();
    const r = await fetch("/api/coming-soon", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ id, action: "notify", email }) }).catch(() => null);
    const d = r ? await r.json().catch(() => ({})) : {};
    setMsg(r?.ok ? "Thanks! We'll email you when it's ready." : d.error ?? "Something went wrong. Please try again.");
    if (r?.ok) setAsking(false);
  }

  return (
    <div className="want">
      <div className="want-row">
        <button type="button" className={`want-btn ${mine ? "on" : ""}`} onClick={want} aria-pressed={mine}>
          {mine ? "♥ You want this" : "♡ I want this"}
        </button>
        {n > 0 ? <span className="want-count">{n} {n === 1 ? "person wants" : "people want"} this</span> : null}
      </div>
      {asking && !msg ? (
        <form className="want-form" onSubmit={notify}>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email me when it's ready (optional)" aria-label="Your email" />
          <button className="btn btn-sm">Notify me</button>
        </form>
      ) : null}
      {msg ? <p className="want-msg">{msg}</p> : null}
    </div>
  );
}
