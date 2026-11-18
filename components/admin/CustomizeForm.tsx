"use client";
import { ADMIN_PAGES, ALWAYS_SHOWN, bottomTabs, orderedPages } from "@/lib/admin-pages";
import { DASHBOARD_WIDGETS, DEFAULT_ADMIN, widgetOrder } from "@/lib/site-structure";
import type { AdminPrefs, SiteSettings } from "@/lib/types";
import { Tabs } from "./Tabs";
import { useSettings } from "./useSettings";

const SWATCHES = [
  { name: "Army green", hex: "#1E4D36" },
  { name: "Olive drab", hex: "#4B5320" },
  { name: "Police blue", hex: "#1F3A93" },
  { name: "Navy", hex: "#14284B" },
  { name: "Old Glory red", hex: "#A6192E" },
  { name: "Brass", hex: "#8A6A12" },
  { name: "Walnut", hex: "#6B4226" },
  { name: "Slate", hex: "#3F4A55" },
];

/** Everything about how the owner's dashboard looks and is arranged. */
export function CustomizeForm({ initial }: { initial: SiteSettings }) {
  const { s, set, bar } = useSettings(initial);
  const a = s.admin;
  const up = (patch: Partial<AdminPrefs>) => set({ admin: { ...a, ...patch } });
  const pages = orderedPages(a);
  const tabs = bottomTabs(a).map((t) => t.href);
  const widgets = widgetOrder(a);

  const movePage = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= pages.length) return;
    const next = pages.map((p) => ({ href: p.href, hidden: p.hidden }));
    [next[i], next[j]] = [next[j], next[i]];
    up({ nav: next });
  };
  const moveWidget = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= widgets.length) return;
    const next = [...widgets];
    [next[i], next[j]] = [next[j], next[i]];
    up({ widgets: next });
  };
  const setTab = (slot: number, href: string) => {
    const next = [...tabs];
    const other = next.indexOf(href);
    if (other >= 0) next[other] = next[slot]; // swap if it's already in another spot
    next[slot] = href;
    up({ tabs: next });
  };

  return (
    <>
      <div className="page-head">
        <h1>Customize dashboard</h1>
        <button className="b b-ghost b-sm" onClick={() => confirm("Put the dashboard back the way it started?") && set({ admin: { ...DEFAULT_ADMIN } })}>Reset to default</button>
      </div>
      <p className="muted lead">Make the dashboard yours: colors, what&apos;s on the home screen, the menu order and the phone&apos;s bottom bar. Only you see these; they don&apos;t change the shop. Tap <strong>Save changes</strong> to apply.</p>
      <Tabs
        label="Customize"
        tabs={[
          {
            id: "look",
            label: "Look",
            content: (
              <section className="panel stack">
                <label className="f"><span>Name in the top bar</span><input value={a.title} placeholder={s.businessName} onChange={(e) => up({ title: e.target.value })} /></label>
                <div className="f">
                  <span>Main color</span>
                  <div className="swatches">
                    <button type="button" className={!a.accent ? "on" : ""} onClick={() => up({ accent: "" })} title="Default"><i style={{ background: "#1E4D36" }} />Default</button>
                    {SWATCHES.map((c) => (
                      <button key={c.hex} type="button" className={a.accent.toLowerCase() === c.hex.toLowerCase() ? "on" : ""} onClick={() => up({ accent: c.hex })} title={c.name}>
                        <i style={{ background: c.hex }} />
                        {c.name}
                      </button>
                    ))}
                    <label className="swatch-pick">
                      <input type="color" value={a.accent || "#1E4D36"} onChange={(e) => up({ accent: e.target.value })} aria-label="Pick any color" />
                      Any color
                    </label>
                  </div>
                </div>
                <div className="f">
                  <span>Light or dark</span>
                  <div className="seg">
                    {(["auto", "light", "dark"] as const).map((m) => (
                      <button key={m} type="button" className={a.mode === m ? "on" : ""} onClick={() => up({ mode: m })}>{m === "auto" ? "Match my phone" : m === "light" ? "Light" : "Dark"}</button>
                    ))}
                  </div>
                </div>
                <div className="row2">
                  <div className="f">
                    <span>Spacing</span>
                    <div className="seg">
                      <button type="button" className={a.density === "comfy" ? "on" : ""} onClick={() => up({ density: "comfy" })}>Roomy</button>
                      <button type="button" className={a.density === "compact" ? "on" : ""} onClick={() => up({ density: "compact" })}>Compact</button>
                    </div>
                  </div>
                  <div className="f">
                    <span>Text size</span>
                    <div className="seg">
                      <button type="button" className={a.textSize === "normal" ? "on" : ""} onClick={() => up({ textSize: "normal" })}>Normal</button>
                      <button type="button" className={a.textSize === "large" ? "on" : ""} onClick={() => up({ textSize: "large" })}>Larger</button>
                    </div>
                  </div>
                </div>
                <label className="f">
                  <span>Open the dashboard on</span>
                  <select value={a.startPage} onChange={(e) => up({ startPage: e.target.value })}>
                    {ADMIN_PAGES.map((p) => <option key={p.href} value={p.href}>{p.label}</option>)}
                  </select>
                  <em className="hint">The page you land on after logging in.</em>
                </label>
              </section>
            ),
          },
          {
            id: "home",
            label: "Home screen",
            content: (
              <section className="panel stack">
                <p className="hint">The sections on the Dashboard page, top to bottom. Switch off what you don&apos;t use.</p>
                <ul className="order-list">
                  {widgets.map((w, i) => {
                    const info = DASHBOARD_WIDGETS.find((x) => x.id === w.id)!;
                    return (
                      <li key={w.id} className={w.hidden ? "off" : ""}>
                        <span className="order-btns">
                          <button type="button" className="b b-ghost b-sm" aria-label={`Move ${info.label} up`} disabled={i === 0} onClick={() => moveWidget(i, -1)}>↑</button>
                          <button type="button" className="b b-ghost b-sm" aria-label={`Move ${info.label} down`} disabled={i === widgets.length - 1} onClick={() => moveWidget(i, 1)}>↓</button>
                        </span>
                        <span className="grow-text"><strong>{info.label}</strong><span className="muted small">{info.note}</span></span>
                        <label className="switch" title={w.hidden ? "Hidden" : "Shown"}>
                          <input type="checkbox" checked={!w.hidden} onChange={(e) => up({ widgets: widgets.map((x) => (x.id === w.id ? { ...x, hidden: !e.target.checked } : x)) })} aria-label={`Show ${info.label}`} />
                          <span />
                        </label>
                      </li>
                    );
                  })}
                </ul>
                <h2>Quick links</h2>
                <p className="hint">Buttons at the top of the Dashboard for places you go a lot: your shop, Stripe, Pirate Ship, your Facebook group...</p>
                {a.quickLinks.map((l, i) => (
                  <div key={i} className="tier">
                    <input aria-label="Button text" value={l.label} placeholder="Button text" style={{ flex: "1 1 8rem", width: "auto" }} onChange={(e) => up({ quickLinks: a.quickLinks.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)) })} />
                    <input aria-label="Web address" value={l.url} placeholder="https://..." style={{ flex: "2 1 12rem", width: "auto" }} onChange={(e) => up({ quickLinks: a.quickLinks.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)) })} />
                    <button type="button" className="b b-ghost b-sm" aria-label="Remove" onClick={() => up({ quickLinks: a.quickLinks.filter((_, j) => j !== i) })}>✕</button>
                  </div>
                ))}
                <div className="row wrap">
                  <button type="button" className="b b-sm" onClick={() => up({ quickLinks: [...a.quickLinks, { label: "", url: "" }] })}>Add a link</button>
                  {[
                    { label: "Open the shop", url: "/" },
                    { label: "Stripe", url: "https://dashboard.stripe.com" },
                    { label: "Pirate Ship", url: "https://ship.pirateship.com" },
                    ...(s.social.facebook ? [{ label: "Facebook", url: s.social.facebook }] : []),
                  ]
                    .filter((x) => !a.quickLinks.some((q) => q.url === x.url))
                    .map((x) => (
                      <button key={x.url} type="button" className="b b-ghost b-sm" onClick={() => up({ quickLinks: [...a.quickLinks, x] })}>+ {x.label}</button>
                    ))}
                </div>
              </section>
            ),
          },
          {
            id: "menu",
            label: "Menu",
            content: (
              <section className="panel stack">
                <p className="hint">The order of the side menu (on a computer) and the More page (on a phone). Hidden pages stay reachable from the More page. Dashboard, Settings, Customize and Help can&apos;t be hidden.</p>
                <ul className="order-list">
                  {pages.map((p, i) => (
                    <li key={p.href} className={p.hidden ? "off" : ""}>
                      <span className="order-btns">
                        <button type="button" className="b b-ghost b-sm" aria-label={`Move ${p.label} up`} disabled={i === 0} onClick={() => movePage(i, -1)}>↑</button>
                        <button type="button" className="b b-ghost b-sm" aria-label={`Move ${p.label} down`} disabled={i === pages.length - 1} onClick={() => movePage(i, 1)}>↓</button>
                      </span>
                      <span className="grow-text"><strong>{p.label}</strong><span className="muted small">{p.group} · {p.note}</span></span>
                      {ALWAYS_SHOWN.includes(p.href) ? null : (
                        <label className="switch" title={p.hidden ? "Hidden" : "Shown"}>
                          <input type="checkbox" checked={!p.hidden} onChange={(e) => up({ nav: pages.map((x) => ({ href: x.href, hidden: x.href === p.href ? !e.target.checked : x.hidden })) })} aria-label={`Show ${p.label} in the menu`} />
                          <span />
                        </label>
                      )}
                    </li>
                  ))}
                </ul>
                <h2>Phone bottom bar</h2>
                <p className="hint">The 4 buttons along the bottom on a phone. The 5th is always More.</p>
                <div className="row2">
                  {[0, 1, 2, 3].map((slot) => (
                    <label key={slot} className="f">
                      <span>Button {slot + 1}</span>
                      <select value={tabs[slot]} onChange={(e) => setTab(slot, e.target.value)}>
                        {ADMIN_PAGES.map((p) => <option key={p.href} value={p.href}>{p.label}</option>)}
                      </select>
                    </label>
                  ))}
                </div>
              </section>
            ),
          },
        ]}
      />
      {bar}
    </>
  );
}
