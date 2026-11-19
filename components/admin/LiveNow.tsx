"use client";
import { useEffect, useState } from "react";

type Live = { shoppers: { count: number; pages: { path: string; n: number }[] }; admins: { name: string; device: string }[] };

const pageName = (p: string) =>
  p === "/" ? "Home" : p === "/cart" ? "Cart" : p === "/shop" ? "Shop" : p.startsWith("/product/") ? `Item: ${p.slice(9).replace(/-/g, " ")}` : p.replace(/^\//, "").replace(/[-/]/g, " ");

/** Shoppers on the site right now and who's signed in to the dashboard; refreshes every 20 seconds. */
export function LiveNow() {
  const [d, setD] = useState<Live | null>(null);
  useEffect(() => {
    let stop = false;
    const load = () => fetch("/api/admin/live").then((r) => (r.ok ? r.json() : null)).then((x) => !stop && x && setD(x)).catch(() => {});
    load();
    const t = setInterval(() => document.visibilityState === "visible" && load(), 20_000);
    return () => {
      stop = true;
      clearInterval(t);
    };
  }, []);
  return (
    <section className="panel live-now">
      <div className="panel-head"><h2><span className="dot live" /> Live now</h2><span className="muted small">updates every 20 seconds</span></div>
      {!d ? (
        <p className="muted">Checking…</p>
      ) : (
        <div className="live-grid">
          <div>
            <strong className="big">{d.shoppers.count}</strong> <span className="muted">{d.shoppers.count === 1 ? "person" : "people"} on the shop</span>
            {d.shoppers.pages.length ? (
              <ul className="live-pages">
                {d.shoppers.pages.slice(0, 6).map((p) => <li key={p.path}><span className="cap">{pageName(p.path)}</span><strong>{p.n}</strong></li>)}
              </ul>
            ) : null}
          </div>
          <div>
            <strong className="big">{d.admins.length}</strong> <span className="muted">signed in to the dashboard</span>
            <ul className="live-pages">
              {d.admins.map((a, i) => <li key={i}><span>{a.name}</span><span className="muted small">{a.device}</span></li>)}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}
