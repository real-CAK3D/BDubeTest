import { GalleryManager } from "@/components/admin/GalleryManager";
import { getProducts, getSettings } from "@/lib/db";

export const metadata = { title: "Our work" };

export default async function GalleryAdmin() {
  const [s, products] = await Promise.all([getSettings(), getProducts()]);
  return <GalleryManager initial={s} products={products.map((p) => ({ slug: p.slug, name: p.name }))} />;
}
