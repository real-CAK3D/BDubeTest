import { after, NextResponse } from "next/server";
import { syncToGitHub } from "@/lib/github-sync";
import { DEFAULT_SETTINGS, getSettings, saveSettings } from "@/lib/db";
import { DEFAULT_ADMIN } from "@/lib/site-structure";
import type { AdminPrefs, DiscountPrograms, SiteSettings } from "@/lib/types";
import { mutating } from "@/lib/store";

type Row = Record<string, unknown>;
const str = (v: unknown, max: number) => String(v ?? "").slice(0, max);
const slugOf = (v: unknown) => String(v ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 50);

function cleanList(k: "customSteps" | "extraPages" | "gallery", rows: Row[]) {
  if (k === "customSteps") return rows.slice(0, 8).map((x) => ({ title: str(x.title, 60), text: str(x.text, 300), ...(x.hidden ? { hidden: true } : {}) }));
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
    ...(x.hidden ? { hidden: true } : {}),
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
    .filter((m) => /^(shop|gallery|custom|about|contact|status|review|military|giftcards|page:[a-z0-9-]+|link:[a-z0-9-]+)$/.test(m.id) && !seen.has(m.id) && seen.add(m.id) && (!m.id.startsWith("link:") || m.href));
}

function cleanDesignList(rows: Row[]) {
  const seen = new Set<string>();
  return rows
    .slice(0, 300)
    .map((d) => ({ id: slugOf(d.id || d.name), name: str(d.name, 60), image: str(d.image, 500), group: str(d.group, 40).trim(), extra: Math.max(0, Math.round(Number(d.extra) || 0)), active: d.active !== false, ...(d.note ? { note: str(d.note, 300) } : {}) }))
    .filter((d) => d.id && d.id !== "upload" && d.name && !seen.has(d.id) && seen.add(d.id));
}

export async function GET() {
  return NextResponse.json(await getSettings());
}

async function handlePUT(req: Request) {
  after(() => syncToGitHub("site content"));
  const body = (await req.json()) as Partial<SiteSettings>;
  const patch: Record<string, unknown> = {};
  for (const k of Object.keys(DEFAULT_SETTINGS) as (keyof SiteSettings)[]) {
    if (!(k in body)) continue;
    if (k === "social" && "links" in body) continue; // worked out from the links instead
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
    else if (k === "links") {
      const rows = (Array.isArray(v) ? (v as unknown as Row[]) : []).slice(0, 20);
      patch[k] = rows
        .map((l, i) => ({ id: str(l.id, 20) || `l${i + 1}`, icon: /^[a-z]{1,20}$/.test(String(l.icon)) ? String(l.icon) : "link", label: str(l.label, 40).trim(), url: str(l.url, 500).trim(), ...(l.hidden ? { hidden: true } : {}) }))
        .filter((l) => l.url && !/^(javascript|data):/i.test(l.url));
      // the older social fields stay in step (the chat and a few pages read Facebook from there)
      const social = { ...(body.social ?? DEFAULT_SETTINGS.social) } as Record<string, string>;
      for (const key of ["facebook", "instagram", "tiktok", "youtube", "x", "etsy"]) social[key] = (patch[k] as { icon: string; url: string; hidden?: boolean }[]).find((l) => l.icon === key && !l.hidden)?.url ?? "";
      patch.social = social;
    }
    else if (k === "hiddenFields")
      patch[k] = (Array.isArray(v) ? v : []).map(String).filter((f) => f in DEFAULT_SETTINGS && typeof DEFAULT_SETTINGS[f as keyof SiteSettings] === "string" && f !== "businessName").slice(0, 80);
    else if (k === "shipFrom") {
      const a = (v ?? {}) as Row;
      patch[k] = Object.fromEntries(["name", "company", "street1", "street2", "city", "state", "zip", "phone", "email"].map((f) => [f, str(a[f], 100).trim()]));
    } else if (k === "parcels")
      patch[k] = (Array.isArray(v) ? (v as unknown as Row[]) : []).slice(0, 12).map((p) => ({
        name: str(p.name, 40),
        length: Math.max(1, Number(p.length) || 1),
        width: Math.max(1, Number(p.width) || 1),
        height: Math.max(0.5, Number(p.height) || 1),
        weightOz: Math.max(1, Number(p.weightOz) || 1),
      }));
    else if (k === "chat") {
      const c = (v ?? {}) as unknown as Row;
      const seen = new Set<string>();
      patch[k] = {
        on: Boolean(c.on),
        useAI: Boolean(c.useAI),
        live: c.live !== false,
        ai: (() => {
          const a = (c.ai ?? {}) as Row;
          const url = str(a.baseUrl, 300).trim();
          return { provider: str(a.provider, 30) || "anthropic", model: str(a.model, 120).trim(), baseUrl: /^https?:\/\//.test(url) ? url : "" };
        })(),
        title: str(c.title, 60),
        greeting: str(c.greeting, 300),
        faqs: (Array.isArray(c.faqs) ? (c.faqs as Row[]) : [])
          .slice(0, 400)
          .map((x) => {
            const alts = (Array.isArray(x.alts) ? (x.alts as unknown[]) : []).map((y) => str(y, 300).trim()).filter(Boolean).slice(0, 30);
            const topic = str(x.topic, 40).trim();
            return { id: slugOf(x.id || x.q) || Math.random().toString(36).slice(2, 8), q: str(x.q, 300).trim(), a: str(x.a, 2000).trim(), hidden: Boolean(x.hidden), ...(alts.length ? { alts } : {}), ...(topic ? { topic } : {}) };
          })
          .filter((x) => x.q && !seen.has(x.id) && seen.add(x.id)),
      };
    }
    else if (k === "discounts") {
      const d = (v ?? {}) as unknown as DiscountPrograms;
      const pct = (x: unknown) => Math.min(90, Math.max(0, Math.round(Number(x) || 0)));
      patch[k] = {
        thankYou: { on: Boolean(d.thankYou?.on), percent: pct(d.thankYou?.percent) || 10, days: Math.min(365, Math.max(7, Math.round(Number(d.thankYou?.days) || 60))) },
        veteran: { on: Boolean(d.veteran?.on), percent: pct(d.veteran?.percent) || 10, verify: d.veteran?.verify !== false, code: str(d.veteran?.code, 40).toUpperCase().replace(/[^A-Z0-9]/g, ""), heading: str(d.veteran?.heading, 80), text: str(d.veteran?.text, 600) },
        bulk: (Array.isArray(d.bulk) ? d.bulk : []).slice(0, 8).map((t) => ({ minQty: Math.max(2, Math.round(Number(t.minQty) || 0)), percent: pct(t.percent) })).filter((t) => t.percent > 0).sort((a, b) => a.minQty - b.minQty),
        reminders: { on: Boolean(d.reminders?.on), hours: Math.min(24, Math.max(1, Math.round(Number(d.reminders?.hours) || 2))) },
        giftCards: { on: Boolean(d.giftCards?.on), amounts: (Array.isArray(d.giftCards?.amounts) ? d.giftCards.amounts : []).map((a) => Math.round(Number(a) || 0)).filter((a) => a >= 5 && a <= 2000).slice(0, 8), heading: str(d.giftCards?.heading, 80), text: str(d.giftCards?.text, 600) },
      };
    }
    else if (k === "watermark") {
      const w = (v ?? {}) as Row;
      const n = (x: unknown, lo: number, hi: number, d: number) => Math.min(hi, Math.max(lo, Math.round(Number(x) || d)));
      patch[k] = {
        on: Boolean(w.on),
        text: str(w.text, 60),
        useLogo: Boolean(w.useLogo),
        position: (["corner", "center", "tiled"] as const).find((x) => x === w.position) ?? "corner",
        opacity: n(w.opacity, 5, 90, 45),
        size: n(w.size, 10, 60, 28),
        onGallery: Boolean(w.onGallery),
        onDesigns: Boolean(w.onDesigns),
      };
    }
    else if (k === "menu") patch[k] = Array.isArray(v) ? cleanMenu(v as unknown as Row[]) : def;
    else if (k === "designs") patch[k] = Array.isArray(v) ? cleanDesignList(v as unknown as Row[]) : def;
    else if (k === "categories") patch[k] = Array.isArray(v) ? [...new Set(v.map((x) => String(x).trim().slice(0, 40)).filter(Boolean))].slice(0, 40) : def;
    else if (k === "customSteps" || k === "extraPages" || k === "gallery") patch[k] = Array.isArray(v) ? cleanList(k, v as unknown as Row[]) : def;
    else patch[k] = v;
  }
  return NextResponse.json(await saveSettings(patch as Partial<SiteSettings>));
}

export const PUT = mutating(handlePUT);
