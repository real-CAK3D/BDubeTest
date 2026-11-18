import { after, NextResponse } from "next/server";
import { syncToGitHub } from "@/lib/github-sync";
import { DEFAULT_SETTINGS, getSettings, saveSettings } from "@/lib/db";
import type { SiteSettings } from "@/lib/types";

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
    else if (k === "customSteps" || k === "extraPages" || k === "gallery") patch[k] = Array.isArray(v) ? cleanList(k, v as unknown as Row[]) : def;
    else patch[k] = v;
  }
  return NextResponse.json(await saveSettings(patch as Partial<SiteSettings>));
}
