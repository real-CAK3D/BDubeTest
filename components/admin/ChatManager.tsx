"use client";
import { useState } from "react";
import type { ChatLogEntry, Faq, SiteSettings } from "@/lib/types";
import { api } from "./api";
import { Tabs } from "./Tabs";
import { useSettings } from "./useSettings";

const newId = () => Math.random().toString(36).slice(2, 10);
const when = (iso: string) => new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

/*
 * The shop's "Ask us" chat: the questions and answers it works from (edit,
 * hide, add), what customers actually asked (add an answer in one tap), and a
 * box to try it.
 */
export function ChatManager({ initial, log: initialLog, hasKey }: { initial: SiteSettings; log: ChatLogEntry[]; hasKey: boolean }) {
  const { s, set, bar } = useSettings(initial);
  const c = s.chat;
  const up = (patch: Partial<SiteSettings["chat"]>) => set({ chat: { ...c, ...patch } });
  const setFaq = (id: string, patch: Partial<Faq>) => up({ faqs: c.faqs.map((f) => (f.id === id ? { ...f, ...patch } : f)) });
  const [q, setQ] = useState("");
  const [log, setLog] = useState(initialLog);
  const [test, setTest] = useState("");
  const [reply, setReply] = useState<{ reply: string; answered: boolean } | null>(null);
  const [busy, setBusy] = useState(false);
  const [focus, setFocus] = useState("");

  const shown = c.faqs.filter((f) => !q || (f.q + " " + f.a).toLowerCase().includes(q.toLowerCase()));
  // the same question asked many times only shows once, with a count
  const asked = Object.values(
    log.reduce<Record<string, { q: string; n: number; answered: boolean; at: string }>>((m, e) => {
      const k = e.q.trim().toLowerCase();
      m[k] ??= { q: e.q, n: 0, answered: e.answered, at: e.at };
      m[k].n++;
      m[k].answered &&= e.answered;
      return m;
    }, {})
  ).sort((a, b) => Number(a.answered) - Number(b.answered) || b.n - a.n);
  const unanswered = asked.filter((a) => !a.answered).length;

  function addAnswer(question = "") {
    const f = { id: newId(), q: question, a: "", hidden: false };
    up({ faqs: [f, ...c.faqs] });
    setFocus(f.id);
    setQ("");
  }

  async function forget(question?: string) {
    setLog(await api<ChatLogEntry[]>("/api/admin/chat", "POST", { action: "clear", q: question }));
  }

  async function tryIt() {
    if (!test.trim()) return;
    setBusy(true);
    setReply(null);
    try {
      setReply(await api("/api/admin/chat", "POST", { action: "test", q: test }));
    } catch (e) {
      setReply({ reply: (e as Error).message, answered: false });
    }
    setBusy(false);
  }

  return (
    <>
      <div className="page-head">
        <h1>Chat</h1>
        <button className="b b-primary" onClick={() => addAnswer()}>Add a question</button>
      </div>
      <p className="muted lead">
        The <strong>Ask us</strong> button on the shop. It answers from the questions and answers below plus your items, prices, shipping, discounts and policies.
        {hasKey && c.useAI ? " Claude writes the replies in plain, friendly words." : " Right now it replies with the closest answer as written."}
        {" "}When people ask something it can&apos;t answer, it shows up under <strong>What people asked</strong> so you can add an answer.
      </p>
      <Tabs
        label="Chat"
        initial={unanswered ? "asked" : "answers"}
        tabs={[
          {
            id: "answers",
            label: "Questions & answers",
            badge: c.faqs.filter((f) => !f.hidden).length,
            content: (
              <>
                <input className="search" placeholder="Search questions and answers" value={q} onChange={(e) => setQ(e.target.value)} />
                <ul className="faq-list">
                  {shown.map((f) => (
                    <li key={f.id} className={`panel ${f.hidden ? "hidden-item" : ""}`}>
                      <label className="f"><span>Question</span><input autoFocus={focus === f.id} value={f.q} onChange={(e) => setFaq(f.id, { q: e.target.value })} placeholder="What a customer might ask" /></label>
                      <label className="f"><span>Answer</span><textarea rows={3} value={f.a} onChange={(e) => setFaq(f.id, { a: e.target.value })} placeholder="How you'd answer it" /></label>
                      <div className="row wrap">
                        <label className="switch" title={f.hidden ? "Hidden" : "In use"}>
                          <input type="checkbox" checked={!f.hidden} onChange={(e) => setFaq(f.id, { hidden: !e.target.checked })} aria-label="Use this answer" />
                          <span />
                        </label>
                        <span className="muted small">{f.hidden ? "Hidden: kept, but the chat won't use it" : "In use"}</span>
                        <span className="grow" />
                        <button type="button" className="b b-danger b-sm" onClick={() => confirm("Delete this question and answer for good? (Hiding it keeps it.)") && up({ faqs: c.faqs.filter((x) => x.id !== f.id) })}>Delete</button>
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            ),
          },
          {
            id: "asked",
            label: "What people asked",
            badge: unanswered || undefined,
            content: (
              <section className="panel">
                <p className="hint">Only the question is kept, never who asked. Ones the chat couldn&apos;t answer are at the top; tap <strong>Answer this</strong> to add it to your answers.</p>
                {asked.length ? (
                  <ul className="rows asked-list">
                    {asked.slice(0, 200).map((a) => (
                      <li key={a.q}>
                        <span>
                          <strong>{a.q}</strong>
                          <span className="muted small"> · {a.n > 1 ? `asked ${a.n} times` : when(a.at)}</span>
                        </span>
                        <span className="row">
                          {a.answered ? <span className="pill s-shipped">Answered</span> : <button className="b b-primary b-sm" onClick={() => addAnswer(a.q)}>Answer this</button>}
                          <button className="b b-ghost b-sm" aria-label="Remove from the list" onClick={() => forget(a.q)}>✕</button>
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="muted">Nothing asked yet.</p>
                )}
                {asked.length ? <button className="b b-ghost b-sm" onClick={() => confirm("Clear the whole list?") && forget()}>Clear the list</button> : null}
              </section>
            ),
          },
          {
            id: "settings",
            label: "Settings & try it",
            content: (
              <>
                <section className="panel stack">
                  <label className="check"><input type="checkbox" checked={c.on} onChange={(e) => up({ on: e.target.checked })} /> Show the chat button on the shop</label>
                  <label className="check"><input type="checkbox" checked={c.useAI} onChange={(e) => up({ useAI: e.target.checked })} /> Write natural replies with Claude</label>
                  <p className="hint">{hasKey ? "Your Anthropic key is saved." : "Needs an Anthropic API key on the Accounts & keys page; without it the chat sends the closest answer as written."} Each reply costs a fraction of a cent.</p>
                  <label className="f"><span>Title</span><input value={c.title} onChange={(e) => up({ title: e.target.value })} /></label>
                  <label className="f"><span>Greeting</span><textarea rows={2} value={c.greeting} onChange={(e) => up({ greeting: e.target.value })} /></label>
                </section>
                <section className="panel stack">
                  <h2>Try it</h2>
                  <p className="hint">Uses your saved answers (save changes first).</p>
                  <div className="row">
                    <input style={{ flex: 1 }} value={test} onChange={(e) => setTest(e.target.value)} onKeyDown={(e) => e.key === "Enter" && tryIt()} placeholder="e.g. do you ship to Texas?" />
                    <button className="b b-primary" disabled={busy} onClick={tryIt}>{busy ? "Thinking…" : "Ask"}</button>
                  </div>
                  {reply ? <p className={`chat-try ${reply.answered ? "" : "warn"}`}>{reply.reply}{reply.answered ? "" : " (not covered by your answers yet)"}</p> : null}
                </section>
              </>
            ),
          },
        ]}
      />
      {bar}
    </>
  );
}
