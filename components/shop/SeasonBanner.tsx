"use client";
import { useEffect, useState } from "react";
import { STYLES, type SeasonSetting } from "@/lib/seasons";

/** A holiday banner across the top of the shop. Customers can close it (it stays closed for that visit). */
export function SeasonBanner({ season, emoji, preview = false }: { season: SeasonSetting; emoji: string; preview?: boolean }) {
  const key = `season-closed:${season.id}:${new Date().getFullYear()}`;
  const [closed, setClosed] = useState(false);
  useEffect(() => {
    if (preview) return;
    try {
      setClosed(sessionStorage.getItem(key) === "1");
    } catch {}
  }, [key, preview]);
  if (closed) return null;
  const st = STYLES[season.style] ?? STYLES.plain;
  const decor = season.decor ? st.decor : [];
  return (
    <div className={`season-banner season-${season.style}`} style={{ background: st.bg, color: st.ink }} role="region" aria-label="Seasonal message">
      {decor.length ? (
        <span className="season-decor" aria-hidden>
          {Array.from({ length: 10 }, (_, i) => (
            <i key={i} style={{ left: `${(i * 97) % 100}%`, animationDelay: `${(i * 1.3) % 7}s`, animationDuration: `${7 + (i % 4)}s` }}>{decor[i % decor.length]}</i>
          ))}
        </span>
      ) : null}
      <span className="season-text">
        <span>
          <span className="season-emoji" aria-hidden>{emoji}</span> {season.message}
        </span>
        {season.link && season.linkText ? (
          <a href={season.link} className="season-link" style={{ color: st.ink, borderColor: st.ink }}>{season.linkText} ›</a>
        ) : null}
      </span>
      {!preview ? (
        <button
          type="button"
          className="season-close"
          aria-label="Close this message"
          style={{ color: st.ink }}
          onClick={() => {
            setClosed(true);
            try {
              sessionStorage.setItem(key, "1");
            } catch {}
          }}
        >
          ✕
        </button>
      ) : null}
    </div>
  );
}
