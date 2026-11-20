"use client";
import { useEffect, useState } from "react";
import { LINK_ICONS } from "@/components/LinkIcon";
import { DEFAULT_LINK_PAGE, type LinkPageSettings } from "@/lib/link-page";
import type { SiteSettings } from "@/lib/types";
import { CopyButton } from "./CopyButton";
import { ImageField } from "./ImageField";
import { LinksEditor } from "./LinksEditor";
import { useSettings } from "./useSettings";

type Stats = { days: number; views: number; taps: Record<string, number>; daily: Record<string, number> };

// one-tap looks, like Linktree's themes
const PRESETS: { name: string; v: Partial<LinkPageSettings> }[] = [
  { name: "Shop colors", v: { bg: "theme", button: "fill", shape: "pill", btnColor: "", btnText: "", textColor: "" } },
  { name: "Midnight", v: { bg: "gradient", color1: "#0f172a", color2: "#312e81", button: "glass", shape: "pill", btnColor: "", btnText: "", textColor: "" } },
  { name: "Old Glory", v: { bg: "gradient", color1: "#1f2a44", color2: "#7a2e3a", button: "fill", shape: "round", btnColor: "#f5f1e6", btnText: "#1f2a44", textColor: "" } },
  { name: "Sunset", v: { bg: "gradient", color1: "#ff7e5f", color2: "#7b2ff7", button: "glass", shape: "pill", btnColor: "", btnText: "", textColor: "#ffffff" } },
  { name: "Olive drab", v: { bg: "color", color1: "#4b5320", button: "outline", shape: "square", btnColor: "#e8e2c8", btnText: "", textColor: "#f2efe2" } },
  { name: "Clean white", v: { bg: "color", color1: "#ffffff", button: "shadow", shape: "round", btnColor: "#ffffff", btnText: "#111111", textColor: "#111111" } },
  { name: "Workshop", v: { bg: "gradient", color1: "#3b2a1a", color2: "#1c140d", button: "soft", shape: "round", btnColor: "#e0a458", btnText: "", textColor: "#f4e9dc" } },
];

const Seg = <T extends string>({ value, options, onChange }: { value: T; options: [T, string][]; onChange: (v: T) => void }) => (
  <div className="seg">
    {options.map(([v, l]) => (
      <button type="button" key={v} className={value === v ? "on" : ""} onClick={() => onChange(v)}>{l}</button>
    ))}
  </div>
);

function ColorPick({ label, value, fallback, onChange, empty }: { label: string; value: string; fallback: string; onChange: (v: string) => void; empty?: string }) {
  return (
    <label className="color-pick">
      <span className="f-label">{label}</span>
      <span className="row">
        <input type="color" value={value || fallback} onChange={(e) => onChange(e.target.value)} />
        {empty ? (
          value ? <button type="button" className="b b-ghost b-sm" onClick={() => onChange("")}>Use {empty}</button> : <span className="muted small">{empty}</span>
        ) : null}
      </span>
    </label>
  );
}

/** Dashboard > Link page: the Socials page (link in bio) with a live phone preview. */
export function LinkPageManager({ initial, stats, url, qr }: { initial: SiteSettings; stats: Stats; url: string; qr: string }) {
  const { s, set, bar, dirty } = useSettings(initial);
  const p = { ...DEFAULT_LINK_PAGE, ...s.linkPage };
  const put = (patch: Partial<LinkPageSettings>) => set({ linkPage: { ...p, ...patch } });
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    if (!dirty) setFrame((n) => n + 1);
  }, [dirty]);

  const shown = s.links.filter((l) => !l.hidden && l.url);
  const totalTaps = Object.values(stats.taps).reduce((a, b) => a + b, 0);
  const rate = (n: number) => (stats.views ? `${Math.round((n / stats.views) * 100)}%` : "–");

  return (
    <>
      <div className="page-head">
        <h1>Link page</h1>
        <a className="b b-sm" href="/socials" target="_blank" rel="noreferrer">Open it</a>
      </div>
      <p className="muted lead">
        Your <strong>Socials</strong> page works like Linktree: one address with your picture, your social icons and a big button for every link. Put it in your bio on Instagram, TikTok, Facebook and YouTube, or post it anywhere, and people can reach everything from one tap.
      </p>

      <div className="lp-wrap">
        <div className="stack">
          <section className="panel stack">
            <h2>Your link</h2>
            <div className="row wrap">
              <code className="lp-url">{url}</code>
              <CopyButton text={url} label="Copy link" />
            </div>
            <div className="lp-share">
              <span className="lp-qr" dangerouslySetInnerHTML={{ __html: qr }} />
              <div className="small">
                <p><strong>Where to paste it</strong></p>
                <ul className="lp-tips">
                  <li><strong>Instagram:</strong> Edit profile › Links › Add external link</li>
                  <li><strong>TikTok:</strong> Edit profile › Website (needs a Business account or 1,000 followers)</li>
                  <li><strong>Facebook page:</strong> Edit details › Website / Links</li>
                  <li><strong>YouTube:</strong> Customize channel › Links</li>
                  <li><strong>X:</strong> Edit profile › Website</li>
                </ul>
                <p className="muted">Print the QR code on cards, stickers and packing slips. The page has its own share button too.</p>
              </div>
            </div>
          </section>

          <section className="panel stack">
            <h2>Profile</h2>
            <ImageField label="Profile picture" hint="Round. Empty = your main logo." value={p.avatar} onChange={(avatar) => put({ avatar })} folder="brand" shape="square" />
            <label>
              <span className="f-label">Name</span>
              <input value={p.title} placeholder={s.businessName} onChange={(e) => put({ title: e.target.value })} maxLength={60} />
            </label>
            <label>
              <span className="f-label">@handle (optional)</span>
              <input value={p.handle} placeholder="@yourshop" onChange={(e) => put({ handle: e.target.value })} maxLength={40} />
            </label>
            <label>
              <span className="f-label">Bio</span>
              <textarea rows={3} value={p.bio} placeholder={s.tagline || "A line or two about you"} onChange={(e) => put({ bio: e.target.value })} maxLength={300} />
            </label>
          </section>

          <section className="panel stack">
            <h2>Links</h2>
            <label className="check"><input type="checkbox" checked={p.shopButton} onChange={(e) => put({ shopButton: e.target.checked })} /> A <strong>{s.shopButton || "Shop"}</strong> button at the top of the list</label>
            <p className="hint">Social networks show as a small icon at the top and as a button; change it per link. The same links show in the footer and on the contact page.</p>
            <LinksEditor value={s.links} onChange={(links) => set({ links })} extras taps={stats.taps} />
          </section>

          <section className="panel stack">
            <h2>Look</h2>
            <div>
              <span className="f-label">Quick looks</span>
              <div className="lp-presets">
                {PRESETS.map((x) => (
                  <button type="button" key={x.name} className="lp-preset" onClick={() => put(x.v)}>
                    <span style={{ background: x.v.bg === "theme" ? "var(--accent)" : x.v.bg === "gradient" ? `linear-gradient(160deg, ${x.v.color1}, ${x.v.color2})` : x.v.color1 }} />
                    {x.name}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <span className="f-label">Background</span>
              <Seg value={p.bg} options={[["theme", "Shop theme"], ["color", "Color"], ["gradient", "Gradient"], ["image", "Photo"]]} onChange={(bg) => put({ bg })} />
            </div>
            {p.bg === "color" || p.bg === "gradient" ? (
              <div className="row wrap">
                <ColorPick label={p.bg === "gradient" ? "Top color" : "Color"} value={p.color1} fallback="#1f2a44" onChange={(color1) => put({ color1 })} />
                {p.bg === "gradient" ? <ColorPick label="Bottom color" value={p.color2} fallback="#7a2e3a" onChange={(color2) => put({ color2 })} /> : null}
              </div>
            ) : null}
            {p.bg === "image" ? <ImageField label="Background photo" hint="Darkened a little so the words stay readable." value={p.image} onChange={(image) => put({ image })} folder="brand" /> : null}
            <div>
              <span className="f-label">Buttons</span>
              <Seg value={p.button} options={[["fill", "Filled"], ["outline", "Outline"], ["soft", "Soft"], ["shadow", "Hard shadow"], ["glass", "Glass"]]} onChange={(button) => put({ button })} />
            </div>
            <div>
              <span className="f-label">Corners</span>
              <Seg value={p.shape} options={[["pill", "Pill"], ["round", "Rounded"], ["square", "Square"]]} onChange={(shape) => put({ shape })} />
            </div>
            <div className="row wrap">
              <ColorPick label="Button color" value={p.btnColor} fallback="#3355aa" onChange={(btnColor) => put({ btnColor })} empty="theme color" />
              <ColorPick label="Button words" value={p.btnText} fallback="#ffffff" onChange={(btnText) => put({ btnText })} empty="automatic" />
              <ColorPick label="Name, bio & icons" value={p.textColor} fallback="#111111" onChange={(textColor) => put({ textColor })} empty="automatic" />
            </div>
            <div>
              <span className="f-label">Social icons</span>
              <Seg value={p.iconsAt} options={[["top", "Under the bio"], ["bottom", "At the bottom"]]} onChange={(iconsAt) => put({ iconsAt })} />
            </div>
          </section>

          <section className="panel stack">
            <h2>Extras</h2>
            <label className="check"><input type="checkbox" checked={p.share} onChange={(e) => put({ share: e.target.checked })} /> Share button (copy link, QR code, post to Facebook, X, WhatsApp…)</label>
            <label className="check"><input type="checkbox" checked={p.subscribe} onChange={(e) => put({ subscribe: e.target.checked })} /> Email sign-up box (adds people to Customers › Subscribers)</label>
            <label>
              <span className="f-label">Bottom line</span>
              <input value={p.footer} placeholder={s.businessName} onChange={(e) => put({ footer: e.target.value })} maxLength={80} />
            </label>
          </section>

          <section className="panel stack">
            <h2>Last {stats.days} days</h2>
            <div className="lp-stats">
              <div><b>{stats.views}</b><span>visits</span></div>
              <div><b>{totalTaps}</b><span>link taps</span></div>
              <div><b>{rate(totalTaps)}</b><span>tap rate</span></div>
            </div>
            {stats.views || totalTaps ? (
              <table className="table">
                <thead><tr><th>Link</th><th>Taps</th><th>Of visits</th></tr></thead>
                <tbody>
                  {p.shopButton ? <tr><td>{s.shopButton || "Shop"}</td><td>{stats.taps.shop ?? 0}</td><td>{rate(stats.taps.shop ?? 0)}</td></tr> : null}
                  {shown.map((l) => (
                    <tr key={l.id}><td>{l.label || LINK_ICONS[l.icon]?.name || "Link"}</td><td>{stats.taps[l.id] ?? 0}</td><td>{rate(stats.taps[l.id] ?? 0)}</td></tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="muted small">No visits yet. Share your link and the numbers show up here.</p>
            )}
          </section>
        </div>

        <aside className="lp-preview">
          <div className="lp-phone">
            <iframe key={frame} src={`/socials?preview=1&v=${frame}`} title="Preview of your Socials page" />
          </div>
          <p className="muted small" style={{ textAlign: "center" }}>{dirty ? "Save to see your changes here." : "This is what people see."}</p>
        </aside>
      </div>
      {bar}
    </>
  );
}
