import { DesignLibrary } from "@/components/admin/DesignLibrary";
import { designCounts } from "@/lib/design-stats";
import { getOrders, getProducts, getSettings } from "@/lib/db";

export const metadata = { title: "Designs" };

export default async function DesignsPage() {
  const [s, products, orders] = await Promise.all([getSettings(), getProducts(), getOrders()]);
  return <DesignLibrary settings={s} products={products} ordered={designCounts(orders)} />;
}
