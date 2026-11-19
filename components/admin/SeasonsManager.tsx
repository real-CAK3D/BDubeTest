"use client";
import { useState } from "react";
import { SeasonBanner } from "@/components/shop/SeasonBanner";
import { isCustom, nextWindow, resolveSeasons, seasonEmoji, seasonName, shopToday, STYLES, type SeasonSetting, type SeasonStyle } from "@/lib/seasons";
import type { SiteSettings } from "@/lib/types";
import { useSettings } from "./useSettings";

const fmt = (d: Date) => d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" });
const LINKS = [
  { v: "/shop", l: "The shop" },
  { v: "/military", l: "Military discount" },
  { v: "/gift-cards", l: "Gift cards" },
  { v: "/custom-order", l: "Custom orders" },
  { v: "/coming-soon", l: "What's to come" },
  { v: "", l: "No button" },
];

/** Dashboard > Seasonal banners: every holiday with an on/off switch, its message, and a preview. */
export function SeasonsManager({ initial }: { initial: SiteSettings }) {
  const { s, set, bar } = useSettings(initial);
  const today = shopToday();
  const all = resolveSeasons(s.seasons);
  const [open, setOpen] = useState("");
  const save = (items: SeasonSetting[]) => set({ seasons: { ...s.seasons, items } });
  const update = (id: string, patch: Partial<SeasonSetting>) => save(all.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  const rows = all
    .map((x) => ({ x, w: nextWindow(x, today) }))
    .sort((a, b) => (a.w?.from.getTime() ?? Infinity) - (b.w?.from.getTime() ?? Infinity));
  const showing = rows.filter((r) => r.x.on && r.w?.now && r.x.message.trim()).sort((a, b) => a.w!.date.getTime() - b.w!.date.getTime())[0]?.x.id;

  function addOwn() {
    const id = `custom-${Math.random().toString(36).slice(2, 8)}`;
    save([...all, { id, on: true, name: "", emoji: "🎉", start: today.toISOString().slice(0, 10), message: "", link: "/shop", linkText: "Shop", daysBefore: 7, daysAfter: 0, style: "plain", decor: false }]);
    setOpen(id);
  }

  return (
    <>
      <div className="page-head">
        <h1>Seasonal banners</h1>
        <button className="b b-primary" onClick={addOwn}>Add your own</button>
      </div>
      <p className="muted lead">
        A banner across the top of the shop for each holiday you switch on. It shows by itself for the days before (and after) the holiday, then goes away, every year, with no need to remember. While one is showing it replaces your usual top message. If two overlap, the sooner holiday wins.
      </p>
      <section className="panel stack">
        <label className="check"><input type="checkbox" checked={s.seasons.on} onChange={(e) => set({ seasons: { ...s.seasons, on: e.target.checked } })} /> Show holiday banners (untick to turn them all off)</label>
        <p className="hint">{showing && s.seasons.on ? <>Showing on the shop now: <strong>{seasonName(all.find((x) => x.id === showing)!)}</strong>.</> : "Nothing is showing on the shop right now."}</p>
      </section>
      <ul className="season-list">
        {rows.map(({ x, w }) => {
          const isOpen = open === x.id;
          return (
            <li key={x.id} className={`panel ${x.on ? "" : "hidden-item"}`}>
              <div className="row wrap">
                <span className="season-row-emoji" aria-hidden>{seasonEmoji(x)}</span>
                <span className="stack-tight">
                  <strong>{seasonName(x)}</strong>
                  <span className="muted small">
                    {w ? <>{fmt(w.date)} · shows {fmt(w.from)}{w.to.getTime() !== w.from.getTime() ? ` to ${fmt(w.to)}` : ""}</> : "Pick a date"}
                    {showing === x.id && s.seasons.on ? <b className="pill s-live" style={{ marginLeft: 6, textTransform: "none" }}>Showing now</b> : null}
                  </span>
                </span>
                <span className="grow" />
                <label className="switch" title={x.on ? "On" : "Off"}>
                  <input type="checkbox" checked={x.on} onChange={(e) => update(x.id, { on: e.target.checked })} aria-label={`${seasonName(x)} banner`} />
                  <span />
                </label>
                <button className="b b-sm" onClick={() => setOpen(isOpen ? "" : x.id)}>{isOpen ? "Close" : "Edit"}</button>
              </div>
              {isOpen ? (
                <div className="stack" style={{ marginTop: "0.9rem" }}>
                  <SeasonBanner season={{ ...x, message: x.message || "Your message here" }} emoji={seasonEmoji(x)} preview />
                  {isCustom(x.id) ? (
                    <div className="row2">
                      <label className="f"><span>Name</span><input value={x.name ?? ""} onChange={(e) => update(x.id, { name: e.target.value })} placeholder="e.g. Shop anniversary, Craft fair" /></label>
                      <label className="f"><span>Date (repeats every year)</span><input type="date" value={x.start ?? ""} onChange={(e) => update(x.id, { start: e.target.value })} /></label>
                    </div>
                  ) : null}
                  <label className="f"><span>Message</span><input value={x.message} maxLength={200} onChange={(e) => update(x.id, { message: e.target.value })} placeholder="What the banner says" /></label>
                  <div className="row2">
                    <label className="f"><span>Button goes to</span>
                      <select value={LINKS.some((l) => l.v === x.link) ? x.link : "other"} onChange={(e) => update(x.id, { link: e.target.value === "other" ? "/" : e.target.value })}>
                        {LINKS.map((l) => <option key={l.l} value={l.v}>{l.l}</option>)}
                        <option value="other">Another page or link…</option>
                      </select>
                    </label>
                    {x.link ? <label className="f"><span>Button text</span><input value={x.linkText} maxLength={30} onChange={(e) => update(x.id, { linkText: e.target.value })} placeholder="e.g. Shop gifts" /></label> : <span />}
                  </div>
                  {x.link && !LINKS.some((l) => l.v === x.link) ? <label className="f"><span>Link</span><input value={x.link} onChange={(e) => update(x.id, { link: e.target.value.trim() })} placeholder="/shop?c=Drinkware or https://..." /></label> : null}
                  <div className="row2">
                    <label className="f"><span>Start showing (days before)</span><input type="number" min={0} max={60} value={x.daysBefore} onChange={(e) => update(x.id, { daysBefore: Number(e.target.value) })} /></label>
                    <label className="f"><span>Keep showing (days after)</span><input type="number" min={0} max={60} value={x.daysAfter} onChange={(e) => update(x.id, { daysAfter: Number(e.target.value) })} /></label>
                  </div>
                  <div className="row2">
                    <label className="f"><span>Colors</span>
                      <select value={x.style} onChange={(e) => update(x.id, { style: e.target.value as SeasonStyle })}>{Object.entries(STYLES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select>
                    </label>
                    {isCustom(x.id) ? <label className="f"><span>Icon</span><input value={x.emoji ?? ""} maxLength={4} onChange={(e) => update(x.id, { emoji: e.target.value })} placeholder="🎉" /></label> : <span />}
                  </div>
                  <label className="check"><input type="checkbox" checked={x.decor} disabled={!STYLES[x.style]?.decor.length} onChange={(e) => update(x.id, { decor: e.target.checked })} /> Little drifting {STYLES[x.style]?.decor.length ? STYLES[x.style].decor.slice(0, 2).join(" ") : "icons"} in the banner{STYLES[x.style]?.decor.length ? "" : " (not with these colors)"}</label>
                  {isCustom(x.id) ? <button className="b b-danger b-sm" style={{ justifySelf: "start" }} onClick={() => confirm("Delete this event?") && save(all.filter((y) => y.id !== x.id))}>Delete</button> : null}
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
      {bar}
    </>
  );
}
