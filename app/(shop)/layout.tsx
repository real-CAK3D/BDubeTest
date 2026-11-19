import type { Metadata } from "next";
import "../shop.css";
import { CartProvider } from "@/components/shop/CartProvider";
import { Footer } from "@/components/shop/Footer";
import { Presence } from "@/components/shop/Presence";
import { Header } from "@/components/shop/Header";
import { ThemeStyle } from "@/components/shop/ThemeStyle";
import { shopProducts, shopSettings } from "@/lib/shop-data";
import { getTheme } from "@/lib/themes";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const s = await shopSettings();
  const url = process.env.NEXT_PUBLIC_SITE_URL;
  const ogImage = s.heroImage || s.logo;
  return {
    metadataBase: url ? new URL(url) : undefined,
    title: { default: `${s.businessName}`, template: `%s | ${s.businessName}` },
    description: s.tagline || s.heroText,
    icons: s.favicon || s.logo ? { icon: s.favicon || s.logo, apple: s.favicon || s.logo } : undefined,
    openGraph: { title: s.businessName, description: s.tagline, images: ogImage ? [ogImage] : undefined, type: "website", siteName: s.businessName },
  };
}

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const [s, products] = await Promise.all([shopSettings(), shopProducts()]);
  const cartProducts = products.map((p) => ({ id: p.id, name: p.name, price: p.price, image: p.images[0], slug: p.slug, stock: p.stock, sizes: p.sizes ?? null, designs: p.designs ?? null }));
  const used = new Set(products.flatMap((p) => (p.designs ? Object.values(p.designs.fit).flat() : [])));
  const cartDesigns = s.designs.filter((d) => d.active && used.has(d.id)).map((d) => ({ id: d.id, name: d.name, image: d.image, extra: d.extra, active: d.active, group: d.group }));
  return (
    <div className="shop">
      <ThemeStyle theme={getTheme(s.theme)} />
      <CartProvider products={cartProducts} designs={cartDesigns}>
        <Header s={s} />
        <main className="main">{children}</main>
        <Footer s={s} />
        <Presence />
      </CartProvider>
    </div>
  );
}
