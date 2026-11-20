"use client";
import { useEffect, useState } from "react";
import type { Abandoned, GiftCard, SiteSettings, VetRequest } from "@/lib/types";
import { api } from "./api";
import { CopyButton } from "./CopyButton";
import { Tabs } from "./Tabs";
import { useSettings } from "./useSettings";

type Code = { id: string; code: string; label: string; uses: number; maxUses: number | null; expires: string | null; active: boolean };
type Person = { email: string; name: string; orders: number };
type Data = { codes: Code[]; vets: VetRequest[]; gifts: GiftCard[]; customers: Person[]; canEmail: boolean; abandoned: Abandoned[]; error?: string };

const day = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

/*
 * Discounts: promo codes (made here, kept in Stripe), sending them to customers,
 * and the standing programs: thank-you codes, military discount, bulk pricing, gift cards.
 */
export function DiscountsManager({ initial, stripeOn }: { initial: SiteSettings; stripeOn: boolean }) {
  const { s, set, bar } = useSettings(initial);
  const d = s.discounts;
  const up = (patch: Partial<SiteSettings["discounts"]>) => set({ discounts: { ...d, ...patch } });
  const [data, setData] = useState<Data | null>(null);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [sending, setSending] = useState<Code | null>(null);
  const [form, setForm] = useState({ code: "", name: "", type: "percent", value: "10", maxUses: "", expiresDays: "", minOrder: "", firstOrderOnly: false });

  const load = () => api<Data>("/api/admin/discounts", "GET").then(setData).catch((e) => setErr(e.message));
  useEffect(() => {
    load();
  }, []);

  async function act(body: Record<string, unknown>) {
    setBusy(true);
    setErr("");
    setMsg("");
    try {
      const r = await api<{ message?: string }>("/api/admin/discounts", "POST", body);
      if (r.message) setMsg(r.message);
      await load();
      return true;
    } catch (e) {
      setErr((e as Error).message);
      return false;
    } finally {
      setBusy(false);
    }
  }

  const note = (
    <>
      {msg ? <p className="alert" role="status">{msg}</p> : null}
      {err ? <p className="err" role="alert">{err}</p> : null}
    </>
  );
  const needStripe = !stripeOn ? <div className="panel"><p>Codes live in Stripe so its checkout page can check them. Connect Stripe on the <a href="/admin/keys">Accounts &amp; keys</a> page first.</p></div> : null;
  const newVets = data?.vets.filter((v) => v.status === "new").length ?? 0;

  return (
    <>
      <div className="page-head"><h1>Discounts</h1></div>
      <p className="muted lead">Make codes, send them to customers, and set up standing deals. Changes take effect on the shop right away.{s.allowPromoCodes ? "" : " The promo code box at checkout is off; turn it on in Settings > Checkout."}</p>
      <Tabs
        label="Discounts"
        tabs={[
          {
            id: "codes",
            label: "Codes",
            content: (
              <>
                {needStripe}
                {note}
                <section className="panel stack">
                  <h2>Make a code</h2>
                  <div className="row2">
                    <label className="f"><span>Code <em className="muted">(leave empty to make one up)</em></span><input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "") })} placeholder="e.g. SPRING15" maxLength={30} /></label>
                    <label className="f"><span>What it&apos;s for <em className="muted">(only you see this)</em></span><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Craft fair 2027" maxLength={40} /></label>
                  </div>
                  <div className="row2">
                    <div className="f">
                      <span>Takes off</span>
                      <div className="row">
                        <div className="seg">
                          <button type="button" className={form.type === "percent" ? "on" : ""} onClick={() => setForm({ ...form, type: "percent" })}>%</button>
                          <button type="button" className={form.type === "amount" ? "on" : ""} onClick={() => setForm({ ...form, type: "amount" })}>$</button>
                        </div>
                        <input inputMode="decimal" style={{ width: "6rem" }} value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value.replace(/[^0-9.]/g, "") })} />
                      </div>
                    </div>
                    <label className="f"><span>Times it can be used <em className="muted">(empty = no limit)</em></span><input inputMode="numeric" value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: e.target.value.replace(/\D/g, "") })} /></label>
                  </div>
                  <div className="row2">
                    <label className="f"><span>Ends after this many days <em className="muted">(empty = never)</em></span><input inputMode="numeric" value={form.expiresDays} onChange={(e) => setForm({ ...form, expiresDays: e.target.value.replace(/\D/g, "") })} /></label>
                    <label className="f"><span>Smallest order it works on, $ <em className="muted">(optional)</em></span><input inputMode="decimal" value={form.minOrder} onChange={(e) => setForm({ ...form, minOrder: e.target.value.replace(/[^0-9.]/g, "") })} /></label>
                  </div>
                  <label className="check"><input type="checkbox" checked={form.firstOrderOnly} onChange={(e) => setForm({ ...form, firstOrderOnly: e.target.checked })} /> Only for someone&apos;s first order</label>
                  <div><button className="b b-primary" disabled={busy || !stripeOn} onClick={async () => (await act({ action: "create", ...form })) && setForm({ ...form, code: "", name: "" })}>{busy ? "Making…" : "Make code"}</button></div>
                </section>

                {sending ? <SendPanel code={sending} people={data?.customers ?? []} canEmail={Boolean(data?.canEmail)} busy={busy} onSend={(to, n) => act({ action: "send", code: sending.code, label: sending.label, to, note: n })} onClose={() => setSending(null)} /> : null}

                <section className="panel">
                  <div className="panel-head"><h2>Your codes</h2></div>
                  {data?.error ? <p className="err">{data.error}</p> : null}
                  {!data ? <p className="muted">Loading…</p> : data.codes.length ? (
                    <div className="tbl-scroll">
                      <table className="tbl">
                        <thead><tr><th>Code</th><th>Takes off</th><th>Used</th><th>Ends</th><th>On</th><th /></tr></thead>
                        <tbody>
                          {data.codes.map((c) => (
                            <tr key={c.id} className={c.active ? "" : "hidden-item"}>
                              <td><code>{c.code}</code></td>
                              <td>{c.label}</td>
                              <td>{c.uses}{c.maxUses ? ` of ${c.maxUses}` : ""}</td>
                              <td>{c.expires ? day(c.expires) : "Never"}</td>
                              <td>
                                <label className="switch" title={c.active ? "On" : "Off"}>
                                  <input type="checkbox" checked={c.active} disabled={busy} onChange={(e) => act({ action: "toggle", id: c.id, active: e.target.checked })} aria-label={`${c.code} on`} />
                                  <span />
                                </label>
                              </td>
                              <td className="row">
                                <CopyButton text={c.code} />
                                {c.active ? <button className="b b-sm" onClick={() => setSending(c)}>Send</button> : null}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="muted">No codes yet.</p>
                  )}
                </section>
              </>
            ),
          },
          {
            id: "programs",
            label: "Deals",
            content: (
              <>
                <section className="panel stack">
                  <h2>Thank-you code for the next order</h2>
                  <label className="check"><input type="checkbox" checked={d.thankYou.on} onChange={(e) => up({ thankYou: { ...d.thankYou, on: e.target.checked } })} /> After each order, give the customer a one-time code for their next one</label>
                  <div className="row2">
                    <label className="f"><span>% off</span><input inputMode="numeric" value={d.thankYou.percent} onChange={(e) => up({ thankYou: { ...d.thankYou, percent: Number(e.target.value.replace(/\D/g, "")) || 0 } })} /></label>
                    <label className="f"><span>Good for this many days</span><input inputMode="numeric" value={d.thankYou.days} onChange={(e) => up({ thankYou: { ...d.thankYou, days: Number(e.target.value.replace(/\D/g, "")) || 0 } })} /></label>
                  </div>
                  <p className="hint">The code shows on their thank-you page and on the order in your dashboard. Needs Stripe connected.</p>
                </section>

                <section className="panel stack">
                  <h2>Military & first responder discount</h2>
                  <label className="check"><input type="checkbox" checked={d.veteran.on} onChange={(e) => up({ veteran: { ...d.veteran, on: e.target.checked } })} /> Offer it (adds a page, a footer link and a note in the cart)</label>
                  <div className="row2">
                    <label className="f"><span>% off</span><input inputMode="numeric" value={d.veteran.percent} onChange={(e) => up({ veteran: { ...d.veteran, percent: Number(e.target.value.replace(/\D/g, "")) || 0 } })} /></label>
                    <div className="f">
                      <span>How they get it</span>
                      <div className="seg">
                        <button type="button" className={d.veteran.verify ? "on" : ""} onClick={() => up({ veteran: { ...d.veteran, verify: true } })}>They ask, I approve</button>
                        <button type="button" className={!d.veteran.verify ? "on" : ""} onClick={() => up({ veteran: { ...d.veteran, verify: false } })}>One shared code</button>
                      </div>
                    </div>
                  </div>
                  {!d.veteran.verify ? (
                    <label className="f"><span>The shared code <em className="muted">(make it on the Codes tab first)</em></span><input value={d.veteran.code} onChange={(e) => up({ veteran: { ...d.veteran, code: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "") } })} placeholder="e.g. SERVED10" /></label>
                  ) : (
                    <p className="hint">Requests show on the Military tab. Approving one makes a personal code and emails it (or you can copy it).</p>
                  )}
                  <label className="f"><span>Page heading</span><input value={d.veteran.heading} onChange={(e) => up({ veteran: { ...d.veteran, heading: e.target.value } })} /></label>
                  <label className="f"><span>Page text <em className="muted">({"{percent}"} is filled in)</em></span><textarea rows={3} value={d.veteran.text} onChange={(e) => up({ veteran: { ...d.veteran, text: e.target.value } })} /></label>
                </section>

                <section className="panel stack">
                  <h2>Bulk order pricing</h2>
                  <p className="hint">The more items in one order, the bigger the discount. It comes off automatically in the cart and at checkout, and works alongside promo codes.</p>
                  {d.bulk.map((t, i) => (
                    <div key={i} className="tier">
                      <span>From</span>
                      <input aria-label="Items" inputMode="numeric" value={t.minQty} onChange={(e) => up({ bulk: d.bulk.map((x, j) => (j === i ? { ...x, minQty: Number(e.target.value.replace(/\D/g, "")) || 0 } : x)) })} />
                      <span>items:</span>
                      <input aria-label="Percent off" inputMode="numeric" value={t.percent} onChange={(e) => up({ bulk: d.bulk.map((x, j) => (j === i ? { ...x, percent: Number(e.target.value.replace(/\D/g, "")) || 0 } : x)) })} />
                      <span>% off</span>
                      <button type="button" className="b b-ghost b-sm" aria-label="Remove" onClick={() => up({ bulk: d.bulk.filter((_, j) => j !== i) })}>✕</button>
                    </div>
                  ))}
                  <div><button type="button" className="b b-sm" onClick={() => up({ bulk: [...d.bulk, { minQty: (d.bulk.at(-1)?.minQty ?? 5) * 2, percent: (d.bulk.at(-1)?.percent ?? 5) + 5 }] })}>Add a level</button></div>
                </section>

                <section className="panel stack">
                  <h2>Gift cards</h2>
                  <label className="check"><input type="checkbox" checked={d.giftCards.on} onChange={(e) => up({ giftCards: { ...d.giftCards, on: e.target.checked } })} /> Sell gift cards (adds a Gift cards page)</label>
                  <label className="f"><span>Amounts, $ (separated by commas)</span><input defaultValue={d.giftCards.amounts.join(", ")} onBlur={(e) => up({ giftCards: { ...d.giftCards, amounts: e.target.value.split(",").map((x) => Math.round(Number(x.replace(/[^0-9.]/g, "")) || 0)).filter((x) => x >= 5) } })} /></label>
                  <label className="f"><span>Page heading</span><input value={d.giftCards.heading} onChange={(e) => up({ giftCards: { ...d.giftCards, heading: e.target.value } })} /></label>
                  <label className="f"><span>Page text</span><textarea rows={2} value={d.giftCards.text} onChange={(e) => up({ giftCards: { ...d.giftCards, text: e.target.value } })} /></label>
                  <p className="hint">Each gift card is a one-time code worth its amount, emailed to the person it&apos;s for. It&apos;s used up in one order.</p>
                </section>
              </>
            ),
          },
          {
            id: "military",
            label: "Military",
            badge: newVets || undefined,
            content: (
              <section className="panel">
                {note}
                {!d.veteran.on ? <p className="muted">The military discount is off (Deals tab).</p> : !d.veteran.verify ? <p className="muted">You&apos;re using one shared code, so there are no requests to approve.</p> : null}
                {data?.vets.length ? (
                  <ul className="rows vet-list">
                    {data.vets.map((v) => (
                      <li key={v.id}>
                        <span><strong>{v.name}</strong> <span className="muted">· {v.group} · {day(v.createdAt)}</span><br /><a href={`mailto:${v.email}`}>{v.email}</a>{v.note ? <span className="muted"> · {v.note}</span> : null}</span>
                        {v.status === "new" ? (
                          <span className="row">
                            <button className="b b-primary b-sm" disabled={busy || !stripeOn} onClick={() => act({ action: "approveVet", id: v.id })}>Approve</button>
                            <button className="b b-ghost b-sm" disabled={busy} onClick={() => act({ action: "declineVet", id: v.id })}>Decline</button>
                          </span>
                        ) : v.code ? (
                          <span className="row"><code>{v.code}</code><CopyButton text={v.code} /></span>
                        ) : (
                          <span className="muted">{v.status}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="muted">No requests yet.</p>
                )}
              </section>
            ),
          },
          {
            id: "reminders",
            label: "Cart reminders",
            content: (
              <>
                <section className="panel stack">
                  <h2>Remind people who didn&apos;t finish checking out</h2>
                  <label className="check"><input type="checkbox" checked={d.reminders.on} onChange={(e) => up({ reminders: { ...d.reminders, on: e.target.checked } })} /> Send one reminder email with a link back to their cart</label>
                  <label className="f"><span>Send it after this many hours (1 to 24)</span><input inputMode="numeric" value={d.reminders.hours} onChange={(e) => up({ reminders: { ...d.reminders, hours: Number(e.target.value.replace(/\D/g, "")) || 1 } })} /></label>
                  <p className="hint">Only for people who typed their email on Stripe&apos;s checkout page and then left. {data && !data.canEmail ? "Email isn't set up yet (Setup > Tracking emails), so they're listed below for you to contact instead." : ""} Turning this on (or changing the hours) needs the Stripe webhook connected again once: Keys &gt; Connect Stripe webhook.</p>
                </section>
                <section className="panel">
                  <div className="panel-head"><h2>Unfinished checkouts</h2></div>
                  {data?.abandoned.length ? (
                    <ul className="rows vet-list">
                      {data.abandoned.map((a) => (
                        <li key={a.id}>
                          <span><strong>{a.name || a.email}</strong> <span className="muted">· ${(a.amount / 100).toFixed(2)} · {day(a.createdAt)}</span><br /><span className="muted small">{a.items}</span></span>
                          <span className="row">
                            {a.recovered ? <span className="pill s-shipped">Came back and paid</span> : a.emailedAt ? <span className="pill">Reminder sent</span> : <a className="b b-sm" href={`mailto:${a.email}?subject=${encodeURIComponent("Your cart is saved")}&body=${encodeURIComponent(`Hi, you left a few things in your cart. Pick up where you left off: ${a.url}`)}`}>Email them</a>}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="muted">None yet.</p>
                  )}
                </section>
              </>
            ),
          },
          {
            id: "gifts",
            label: "Gift cards",
            content: (
              <>
                <p className="muted small">Gift cards are the shop's own codes with a balance: they work with every way to pay, and whatever isn't spent stays on the card.</p>
                {note}
                <GiftMaker busy={busy} disabled={false} onMake={(g) => act({ action: "giftCard", ...g })} />
                <section className="panel">
                  <div className="panel-head"><h2>Gift cards</h2></div>
                  {data?.gifts.length ? (
                    <div className="tbl-scroll">
                      <table className="tbl">
                        <thead><tr><th>Code</th><th>Amount</th><th>For</th><th>From</th><th>Made</th><th>Left</th></tr></thead>
                        <tbody>
                          {data.gifts.map((g) => {
                            const c = data.codes.find((x) => x.id === g.promoId);
                            return (
                              <tr key={g.id}>
                                <td><code>{g.code}</code> <CopyButton text={g.code} /></td>
                                <td>${(g.amount / 100).toFixed(2)}</td>
                                <td>{g.toName || g.toEmail || g.buyerEmail}{g.sentAt ? " (emailed)" : ""}</td>
                                <td>{g.fromName}{g.orderNumber ? ` · order #${g.orderNumber}` : ""}</td>
                                <td>{day(g.createdAt)}</td>
                                <td>{g.promoId ? (c ? (c.uses ? "Used" : "Not yet") : "?") : `$${((g.balance ?? 0) / 100).toFixed(2)}${g.uses?.length ? ` (used on #${g.uses.map((u) => u.order).join(", #")})` : ""}`}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="muted">No gift cards yet.</p>
                  )}
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

function SendPanel({ code, people, canEmail, busy, onSend, onClose }: { code: Code; people: Person[]; canEmail: boolean; busy: boolean; onSend: (to: string[], note: string) => Promise<boolean>; onClose: () => void }) {
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [extra, setExtra] = useState("");
  const [note, setNote] = useState("");
  const to = [...picked, ...extra.split(/[\s,;]+/).filter((x) => x.includes("@"))];
  const mailto = `mailto:?bcc=${encodeURIComponent(to.join(","))}&subject=${encodeURIComponent("A code for you")}&body=${encodeURIComponent(`${note ? note + "\n\n" : ""}Your code: ${code.code} (${code.label})`)}`;
  return (
    <section className="panel stack">
      <div className="panel-head"><h2>Send {code.code}</h2><button className="b b-ghost b-sm" onClick={onClose}>Close</button></div>
      {people.length ? (
        <>
          <div className="row wrap">
            <button className="b b-ghost b-sm" onClick={() => setPicked(new Set(people.map((p) => p.email)))}>Everyone ({people.length})</button>
            <button className="b b-ghost b-sm" onClick={() => setPicked(new Set(people.filter((p) => p.orders > 0).map((p) => p.email)))}>Past buyers</button>
            <button className="b b-ghost b-sm" onClick={() => setPicked(new Set())}>None</button>
          </div>
          <ul className="pick-people">
            {people.map((p) => (
              <li key={p.email}>
                <label className="check small">
                  <input type="checkbox" checked={picked.has(p.email)} onChange={(e) => {
                    const n = new Set(picked);
                    if (e.target.checked) n.add(p.email);
                    else n.delete(p.email);
                    setPicked(n);
                  }} />
                  {p.name || p.email} <span className="muted">{p.name ? p.email : ""}{p.orders ? ` · ${p.orders} order${p.orders === 1 ? "" : "s"}` : " · sign-up"}</span>
                </label>
              </li>
            ))}
          </ul>
        </>
      ) : null}
      <label className="f"><span>Other email addresses <em className="muted">(optional)</em></span><input value={extra} onChange={(e) => setExtra(e.target.value)} placeholder="name@example.com, ..." /></label>
      <label className="f"><span>Message</span><textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Thanks for being a customer! Here's a little something for your next order." /></label>
      <div className="row wrap">
        {canEmail ? <button className="b b-primary" disabled={busy || !to.length} onClick={async () => (await onSend(to, note)) && onClose()}>Email {to.length || ""} {to.length === 1 ? "person" : "people"}</button> : null}
        <a className={`b ${canEmail ? "b-ghost" : "b-primary"}`} href={mailto}>Open in my email app</a>
      </div>
      <p className="hint">{canEmail ? "Each person gets their own email, so nobody sees the others' addresses." : "Opens your email app with everyone in BCC, so nobody sees the others' addresses. To send from the site instead, set up email (Setup > Tracking emails)."}</p>
    </section>
  );
}

function GiftMaker({ busy, disabled, onMake }: { busy: boolean; disabled: boolean; onMake: (g: { amount: string; toName: string; toEmail: string; message: string }) => Promise<boolean> }) {
  const [g, setG] = useState({ amount: "25", toName: "", toEmail: "", message: "" });
  return (
    <section className="panel stack">
      <h2>Make a gift card</h2>
      <p className="hint">For giveaways, raffles, or to replace one. It&apos;s emailed if you add an address (and email is set up).</p>
      <div className="row2">
        <label className="f"><span>Amount, $</span><input inputMode="decimal" value={g.amount} onChange={(e) => setG({ ...g, amount: e.target.value.replace(/[^0-9.]/g, "") })} /></label>
        <label className="f"><span>For</span><input value={g.toName} onChange={(e) => setG({ ...g, toName: e.target.value })} placeholder="Name" /></label>
      </div>
      <label className="f"><span>Their email <em className="muted">(optional)</em></span><input type="email" value={g.toEmail} onChange={(e) => setG({ ...g, toEmail: e.target.value })} /></label>
      <label className="f"><span>Message <em className="muted">(optional)</em></span><input value={g.message} onChange={(e) => setG({ ...g, message: e.target.value })} /></label>
      <div><button className="b b-primary" disabled={busy || disabled} onClick={async () => (await onMake(g)) && setG({ amount: "25", toName: "", toEmail: "", message: "" })}>Make gift card</button></div>
    </section>
  );
}
