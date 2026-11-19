import { AppearanceForm } from "@/components/admin/AppearanceForm";
import { getProducts, getSettings } from "@/lib/db";
import { fontHref, LAYOUTS, THEMES } from "@/lib/themes";

export const metadata = { title: "Look & layout" };

export default async function Appearance() {
  const [s, products] = await Promise.all([getSettings(), getProducts()]);
  return (
    <>
      {THEMES.map((t) => (
        // eslint-disable-next-line @next/next/no-page-custom-font
        <link key={t.id} rel="stylesheet" href={fontHref(t)} />
      ))}
      <AppearanceForm initial={s} themes={THEMES} layouts={LAYOUTS} sample={products.find((p) => p.images[0])?.images[0] ?? s.gallery.find((g) => g.photos[0])?.photos[0] ?? ""} />
    </>
  );
}
