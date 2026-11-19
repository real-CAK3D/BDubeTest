import { ProductManager } from "@/components/admin/ProductManager";
import { getAnalytics, getProducts, getSettings } from "@/lib/db";
import { getBlanks } from "@/lib/blanks";
import { getKey } from "@/lib/keys";

export const metadata = { title: "Products" };

export default async function Products({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const { edit } = await searchParams;
  const [products, s, a, key, blanks] = await Promise.all([getProducts(), getSettings(), getAnalytics(), getKey("STRIPE_SECRET_KEY"), getBlanks()]);
  return <ProductManager initial={products} currency={s.currency} views={a.productViews} lowAt={s.lowStockAlert} stripeOn={Boolean(key)} stripeTest={Boolean(key?.includes("_test_"))} library={s.designs} categories={s.categories} blanks={blanks} openId={edit} />;
}
