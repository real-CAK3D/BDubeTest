import "server-only";
import { newId, slugify } from "./ids";
import type { Product, ProductDesigns, ProductPreview, Shape3D } from "./types";

const cleanSizes = (v: unknown) => {
  if (!Array.isArray(v)) return null;
  const seen = new Set<string>();
  const out = v
    .map((x) => ({ name: String(x?.name ?? "").trim().slice(0, 40), price: Math.max(0, Math.round(Number(x?.price) || 0)) }))
    .filter((x) => x.name && !seen.has(x.name) && seen.add(x.name))
    .slice(0, 20);
  return out.length ? out : null;
};

const cleanDesigns = (v: Partial<ProductDesigns> | null | undefined, sizes: { name: string }[] | null): ProductDesigns | null => {
  if (!v || typeof v !== "object") return null;
  const keys = sizes ? sizes.map((s) => s.name) : ["*"];
  const fit: Record<string, string[]> = {};
  for (const k of keys) {
    const ids = (v.fit as Record<string, unknown> | undefined)?.[k];
    fit[k] = Array.isArray(ids) ? [...new Set(ids.map((x) => String(x).slice(0, 50)).filter(Boolean))].slice(0, 200) : [];
  }
  return {
    label: String(v.label || "Design").slice(0, 40),
    required: Boolean(v.required),
    fit,
    ...(v.allowUpload ? { allowUpload: true, uploadExtra: Math.max(0, Math.round(Number(v.uploadExtra) || 0)) } : {}),
  };
};

const SHAPES: Shape3D[] = ["tumbler", "mug", "sign", "round", "square", "card"];
const url = (v: unknown) => {
  const s = String(v ?? "").trim().slice(0, 500);
  return /^(https:\/\/|\/)/.test(s) && !s.startsWith("//") ? s : "";
};
const pct = (v: unknown) => Math.min(100, Math.max(0, Math.round((Number(v) || 0) * 10) / 10));

function cleanPreview(v: Partial<ProductPreview> | null | undefined): ProductPreview | null {
  if (!v || typeof v !== "object") return null;
  const m = v.mockup && url(v.mockup.image) ? { image: url(v.mockup.image), x: pct(v.mockup.x), y: pct(v.mockup.y), w: Math.max(2, pct(v.mockup.w)), h: Math.max(2, pct(v.mockup.h)) } : null;
  const out: ProductPreview = {
    ...(m ? { mockup: m } : {}),
    ...(v.shape && SHAPES.includes(v.shape) ? { shape: v.shape, color: /^#[0-9a-f]{6}$/i.test(String(v.color)) ? String(v.color) : "#2b2f36" } : {}),
    ...(url(v.model) ? { model: url(v.model) } : {}),
    ...(Array.isArray(v.spin) && v.spin.map(url).filter(Boolean).length >= 4 ? { spin: v.spin.map(url).filter(Boolean).slice(0, 72) } : {}),
  };
  return Object.keys(out).length ? out : null;
}

export function cleanProduct(input: Partial<Product>, existing?: Product): Product {
  const now = new Date().toISOString();
  const sizes = cleanSizes(input.sizes);
  const optionValues = (input.option?.values ?? []).map((v) => String(v).trim()).filter(Boolean);
  return {
    id: existing?.id ?? newId(),
    slug: existing?.slug ?? "",
    name: String(input.name ?? "").trim().slice(0, 120) || "Untitled item",
    // with sizes, the item's own price is the cheapest size ("From $30")
    price: sizes ? Math.min(...sizes.map((s) => s.price)) : Math.max(0, Math.round(Number(input.price) || 0)),
    compareAtPrice: input.compareAtPrice ? Math.max(0, Math.round(Number(input.compareAtPrice))) : null,
    summary: String(input.summary ?? "").slice(0, 300),
    description: String(input.description ?? "").slice(0, 8000),
    category: String(input.category ?? "").trim().slice(0, 60),
    images: (input.images ?? []).filter((u) => typeof u === "string").slice(0, 12),
    stock: input.stock === null || input.stock === undefined || (input.stock as unknown) === "" ? null : Math.max(0, Math.floor(Number(input.stock))),
    madeToOrder: Boolean(input.madeToOrder),
    featured: Boolean(input.featured),
    active: input.active === undefined ? true : Boolean(input.active),
    option: input.option?.label && optionValues.length ? { label: String(input.option.label).slice(0, 40), values: optionValues.slice(0, 20) } : null,
    personalize: input.personalize
      ? {
          label: String(input.personalize.label || "Engraving text").slice(0, 40),
          maxLength: Math.min(200, Math.max(1, Math.round(Number(input.personalize.maxLength) || 40))),
          required: Boolean(input.personalize.required),
        }
      : null,
    sizes,
    designs: cleanDesigns(input.designs, sizes),
    preview: cleanPreview(input.preview),
    stripeProductId: existing?.stripeProductId ?? input.stripeProductId,
    stripeStockSeen: input.stripeStockSeen ?? existing?.stripeStockSeen ?? null,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
}

export function uniqueSlug(name: string, list: Product[], selfId: string) {
  const base = slugify(name);
  let slug = base;
  let i = 2;
  while (list.some((p) => p.slug === slug && p.id !== selfId)) slug = `${base}-${i++}`;
  return slug;
}

