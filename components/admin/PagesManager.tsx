"use client";
import Link from "next/link";
import { useState } from "react";
import { POLICY_PAGES } from "@/lib/policy-text";
import { BUILTIN_PAGES, resolveMenu, type ResolvedItem } from "@/lib/site-structure";
import type { InfoPage, MenuItem, SiteSettings } from "@/lib/types";
import { useSettings } from "./useSettings";

// Where each built-in page's words are edited
const EDIT_AT: Record<string, { href: string; label: string }> = {
  shop: { href: "/admin/products", label: "Edit items" },
  gallery: { href: "/admin/gallery", label: "Edit pieces" },
  custom: { href: "/admin/content?tab=custom", label: "Edit words" },
  about: { href: "/admin/content?tab=about", label: "Edit story" },
  contact: { href: "/admin/content?tab=contact", label: "Edit details" },
  review: { href: "/admin/reviews", label: "Reviews" },
};

const slugOf = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 50);

/** Every page of the shop in one list: order, names, menu and footer, on/off, add and delete. */
export function PagesManager({ initial }: { initial: SiteSettings }) {
  const { s, set, bar } = useSettings(initial);
  const [open, setOpen] = useState("");
  const items = resolveMenu(s);

  const toMenu = (list: ResolvedItem[]): MenuItem[] =>
    list.map((m) => ({ id: m.id, label: m.label, ...(m.kind === "link" ? { href: m.href } : {}), top: m.top, footer: m.footer, ...(m.off ? { off: true } : {}) }));

  function update(list: ResolvedItem[], extra: Partial<SiteSettings> = {}) {
    set({ menu: toMenu(list), ...extra });
  }

  function patch(id: string, p: Partial<ResolvedItem>) {
    const list = items.map((m) => (m.id === id ? { ...m, ...p } : m));
    const extra: Partial<SiteSettings> = {};
    if ("off" in p && id === "custom") extra.showCustomOrders = !p.off;
    if ("off" in p && id === "review") extra.showReviews = !p.off;
    if (id.startsWith("page:") && "footer" in p) extra.extraPages = s.extraPages.map((x) => (`page:${x.slug}` === id ? { ...x, inFooter: Boolean(p.footer) } : x));
    update(list, extra);
  }

  function move(i: number, d: number) {
    const j = i + d;
    if (j < 0 || j >= items.length) return;
    const list = [...items];
    [list[i], list[j]] = [list[j], list[i]];
    update(list);
  }

  function addPage() {
    let slug = "new-page";
    for (let n = 2; s.extraPages.some((p) => p.slug === slug); n++) slug = `new-page-${n}`;
    const page: InfoPage = { slug, title: "New page", body: "", inFooter: true };
    const list = [...items, { id: `page:${slug}`, label: "New page", top: false, footer: true, href: `/pages/${slug}`, kind: "page" as const, note: "" }];
    set({ extraPages: [...s.extraPages, page], menu: toMenu(list) });
    setOpen(`page:${slug}`);
  }

  function addLink() {
    const label = prompt("Link text (e.g. Facebook group, Etsy shop)")?.trim();
    if (!label) return;
    const href = prompt("Web address (starts with https://)")?.trim() ?? "";
    if (!/^(https?:\/\/|\/)/.test(href)) return alert("The address should start with https:// (or / for a page on this site).");
    let id = `link:${slugOf(label) || "link"}`;
    for (let n = 2; items.some((m) => m.id === id); n++) id = `link:${slugOf(label) || "link"}-${n}`;
    update([...items, { id, label, href, top: true, footer: false, kind: "link", note: "" }]);
  }

  function remove(m: ResolvedItem) {
    if (!confirm(`Delete "${m.label}"?${m.kind === "page" ? " Its text will be gone." : ""}`)) return;
    const list = items.filter((x) => x.id !== m.id);
    update(list, m.kind === "page" ? { extraPages: s.extraPages.filter((p) => `page:${p.slug}` !== m.id) } : {});
  }

  function editPage(m: ResolvedItem, p: Partial<InfoPage>) {
    const old = s.extraPages.find((x) => `page:${x.slug}` === m.id);
    if (!old) return;
    const next = { ...old, ...p };
    if (p.slug !== undefined) next.slug = slugOf(p.slug) || old.slug;
    if (next.slug !== old.slug && s.extraPages.some((x) => x.slug === next.slug)) return;
    const newId = `page:${next.slug}`;
    const list = items.map((x) => (x.id === m.id ? { ...x, id: newId, label: p.title !== undefined && x.label === old.title ? next.title : x.label } : x));
    set({ extraPages: s.extraPages.map((x) => (x === old ? next : x)), menu: toMenu(list) });
    if (newId !== m.id) setOpen(newId);
  }

  const policies = Object.entries(POLICY_PAGES).filter(([, p]) => s[p.field]);

  return (
    <>
      <div className="page-head">
        <h1>Pages &amp; menu</h1>
        <div className="row wrap">
          <button className="b" onClick={addLink}>Add a link</button>
          <button className="b b-primary" onClick={addPage}>Add a page</button>
        </div>
      </div>
      <p className="muted lead">
        Every page of your shop. Use the arrows to set the order of the top menu and footer, rename a page by typing over its name, and switch off any page you don&apos;t want (customers then can&apos;t open it). Tap <strong>Save changes</strong> when done.
      </p>
      <ul className="order-list pages-list">
        {items.map((m, i) => {
          const page = m.kind === "page" ? s.extraPages.find((x) => `page:${x.slug}` === m.id) : undefined;
          const canOff = m.kind !== "builtin" || BUILTIN_PAGES.find((b) => b.id === m.id)?.canTurnOff;
          return (
            <li key={m.id} className={m.off ? "off" : ""}>
              <div className="page-row">
                <span className="order-btns">
                  <button type="button" className="b b-ghost b-sm" aria-label={`Move ${m.label} up`} disabled={i === 0} onClick={() => move(i, -1)}>↑</button>
                  <button type="button" className="b b-ghost b-sm" aria-label={`Move ${m.label} down`} disabled={i === items.length - 1} onClick={() => move(i, 1)}>↓</button>
                </span>
                <div className="page-name">
                  <input aria-label="Name in the menu" value={m.label} onChange={(e) => patch(m.id, { label: e.target.value })} />
                  <span className="muted small">{m.note} · {m.href}</span>
                </div>
              </div>
              <div className="page-row">
                <label className="check small"><input type="checkbox" checked={m.top} disabled={m.off} onChange={(e) => patch(m.id, { top: e.target.checked })} /> Top menu</label>
                <label className="check small"><input type="checkbox" checked={m.footer} disabled={m.off} onChange={(e) => patch(m.id, { footer: e.target.checked })} /> Footer</label>
                {canOff ? (
                  <label className="switch" title={m.off ? "Off" : "On"}>
                    <input type="checkbox" checked={!m.off} onChange={(e) => patch(m.id, { off: !e.target.checked })} aria-label={`${m.label} page on`} />
                    <span />
                  </label>
                ) : null}
                <span className="grow" />
                {m.kind === "page" ? (
                  <button type="button" className="b b-sm" onClick={() => setOpen(open === m.id ? "" : m.id)}>{open === m.id ? "Close" : "Edit text"}</button>
                ) : EDIT_AT[m.id] ? (
                  <Link className="b b-ghost b-sm" href={EDIT_AT[m.id].href}>{EDIT_AT[m.id].label}</Link>
                ) : null}
                <a className="b b-ghost b-sm" href={m.href} target="_blank" rel="noreferrer">View</a>
                {m.kind !== "builtin" ? <button type="button" className="b b-danger b-sm" onClick={() => remove(m)}>Delete</button> : null}
              </div>
              {m.kind === "link" ? (
                <label className="f page-link"><span className="small">Goes to</span><input value={m.href} onChange={(e) => patch(m.id, { href: e.target.value })} /></label>
              ) : null}
              {page && open === m.id ? (
                <div className="page-edit stack">
                  <div className="row2">
                    <label className="f"><span>Page title</span><input value={page.title} onChange={(e) => editPage(m, { title: e.target.value })} /></label>
                    <label className="f"><span>Web address</span><input defaultValue={page.slug} onBlur={(e) => editPage(m, { slug: e.target.value })} /><em className="hint">/pages/{page.slug}</em></label>
                  </div>
                  <label className="f">
                    <span>Text</span>
                    <textarea rows={12} value={page.body} onChange={(e) => editPage(m, { body: e.target.value })} placeholder={"Leave a blank line between paragraphs.\n\nA short first line with the answer on the next line\nshows as a question and answer (good for an FAQ)."} />
                  </label>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
      {policies.length ? (
        <section className="panel">
          <h2>Policy pages</h2>
          <p className="hint">These are always in the footer&apos;s Legal and Help columns. Edit them, or empty one to remove it, in <Link href="/admin/content?tab=policies">Words &amp; logos &gt; Policies</Link>.</p>
          <p className="small">{policies.map(([, p]) => p.title).join(" · ")}</p>
        </section>
      ) : null}
      {bar}
    </>
  );
}
