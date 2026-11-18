import { DesignLibrary } from "@/components/admin/DesignLibrary";
import { getProducts, getSettings } from "@/lib/db";

export const metadata = { title: "Designs" };

export default async function DesignsPage() {
  const [s, products] = await Promise.all([getSettings(), getProducts()]);
  return <DesignLibrary settings={s} products={products} />;
}
