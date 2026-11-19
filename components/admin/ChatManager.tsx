"use client";
import { useState } from "react";
import { AI_PROVIDERS, providerOf } from "@/lib/ai-providers";
import type { ChatSuggestion } from "@/lib/chat";
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
export function ChatManager({ initial, log: initialLog, hasKey, suggestions = [] }: { initial: SiteSettings; log: ChatLogEntry[]; hasKey: boolean; suggestions?: ChatSuggestion[] }) {
  const { s, set, bar } = useSettings(initial);
  const c = s.chat;
  const up = (patch: Partial<SiteSettings["chat"]>) => set({ chat: { ...c, ...patch } });
  const setFaq = (id: string, patch: Partial<Faq>) => up({ faqs: c.faqs.map((f) => (f.id === id ? { ...f, ...patch } : f)) });
  const [q, setQ] = useState("");
  const [log, setLog] = useState(initialLog);
  const [test, setTest] = useState("");
  const [reply, setReply] = useState<{ reply: string; answered: boolean; via?: string; error?: string } | null>(null);
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

  const ai = c.ai ?? { provider: "anthropic", model: "", baseUrl: "" };
  const prov = providerOf(ai.provider);
  const aiOn = c.useAI && (hasKey || !prov.needsKey) && (prov.id === "anthropic" || Boolean(ai.baseUrl || prov.baseUrl));

  // a customer's wording becomes another way to ask an answer you already have
  function sameAs(questions: string | string[], id: string) {
    const qs = Array.isArray(questions) ? questions : [questions];
    up({ faqs: c.faqs.map((f) => (f.id === id ? { ...f, alts: [...new Set([...(f.alts ?? []), ...qs])].slice(0, 30) } : f)) });
    setDone((d) => [...d, ...qs]);
    void Promise.all(qs.map((q) => forget(q)));
  }
  const [done, setDone] = useState<string[]>([]);
  const tips = suggestions.filter((g) => !g.questions.every((q) => done.includes(q)));
  function newFrom(g: ChatSuggestion) {
    const f = { id: newId(), q: g.questions[0], a: "", hidden: false, alts: g.questions.slice(1) };
    up({ faqs: [f, ...c.faqs] });
    setFocus(f.id);
    setDone((d) => [...d, ...g.questions]);
  }

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
        {aiOn ? ` ${prov.name} writes the replies in plain, friendly words.` : " It answers on its own (no AI key needed): it fixes typos, looks up item prices and stock, discounts and shipping, follows \"how much is it?\" questions, and picks your closest written answer."}
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
                      <label className="f">
                        <span>Other ways people ask it <span className="muted small">(optional, one per line)</span></span>
                        <textarea rows={Math.min(5, Math.max(1, (f.alts?.length ?? 0) + 1))} value={(f.alts ?? []).join("\n")} onChange={(e) => setFaq(f.id, { alts: e.target.value.split("\n").map((x) => x.trimStart()).slice(0, 30) })} placeholder="e.g. how long till I get it" />
                      </label>
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
              <>
              {tips.length ? (
                <section className="panel stack">
                  <h2>Suggestions</h2>
                  <p className="hint">The chat&apos;s meaning model grouped questions it couldn&apos;t answer. One tap teaches it; remember to save.</p>
                  <ul className="rows asked-list">
                    {tips.map((g) => (
                      <li key={g.questions[0]} className="stack">
                        <span>
                          <strong>{g.questions[0]}</strong>
                          <span className="muted small"> · asked {g.asked} time{g.asked === 1 ? "" : "s"}{g.questions.length > 1 ? `, ${g.questions.length} ways` : ""}</span>
                          {g.questions.length > 1 ? <span className="muted small"><br />Also: {g.questions.slice(1, 5).map((q) => `"${q}"`).join(", ")}</span> : null}
                        </span>
                        <span className="row wrap">
                          {g.faqId ? <button className="b b-primary b-sm" onClick={() => sameAs(g.questions, g.faqId!)}>Same as &quot;{(g.faqQ ?? "").slice(0, 40)}&quot;</button> : null}
                          <button className={`b b-sm ${g.faqId ? "b-ghost" : "b-primary"}`} onClick={() => newFrom(g)}>Write a new answer</button>
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}
              <section className="panel">
                <p className="hint">Only the question is kept, never who asked. Ones the chat couldn&apos;t answer are at the top. <strong>Answer this</strong> adds a new answer; <strong>Same as…</strong> teaches the chat that this wording means a question you already answered. Remember to save.</p>
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
                          {a.answered ? null : (
                            <select className="b-sm" value="" aria-label="Same as an answer you already have" onChange={(e) => e.target.value && sameAs(a.q, e.target.value)}>
                              <option value="">Same as…</option>
                              {c.faqs.filter((f) => f.q).map((f) => <option key={f.id} value={f.id}>{f.q.length > 50 ? f.q.slice(0, 49) + "…" : f.q}</option>)}
                            </select>
                          )}
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
              </>
            ),
          },
          {
            id: "settings",
            label: "Settings & try it",
            content: (
              <>
                <section className="panel stack">
                  <label className="check"><input type="checkbox" checked={c.on} onChange={(e) => up({ on: e.target.checked })} /> Show the chat button on the shop</label>
                  <p className="hint">The chat works with no AI at all. An AI just makes the wording more natural and handles odd questions better.</p>
                  <label className="check"><input type="checkbox" checked={c.useAI} onChange={(e) => up({ useAI: e.target.checked })} /> Let an AI write the replies</label>
                  {c.useAI ? (
                    <>
                      <label className="f">
                        <span>AI service</span>
                        <select value={prov.id} onChange={(e) => up({ ai: { provider: e.target.value, model: "", baseUrl: "" } })}>
                          {AI_PROVIDERS.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
                        </select>
                      </label>
                      <p className="hint">{prov.note}{prov.keyUrl ? <> <a href={prov.keyUrl} target="_blank" rel="noreferrer">{prov.needsKey ? "Get a key" : "Download"}</a></> : null}</p>
                      <label className="f"><span>Model</span><input value={ai.model} onChange={(e) => up({ ai: { ...ai, model: e.target.value.trim() } })} placeholder={prov.model || "the model's name, e.g. llama3.3"} /></label>
                      {prov.id !== "anthropic" ? (
                        <label className="f"><span>Address (base URL)</span><input value={ai.baseUrl} onChange={(e) => up({ ai: { ...ai, baseUrl: e.target.value.trim() } })} placeholder={prov.baseUrl || "https://your-server.example.com/v1"} /></label>
                      ) : null}
                      <p className="hint">Leave model{prov.id !== "anthropic" ? " and address" : ""} empty to use the usual one shown in grey. {hasKey ? <>Your AI key is saved. </> : prov.needsKey ? <><strong>No AI key saved yet</strong>: paste it on <a href="/admin/keys">Accounts &amp; keys</a> (AI key for the chat). Until then the chat answers on its own. </> : null}If the AI ever fails, the chat answers on its own instead, so customers always get a reply.</p>
                    </>
                  ) : null}
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
                  {reply ? (
                    <>
                      <p className={`chat-try ${reply.answered ? "" : "warn"}`}>{reply.reply}{reply.answered ? "" : " (not covered by your answers yet)"}</p>
                      <p className="muted small">Answered by {reply.via === "brain" || !reply.via ? "the shop's own chat (no AI)" : reply.via}{reply.error ? `. The AI didn't work: ${reply.error}` : ""}</p>
                    </>
                  ) : null}
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
