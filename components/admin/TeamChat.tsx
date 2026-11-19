"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type Msg = { id: string; at: string; by: string; text: string; link?: string };
const when = (iso: string) => {
  const d = new Date(iso);
  const today = new Date().toDateString() === d.toDateString();
  return d.toLocaleString("en-US", today ? { hour: "numeric", minute: "2-digit" } : { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
};
const QUICK = ["I've got it", "Can you take this one?", "On my way to the shop", "Order's packed and ready"];

/** Dashboard > Team chat: messages between the people who run the shop. Updates every 3 seconds. */
export function TeamChat() {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [online, setOnline] = useState<string[]>([]);
  const [me, setMe] = useState("");
  const [text, setText] = useState("");
  const [err, setErr] = useState("");
  const box = useRef<HTMLDivElement>(null);
  const count = useRef(0);

  async function refresh() {
    const r = await fetch("/api/admin/team").catch(() => null);
    if (!r?.ok) return;
    const d = await r.json();
    setMsgs(d.msgs);
    setOnline(d.online);
    setMe(d.me);
    if (d.msgs.length !== count.current) {
      count.current = d.msgs.length;
      fetch("/api/admin/team", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "read" }) }).catch(() => {});
    }
  }
  useEffect(() => {
    refresh();
    const t = setInterval(() => document.visibilityState === "visible" && refresh(), 3000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    box.current?.scrollTo({ top: box.current.scrollHeight });
  }, [msgs.length]);

  async function send(t = text) {
    if (!t.trim()) return;
    setText("");
    setErr("");
    const r = await fetch("/api/admin/team", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text: t }) }).catch(() => null);
    if (!r?.ok) setErr("Didn't send. Try again.");
    refresh();
  }

  const mine = (m: Msg) => m.by.trim().toLowerCase() === me.trim().toLowerCase();
  return (
    <>
      <div className="page-head">
        <h1>Team chat</h1>
        <span className="muted small">{online.length ? `Signed in now: ${online.join(", ")}` : ""}</span>
      </div>
      <p className="muted lead">Just for the two of you (and anyone else who runs the shop). Customers never see it. A message pings the others&apos; phones and pops up in their dashboard.</p>
      <section className="panel team-room">
        <div className="live-msgs" ref={box}>
          {msgs.length ? (
            msgs.map((m, i) => (
              <p key={m.id} className={`chat-msg ${mine(m) ? "me" : "bot"}`}>
                {!mine(m) && msgs[i - 1]?.by !== m.by ? <span className="team-by">{m.by.split(" ")[0]}</span> : null}
                {m.text}
                {m.link ? <> <Link href={m.link}>Open</Link></> : null}
                <span className="live-at">{when(m.at)}</span>
              </p>
            ))
          ) : (
            <p className="muted">No messages yet. Say hi!</p>
          )}
        </div>
        <div className="chips small-chips team-quick">
          {QUICK.map((q) => <button key={q} type="button" onClick={() => send(q)}>{q}</button>)}
        </div>
        <form className="row" onSubmit={(e) => { e.preventDefault(); send(); }}>
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Message the team" style={{ flex: 1 }} maxLength={2000} />
          <button className="b b-primary" disabled={!text.trim()}>Send</button>
        </form>
        {err ? <p className="error small">{err}</p> : null}
      </section>
    </>
  );
}
