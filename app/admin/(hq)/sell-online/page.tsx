import { headers } from "next/headers";
import { SellOnline } from "@/components/admin/SellOnline";
import { getActiveProducts, getSettings } from "@/lib/db";

export const metadata = { title: "Sell on Facebook, Instagram & Google" };

export default async function SellOnlinePage() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const base = (process.env.NEXT_PUBLIC_SITE_URL || `${host.startsWith("localhost") ? "http" : "https"}://${host}`).replace(/\/$/, "");
  const [s, products] = await Promise.all([getSettings(), getActiveProducts()]);
  const ready = products.filter((p) => p.images[0] && p.price >= 50).length;
  return <SellOnline initial={s} feed={`${base}/feed.xml`} site={base} counts={{ ready, all: products.length }} />;
}
