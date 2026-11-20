import type { Metadata } from "next";
import "../shop.css";
import { CartProvider } from "@/components/shop/CartProvider";
import { Footer } from "@/components/shop/Footer";
import { ChatWidget } from "@/components/shop/ChatWidget";
import { AdminBar } from "@/components/shop/AdminBar";
import { Presence } from "@/components/shop/Presence";
import { signedInOwner } from "@/lib/session";
import { Header } from "@/components/shop/Header";
import { ThemeStyle } from "@/components/shop/ThemeStyle";
import { shopProducts, shopSettings } from "@/lib/shop-data";
import { getTheme } from "@/lib/themes";
import { payOptions } from "@/lib/pay-options";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const s = await shopSettings();
  const url = process.env.NEXT_PUBLIC_SITE_URL;
  const ogImage = s.heroImage || s.logo;
  return {
    metadataBase: url ? new URL(url) : undefined,
    title: { default: `${s.businessName}`, template: `%s | ${s.businessName}` },
    description: s.tagline || s.heroText,
    icons: s.favicon || s.logo ? { icon: [16, 32, 48, 192].map((n) => ({ url: `/api/favicon?s=${n}`, sizes: `${n}x${n}`, type: "image/png" })), apple: { url: "/api/favicon?s=180", sizes: "180x180" } } : undefined,
    verification: {
      google: s.verify?.google || undefined,
      other: {
        ...(s.verify?.meta ? { "facebook-domain-verification": s.verify.meta } : {}),
        ...(s.verify?.pinterest ? { "p:domain_verify": s.verify.pinterest } : {}),
        ...(s.verify?.bing ? { "msvalidate.01": s.verify.bing } : {}),
      },
    },
    openGraph: { title: s.businessName, description: s.tagline, images: ogImage ? [ogImage] : undefined, type: "website", siteName: s.businessName },
  };
}

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const [s, products, owner] = await Promise.all([shopSettings(), shopProducts(), signedInOwner()]);
  const accepts = (await payOptions(s)).accepts;
  const cartProducts = products.map((p) => ({ id: p.id, name: p.name, price: p.price, image: p.images[0], slug: p.slug, stock: p.stock, sizes: p.sizes ?? null, designs: p.designs ?? null }));
  const used = new Set(products.flatMap((p) => (p.designs ? Object.values(p.designs.fit).flat() : [])));
  const cartDesigns = s.designs.filter((d) => d.active && used.has(d.id)).map((d) => ({ id: d.id, name: d.name, image: d.image, extra: d.extra, active: d.active, group: d.group }));
  return (
    <div className="shop">
      <ThemeStyle theme={getTheme(s.theme)} />
      <CartProvider products={cartProducts} designs={cartDesigns}>
        <Header s={s} />
        <main className="main">{children}</main>
        <Footer s={s} accepts={accepts} />
        {owner ? <AdminBar /> : <Presence />}
        {s.chat.on ? <ChatWidget title={s.chat.title} greeting={s.chat.greeting} suggestions={s.chat.faqs.filter((f) => !f.hidden).slice(0, 4).map((f) => f.q)} /> : null}
      </CartProvider>
    </div>
  );
}
