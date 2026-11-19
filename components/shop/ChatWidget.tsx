"use client";
import { useEffect, useRef, useState } from "react";

type Turn = { role: "user" | "assistant"; content: string };

// shop pages (/contact, /product/...) and web addresses in a reply become links
const LINK = /(https?:\/\/[^\s)]+[^\s).,!?]|\/(?:product|shop|contact|custom-order|gift-cards|military|order-status|policies|pages|gallery|about|cart)(?:\/[\w-]+)*)/g;
const LABEL: Record<string, string> = { product: "View item", shop: "the shop", contact: "Contact", "custom-order": "Custom orders", "gift-cards": "Gift cards", military: "Military discount", "order-status": "Order status", policies: "Policies", pages: "this page", gallery: "Our work", about: "About us", cart: "your cart" };
function linkify(text: string) {
  return text.split(LINK).map((part, i) =>
    i % 2 ? (
      <a key={i} href={part} {...(part.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}>
        {part.startsWith("http") ? part.replace(/^https?:\/\/(www\.)?/, "") : (LABEL[part.split("/")[1]] ?? "this page")}
      </a>
    ) : (
      part
    )
  );
}
const KEY = "chat:v1";

/** The "Ask us" button and chat window on every shop page. */
export function ChatWidget({ title, greeting, suggestions }: { title: string; greeting: string; suggestions: string[] }) {
  const [open, setOpen] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const list = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);

  // keep the conversation while they browse, until the tab closes
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(KEY);
      if (raw) setTurns(JSON.parse(raw));
    } catch {}
  }, []);
  useEffect(() => {
    try {
      sessionStorage.setItem(KEY, JSON.stringify(turns.slice(-20)));
    } catch {}
    list.current?.scrollTo({ top: list.current.scrollHeight, behavior: "smooth" });
  }, [turns, open]);
  useEffect(() => {
    if (open) input.current?.focus();
  }, [open]);

  async function ask(q: string) {
    const question = q.trim();
    if (!question || busy) return;
    const next: Turn[] = [...turns, { role: "user", content: question }];
    setTurns(next);
    setText("");
    setBusy(true);
    try {
      const r = await fetch("/api/chat", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ messages: next.slice(-10) }) });
      const d = await r.json().catch(() => ({}));
      setTurns([...next, { role: "assistant", content: d.reply ?? d.error ?? "Sorry, something went wrong. Please try again." }]);
    } catch {
      setTurns([...next, { role: "assistant", content: "Sorry, I couldn't connect. Please try again." }]);
    }
    setBusy(false);
  }

  return (
    <>
      {open ? (
        <section className="chat-box" role="dialog" aria-label={title}>
          <header>
            <strong>{title}</strong>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close chat">✕</button>
          </header>
          <div className="chat-list" ref={list} aria-live="polite">
            <p className="chat-msg bot">{greeting}</p>
            {turns.map((t, i) => <p key={i} className={`chat-msg ${t.role === "user" ? "me" : "bot"}`}>{t.role === "user" ? t.content : linkify(t.content)}</p>)}
            {busy ? <p className="chat-msg bot typing" aria-label="Typing"><span /><span /><span /></p> : null}
            {!turns.length && suggestions.length ? (
              <div className="chat-suggest">
                {suggestions.map((s) => <button key={s} type="button" onClick={() => ask(s)}>{s}</button>)}
              </div>
            ) : null}
          </div>
          <form onSubmit={(e) => (e.preventDefault(), ask(text))}>
            <input ref={input} value={text} onChange={(e) => setText(e.target.value)} maxLength={500} placeholder="Type your question" aria-label="Your question" />
            <button className="btn btn-sm" disabled={busy || !text.trim()}>Send</button>
          </form>
          <p className="chat-note">Answers come from our own info. For anything else, use the Contact page.</p>
        </section>
      ) : null}
      <button type="button" className="chat-fab" onClick={() => setOpen(!open)} aria-expanded={open} aria-label={open ? "Close chat" : title}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" />
        </svg>
        <span>{open ? "Close" : "Ask us"}</span>
      </button>
    </>
  );
}
