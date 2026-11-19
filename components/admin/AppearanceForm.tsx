"use client";
import type { Layout, Theme, ThemeGroup } from "@/lib/themes";

const GROUPS: ThemeGroup[] = ["Military", "Police", "USA & support", "Workshop", "Plain"];
import type { SiteSettings } from "@/lib/types";
import { Tabs } from "./Tabs";
import { useSettings } from "./useSettings";

export function AppearanceForm({ initial, themes, layouts, sample }: { initial: SiteSettings; themes: Theme[]; layouts: Layout[]; sample: string }) {
  const { s, set, bar } = useSettings(initial);
  const previewUrl = `/?theme=${s.theme}&layout=${s.layout}`;
  return (
    <>
      <div className="page-head">
        <h1>Look & layout</h1>
        <a className="b b-ghost" href={previewUrl} target="_blank" rel="noreferrer">Open preview</a>
      </div>
      <Tabs
        label="Look and layout"
        tabs={[
          { id: "theme", label: "Theme", badge: themes.find((t) => t.id === s.theme)?.name, content: (
      <section className="panel">
        <div className="panel-head"><h2>Theme</h2></div>
        {GROUPS.map((g) => (
          <div key={g} className="theme-group">
            <h3>{g}</h3>
            <div className="theme-grid" role="radiogroup" aria-label={`${g} themes`}>
              {themes.filter((t) => t.group === g).map((t) => (
                <button key={t.id} role="radio" aria-checked={s.theme === t.id} className={`theme-card ${s.theme === t.id ? "on" : ""}`} onClick={() => set({ theme: t.id })}>
                  <span className="theme-swatch" style={{ background: t.colors.bg }}>
                    <span style={{ background: t.colors.band, color: t.colors.bandInk, borderBottom: `3px solid ${t.colors.stitch}`, fontFamily: t.fonts.display }}>Aa</span>
                    <span className="sw-row">
                      <i style={{ background: t.colors.accent }} />
                      <i style={{ background: t.colors.stitch }} />
                      <i style={{ background: t.colors.surface2 }} />
                      <i style={{ background: t.colors.ink }} />
                    </span>
                  </span>
                  <strong>{t.name}</strong>
                  <span className="muted">{t.description}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </section>
          ) },
          { id: "layout", label: "Layout", badge: layouts.find((l) => l.id === s.layout)?.name, content: (
      <section className="panel">
        <div className="panel-head"><h2>Page layout</h2></div>
        <div className="theme-grid" role="radiogroup" aria-label="Layout">
          {layouts.map((l) => (
            <button key={l.id} role="radio" aria-checked={s.layout === l.id} className={`theme-card ${s.layout === l.id ? "on" : ""}`} onClick={() => set({ layout: l.id })}>
              <pre className="sketch" aria-hidden>{l.sketch}</pre>
              <strong>{l.name}</strong>
              <span className="muted">{l.description}</span>
            </button>
          ))}
        </div>
      </section>
          ) },
          { id: "watermark", label: "Watermark", badge: s.watermark.on ? "On" : "Off", content: <WatermarkPanel s={s} set={set} sample={sample} /> },
          { id: "preview", label: "Preview", content: (
      <section className="panel preview">
        <div className="panel-head"><h2>Preview</h2><span className="muted small">Customers keep seeing the saved look until you save.</span></div>
        <iframe key={previewUrl} src={previewUrl} title="Shop preview" loading="lazy" />
      </section>
          ) },
        ]}
      />
      {bar}
    </>
  );
}

const POSITIONS = [
  { id: "corner", label: "Bottom corner" },
  { id: "center", label: "One big diagonal" },
  { id: "tiled", label: "Diagonal all over" },
] as const;

/** Watermark: a stamp on shop photos that can be switched on and off at any time. */
function WatermarkPanel({ s, set, sample }: { s: SiteSettings; set: (p: Partial<SiteSettings>) => void; sample: string }) {
  const w = s.watermark;
  const up = (patch: Partial<SiteSettings["watermark"]>) => set({ watermark: { ...w, ...patch } });
  const saved = JSON.stringify(w);
  return (
    <section className="panel stack">
      <label className="check"><input type="checkbox" checked={w.on} onChange={(e) => up({ on: e.target.checked })} /> Stamp a watermark on shop photos</label>
      <p className="hint">Your original photos are never changed. Switch this off any time and the clean photos are back right away. It applies to item photos{w.onGallery ? ", Our work" : ""}{w.onDesigns ? " and design artwork" : ""}; your logo, banner and customers&apos; review photos are left alone.</p>
      <label className="f"><span>Text</span><input value={w.text} placeholder={s.businessName} maxLength={60} onChange={(e) => up({ text: e.target.value })} /><em className="hint">Leave empty to use your business name.</em></label>
      <label className="check"><input type="checkbox" checked={w.useLogo} onChange={(e) => up({ useLogo: e.target.checked })} disabled={!s.logo} /> Add my logo above the text</label>
      <div className="f">
        <span>Where</span>
        <div className="seg">
          {POSITIONS.map((p) => <button key={p.id} type="button" className={w.position === p.id ? "on" : ""} onClick={() => up({ position: p.id })}>{p.label}</button>)}
        </div>
      </div>
      <div className="row2">
        <label className="f"><span>How strong: {w.opacity}%</span><input type="range" min={5} max={90} value={w.opacity} onChange={(e) => up({ opacity: Number(e.target.value) })} /></label>
        <label className="f"><span>Size: {w.size}</span><input type="range" min={10} max={60} value={w.size} onChange={(e) => up({ size: Number(e.target.value) })} /></label>
      </div>
      <label className="check"><input type="checkbox" checked={w.onGallery} onChange={(e) => up({ onGallery: e.target.checked })} /> Also on Our work photos</label>
      <label className="check"><input type="checkbox" checked={w.onDesigns} onChange={(e) => up({ onDesigns: e.target.checked })} /> Also on design artwork</label>
      {sample ? (
        <div className="wm-preview">
          <span className="f-label">Preview</span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img key={saved} src={w.on ? `/api/wm?u=${encodeURIComponent(sample)}&p=${encodeURIComponent(saved)}` : sample} alt="Watermark preview" />
        </div>
      ) : null}
    </section>
  );
}
