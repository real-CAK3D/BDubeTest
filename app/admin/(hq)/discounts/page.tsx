import { DiscountsManager } from "@/components/admin/DiscountsManager";
import { getSettings } from "@/lib/db";
import { getKey } from "@/lib/keys";

export const metadata = { title: "Discounts" };

export default async function Discounts() {
  const [s, key] = await Promise.all([getSettings(), getKey("STRIPE_SECRET_KEY")]);
  return <DiscountsManager initial={s} stripeOn={Boolean(key)} />;
}
