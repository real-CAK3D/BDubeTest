"use client";
import { useEffect, useRef, useState } from "react";
import type { LiveMsg } from "@/lib/live-chat";

type Chat = { id: string; createdAt: string; updatedAt: string; status: "waiting" | "open" | "closed"; name: string; email: string; page: string; msgs: LiveMsg[]; unread: number; mine: boolean; ownerName: string };
const when = (iso: string) => new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
const day = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
const post = (body: object) => fetch("/api/admin/live-chat", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });

/** The live chat page: conversations on the left, the open one on the right. Updates every 2.5 seconds. */
export function LiveDesk({ openId }: { openId?: string }) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [agents, setAgents] = useState<string[]>([]);
  const [sel, setSel] = useState(openId ?? "");
  const [text, setText] = useState("");
  const [tab, setTab] = useState<"now" | "done">("now");
  const list = useRef<HTMLDivElement>(null);
  const lastClaim = useRef(0);

  async function refresh() {
    const r = await fetch("/api/admin/live-chat").catch(() => null);
    if (!r?.ok) return;
    const d = await r.json();
    setChats(d.chats);
    setAgents(d.agents);
  }
  useEffect(() => {
    refresh();
    const t = setInterval(() => document.visibilityState === "visible" && refresh(), 2500);
    return () => clearInterval(t);
  }, []);

  const c = chats.find((x) => x.id === sel);
  useEffect(() => {
    if (c?.unread) post({ action: "read", id: c.id });
    list.current?.scrollTo({ top: list.current.scrollHeight });
  }, [c?.id, c?.msgs.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // typing a reply claims the chat (and shows the customer "… is typing")
  function typing(v: string) {
    setText(v);
    if (!c || !v.trim() || Date.now() - lastClaim.current < 3000) return;
    lastClaim.current = Date.now();
    post({ action: "claim", id: c.id }).then(refresh);
  }
  async function takeOver() {
    if (!c) return;
    await post({ action: "claim", id: c.id, force: true });
    refresh();
  }

  async function send() {
    if (!text.trim() || !c) return;
    const t = text;
    setText("");
    await post({ action: "send", id: c.id, text: t });
    refresh();
  }

  const shown = chats.filter((x) => (tab === "now" ? x.status !== "closed" : x.status === "closed"));
  return (
    <>
      <div className="page-head">
        <h1>Live chat</h1>
        <span className={`pill ${agents.length ? "s-live" : ""}`} style={{ textTransform: "none" }}>{agents.length ? `Available: ${agents.join(", ")}` : "Nobody available (turn on Live in the top bar)"}</span>
      </div>
      <p className="muted lead">
        While the <strong>Live</strong> switch in the top bar is on (pulsing red) and the dashboard is open on screen, customers see a red pulse on the shop&apos;s chat button and can talk to you here. Close the dashboard or switch to Away and the chat helper takes over again; anyone who wanted a person can leave their email instead.
      </p>
      <div className="live-desk">
        <aside className="panel live-list">
          <div className="seg">
            <button className={tab === "now" ? "on" : ""} onClick={() => setTab("now")}>Now ({chats.filter((x) => x.status !== "closed").length})</button>
            <button className={tab === "done" ? "on" : ""} onClick={() => setTab("done")}>Ended</button>
          </div>
          {shown.length ? (
            <ul>
              {shown.map((x) => (
                <li key={x.id}>
                  <button className={`live-item ${x.id === sel ? "on" : ""}`} onClick={() => setSel(x.id)}>
                    <strong>{x.name || "Guest"}</strong>
                    {x.unread ? <b className="count">{x.unread}</b> : null}
                    <span className="muted small">{x.status === "closed" ? "Ended" : x.mine ? "You're answering" : x.ownerName ? `${x.ownerName} has it` : "Waiting for an answer"} · {day(x.updatedAt)} {when(x.updatedAt)}</span>
                    <span className="muted small clip">{x.msgs.filter((m) => m.from !== "system").at(-1)?.text ?? ""}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted small">{tab === "now" ? "No one's chatting right now." : "No ended chats yet."}</p>
          )}
        </aside>
        <section className="panel live-room">
          {c ? (
            <>
              <header className="row wrap">
                <strong>{c.name || "Guest"}</strong>
                {c.email ? <a href={`mailto:${c.email}`} className="small">{c.email}</a> : <span className="muted small">no email given</span>}
                {c.page ? <span className="muted small">started on {c.page}</span> : null}
                <span className="grow" />
                <button className="b b-ghost b-sm" onClick={async () => { await post({ action: "inbox", id: c.id }); alert("Saved to your Inbox."); }}>Save to Inbox</button>
                {c.status !== "closed" ? <button className="b b-sm" onClick={async () => { await post({ action: "close", id: c.id }); refresh(); }}>End chat</button> : (
                  <button className="b b-danger b-sm" onClick={async () => { if (confirm("Delete this conversation for good?")) { await post({ action: "delete", id: c.id }); setSel(""); refresh(); } }}>Delete</button>
                )}
              </header>
              <div className="live-msgs" ref={list}>
                {c.msgs.map((m, i) =>
                  m.from === "system" ? (
                    <p key={i} className="live-sys">{m.text}</p>
                  ) : (
                    <p key={i} className={`chat-msg ${m.from === "admin" ? "me" : "bot"}`}>
                      {m.text}
                      <span className="live-at">{m.from === "admin" ? `${m.by} · ` : ""}{when(m.at)}</span>
                    </p>
                  )
                )}
              </div>
              {c.status !== "closed" && c.ownerName && !c.mine ? (
                <div className="live-taken">
                  <span><strong>{c.ownerName}</strong> is answering this one, so you don&apos;t need to.</span>
                  <button className="b b-sm" onClick={takeOver}>Take over</button>
                </div>
              ) : c.status !== "closed" ? (
                <form className="row" onSubmit={(e) => { e.preventDefault(); send(); }}>
                  <input value={text} onChange={(e) => typing(e.target.value)} placeholder={`Reply to ${c.name || "the customer"}`} style={{ flex: 1 }} autoFocus />
                  <button className="b b-primary" disabled={!text.trim()}>Send</button>
                </form>
              ) : (
                <p className="muted small">This chat has ended.{c.email ? " Email them to follow up." : ""}</p>
              )}
            </>
          ) : (
            <p className="muted">Pick a conversation.</p>
          )}
        </section>
      </div>
    </>
  );
}
