"use client";
import { useState } from "react";
import { LinkIcon, LINK_ICONS } from "@/components/LinkIcon";
import { placeOf } from "@/lib/link-page";
import type { LinkItem } from "@/lib/types";
import { ImageField } from "./ImageField";

/**
 * Links with pictures for the Socials page, footer and contact page: pick an icon,
 * paste the address, order, hide. With `extras` (Dashboard > Link page) each link
 * also says how it shows on the Socials page, its own picture, and a wiggle.
 */
export function LinksEditor({ value, onChange, extras = false, taps }: { value: LinkItem[]; onChange: (v: LinkItem[]) => void; extras?: boolean; taps?: Record<string, number> }) {
  const [picking, setPicking] = useState<string | null>(null);
  const up = (id: string, patch: Partial<LinkItem>) => onChange(value.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  const add = (icon: string) => {
    const id = Math.random().toString(36).slice(2, 8);
    onChange([...value, { id, icon, label: "", url: "" }]);
    setPicking(null);
  };

  return (
    <div className="stack">
      <ul className="order-list">
        {value.map((l, i) => (
          <li key={l.id} className={l.hidden ? "off" : ""}>
            <span className="order-btns">
              <button type="button" className="b b-ghost b-sm" aria-label="Move up" disabled={i === 0} onClick={() => move(i, -1)}>↑</button>
              <button type="button" className="b b-ghost b-sm" aria-label="Move down" disabled={i === value.length - 1} onClick={() => move(i, 1)}>↓</button>
            </span>
            <button type="button" className="icon-pick" onClick={() => setPicking(picking === l.id ? null : l.id)} aria-label="Change the picture" title="Change the picture">
              <LinkIcon icon={l.icon} />
            </button>
            <input className="grow-in" value={l.url} onChange={(e) => up(l.id, { url: e.target.value })} placeholder={LINK_ICONS[l.icon]?.placeholder ?? "https://..."} aria-label="Address" />
            <input className="label-in" value={l.label} onChange={(e) => up(l.id, { label: e.target.value })} placeholder={LINK_ICONS[l.icon]?.name ?? "Name"} aria-label="Name shown" />
            <button type="button" className="b b-ghost b-sm" onClick={() => up(l.id, { hidden: !l.hidden })}>{l.hidden ? "Show" : "Hide"}</button>
            <button type="button" className="b b-ghost b-sm" aria-label="Delete" onClick={() => confirm("Delete this link? (Hide keeps it.)") && onChange(value.filter((x) => x.id !== l.id))}>✕</button>
            {extras ? (
              <div className="link-extras">
                <label>
                  Shows as{" "}
                  <select value={placeOf(l)} onChange={(e) => up(l.id, { place: e.target.value as LinkItem["place"] })}>
                    <option value="button">a big button</option>
                    <option value="icon">a small icon at the top</option>
                    <option value="both">both</option>
                  </select>
                </label>
                <label className="check"><input type="checkbox" checked={Boolean(l.featured)} onChange={(e) => up(l.id, { featured: e.target.checked || undefined })} /> Wiggle to catch the eye</label>
                {taps ? <span className="muted small">{taps[l.id] ?? 0} taps in 30 days</span> : null}
                <details>
                  <summary>{l.thumb ? "Button picture ✓" : "Add a button picture"}</summary>
                  <ImageField label="Picture on the button" hint="Square works best. Empty = the icon." value={l.thumb ?? ""} onChange={(thumb) => up(l.id, { thumb: thumb || undefined })} folder="links" shape="square" />
                </details>
              </div>
            ) : null}
            {picking === l.id ? (
              <div className="icon-grid">
                {Object.entries(LINK_ICONS).map(([k, ic]) => (
                  <button key={k} type="button" className={k === l.icon ? "on" : ""} onClick={() => (up(l.id, { icon: k }), setPicking(null))}>
                    <LinkIcon icon={k} />
                    <span>{ic.name}</span>
                  </button>
                ))}
              </div>
            ) : null}
          </li>
        ))}
      </ul>
      <div>
        <span className="f-label">Add a link</span>
        <div className="icon-grid">
          {Object.entries(LINK_ICONS).map(([k, ic]) => (
            <button key={k} type="button" onClick={() => add(k)}>
              <LinkIcon icon={k} />
              <span>{ic.name}</span>
            </button>
          ))}
        </div>
      </div>
      <p className="hint">For Call and Text, type the phone number; for Email, the address. Leave the name empty to use the usual one.</p>
    </div>
  );
}
