import type { Metadata } from "next";
import "../shop.css";
import { CartProvider } from "@/components/shop/CartProvider";
import { Footer } from "@/components/shop/Footer";
import { Header } from "@/components/shop/Header";
import { ThemeStyle } from "@/components/shop/ThemeStyle";
import { getActiveProducts, getSettings } from "@/lib/db";
import { getTheme } from "@/lib/themes";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
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
  const [s, products] = await Promise.all([getSettings(), getActiveProducts()]);
  const cartProducts = products.map((p) => ({ id: p.id, name: p.name, price: p.price, image: p.images[0], slug: p.slug, stock: p.stock }));
  return (
    <div className="shop">
      <ThemeStyle theme={getTheme(s.theme)} />
      <CartProvider products={cartProducts}>
        <Header s={s} />
        <main className="main">{children}</main>
        <Footer s={s} />
      </CartProvider>
    </div>
  );
}
