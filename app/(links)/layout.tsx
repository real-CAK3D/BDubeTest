import "../shop.css";
import "../links.css";
import { ThemeStyle } from "@/components/shop/ThemeStyle";
import { shopSettings } from "@/lib/shop-data";
import { getTheme } from "@/lib/themes";

export const dynamic = "force-dynamic";

// The Socials page stands on its own, like a Linktree page: no shop header, menu or chat.
export default async function LinksLayout({ children }: { children: React.ReactNode }) {
  const s = await shopSettings();
  return (
    <>
      <ThemeStyle theme={getTheme(s.theme)} />
      {children}
    </>
  );
}
