import { after, NextResponse } from "next/server";
import { syncToGitHub } from "@/lib/github-sync";
import { DEFAULT_SETTINGS, getSettings, saveSettings } from "@/lib/db";
import { DEFAULT_ADMIN } from "@/lib/site-structure";
import type { AdminPrefs, SiteSettings } from "@/lib/types";

type Row = Record<string, unknown>;
const str = (v: unknown, max: number) => String(v ?? "").slice(0, max);
const slugOf = (v: unknown) => String(v ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 50);

function cleanList(k: "customSteps" | "extraPages" | "gallery", rows: Row[]) {
  if (k === "customSteps") return rows.slice(0, 8).map((x) => ({ title: str(x.title, 60), text: str(x.text, 300) }));
  if (k === "extraPages")
    return rows.slice(0, 20).map((x) => ({ slug: slugOf(x.slug || x.title) || "page", title: str(x.title, 80), body: str(x.body, 20000), inFooter: Boolean(x.inFooter) }));
  return rows.slice(0, 200).map((x) => ({
    slug: slugOf(x.slug || x.title) || "piece",
    title: str(x.title, 100),
    category: str(x.category, 60),
    description: str(x.description, 3000),
    photos: (Array.isArray(x.photos) ? x.photos : []).filter((u): u is string => typeof u === "string").slice(0, 12),
    featured: Boolean(x.featured),
    productSlug: slugOf(x.productSlug),
  }));
}

const color = (v: unknown) => (/^#[0-9a-f]{6}$/i.test(String(v)) ? String(v) : "");
const adminPath = (v: unknown) => (/^\/admin(\/[a-z-]+)?$/.test(String(v)) ? String(v) : "/admin");

function cleanAdmin(v: Row): AdminPrefs {
  const d = DEFAULT_ADMIN;
  const arr = (x: unknown) => (Array.isArray(x) ? (x as Row[]) : []);
  return {
    title: str(v.title, 60),
    accent: color(v.accent),
    mode: (["auto", "light", "dark"] as const).find((m) => m === v.mode) ?? d.mode,
    density: v.density === "compact" ? "compact" : "comfy",
    textSize: v.textSize === "large" ? "large" : "normal",
    startPage: adminPath(v.startPage),
    nav: arr(v.nav).slice(0, 60).map((n) => ({ href: adminPath(n.href), hidden: Boolean(n.hidden) })),
    tabs: (Array.isArray(v.tabs) ? v.tabs : d.tabs).map(adminPath).slice(0, 4),
    widgets: arr(v.widgets).slice(0, 30).map((w) => ({ id: str(w.id, 30), hidden: Boolean(w.hidden) })),
    quickLinks: arr(v.quickLinks).slice(0, 12).map((l) => ({ label: str(l.label, 40), url: str(l.url, 500) })).filter((l) => l.label && /^(https?:\/\/|\/|mailto:|tel:)/.test(l.url)),
  };
}

function cleanMenu(rows: Row[]) {
  const seen = new Set<string>();
  return rows
    .slice(0, 60)
    .map((m) => {
      const id = str(m.id, 70);
      const href = str(m.href, 500);
      return {
        id,
        label: str(m.label, 40),
        ...(id.startsWith("link:") ? { href: /^(https?:\/\/|\/|mailto:|tel:)/.test(href) ? href : "" } : {}),
        top: Boolean(m.top),
        footer: Boolean(m.footer),
        ...(m.off ? { off: true } : {}),
      };
    })
    .filter((m) => /^(shop|gallery|custom|about|contact|status|review|page:[a-z0-9-]+|link:[a-z0-9-]+)$/.test(m.id) && !seen.has(m.id) && seen.add(m.id) && (!m.id.startsWith("link:") || m.href));
}

function cleanDesignList(rows: Row[]) {
  const seen = new Set<string>();
  return rows
    .slice(0, 300)
    .map((d) => ({ id: slugOf(d.id || d.name), name: str(d.name, 60), image: str(d.image, 500), group: str(d.group, 40).trim(), extra: Math.max(0, Math.round(Number(d.extra) || 0)), active: d.active !== false, ...(d.note ? { note: str(d.note, 300) } : {}) }))
    .filter((d) => d.id && d.name && !seen.has(d.id) && seen.add(d.id));
}

export async function GET() {
  return NextResponse.json(await getSettings());
}

export async function PUT(req: Request) {
  after(() => syncToGitHub("site content"));
  const body = (await req.json()) as Partial<SiteSettings>;
  const patch: Record<string, unknown> = {};
  for (const k of Object.keys(DEFAULT_SETTINGS) as (keyof SiteSettings)[]) {
    if (!(k in body)) continue;
    const v = body[k];
    const def = DEFAULT_SETTINGS[k];
    if (typeof def === "number") patch[k] = Math.max(0, Math.round(Number(v) || 0));
    else if (typeof def === "boolean") patch[k] = Boolean(v);
    else if (typeof def === "string") patch[k] = String(v ?? "").slice(0, 8000);
    else if (k === "shippingTiers")
      patch[k] = Array.isArray(v)
        ? (v as unknown as Row[]).slice(0, 12).map((t) => ({ upToMiles: Math.max(1, Math.round(Number(t.upToMiles) || 0)), price: Math.max(0, Math.round(Number(t.price) || 0)) })).sort((a, b) => a.upToMiles - b.upToMiles)
        : def;
    else if (k === "shipFromZip") patch[k] = String(v ?? "").replace(/\D/g, "").slice(0, 5);
    else if (k === "shipCountries" || k === "expenseCategories" || k === "customOrderTypes")
      patch[k] = Array.isArray(v) ? v.map((x) => String(x).trim().slice(0, 40)).filter(Boolean).slice(0, 50) : def;
    else if (k === "admin") patch[k] = cleanAdmin((v ?? {}) as Row);
    else if (k === "menu") patch[k] = Array.isArray(v) ? cleanMenu(v as unknown as Row[]) : def;
    else if (k === "designs") patch[k] = Array.isArray(v) ? cleanDesignList(v as unknown as Row[]) : def;
    else if (k === "categories") patch[k] = Array.isArray(v) ? [...new Set(v.map((x) => String(x).trim().slice(0, 40)).filter(Boolean))].slice(0, 40) : def;
    else if (k === "customSteps" || k === "extraPages" || k === "gallery") patch[k] = Array.isArray(v) ? cleanList(k, v as unknown as Row[]) : def;
    else patch[k] = v;
  }
  return NextResponse.json(await saveSettings(patch as Partial<SiteSettings>));
}
