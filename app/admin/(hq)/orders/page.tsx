import { OrderList } from "@/components/admin/OrderList";
import { getOrders, getSettings } from "@/lib/db";
import { emailReady } from "@/lib/email";
import { getKey } from "@/lib/keys";

export const metadata = { title: "Orders" };

export default async function Orders({ searchParams }: { searchParams: Promise<{ open?: string; status?: string }> }) {
  const [sp, orders, s, shippo] = await Promise.all([searchParams, getOrders(), getSettings(), getKey("SHIPPO_API_KEY")]);
  return (
    <OrderList
      initial={orders}
      openId={sp.open}
      status={sp.status}
      canEmail={await emailReady(s.emailFrom)}
      designs={s.designs}
      parcels={s.parcels}
      labelsReady={Boolean(shippo && s.shipFrom.street1 && s.shipFrom.zip)}
      business={s.businessName}
    />
  );
}
