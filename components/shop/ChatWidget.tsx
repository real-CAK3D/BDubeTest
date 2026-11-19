"use client";
import { useEffect, useRef, useState } from "react";

type Turn = { role: "user" | "assistant"; content: string; by?: string; sys?: boolean };
type LiveMsg = { at: string; from: "customer" | "admin" | "system"; text: string; by?: string };
type Live = { id: string; token: string; from: number; started: number; status: "waiting" | "open" | "closed"; msgs: LiveMsg[] };

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
const HUMAN = /\b((talk|speak|chat) (to|with) (a |an |the )?(real |actual |live )?(person|human|someone|somebody|owner)|real person|live chat|live person|human being)\b/i;
const NOBODY_MS = 90_000; // no reply from the shop by then: take a message instead
const save = (k: string, v: unknown) => {
  try {
    sessionStorage.setItem(k, JSON.stringify(v));
  } catch {}
};

/** The chat button and window on every shop page: the chat helper, plus live chat with a person when someone's available. */
export function ChatWidget({ title, greeting, suggestions }: { title: string; greeting: string; suggestions: string[] }) {
  const [open, setOpen] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [people, setPeople] = useState<string[]>([]); // who's available for live chat
  const [live, setLive] = useState<Live | null>(null);
  const liveRef = useRef<Live | null>(null);
  liveRef.current = live;
  const state = useRef<unknown>(null); // what the chat helper is in the middle of (e.g. taking a request)
  const list = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);

  // keep the conversation while they browse, until the tab closes
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(KEY);
      if (raw) setTurns(JSON.parse(raw));
      state.current = JSON.parse(sessionStorage.getItem(KEY + ":state") ?? "null");
      const l = JSON.parse(sessionStorage.getItem(KEY + ":live") ?? "null");
      if (l?.id) setLive(l);
    } catch {}
  }, []);
  useEffect(() => {
    save(KEY, turns.slice(-30));
    list.current?.scrollTo({ top: list.current.scrollHeight, behavior: "smooth" });
  }, [turns, open, live?.msgs.length]);
  useEffect(() => save(KEY + ":live", live), [live]);
  useEffect(() => {
    if (open) input.current?.focus();
    if (open) fetch("/api/chat").catch(() => {}); // wakes the chat helper up before the first question
  }, [open]);

  // is anyone free for live chat? (checked now and then; more often while the window is open)
  useEffect(() => {
    let stop = false;
    const check = () =>
      document.visibilityState === "visible" &&
      fetch("/api/live")
        .then((r) => r.json())
        .then((d) => !stop && setPeople(d.names ?? []))
        .catch(() => {});
    check();
    const t = setInterval(check, open ? 20_000 : 45_000);
    return () => {
      stop = true;
      clearInterval(t);
    };
  }, [open]);

  // during a live chat: new messages every 2.5 seconds
  useEffect(() => {
    if (!live || live.status === "closed") return;
    const t = setInterval(async () => {
      if (document.visibilityState !== "visible") return;
      const r = await fetch(`/api/live?id=${encodeURIComponent(live.id)}&token=${encodeURIComponent(live.token)}`).catch(() => null);
      if (r?.status === 404) return finishLive("This chat has ended.");
      const d = r?.ok ? await r.json() : null;
      if (!d) return;
      if (liveRef.current) liveRef.current = { ...liveRef.current, status: d.status, msgs: d.msgs };
      setLive((l) => (l ? { ...l, status: d.status, msgs: d.msgs } : l));
      if (d.status === "closed") finishLive();
      // nobody answered: take a message instead
      else if (d.status === "waiting" && Date.now() - live.started > NOBODY_MS) {
        const said = (d.msgs as LiveMsg[]).filter((m) => m.from === "customer").map((m) => m.text);
        await fetch("/api/live", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "end", id: live.id, token: live.token }) }).catch(() => {});
        state.current = { flow: "message", notes: said, turns: 0 };
        save(KEY + ":state", state.current);
        finishLive(`Sorry, nobody could get to the chat just now. ${said.length ? "I'll pass your message on: what" : "What would you like to ask, and what"} email should we reply to?`);
      }
    }, 2500);
    return () => clearInterval(t);
  }, [live?.id, live?.status, live?.started]); // eslint-disable-line react-hooks/exhaustive-deps

  /** Leaves live mode, keeping the conversation on screen. */
  function finishLive(note?: string) {
    const l = liveRef.current;
    if (!l) return;
    liveRef.current = null;
    const kept: Turn[] = l.msgs.map((m) => (m.from === "system" ? { role: "assistant", content: m.text, sys: true } : { role: m.from === "admin" ? "assistant" : "user", content: m.text, by: m.by }));
    setTurns((t) => [...t.slice(0, l.from), ...kept, note ? { role: "assistant", content: note } : { role: "assistant", content: "The live chat has ended. I'm still here if you have more questions.", sys: true }]);
    setLive(null);
  }

  async function startLive(first?: string) {
    if (busy) return;
    setBusy(true);
    const earlier = turns.filter((t) => t.role === "user").map((t) => t.content).slice(-4);
    const r = await fetch("/api/live", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "start", text: first ?? "", page: location.pathname, earlier }) }).catch(() => null);
    const d = r ? await r.json().catch(() => ({})) : {};
    setBusy(false);
    if (!r?.ok) {
      setTurns((t) => [...t, ...(first ? [{ role: "user" as const, content: first }] : []), { role: "assistant", content: d.error ?? "Sorry, live chat isn't available right now. Ask me, or say \"talk to a person\" and I'll pass a message on." }]);
      return;
    }
    setTurns((t) => [...t, { role: "assistant", content: `Connecting you with ${people.length ? people.join(" or ") : "us"}… Say hi and ask away!`, sys: true }]);
    setLive({ id: d.id, token: d.token, from: turns.length + 1, started: Date.now(), status: d.status, msgs: d.msgs });
    state.current = null;
    save(KEY + ":state", null);
  }

  async function endLive() {
    if (!live) return;
    await fetch("/api/live", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "end", id: live.id, token: live.token }) }).catch(() => {});
    finishLive();
  }

  async function ask(q: string) {
    const question = q.trim();
    if (!question || busy) return;
    setText("");
    // live chat: straight to the person
    if (live) {
      setLive({ ...live, msgs: [...live.msgs, { at: new Date().toISOString(), from: "customer", text: question }] });
      const r = await fetch("/api/live", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "send", id: live.id, token: live.token, text: question }) }).catch(() => null);
      if (r?.status === 410) finishLive("This chat has ended. Ask me anything, or leave a message on the Contact page.");
      return;
    }
    // "can I talk to a real person?" while someone's available
    if (people.length && HUMAN.test(question)) return startLive(question);
    const next: Turn[] = [...turns, { role: "user", content: question }];
    setTurns(next);
    setBusy(true);
    try {
      const r = await fetch("/api/chat", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ messages: next.filter((t) => !t.sys).slice(-10).map(({ role, content }) => ({ role, content })), state: state.current }) });
      const d = await r.json().catch(() => ({}));
      state.current = d.state ?? null;
      save(KEY + ":state", state.current);
      setTurns([...next, { role: "assistant", content: d.reply ?? d.error ?? "Sorry, something went wrong. Please try again." }]);
    } catch {
      setTurns([...next, { role: "assistant", content: "Sorry, I couldn't connect. Please try again." }]);
    }
    setBusy(false);
  }

  const shown: Turn[] = live
    ? [...turns.slice(0, live.from), ...live.msgs.map((m): Turn => (m.from === "system" ? { role: "assistant", content: m.text, sys: true } : { role: m.from === "admin" ? "assistant" : "user", content: m.text, by: m.by }))]
    : turns;
  const agent = live?.msgs.filter((m) => m.from === "admin").at(-1)?.by;
  const available = people.length > 0;
  return (
    <>
      {open ? (
        <section className="chat-box" role="dialog" aria-label={title}>
          <header>
            <strong>{live ? (agent ? `Chatting with ${agent}` : "Live chat") : title}</strong>
            <span className="row">
              {live ? <button type="button" className="chat-end" onClick={endLive}>End chat</button> : null}
              <button type="button" onClick={() => setOpen(false)} aria-label="Close chat">✕</button>
            </span>
          </header>
          {!live && available ? (
            <button type="button" className="chat-live-bar" onClick={() => startLive()} disabled={busy}>
              <span className="live-dot" aria-hidden /> {people.join(" & ")} {people.length > 1 ? "are" : "is"} here now. <u>Talk to a person</u>
            </button>
          ) : null}
          {live && live.status === "waiting" ? <p className="chat-live-bar waiting"><span className="live-dot" aria-hidden /> Waiting for {people.join(" or ") || "someone"} to join…</p> : null}
          <div className="chat-list" ref={list} aria-live="polite">
            <p className="chat-msg bot">{greeting}</p>
            {shown.map((t, i) =>
              t.sys ? (
                <p key={i} className="chat-sys">{t.content}</p>
              ) : (
                <p key={i} className={`chat-msg ${t.role === "user" ? "me" : t.by ? "bot person" : "bot"}`}>
                  {t.by ? <span className="chat-by">{t.by}</span> : null}
                  {t.role === "user" ? t.content : linkify(t.content)}
                </p>
              )
            )}
            {busy ? <p className="chat-msg bot typing" aria-label="Typing"><span /><span /><span /></p> : null}
            {!turns.length && !live && suggestions.length ? (
              <div className="chat-suggest">
                {suggestions.map((s) => <button key={s} type="button" onClick={() => ask(s)}>{s}</button>)}
              </div>
            ) : null}
          </div>
          <form onSubmit={(e) => (e.preventDefault(), ask(text))}>
            <input ref={input} value={text} onChange={(e) => setText(e.target.value)} maxLength={500} placeholder={live ? "Type a message" : "Type your question"} aria-label={live ? "Your message" : "Your question"} />
            <button className="btn btn-sm" disabled={busy || !text.trim()}>Send</button>
          </form>
          <p className="chat-note">{live ? "You're chatting with a real person from our shop." : "Answers come from our own info. Ask for a person any time and we'll pass your message on."}</p>
        </section>
      ) : null}
      <button type="button" className={`chat-fab ${available ? "has-live" : ""}`} onClick={() => setOpen(!open)} aria-expanded={open} aria-label={open ? "Close chat" : available ? `${title} (live chat available)` : title}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" />
        </svg>
        <span>{open ? "Close" : available ? "Live chat" : "Ask us"}</span>
        {available && !open ? <span className="live-dot fab-dot" aria-hidden /> : null}
      </button>
    </>
  );
}
